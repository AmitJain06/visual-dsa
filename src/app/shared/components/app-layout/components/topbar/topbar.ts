import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class AppTopbar {
  readonly currentPage = input('Overview');
  readonly mobileOpen = input(false);
  readonly navigationToggle = output<void>();
}
