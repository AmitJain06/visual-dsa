import { Component, computed, effect, input, model, untracked } from '@angular/core';
import { CanvasElement, CanvasShapeDefaults, CanvasShapePropertyVisibility, CANVAS_SHAPE_PALETTE, GraphNode, GraphNodeValueType } from '../../../models/canvas-shape';
import { GraphAdjacencyList } from '../../../models/graph-adjacency-list';
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
  readonly graphData = input<GraphAdjacencyList | null>(null);
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
      const graphData = this.graphData();
      if (!graphData) return;

      const weighted = graphData.edges.some((edge) => edge.length === 3);
      this.directed.set(graphData.isDirected);
      this.weighted.set(weighted);
      this.shapes.set(this.createCanvasElements(graphData));
    });

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

  private createCanvasElements(graphData: GraphAdjacencyList): CanvasElement[] {
    const radius = graphData.nodes === 2 ? 150 : 220;
    const nodes: GraphNode[] = Array.from({ length: graphData.nodes }, (_, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / graphData.nodes;
      const position = graphData.nodes === 2
        ? { x: index === 0 ? 350 : 650, y: 310 }
        : {
            x: graphData.nodes === 1 ? 500 : 500 + Math.cos(angle) * radius,
            y: graphData.nodes === 1 ? 310 : 310 + Math.sin(angle) * radius
          };

      return {
        type: 'graph-node',
        label: 'Graph node',
        id: `graph-model-node-${index}`,
        color: '#776be8',
        blinking: false,
        size: 72,
        shape: 'circle',
        value: index,
        valueType: 'int',
        ...position
      };
    });

    const edges = graphData.edges.map((edge, index): CanvasElement => ({
      type: 'edge',
      label: 'Edge',
      id: `graph-model-edge-${index}`,
      sourceId: `graph-model-node-${edge[0]}`,
      targetId: `graph-model-node-${edge[1]}`,
      color: '#68708a',
      blinking: false,
      directed: graphData.isDirected,
      weighted: edge.length === 3,
      ...(edge.length === 3 ? { weight: edge[2] } : {}),
      thickness: 2
    }));

    return [...nodes, ...edges];
  }
}
