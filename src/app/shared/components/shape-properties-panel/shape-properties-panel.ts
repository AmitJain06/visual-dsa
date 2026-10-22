import { Component, input, output } from '@angular/core';
import { CanvasElement, CanvasNodeShape, CanvasShapeStyle, Edge, GraphNode, GraphNodeValueType } from '../../models/canvas-shape';

@Component({
  selector: 'app-shape-properties-panel',
  standalone: true,
  templateUrl: './shape-properties-panel.html',
  styleUrl: './shape-properties-panel.scss',
  host: {
    '[class.is-open]': 'open()'
  }
})
export class ShapePropertiesPanel {
  readonly shape = input<CanvasElement | null>(null);
  readonly open = input(false);
  readonly shapeChange = output<CanvasElement>();
  readonly close = output<void>();

  protected updateColor(event: Event): void {
    this.updateCommon({ color: (event.currentTarget as HTMLInputElement).value });
  }

  protected updateBlinking(event: Event): void {
    this.updateCommon({ blinking: (event.currentTarget as HTMLInputElement).checked });
  }

  protected updateGraphNodeValue(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'graph-node') return;
    const input = event.currentTarget as HTMLInputElement;
    if (shape.valueType === 'boolean') {
      this.shapeChange.emit({ ...shape, value: input.checked });
      return;
    }
    if (shape.valueType === 'string' || shape.valueType === 'char') {
      this.shapeChange.emit({ ...shape, value: shape.valueType === 'char' ? input.value.slice(0, 1) : input.value });
      return;
    }
    const value = Number(input.value);
    if (!input.value || !Number.isFinite(value) || (shape.valueType === 'int' && !Number.isInteger(value))) {
      input.value = String(shape.value);
      return;
    }
    this.shapeChange.emit({ ...shape, value });
  }

  protected updateGraphNodeValueType(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'graph-node') return;
    const valueType = (event.currentTarget as HTMLSelectElement).value as GraphNodeValueType;
    if (valueType === shape.valueType) return;
    const numberValue = typeof shape.value === 'number' ? shape.value : Number(shape.value);
    const value = valueType === 'boolean'
      ? shape.value === true || shape.value === 1 || shape.value === 'true'
      : valueType === 'string' || valueType === 'char'
        ? valueType === 'char' ? String(shape.value).slice(0, 1) : String(shape.value)
        : Number.isFinite(numberValue)
          ? valueType === 'int' ? Math.trunc(numberValue) : numberValue
          : 0;
    this.shapeChange.emit({ ...shape, valueType, value });
  }

  protected updateGraphNodeSize(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'graph-node') return;
    this.shapeChange.emit({ ...shape, size: Number((event.currentTarget as HTMLInputElement).value) });
  }

  protected updateGraphNodeShape(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'graph-node') return;
    this.shapeChange.emit({ ...shape, shape: (event.currentTarget as HTMLSelectElement).value as CanvasNodeShape });
  }

  protected updateEdgeDirected(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'edge') return;
    this.shapeChange.emit({ ...shape, directed: (event.currentTarget as HTMLInputElement).checked });
  }

  protected updateEdgeWeighted(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'edge') return;
    const weighted = (event.currentTarget as HTMLInputElement).checked;
    this.shapeChange.emit({ ...shape, weighted, weight: weighted ? shape.weight ?? 1 : undefined });
  }

  protected updateEdgeWeight(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'edge') return;
    const input = event.currentTarget as HTMLInputElement;
    const weight = Number(input.value);
    if (!input.value || !Number.isFinite(weight)) {
      input.value = String(shape.weight ?? 1);
      return;
    }
    this.shapeChange.emit({ ...shape, weight });
  }

  protected updateEdgeThickness(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'edge') return;
    this.shapeChange.emit({ ...shape, thickness: Number((event.currentTarget as HTMLInputElement).value) });
  }

  private updateCommon(changes: Partial<Pick<CanvasShapeStyle, 'color' | 'blinking'>>): void {
    const shape = this.shape();
    if (!shape) return;
    this.shapeChange.emit({ ...shape, ...changes } as GraphNode | Edge);
  }
}
