import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JavascriptEditor } from '../../shared/components/javascript-editor/javascript-editor';

@Component({
  selector: 'app-javascript-practice-page',
  standalone: true,
  imports: [JavascriptEditor, RouterLink],
  templateUrl: './javascript-practice.html',
  styleUrl: './javascript-practice.scss'
})
export class JavascriptPracticePage {}
