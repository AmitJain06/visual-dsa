import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSidebar } from './components/sidebar/sidebar';
import { AppTopbar } from './components/topbar/topbar';

@Component({
  selector: 'app-layout',
  imports: [AppSidebar, AppTopbar, RouterOutlet],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayout {
}
