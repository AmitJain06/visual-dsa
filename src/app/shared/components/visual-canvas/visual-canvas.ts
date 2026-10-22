import { Component, computed, ElementRef, input, model, signal, viewChild } from '@angular/core';
import { CanvasConnection, CanvasShape, CanvasShapeDefinition, CANVAS_SHAPE_PALETTE } from '../../models/canvas-shape';

interface CanvasPoint {
  x: number;
  y: number;
}

interface ShapeDrag {
  shapeId: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

@Component({
  selector: 'app-visual-canvas',
  templateUrl: './visual-canvas.html',
  styleUrl: './visual-canvas.scss'
})
export class VisualCanvas {
  private static nextCanvasId = 0;
  private nextShapeId = 1;
  private nextConnectionId = 1;

  readonly canvasTitle = input('Visual canvas');
  readonly shapes = model<CanvasShape[]>([]);
  readonly connections = model<CanvasConnection[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly connectMode = signal(false);
  protected readonly pendingConnectionSourceId = signal<string | null>(null);
  protected readonly snapToGrid = signal(true);
  protected readonly isDragOver = signal(false);
  protected readonly statusMessage = signal('Drag a shape onto the board, or choose one from the palette.');
  protected readonly gridPatternId = `visual-canvas-grid-${++VisualCanvas.nextCanvasId}`;
  protected readonly arrowMarkerId = `visual-canvas-arrow-${VisualCanvas.nextCanvasId}`;
  protected readonly palette = CANVAS_SHAPE_PALETTE;
  protected readonly selectedShape = computed(
    () => this.shapes().find((shape) => shape.id === this.selectedId()) ?? null
  );

  private readonly surface = viewChild<ElementRef<SVGSVGElement>>('surface');
  private readonly activeDrag = signal<ShapeDrag | null>(null);

  protected addShapeFromPalette(definition: CanvasShapeDefinition): void {
    const offset = (this.shapes().length % 5) * 28;
    this.addShape(definition, { x: 500 + offset, y: 300 + offset });
  }

  protected beginPaletteDrag(event: DragEvent, definition: CanvasShapeDefinition): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-visual-canvas-shape', definition.type);
    event.dataTransfer.setData('text/plain', definition.type);
  }

  protected allowDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.isDragOver.set(true);
  }

  protected leaveDropZone(event: DragEvent): void {
    if (event.currentTarget === event.target) this.isDragOver.set(false);
  }

  protected dropShape(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const type = event.dataTransfer?.getData('application/x-visual-canvas-shape')
      || event.dataTransfer?.getData('text/plain');
    const definition = this.palette.find((item) => item.type === type);
    const point = this.pointFromClient(event.clientX, event.clientY);

    if (!definition || !point) return;
    this.addShape(definition, point);
  }

  protected beginShapeMove(event: PointerEvent, shape: CanvasShape): void {
    if (event.button !== 0) return;
    if (this.connectMode()) {
      event.preventDefault();
      event.stopPropagation();
      this.pickConnectionEndpoint(shape);
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const point = this.pointFromClient(event.clientX, event.clientY);
    const svg = this.surface()?.nativeElement;
    if (!point || !svg) return;

    this.selectedId.set(shape.id);
    this.activeDrag.set({
      shapeId: shape.id,
      pointerId: event.pointerId,
      offsetX: point.x - shape.x,
      offsetY: point.y - shape.y
    });
    svg.setPointerCapture(event.pointerId);
  }

  protected moveShape(event: PointerEvent): void {
    const drag = this.activeDrag();
    if (!drag || drag.pointerId !== event.pointerId) return;

    const point = this.pointFromClient(event.clientX, event.clientY);
    if (!point) return;
    this.setShapePosition(drag.shapeId, point.x - drag.offsetX, point.y - drag.offsetY);
  }

  protected endShapeMove(event: PointerEvent): void {
    const drag = this.activeDrag();
    if (!drag || drag.pointerId !== event.pointerId) return;

    const svg = this.surface()?.nativeElement;
    if (svg?.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    this.activeDrag.set(null);
  }

  protected selectCanvasBackground(event: PointerEvent): void {
    const target = event.target;
    if (target instanceof SVGElement && (target === event.currentTarget || target.classList.contains('canvas-grid'))) {
      this.selectedId.set(null);
    }
  }

  protected selectShape(shapeId: string): void {
    this.selectedId.set(shapeId);
  }

  protected toggleConnectMode(): void {
    const enabled = !this.connectMode();
    this.connectMode.set(enabled);
    this.pendingConnectionSourceId.set(null);
    this.statusMessage.set(enabled
      ? 'Connect mode: choose a source shape, then a destination shape.'
      : 'Connect mode off. Drag shapes to arrange your canvas.');
  }

  protected connectionPath(connection: CanvasConnection): string | null {
    const source = this.shapes().find((shape) => shape.id === connection.sourceId);
    const target = this.shapes().find((shape) => shape.id === connection.targetId);
    if (!source || !target) return null;
    const start = this.shapeBoundaryPoint(source, target);
    const end = this.shapeBoundaryPoint(target, source);
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  protected moveShapeWithKeyboard(event: KeyboardEvent, shape: CanvasShape): void {
    const steps: Record<string, CanvasPoint> = {
      ArrowLeft: { x: -20, y: 0 },
      ArrowRight: { x: 20, y: 0 },
      ArrowUp: { x: 0, y: -20 },
      ArrowDown: { x: 0, y: 20 }
    };
    const step = steps[event.key];

    if (step) {
      event.preventDefault();
      this.selectedId.set(shape.id);
      this.setShapePosition(shape.id, shape.x + step.x, shape.y + step.y);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.selectedId.set(shape.id);
      this.deleteSelectedShape();
    }
  }

  protected toggleSnap(): void {
    this.snapToGrid.update((enabled) => !enabled);
    this.statusMessage.set(`Snap to grid ${this.snapToGrid() ? 'enabled' : 'disabled'}.`);
  }

  protected duplicateSelectedShape(): void {
    const selected = this.selectedShape();
    if (!selected) return;

    const id = this.createShapeId();
    const copy = { ...selected, id };
    this.shapes.update((shapes) => [...shapes, copy]);
    this.selectedId.set(id);
    this.setShapePosition(id, selected.x + 40, selected.y + 40);
    this.statusMessage.set(`${selected.label} duplicated.`);
  }

  protected deleteSelectedShape(): void {
    const selected = this.selectedShape();
    if (!selected) return;

    this.shapes.update((shapes) => shapes.filter((shape) => shape.id !== selected.id));
    this.connections.update((connections) => connections.filter(
      (connection) => connection.sourceId !== selected.id && connection.targetId !== selected.id
    ));
    if (this.pendingConnectionSourceId() === selected.id) this.pendingConnectionSourceId.set(null);
    this.selectedId.set(null);
    this.statusMessage.set(`${selected.label} removed from canvas.`);
  }

  protected clearCanvas(): void {
    this.shapes.set([]);
    this.connections.set([]);
    this.selectedId.set(null);
    this.pendingConnectionSourceId.set(null);
    this.statusMessage.set('Canvas cleared. Add a shape from the palette.');
  }

  protected updateSelectedLabel(event: Event): void {
    const selected = this.selectedShape();
    const text = (event.currentTarget as HTMLInputElement).value;
    if (!selected) return;

    this.shapes.update((shapes) => shapes.map((shape) => shape.id === selected.id ? { ...shape, text } : shape));
  }

  private addShape(definition: CanvasShapeDefinition, point: CanvasPoint): void {
    const id = this.createShapeId();
    const shape: CanvasShape = {
      ...definition,
      id,
      x: point.x,
      y: point.y,
      text: `${definition.label} ${this.nextShapeId - 1}`
    };
    this.shapes.update((shapes) => [...shapes, shape]);
    this.selectedId.set(id);
    this.statusMessage.set(`${shape.text} added. Use arrow keys to move it, or drag it on the canvas.`);
  }

  private createShapeId(): string {
    return `canvas-shape-${this.nextShapeId++}`;
  }

  private shapeBoundaryPoint(shape: CanvasShape, other: CanvasShape): CanvasPoint {
    const dx = other.x - shape.x;
    const dy = other.y - shape.y;
    if (shape.type === 'circle') {
      const distance = Math.hypot(dx, dy) || 1;
      return { x: shape.x + (dx / distance) * 36, y: shape.y + (dy / distance) * 36 };
    }

    const halfWidth = shape.type === 'rectangle' ? 48 : 42;
    const halfHeight = shape.type === 'rectangle' ? 32 : 42;
    const scale = 1 / Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight, 1);
    return { x: shape.x + dx * scale, y: shape.y + dy * scale };
  }

  private pickConnectionEndpoint(shape: CanvasShape): void {
    const sourceId = this.pendingConnectionSourceId();
    if (!sourceId) {
      this.pendingConnectionSourceId.set(shape.id);
      this.selectedId.set(shape.id);
      this.statusMessage.set(`Source selected: ${shape.text}. Choose a different shape to connect it.`);
      return;
    }
    if (sourceId === shape.id) {
      this.pendingConnectionSourceId.set(null);
      this.statusMessage.set('Connection cancelled. Choose a source shape to start again.');
      return;
    }
    const exists = this.connections().some((connection) =>
      connection.sourceId === sourceId && connection.targetId === shape.id
    );
    if (exists) {
      this.statusMessage.set(`A connection to ${shape.text} already exists.`);
    } else {
      this.connections.update((connections) => [...connections, {
        id: `canvas-connection-${this.nextConnectionId++}`,
        sourceId,
        targetId: shape.id
      }]);
      this.statusMessage.set(`Connected ${this.shapes().find((item) => item.id === sourceId)?.text} to ${shape.text}.`);
    }
    this.pendingConnectionSourceId.set(null);
  }

  private pointFromClient(clientX: number, clientY: number): CanvasPoint | null {
    const svg = this.surface()?.nativeElement;
    const bounds = svg?.getBoundingClientRect();
    if (!bounds?.width || !bounds.height) return null;

    return {
      x: ((clientX - bounds.left) / bounds.width) * 1000,
      y: ((clientY - bounds.top) / bounds.height) * 620
    };
  }

  private setShapePosition(shapeId: string, x: number, y: number): void {
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const snap = (value: number) => this.snapToGrid() ? Math.round(value / 20) * 20 : value;
    const nextX = clamp(snap(x), 48, 952);
    const nextY = clamp(snap(y), 48, 572);

    this.shapes.update((shapes) => shapes.map((shape) => shape.id === shapeId
      ? { ...shape, x: nextX, y: nextY }
      : shape));
  }
}
