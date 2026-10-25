import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Array as ArrayCanvas } from '../../shared/components/data-structures/array/array';
import { ArrayNode, CanvasElement } from '../../shared/models/canvas-shape';
import { ArrayModel } from '../../shared/models/array-model';

function createInitialArray(): ArrayModel {
  const values = [7, 12, 4, 19, 6];
  const arrayNodes: ArrayNode[] = values.map((value, index) => ({
    type: 'array-node',
    label: 'Array node',
    id: `array-traversal-${index}`,
    color: '#3d9b89',
    blinking: false,
    x: 220 + index * 140,
    y: 310,
    size: 80,
    value,
    valueType: 'int'
  }));
  return { size: arrayNodes.length, arrayNodes };
}

@Component({
  selector: 'app-array-traversal-page',
  standalone: true,
  imports: [ArrayCanvas, RouterLink],
  templateUrl: './array-traversal.html',
  styleUrl: './array-traversal.scss'
})
export class ArrayTraversalPage {
  protected readonly arrayModel = signal<ArrayModel>(createInitialArray());
  protected readonly currentIndex = signal(-1);
  protected readonly statusMessage = signal('Ready to traverse the array from left to right.');
  protected readonly visitedCount = computed(() => Math.min(this.currentIndex() + 1, this.arrayModel().size));
  protected readonly canStep = computed(() => this.currentIndex() < this.arrayModel().size);

  protected updateArrayNodes(elements: CanvasElement[]): void {
    const arrayNodes = elements.filter((element): element is ArrayNode => element.type === 'array-node');
    const previousIds = this.arrayModel().arrayNodes.map((node) => node.id);
    const nextIds = arrayNodes.map((node) => node.id);
    const structureChanged = previousIds.length !== nextIds.length || previousIds.some((id, index) => id !== nextIds[index]);
    const nextNodes = structureChanged ? arrayNodes.map((node) => ({ ...node, blinking: false })) : arrayNodes;
    this.arrayModel.update((current) => ({ ...current, size: nextNodes.length, arrayNodes: nextNodes }));
    if (structureChanged) {
      this.currentIndex.set(-1);
      this.statusMessage.set('Array changed. Traversal reset to index 0.');
    } else if (this.currentIndex() > arrayNodes.length) {
      this.currentIndex.set(arrayNodes.length);
    }
  }

  protected stepTraversal(): void {
    const arrayNodes = this.arrayModel().arrayNodes;
    const nextIndex = this.currentIndex() + 1;
    if (nextIndex >= arrayNodes.length) {
      this.currentIndex.set(arrayNodes.length);
      this.arrayModel.update((current) => ({
        ...current,
        arrayNodes: current.arrayNodes.map((node) => ({ ...node, blinking: false }))
      }));
      this.statusMessage.set(`Traversal complete. Visited ${arrayNodes.length} ${arrayNodes.length === 1 ? 'element' : 'elements'}.`);
      return;
    }

    const currentNode = arrayNodes[nextIndex];
    this.currentIndex.set(nextIndex);
    this.arrayModel.update((current) => ({
      ...current,
      arrayNodes: current.arrayNodes.map((node, index) => ({ ...node, blinking: index === nextIndex }))
    }));
    this.statusMessage.set(`Visiting index ${nextIndex}: ${currentNode.value}.`);
  }

  protected resetTraversal(): void {
    this.currentIndex.set(-1);
    this.arrayModel.update((current) => ({
      ...current,
      arrayNodes: current.arrayNodes.map((node) => ({ ...node, blinking: false }))
    }));
    this.statusMessage.set('Traversal reset. Ready to start from index 0.');
  }
}
