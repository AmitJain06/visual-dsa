import { Component, computed, effect, input, model, untracked } from '@angular/core';
import { CanvasElement, CanvasShapeDefaults, CanvasShapePropertyVisibility, CANVAS_SHAPE_PALETTE, GraphNode, GraphNodeValueType } from '../../../models/canvas-shape';
import { VisualCanvas } from '../../visual-canvas/visual-canvas';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [VisualCanvas],
  templateUrl: './graph.html',
  styleUrl: './graph.scss'
})
export class Graph {
  readonly title = input('Graph');
  readonly shapes = model<CanvasElement[]>([]);

  readonly directed = model(true);
  readonly weighted = model(false);
  readonly nodeValueType = model<GraphNodeValueType>('int');
  protected readonly availableShapes = CANVAS_SHAPE_PALETTE;
  protected readonly shapeDefaults = computed<CanvasShapeDefaults>(() => ({
    graphNode: { valueType: this.nodeValueType() },
    edge: { directed: this.directed(), weighted: this.weighted() }
  }));
  protected readonly propertyVisibility: CanvasShapePropertyVisibility = {
    graphNode: { valueType: false },
    edge: { directed: false, weighted: false }
  };

  constructor() {
    effect(() => {
      const directed = this.directed();
      const weighted = this.weighted();
      const nodeValueType = this.nodeValueType();
      untracked(() => this.shapes.update((shapes) => shapes.map((shape) => {
        if (shape.type === 'edge') {
          if (shape.directed === directed && shape.weighted === weighted && (weighted || shape.weight === undefined)) return shape;
          return { ...shape, directed, weighted, weight: weighted ? shape.weight ?? 1 : undefined };
        }
        if (shape.valueType === nodeValueType) return shape;
        return { ...shape, valueType: nodeValueType, value: this.convertValue(shape.value, nodeValueType) };
      })));
    });
  }

  protected updateDirected(event: Event): void {
    this.directed.set((event.currentTarget as HTMLInputElement).checked);
  }

  protected updateWeighted(event: Event): void {
    this.weighted.set((event.currentTarget as HTMLInputElement).checked);
  }

  protected updateNodeValueType(event: Event): void {
    const valueType = (event.currentTarget as HTMLSelectElement).value as GraphNodeValueType;
    this.nodeValueType.set(valueType);
  }

  private convertValue(value: GraphNode['value'], valueType: GraphNodeValueType): GraphNode['value'] {
    if (valueType === 'string') return String(value);
    if (valueType === 'char') return String(value).slice(0, 1) || 'A';
    if (valueType === 'boolean') {
      return value === true || value === 1 || (typeof value === 'string' && value.toLowerCase() === 'true');
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 0;
    return valueType === 'int' ? Math.trunc(numericValue) : numericValue;
  }
}
