import { Component } from '@angular/core';
import { Graph } from '../../shared/components/data-structures/graph/graph';

@Component({
  selector: 'app-home',
  imports: [Graph],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {}
