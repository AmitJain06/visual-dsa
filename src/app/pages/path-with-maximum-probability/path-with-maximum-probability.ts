import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Graph } from '../../shared/components/data-structures/graph/graph';
import { GraphAdjacencyList, GraphAdjacencyListEdge } from '../../shared/models/graph-adjacency-list';

interface EditableEdge {
  id: number;
  from: number;
  to: number;
  weight: number;
}

@Component({
  selector: 'app-path-with-maximum-probability-page',
  imports: [Graph, RouterLink],
  templateUrl: './path-with-maximum-probability.html',
  styleUrl: './path-with-maximum-probability.scss'
})
export class PathWithMaximumProbabilityPage {
  protected readonly nodeCount = signal(3);
  protected readonly isDirected = signal(false);
  protected readonly isWeighted = signal(true);
  protected readonly edges = signal<EditableEdge[]>([
    { id: 1, from: 0, to: 1, weight: 0.5 },
    { id: 2, from: 1, to: 2, weight: 0.5 },
    { id: 3, from: 0, to: 2, weight: 0.2 }
  ]);
  private nextEdgeId = 4;

  protected readonly graphData = computed(() => {
    const modelEdges: GraphAdjacencyListEdge[] = this.edges().map((edge): GraphAdjacencyListEdge =>
      this.isWeighted() ? [edge.from, edge.to, edge.weight] : [edge.from, edge.to]
    );
    return new GraphAdjacencyList(this.nodeCount(), this.isDirected(), modelEdges);
  });

  protected updateNodeCount(event: Event): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    if (!Number.isFinite(value)) return;
    const count = Math.max(2, Math.floor(value));
    this.nodeCount.set(count);
    this.edges.update((edges) => edges.filter((edge) => edge.from < count && edge.to < count));
  }

  protected updateDirected(event: Event): void {
    this.isDirected.set((event.currentTarget as HTMLInputElement).checked);
  }

  protected updateWeighted(event: Event): void {
    this.isWeighted.set((event.currentTarget as HTMLInputElement).checked);
  }

  protected updateEdgeField(edgeId: number, field: 'from' | 'to' | 'weight', event: Event): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    if (!Number.isFinite(value)) return;

    this.edges.update((edges) => edges.map((edge) => {
      if (edge.id !== edgeId) return edge;
      if (field === 'weight') return { ...edge, weight: Math.min(1, Math.max(0, value)) };
      return { ...edge, [field]: Math.min(this.nodeCount() - 1, Math.max(0, Math.floor(value))) };
    }));
  }

  protected addEdge(): void {
    this.edges.update((edges) => [...edges, {
      id: this.nextEdgeId++,
      from: 0,
      to: this.nodeCount() - 1,
      weight: 0.5
    }]);
  }

  protected removeEdge(edgeId: number): void {
    this.edges.update((edges) => edges.filter((edge) => edge.id !== edgeId));
  }
}
