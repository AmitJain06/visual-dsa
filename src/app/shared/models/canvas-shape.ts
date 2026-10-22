export type CanvasNodeShape = 'circle' | 'square' | 'diamond' | 'triangle';
export type GraphNodeValueType = 'int' | 'string' | 'char' | 'double' | 'boolean';

export interface CanvasShapeStyle {
  id: string;
  color: string;
  blinking: boolean;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface GraphNodeDefinition {
  type: 'graph-node';
  label: 'Graph node';
  color: string;
}

export interface GraphNode extends GraphNodeDefinition, CanvasShapeStyle, CanvasPoint {
  size: number;
  shape: CanvasNodeShape;
  value: string | number | boolean;
  valueType: GraphNodeValueType;
}

export interface EdgeDefinition {
  type: 'edge';
  label: 'Edge';
  color: string;
}

export interface Edge extends EdgeDefinition, CanvasShapeStyle {
  sourceId: string;
  targetId: string;
  directed: boolean;
  weighted: boolean;
  weight?: number;
  thickness: number;
}

export type CanvasElement = GraphNode | Edge;
export type CanvasElementDefinition = GraphNodeDefinition | EdgeDefinition;

export interface CanvasShapeDefaults {
  graphNode?: { valueType?: GraphNodeValueType };
  edge?: { directed?: boolean; weighted?: boolean };
}

export interface CanvasShapePropertyVisibility {
  graphNode?: { valueType?: boolean };
  edge?: { directed?: boolean; weighted?: boolean };
}

export const CANVAS_SHAPE_PALETTE: readonly CanvasElementDefinition[] = [
  { type: 'graph-node', label: 'Graph node', color: '#776be8' },
  { type: 'edge', label: 'Edge', color: '#68708a' }
];
