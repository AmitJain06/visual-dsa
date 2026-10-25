import { Component } from '@angular/core';
import { Array } from '../../shared/components/data-structures/array/array';
import { Graph } from '../../shared/components/data-structures/graph/graph';

@Component({
  selector: 'app-home',
  imports: [Graph, Array],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {}
