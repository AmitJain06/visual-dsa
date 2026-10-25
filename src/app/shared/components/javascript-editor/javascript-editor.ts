import { Component, OnDestroy, computed, input, model, output, signal } from '@angular/core';

type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'system';
type ExecutionMode = 'run' | 'debug';

interface ConsoleEntry {
  level: ConsoleLevel;
  text: string;
}

interface WorkerMessage {
  kind: 'console' | 'done' | 'error' | 'paused' | 'visualization';
  level?: Exclude<ConsoleLevel, 'system'>;
  text?: string;
  line?: number;
  index?: number;
  reason?: 'breakpoint' | 'visualization';
}

export interface CodeVisualizationEvent {
  type: 'visit';
  index: number;
}

const DEFAULT_CODE = `const numbers = [1, 2, 3];

for (const number of numbers) {
  console.log(number);
}`;

const RUNNER_WORKER_SOURCE = `
function format(value) {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === 'undefined') return 'undefined';
  try { return JSON.stringify(value, null, 2) ?? String(value); }
  catch { return String(value); }
}
function emit(level, values) {
  self.postMessage({ kind: 'console', level, text: values.map(format).join(' ') });
}
let resumeExecution = null;
async function pauseAt(line) {
  self.postMessage({ kind: 'paused', line, reason: 'breakpoint' });
  await new Promise((resolve) => { resumeExecution = resolve; });
}
async function visit(index, data) {
  self.postMessage({ kind: 'visualization', index });
  if (data.pauseOnVisualization && data.mode === 'debug') {
    self.postMessage({ kind: 'paused', reason: 'visualization' });
    await new Promise((resolve) => { resumeExecution = resolve; });
  } else if (data.visualizationDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, data.visualizationDelayMs));
  }
}
for (const level of ['log', 'info', 'warn', 'error', 'debug', 'table']) {
  self.console[level] = (...values) => emit(level === 'table' || level === 'debug' ? 'log' : level, values);
}
self.addEventListener('error', (event) => {
  self.postMessage({ kind: 'error', text: event.error?.stack || event.message || 'JavaScript error' });
  event.preventDefault();
});
self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({ kind: 'error', text: format(event.reason) });
  event.preventDefault();
});
self.onmessage = async ({ data }) => {
  if (data.kind === 'resume') {
    const resume = resumeExecution;
    resumeExecution = null;
    resume?.();
    return;
  }
  if (data.kind !== 'start') return;
  const lines = String(data.code).split('\\n');
  const breakpoints = new Set(data.breakpoints);
  const source = lines.map((line, index) => breakpoints.has(index + 1) ? 'await self.__pauseAt(' + (index + 1) + '); ' + line : line).join('\\n');
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const visualize = { visit: (index) => visit(index, data) };
    await new AsyncFunction('visualize', 'context', source)(visualize, data.context);
  } catch (error) {
    self.postMessage({ kind: 'error', text: error?.stack || String(error) });
  } finally {
    self.postMessage({ kind: 'done' });
  }
};
self.__pauseAt = pauseAt;
`;

@Component({
  selector: 'app-javascript-editor',
  standalone: true,
  templateUrl: './javascript-editor.html',
  styleUrl: './javascript-editor.scss'
})
export class JavascriptEditor implements OnDestroy {
  readonly code = model(DEFAULT_CODE);
  readonly context = input<Record<string, unknown>>({});
  readonly pauseOnVisualization = input(false);
  readonly visualizationDelayMs = input(0);
  readonly visualization = output<CodeVisualizationEvent>();
  protected readonly output = signal<ConsoleEntry[]>([]);
  protected readonly isRunning = signal(false);
  protected readonly isPaused = signal(false);
  protected readonly currentDebugLine = signal<number | null>(null);
  protected readonly executionMode = signal<ExecutionMode | null>(null);
  protected readonly statusMessage = signal('Ready');
  protected readonly breakpointLines = signal(new Set<number>());
  protected readonly gutterScrollTop = signal(0);
  protected readonly lines = computed(() => Array.from(
    { length: Math.max(1, this.code().split('\n').length) },
    (_, index) => index + 1
  ));

  private worker: Worker | null = null;
  private workerUrl: string | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  protected updateCode(event: Event): void {
    this.code.set((event.currentTarget as HTMLTextAreaElement).value);
  }

  protected insertIndent(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const editor = event.currentTarget as HTMLTextAreaElement;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const updatedCode = `${editor.value.slice(0, start)}  ${editor.value.slice(end)}`;
    this.code.set(updatedCode);
    queueMicrotask(() => {
      editor.selectionStart = editor.selectionEnd = start + 2;
    });
  }

  protected syncGutter(event: Event): void {
    const editor = event.currentTarget as HTMLTextAreaElement;
    this.gutterScrollTop.set(editor.scrollTop);
  }

  protected toggleBreakpoint(line: number): void {
    this.breakpointLines.update((lines) => {
      const next = new Set(lines);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });
  }

  protected hasBreakpoint(line: number): boolean {
    return this.breakpointLines().has(line);
  }

  protected run(): void {
    this.startExecution('run');
  }

  protected debug(): void {
    this.startExecution('debug');
  }

  protected continueExecution(): void {
    if (!this.worker || !this.isPaused()) return;
    this.isPaused.set(false);
    this.statusMessage.set(this.executionMode() === 'debug' ? 'Debugging…' : 'Running in worker…');
    this.worker.postMessage({ kind: 'resume' });
    this.armTimeout(this.worker, this.executionMode() ?? 'run');
  }

  protected stop(): void {
    if (!this.isRunning()) return;
    this.finishExecution();
    this.appendOutput('system', 'Execution stopped.');
    this.statusMessage.set('Stopped');
  }

  protected clearOutput(): void {
    this.output.set([]);
  }

  ngOnDestroy(): void {
    this.finishExecution();
  }

  private startExecution(mode: ExecutionMode): void {
    this.finishExecution();
    this.output.set([]);
    this.isRunning.set(true);
    this.isPaused.set(false);
    this.currentDebugLine.set(null);
    this.executionMode.set(mode);
    this.statusMessage.set(mode === 'debug' ? 'Debugging in worker…' : 'Running in worker…');

    try {
      const workerBlob = new Blob([RUNNER_WORKER_SOURCE], { type: 'text/javascript' });
      this.workerUrl = URL.createObjectURL(workerBlob);
      const worker = new Worker(this.workerUrl);
      this.worker = worker;
      worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        if (this.worker !== worker) return;
        const message = event.data;
        if (message.kind === 'console') this.appendOutput(message.level ?? 'log', message.text ?? '');
        if (message.kind === 'error') this.appendOutput('error', message.text ?? 'JavaScript error');
        if (message.kind === 'visualization' && Number.isInteger(message.index)) {
          this.visualization.emit({ type: 'visit', index: message.index! });
        }
        if (message.kind === 'paused') {
          if (this.timeoutId !== null) clearTimeout(this.timeoutId);
          this.timeoutId = null;
          this.isPaused.set(true);
          this.currentDebugLine.set(message.line ?? null);
          const visualizationPause = message.reason === 'visualization';
          this.currentDebugLine.set(message.line ?? null);
          this.statusMessage.set(visualizationPause ? 'Paused at array visit' : 'Paused at line ' + (message.line ?? '?'));
          this.appendOutput('system', visualizationPause
            ? 'Array visit paused. Continue to execute the next step.'
            : 'Paused at breakpoint on line ' + (message.line ?? '?') + '. Continue to reach the next breakpoint.');
        }
        if (message.kind === 'done') {
          this.finishExecution();
          this.statusMessage.set(mode === 'debug' ? 'Debug session finished' : 'Run finished');
        }
      };
      worker.onerror = (event: ErrorEvent) => {
        if (this.worker !== worker) return;
        this.appendOutput('error', event.message || 'The worker could not run this code.');
        this.finishExecution();
        this.statusMessage.set('Execution failed');
        event.preventDefault();
      };

      const breakpoints = mode === 'debug'
        ? (this.breakpointLines().size ? [...this.breakpointLines()] : [1])
        : [];
      worker.postMessage({
        kind: 'start',
        code: this.code(),
        breakpoints,
        context: this.context(),
        mode,
        pauseOnVisualization: this.pauseOnVisualization(),
        visualizationDelayMs: this.visualizationDelayMs()
      });
      this.armTimeout(worker, mode);
      if (mode === 'debug') {
        this.appendOutput('system', breakpoints.length && this.breakpointLines().size
          ? 'Debug breakpoints set on line' + (breakpoints.length === 1 ? ' ' : 's ') + breakpoints.join(', ') + '.'
          : 'Debug starts at line 1. Add breakpoints by clicking line numbers.');
      }
    } catch (error) {
      this.appendOutput('error', error instanceof Error ? error.message : String(error));
      this.finishExecution();
      this.statusMessage.set('Could not start JavaScript worker');
    }
  }

  private finishExecution(): void {
    if (this.timeoutId !== null) clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.worker?.terminate();
    this.worker = null;
    if (this.workerUrl) URL.revokeObjectURL(this.workerUrl);
    this.workerUrl = null;
    this.isRunning.set(false);
    this.isPaused.set(false);
    this.currentDebugLine.set(null);
  }

  private armTimeout(worker: Worker, mode: ExecutionMode): void {
    if (this.timeoutId !== null) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      if (this.worker !== worker) return;
      this.appendOutput('error', 'Execution exceeded the time limit and was stopped.');
      this.finishExecution();
      this.statusMessage.set('Execution timed out');
    }, mode === 'debug' ? 30000 : 10000);
  }

  private appendOutput(level: ConsoleLevel, text: string): void {
    this.output.update((entries) => [...entries.slice(-499), { level, text }]);
  }
}
