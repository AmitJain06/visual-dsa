import { Component, input } from '@angular/core';
import { GraphNode } from '../../../models/canvas-shape';

@Component({
  selector: 'g[app-graph-node]',
  standalone: true,
  templateUrl: './graph-node.html',
  styleUrl: './graph-node.scss'
})
export class GraphNodeComponent {
  readonly node = input.required<GraphNode>();
  readonly selected = input(false);
}
