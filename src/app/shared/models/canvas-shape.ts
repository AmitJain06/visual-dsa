export type CanvasNodeShape = 'circle' | 'square' | 'diamond' | 'triangle';
export type GraphNodeValueType = 'int' | 'string' | 'char' | 'double' | 'boolean';
export type ArrayNodeValueType = 'int' | 'char' | 'double' | 'boolean';

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

export interface ArrayNodeDefinition {
  type: 'array-node';
  label: 'Array node';
  color: string;
}

export interface ArrayNode extends ArrayNodeDefinition, CanvasShapeStyle, CanvasPoint {
  size: number;
  value: string | number | boolean;
  valueType: ArrayNodeValueType;
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

export type CanvasElement = GraphNode | ArrayNode | Edge;
export type CanvasElementDefinition = GraphNodeDefinition | ArrayNodeDefinition | EdgeDefinition;

export interface CanvasShapeDefaults {
  graphNode?: { valueType?: GraphNodeValueType };
  arrayNode?: { valueType?: ArrayNodeValueType };
  edge?: { directed?: boolean; weighted?: boolean };
}

export interface CanvasShapePropertyVisibility {
  graphNode?: { valueType?: boolean };
  arrayNode?: { valueType?: boolean };
  edge?: { directed?: boolean; weighted?: boolean };
}

export const CANVAS_SHAPE_PALETTE: readonly CanvasElementDefinition[] = [
  { type: 'graph-node', label: 'Graph node', color: '#776be8' },
  { type: 'array-node', label: 'Array node', color: '#3d9b89' },
  { type: 'edge', label: 'Edge', color: '#68708a' }
];
