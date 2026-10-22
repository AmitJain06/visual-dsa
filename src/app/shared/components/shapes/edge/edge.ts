import { Component, input } from '@angular/core';
import { CanvasPoint, Edge } from '../../../models/canvas-shape';

@Component({
  selector: 'g[app-edge]',
  standalone: true,
  templateUrl: './edge.html',
  styleUrl: './edge.scss'
})
export class EdgeComponent {
  readonly edge = input.required<Edge>();
  readonly start = input.required<CanvasPoint>();
  readonly end = input.required<CanvasPoint>();
  readonly selected = input(false);
}
