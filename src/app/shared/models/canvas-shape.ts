export type CanvasNodeShape = 'circle' | 'square' | 'diamond' | 'triangle';
export type GraphNodeValueType = 'int' | 'string' | 'char' | 'double' | 'boolean';

export interface CanvasNodeStyle {
  id: string;
  x: number;
  y: number;
  color: string;
  /** Diameter in canvas units. */
  size: number;
  blinking: boolean;
  shape: CanvasNodeShape;
}

export interface GraphNodeDefinition {
  type: 'graph-node';
  label: 'Graph node';
  color: string;
}

export interface GraphNode extends GraphNodeDefinition, CanvasNodeStyle {
  value: string | number | boolean;
  valueType: GraphNodeValueType;
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
