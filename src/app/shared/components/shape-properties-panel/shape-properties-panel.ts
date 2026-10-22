import { Component, input, output } from '@angular/core';
import { CanvasElement } from '../../models/canvas-shape';

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

  protected update(changes: Partial<CanvasElement>): void {
    const shape = this.shape();
    if (shape) this.shapeChange.emit({ ...shape, ...changes });
  }

  protected updateValue(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'graph-node') return;
    const input = event.currentTarget as HTMLInputElement;
    const value = Number(input.value);
    if (!Number.isInteger(value)) {
      input.value = String(shape.value);
      return;
    }
    this.update({ value });
  }

  protected updateColor(event: Event): void {
    this.update({ color: (event.currentTarget as HTMLInputElement).value });
  }

  protected updateSize(event: Event): void {
    this.update({ size: Number((event.currentTarget as HTMLInputElement).value) });
  }

  protected updateBlinking(event: Event): void {
    this.update({ blinking: (event.currentTarget as HTMLInputElement).checked });
  }

  protected updateNodeShape(event: Event): void {
    const shape = this.shape();
    if (shape?.type !== 'graph-node') return;
    this.update({ shape: (event.currentTarget as HTMLSelectElement).value as typeof shape.shape });
  }
}
