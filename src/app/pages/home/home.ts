import { Component } from '@angular/core';
import { VisualCanvas } from '../../shared/components/visual-canvas/visual-canvas';

@Component({
  selector: 'app-home',
  imports: [VisualCanvas],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {}
