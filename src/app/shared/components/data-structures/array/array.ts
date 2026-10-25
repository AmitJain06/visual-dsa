import { Component, computed, effect, input, model, untracked } from '@angular/core';
import { ArrayNode, ArrayNodeValueType, CanvasElement, CanvasShapeDefaults, CanvasShapePropertyVisibility, CanvasElementDefinition } from '../../../models/canvas-shape';
import { VisualCanvas } from '../../visual-canvas/visual-canvas';

const ARRAY_SHAPES: readonly CanvasElementDefinition[] = [
  { type: 'array-node', label: 'Array node', color: '#3d9b89' }
];

@Component({
  selector: 'app-array',
  standalone: true,
  imports: [VisualCanvas],
  templateUrl: './array.html',
  styleUrl: './array.scss'
})
export class Array {
  readonly title = input('Array');
  readonly shapes = model<CanvasElement[]>([]);
  readonly elementValueType = model<ArrayNodeValueType>('int');

  protected readonly availableShapes = ARRAY_SHAPES;
  protected readonly shapeDefaults = computed<CanvasShapeDefaults>(() => ({
    arrayNode: { valueType: this.elementValueType() }
  }));
  protected readonly propertyVisibility: CanvasShapePropertyVisibility = {
    arrayNode: { valueType: false }
  };

  constructor() {
    effect(() => {
      const valueType = this.elementValueType();
      untracked(() => this.shapes.update((shapes) => shapes.map((shape) => {
        if (shape.type !== 'array-node' || shape.valueType === valueType) return shape;
        return { ...shape, valueType, value: this.convertValue(shape.value, valueType) };
      })));
    });
  }

  protected updateElementValueType(event: Event): void {
    this.elementValueType.set((event.currentTarget as HTMLSelectElement).value as ArrayNodeValueType);
  }

  private convertValue(value: ArrayNode['value'], valueType: ArrayNodeValueType): ArrayNode['value'] {
    if (valueType === 'char') return String(value).slice(0, 1) || 'A';
    if (valueType === 'boolean') {
      return value === true || value === 1 || (typeof value === 'string' && value.toLowerCase() === 'true');
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 0;
    return valueType === 'int' ? Math.trunc(numericValue) : numericValue;
  }
}
