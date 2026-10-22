export type GraphNodeShape = 'circle' | 'square' | 'diamond' | 'triangle';

export interface GraphNodeDefinition {
  type: 'graph-node';
  label: 'Graph node';
  color: string;
}

export interface GraphNode extends GraphNodeDefinition {
  id: string;
  x: number;
  y: number;
  value: number;
  /** Diameter in canvas units. */
  size: number;
  blinking: boolean;
  shape: GraphNodeShape;
}

export type CanvasElement = GraphNode;
export type CanvasElementDefinition = GraphNodeDefinition;

export interface CanvasConnection {
  id: string;
  sourceId: string;
  targetId: string;
}

export const CANVAS_SHAPE_PALETTE: readonly CanvasElementDefinition[] = [
  { type: 'graph-node', label: 'Graph node', color: '#776be8' }
];
