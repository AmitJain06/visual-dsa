export type CanvasShapeType = 'circle' | 'rectangle' | 'triangle' | 'diamond';

export interface CanvasShapeDefinition {
  type: CanvasShapeType;
  label: string;
  fill: string;
  stroke: string;
}

export interface CanvasShape extends CanvasShapeDefinition {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface CanvasConnection {
  id: string;
  sourceId: string;
  targetId: string;
}

export const CANVAS_SHAPE_PALETTE: readonly CanvasShapeDefinition[] = [
  { type: 'circle', label: 'Circle', fill: '#efedff', stroke: '#776be8' },
  { type: 'rectangle', label: 'Rectangle', fill: '#e8f3ff', stroke: '#579ad8' },
  { type: 'triangle', label: 'Triangle', fill: '#fff0e9', stroke: '#e78d64' },
  { type: 'diamond', label: 'Diamond', fill: '#e5f7f0', stroke: '#4db48a' }
];
