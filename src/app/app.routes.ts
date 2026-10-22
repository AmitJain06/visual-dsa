import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { TopicPage } from './pages/topic/topic';
import { AppLayout } from './shared/components/app-layout/app-layout';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Home, title: 'Visual DSA' },
      { path: ':section/:topic', component: TopicPage },
      { path: '**', redirectTo: '' }
    ]
  },
  { path: '**', redirectTo: '' }
];
