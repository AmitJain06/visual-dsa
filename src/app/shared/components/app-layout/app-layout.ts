import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AppSidebar } from './components/sidebar/sidebar';
import { AppTopbar } from './components/topbar/topbar';

@Component({
  selector: 'app-layout',
  imports: [AppSidebar, AppTopbar, RouterOutlet],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayout {
  private readonly router = inject(Router);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly currentPage = signal('Overview');

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.updateCurrentPage());
    this.updateCurrentPage();
  }

  protected toggleSidebar(): void {
    if (window.matchMedia('(max-width: 700px)').matches) {
      this.mobileOpen.update((open) => !open);
      return;
    }

    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  protected closeMobileSidebar(): void {
    this.mobileOpen.set(false);
  }

  protected expandSidebar(): void {
    this.sidebarCollapsed.set(false);
  }

  private updateCurrentPage(): void {
    const path = this.router.url.split('?')[0];
    const segments = path.split('/').filter(Boolean);
    const topic = segments[1]?.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    this.currentPage.set(topic ?? 'Overview');
  }
}
