import { Component, computed, ElementRef, input, model, signal, viewChild } from '@angular/core';
import { CanvasElement, CanvasElementDefinition, CanvasPoint, CanvasShapeDefaults, CanvasShapePropertyVisibility, CANVAS_SHAPE_PALETTE, Edge, GraphNode, GraphNodeDefinition } from '../../models/canvas-shape';
import { EdgeComponent } from '../shapes/edge/edge';
import { GraphNodeComponent } from '../shapes/graph-node/graph-node';
import { ShapePropertiesPanel } from '../shape-properties-panel/shape-properties-panel';

interface ShapeDrag {
  shapeId: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

interface EdgeEndpoints {
  start: CanvasPoint;
  end: CanvasPoint;
}

@Component({
  selector: 'app-visual-canvas',
  imports: [GraphNodeComponent, EdgeComponent, ShapePropertiesPanel],
  templateUrl: './visual-canvas.html',
  styleUrl: './visual-canvas.scss'
})
export class VisualCanvas {
  private static nextCanvasId = 0;
  private nextShapeId = 1;
  private edgeCreationClickTargetId: string | null = null;
  private readonly canvasInstanceId = ++VisualCanvas.nextCanvasId;

  readonly canvasTitle = input('Visual canvas');
  readonly availableShapes = input<readonly CanvasElementDefinition[]>(CANVAS_SHAPE_PALETTE);
  readonly shapeDefaults = input<CanvasShapeDefaults>({});
  readonly shapePropertyVisibility = input<CanvasShapePropertyVisibility>({});
  readonly shapes = model<CanvasElement[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly editingShapeId = signal<string | null>(null);
  protected readonly edgeCreationMode = signal(false);
  protected readonly pendingEdgeSourceId = signal<string | null>(null);
  protected readonly snapToGrid = signal(true);
  protected readonly isDragOver = signal(false);
  protected readonly statusMessage = signal('Drag a graph node onto the board, or choose one from the palette.');
  protected readonly gridPatternId = `visual-canvas-grid-${this.canvasInstanceId}`;
  protected readonly selectedShape = computed(
    () => this.shapes().find((shape) => shape.id === this.selectedId()) ?? null
  );
  protected readonly editingShape = computed(
    () => this.shapes().find((shape) => shape.id === this.editingShapeId()) ?? null
  );

  private readonly surface = viewChild<ElementRef<SVGSVGElement>>('surface');
  private readonly activeDrag = signal<ShapeDrag | null>(null);

  protected addShapeFromPalette(definition: CanvasElementDefinition): void {
    if (definition.type === 'edge') {
      this.beginEdgeCreation();
      return;
    }
    const offset = (this.shapes().filter((shape) => shape.type === 'graph-node').length % 5) * 28;
    this.addGraphNode(definition, { x: 500 + offset, y: 300 + offset });
  }

  protected beginPaletteDrag(event: DragEvent, definition: CanvasElementDefinition): void {
    if (definition.type !== 'graph-node' || !event.dataTransfer) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-visual-canvas-shape', definition.type);
    event.dataTransfer.setData('text/plain', definition.type);
  }

  protected allowDrop(event: DragEvent): void {
    if (!event.dataTransfer || !Array.from(event.dataTransfer.types).includes('application/x-visual-canvas-shape')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.isDragOver.set(true);
  }

  protected leaveDropZone(event: DragEvent): void {
    if (event.currentTarget === event.target) this.isDragOver.set(false);
  }

  protected dropShape(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const type = event.dataTransfer?.getData('application/x-visual-canvas-shape');
    const definition = this.availableShapes().find((item) => item.type === type);
    const point = this.pointFromClient(event.clientX, event.clientY);
    if (!definition || definition.type !== 'graph-node' || !point) return;
    this.addGraphNode(definition, point);
  }

  protected beginShapeMove(event: PointerEvent, shape: CanvasElement): void {
    if (!this.edgeCreationMode()) this.edgeCreationClickTargetId = null;
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    if (this.edgeCreationMode()) {
      if (shape.type === 'graph-node') this.pickEdgeEndpoint(shape);
      else this.statusMessage.set('Edges can only connect two graph nodes. Choose a graph node.');
      return;
    }

    this.selectedId.set(shape.id);
    if (shape.type === 'edge') return;

    const point = this.pointFromClient(event.clientX, event.clientY);
    const svg = this.surface()?.nativeElement;
    if (!point || !svg) return;

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
      this.closeShapeProperties();
    }
  }

  protected selectShape(shapeId: string): void {
    if (this.edgeCreationClickTargetId === shapeId) {
      this.edgeCreationClickTargetId = null;
      return;
    }
    if (this.edgeCreationMode() || this.pendingEdgeSourceId()) return;
    this.selectedId.set(shapeId);
    if (this.editingShapeId() !== shapeId) this.closeShapeProperties();
  }

  protected openShapeProperties(event: MouseEvent, shape: CanvasElement): void {
    event.preventDefault();
    this.selectedId.set(shape.id);
    this.editingShapeId.set(shape.id);
  }

  protected closeShapeProperties(): void {
    this.editingShapeId.set(null);
  }

  protected updateShape(updatedShape: CanvasElement): void {
    this.shapes.update((shapes) => shapes.map((shape) => shape.id === updatedShape.id ? updatedShape : shape));
  }

  protected toggleEdgeCreationMode(): void {
    if (this.edgeCreationMode()) {
      this.edgeCreationMode.set(false);
      this.pendingEdgeSourceId.set(null);
      this.statusMessage.set('Edge creation cancelled.');
      return;
    }
    this.beginEdgeCreation();
  }

  protected edgeEndpoints(edge: Edge): EdgeEndpoints | null {
    const source = this.graphNodeById(edge.sourceId);
    const target = this.graphNodeById(edge.targetId);
    if (!source || !target) return null;
    return {
      start: this.shapeBoundaryPoint(source, target),
      end: this.shapeBoundaryPoint(target, source)
    };
  }

  protected moveShapeWithKeyboard(event: KeyboardEvent, shape: CanvasElement): void {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.selectedId.set(shape.id);
      this.deleteSelectedShape();
      return;
    }
    if (shape.type !== 'graph-node') return;
    const steps: Record<string, CanvasPoint> = {
      ArrowLeft: { x: -20, y: 0 },
      ArrowRight: { x: 20, y: 0 },
      ArrowUp: { x: 0, y: -20 },
      ArrowDown: { x: 0, y: 20 }
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    this.selectedId.set(shape.id);
    this.setShapePosition(shape.id, shape.x + step.x, shape.y + step.y);
  }

  protected toggleSnap(): void {
    this.snapToGrid.update((enabled) => !enabled);
    this.statusMessage.set(`Snap to grid ${this.snapToGrid() ? 'enabled' : 'disabled'}.`);
  }

  protected duplicateSelectedShape(): void {
    const selected = this.selectedShape();
    if (!selected || selected.type === 'edge') return;
    const id = this.createShapeId();
    const copy: GraphNode = { ...selected, id };
    this.shapes.update((shapes) => [...shapes, copy]);
    this.selectedId.set(id);
    this.setShapePosition(id, selected.x + 40, selected.y + 40);
    this.statusMessage.set(`${selected.label} duplicated.`);
  }

  protected deleteSelectedShape(): void {
    const selected = this.selectedShape();
    if (!selected) return;
    this.shapes.update((shapes) => shapes.filter((shape) => shape.id !== selected.id &&
      !(shape.type === 'edge' && (shape.sourceId === selected.id || shape.targetId === selected.id))));
    if (this.pendingEdgeSourceId() === selected.id) this.pendingEdgeSourceId.set(null);
    if (this.editingShapeId() === selected.id) this.closeShapeProperties();
    this.selectedId.set(null);
    this.statusMessage.set(`${selected.label} removed from canvas.`);
  }

  protected clearCanvas(): void {
    this.shapes.set([]);
    this.selectedId.set(null);
    this.pendingEdgeSourceId.set(null);
    this.edgeCreationMode.set(false);
    this.closeShapeProperties();
    this.statusMessage.set('Canvas cleared. Add a graph node from the palette.');
  }

  private beginEdgeCreation(): void {
    const nodes = this.shapes().filter((shape): shape is GraphNode => shape.type === 'graph-node');
    if (nodes.length < 2) {
      this.statusMessage.set('Add at least two graph nodes before creating an edge. Edges must connect two graph nodes.');
      return;
    }
    this.edgeCreationMode.set(true);
    this.pendingEdgeSourceId.set(null);
    this.closeShapeProperties();
    this.statusMessage.set('Edge mode: choose a source graph node, then a destination graph node.');
  }

  private pickEdgeEndpoint(node: GraphNode): void {
    const sourceId = this.pendingEdgeSourceId();
    if (!sourceId) {
      this.pendingEdgeSourceId.set(node.id);
      this.selectedId.set(node.id);
      this.statusMessage.set(`Source selected: Graph node ${node.value}. Choose a different graph node.`);
      return;
    }
    if (sourceId === node.id) {
      this.pendingEdgeSourceId.set(null);
      this.statusMessage.set('Choose a different graph node for the edge destination.');
      return;
    }
    const duplicate = this.shapes().some((shape) => shape.type === 'edge' && (
      (shape.sourceId === sourceId && shape.targetId === node.id) ||
      (!shape.directed && shape.sourceId === node.id && shape.targetId === sourceId)
    ));
    if (duplicate) {
      this.pendingEdgeSourceId.set(null);
      this.edgeCreationMode.set(false);
      this.statusMessage.set('An edge already connects those graph nodes.');
      return;
    }
    const id = this.createShapeId();
    const edgeDefaults = this.shapeDefaults().edge;
    const weighted = edgeDefaults?.weighted ?? false;
    const edge: Edge = {
      id,
      type: 'edge',
      label: 'Edge',
      sourceId,
      targetId: node.id,
      color: this.availableShapes().find((shape) => shape.type === 'edge')?.color ?? '#68708a',
      blinking: false,
      directed: edgeDefaults?.directed ?? true,
      weighted,
      ...(weighted ? { weight: 1 } : {}),
      thickness: 2
    };
    this.shapes.update((shapes) => [...shapes, edge]);
    this.selectedId.set(id);
    this.pendingEdgeSourceId.set(null);
    this.edgeCreationMode.set(false);
    this.edgeCreationClickTargetId = node.id;
    const source = this.graphNodeById(sourceId);
    this.statusMessage.set(`Edge added between graph nodes ${source?.value} and ${node.value}. Right-click the edge to edit its direction and weight.`);
  }

  private addGraphNode(definition: GraphNodeDefinition, point: CanvasPoint): void {
    const node: GraphNode = {
      ...definition,
      id: this.createShapeId(),
      x: point.x,
      y: point.y,
      size: 72,
      blinking: false,
      shape: 'circle',
      value: this.defaultGraphNodeValue(this.shapeDefaults().graphNode?.valueType ?? 'int'),
      valueType: this.shapeDefaults().graphNode?.valueType ?? 'int'
    };
    this.shapes.update((shapes) => [...shapes, node]);
    this.selectedId.set(node.id);
    this.statusMessage.set(`Graph node ${node.value} added. Use arrow keys to move it, or drag it on the canvas.`);
  }

  private defaultGraphNodeValue(valueType: GraphNode['valueType']): GraphNode['value'] {
    if (valueType === 'string') return '';
    if (valueType === 'char') return 'A';
    if (valueType === 'boolean') return false;
    return 0;
  }

  private createShapeId(): string {
    return `canvas-${this.canvasInstanceId}-shape-${this.nextShapeId++}`;
  }

  private graphNodeById(id: string): GraphNode | undefined {
    const shape = this.shapes().find((item) => item.id === id);
    return shape?.type === 'graph-node' ? shape : undefined;
  }

  private shapeBoundaryPoint(shape: GraphNode, other: GraphNode): CanvasPoint {
    const dx = other.x - shape.x;
    const dy = other.y - shape.y;
    if (shape.shape === 'circle') {
      const distance = Math.hypot(dx, dy) || 1;
      const radius = shape.size / 2;
      return { x: shape.x + (dx / distance) * radius, y: shape.y + (dy / distance) * radius };
    }
    const halfWidth = shape.size / 2;
    const halfHeight = shape.size / 2;
    const scale = 1 / Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight, 1);
    return { x: shape.x + dx * scale, y: shape.y + dy * scale };
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
    const shape = this.graphNodeById(shapeId);
    if (!shape) return;
    const padding = shape.size / 2;
    const nextX = clamp(snap(x), padding, 1000 - padding);
    const nextY = clamp(snap(y), padding, 620 - padding);
    this.shapes.update((shapes) => shapes.map((item) => item.id === shapeId && item.type === 'graph-node'
      ? { ...item, x: nextX, y: nextY }
      : item));
  }
}
