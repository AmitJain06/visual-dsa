import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavigationPage {
  label: string;
  path: string;
}

interface NavigationSubgroup {
  id: string;
  label: string;
  pages: NavigationPage[];
}

interface NavigationGroup {
  id: string;
  label: string;
  icon: string;
  subgroups: NavigationSubgroup[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  host: { '[class.mobile-open]': 'mobileOpen()' },
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class AppSidebar {
  readonly collapsed = input(false);
  readonly mobileOpen = input(false);
  readonly itemSelected = output<void>();
  readonly expandRequested = output<void>();

  protected readonly expandedGroups = signal(new Set(['algorithms', 'sorting', 'searching', 'structures', 'linear-structures', 'trees']));

  protected readonly navigation: NavigationGroup[] = [
    {
      id: 'algorithms',
      label: 'Algorithms',
      icon: 'pi-sparkles',
      subgroups: [
        { id: 'sorting', label: 'Sorting', pages: [{ label: 'Bubble sort', path: '/algorithms/bubble-sort' }, { label: 'Merge sort', path: '/algorithms/merge-sort' }, { label: 'Quick sort', path: '/algorithms/quick-sort' }] },
        { id: 'searching', label: 'Searching', pages: [{ label: 'Linear search', path: '/algorithms/linear-search' }, { label: 'Binary search', path: '/algorithms/binary-search' }] },
        { id: 'graph-algorithms', label: 'Graph algorithms', pages: [{ label: 'Breadth-first search', path: '/algorithms/breadth-first-search' }, { label: 'Depth-first search', path: '/algorithms/depth-first-search' }] }
      ]
    },
    {
      id: 'structures',
      label: 'Data structures',
      icon: 'pi-box',
      subgroups: [
        { id: 'linear-structures', label: 'Linear structures', pages: [{ label: 'Arrays', path: '/data-structures/arrays' }, { label: 'Linked lists', path: '/data-structures/linked-lists' }, { label: 'Stacks', path: '/data-structures/stacks' }, { label: 'Queues', path: '/data-structures/queues' }] },
        { id: 'trees', label: 'Trees', pages: [{ label: 'Binary tree', path: '/data-structures/binary-tree' }, { label: 'Binary search tree', path: '/data-structures/binary-search-tree' }, { label: 'Heap', path: '/data-structures/heap' }] }
      ]
    }
  ];

  protected isExpanded(groupId: string): boolean {
    return this.expandedGroups().has(groupId);
  }

  protected toggleGroup(groupId: string): void {
    if (this.collapsed() && !this.mobileOpen()) {
      this.expandRequested.emit();
      this.expandedGroups.update((groups) => new Set(groups).add(groupId));
      return;
    }

    this.expandedGroups.update((groups) => {
      const next = new Set(groups);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }
}
