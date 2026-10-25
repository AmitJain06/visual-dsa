import { Component, input } from '@angular/core';
import { ArrayNode } from '../../../models/canvas-shape';

@Component({
  selector: 'g[app-array-node]',
  standalone: true,
  templateUrl: './array-node.html',
  styleUrl: './array-node.scss'
})
export class ArrayNodeComponent {
  readonly node = input.required<ArrayNode>();
  readonly selected = input(false);
}
