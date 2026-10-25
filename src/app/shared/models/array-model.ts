import { ArrayNode } from './canvas-shape';

/** An array's canvas elements. `size` is the number of entries and must match `arrayNodes.length`. */
export interface ArrayModel {
  size: number;
  arrayNodes: ArrayNode[];
}
