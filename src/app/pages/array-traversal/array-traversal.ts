import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Array as ArrayCanvas } from '../../shared/components/data-structures/array/array';
import { CodeVisualizationEvent, JavascriptEditor } from '../../shared/components/javascript-editor/javascript-editor';
import { ArrayNode, CanvasElement } from '../../shared/models/canvas-shape';
import { ArrayModel } from '../../shared/models/array-model';

const DEFAULT_TRAVERSAL_CODE = [
  'const values = context.array;',
  '',
  'for (let index = 0; index < values.length; index++) {',
  '  await visualize.visit(index);',
  "  console.log('array[' + index + '] = ' + values[index]);",
  '}'
].join('\n');

function createInitialArray(): ArrayModel {
  const values = [7, 12, 4, 19, 6];
  const arrayNodes: ArrayNode[] = values.map((value, index) => ({
    type: 'array-node',
    label: 'Array node',
    id: `array-traversal-${index}`,
    color: '#3d9b89',
    blinking: false,
    x: 0,
    y: 310,
    size: 80,
    value,
    valueType: 'int'
  }));
  return { size: arrayNodes.length, arrayNodes: layoutArrayNodes(arrayNodes) };
}

/** Lay out array cells within the canvas's 1000-unit width, adapting cell size to node count. */
function layoutArrayNodes(nodes: ArrayNode[]): ArrayNode[] {
  if (!nodes.length) return nodes;
  const canvasWidth = 1000;
  const horizontalMargin = 40;
  const gap = nodes.length === 1 ? 0 : Math.min(20, (canvasWidth - horizontalMargin * 2) / (nodes.length - 1) * 0.2);
  const size = Math.min(80, (canvasWidth - horizontalMargin * 2 - gap * (nodes.length - 1)) / (nodes.length * 1.5));
  const cellWidth = size * 1.5;
  const occupiedWidth = nodes.length * cellWidth + gap * (nodes.length - 1);
  const startX = (canvasWidth - occupiedWidth) / 2 + cellWidth / 2;
  return nodes.map((node, index) => ({
    ...node,
    x: startX + index * (cellWidth + gap),
    y: 310,
    size
  }));
}

@Component({
  selector: 'app-array-traversal-page',
  standalone: true,
  imports: [ArrayCanvas, JavascriptEditor, RouterLink],
  templateUrl: './array-traversal.html',
  styleUrl: './array-traversal.scss'
})
export class ArrayTraversalPage {
  protected readonly arrayModel = signal<ArrayModel>(createInitialArray());
  protected readonly traversalCode = signal(DEFAULT_TRAVERSAL_CODE);
  protected readonly currentIndex = signal(-1);
  protected readonly statusMessage = signal('Ready to traverse the array from left to right.');
  protected readonly editorShare = signal(50);
  protected readonly workspaceColumns = computed(
    () => `minmax(0, ${this.editorShare()}fr) 10px minmax(0, ${100 - this.editorShare()}fr)`
  );
  protected readonly editorContext = computed(() => ({
    array: this.arrayModel().arrayNodes.map((node) => node.value)
  }));
  protected readonly visitedCount = computed(() => Math.min(this.currentIndex() + 1, this.arrayModel().size));
  protected readonly canStep = computed(() => this.currentIndex() < this.arrayModel().size);

  protected updateArrayNodes(elements: CanvasElement[]): void {
    const arrayNodes = elements.filter((element): element is ArrayNode => element.type === 'array-node');
    const previousIds = this.arrayModel().arrayNodes.map((node) => node.id);
    const nextIds = arrayNodes.map((node) => node.id);
    const structureChanged = previousIds.length !== nextIds.length || previousIds.some((id, index) => id !== nextIds[index]);
    const nextNodes = structureChanged
      ? layoutArrayNodes(arrayNodes.map((node) => ({ ...node, blinking: false })))
      : arrayNodes;
    this.arrayModel.update((current) => ({ ...current, size: nextNodes.length, arrayNodes: nextNodes }));
    if (structureChanged) {
      this.currentIndex.set(-1);
      this.statusMessage.set('Array changed. Traversal reset to index 0.');
    } else if (this.currentIndex() > arrayNodes.length) {
      this.currentIndex.set(arrayNodes.length);
    }
  }

  protected stepTraversal(): void {
    const arrayNodes = this.arrayModel().arrayNodes;
    const nextIndex = this.currentIndex() + 1;
    if (nextIndex >= arrayNodes.length) {
      this.currentIndex.set(arrayNodes.length);
      this.arrayModel.update((current) => ({
        ...current,
        arrayNodes: current.arrayNodes.map((node) => ({ ...node, blinking: false }))
      }));
      this.statusMessage.set(`Traversal complete. Visited ${arrayNodes.length} ${arrayNodes.length === 1 ? 'element' : 'elements'}.`);
      return;
    }

    const currentNode = arrayNodes[nextIndex];
    this.currentIndex.set(nextIndex);
    this.arrayModel.update((current) => ({
      ...current,
      arrayNodes: current.arrayNodes.map((node, index) => ({ ...node, blinking: index === nextIndex }))
    }));
    this.statusMessage.set(`Visiting index ${nextIndex}: ${currentNode.value}.`);
  }

  protected visualizeCode(event: CodeVisualizationEvent): void {
    if (event.type !== 'visit') return;
    const arrayNodes = this.arrayModel().arrayNodes;
    if (!Number.isInteger(event.index) || event.index < 0 || event.index >= arrayNodes.length) {
      this.statusMessage.set('Code requested array index ' + event.index + ', which is outside the current array.');
      return;
    }

    const currentNode = arrayNodes[event.index];
    this.currentIndex.set(event.index);
    this.arrayModel.update((current) => ({
      ...current,
      arrayNodes: current.arrayNodes.map((node, index) => ({ ...node, blinking: index === event.index }))
    }));
    this.statusMessage.set('Code visited index ' + event.index + ': ' + currentNode.value + '.');
  }

  protected resetTraversal(): void {
    this.currentIndex.set(-1);
    this.arrayModel.update((current) => ({
      ...current,
      arrayNodes: current.arrayNodes.map((node) => ({ ...node, blinking: false }))
    }));
    this.statusMessage.set('Traversal reset. Ready to start from index 0.');
  }

  protected startWorkspaceResize(event: PointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected resizeWorkspace(event: PointerEvent): void {
    if (event.buttons !== 1) return;
    const workspace = (event.currentTarget as HTMLElement).parentElement;
    const bounds = workspace?.getBoundingClientRect();
    if (!bounds?.width) return;
    const share = ((event.clientX - bounds.left) / bounds.width) * 100;
    this.editorShare.set(Math.max(25, Math.min(75, Math.round(share))));
  }

  protected endWorkspaceResize(event: PointerEvent): void {
    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  }

  protected resizeWorkspaceWithKeyboard(event: KeyboardEvent): void {
    const delta = event.key === 'ArrowLeft' ? -5 : event.key === 'ArrowRight' ? 5 : 0;
    if (!delta) return;
    event.preventDefault();
    this.editorShare.update((share) => Math.max(25, Math.min(75, share + delta)));
  }
}
