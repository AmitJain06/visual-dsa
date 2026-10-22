import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { TopicPage } from './pages/topic/topic';
import { PathWithMaximumProbabilityPage } from './pages/path-with-maximum-probability/path-with-maximum-probability';
import { AppLayout } from './shared/components/app-layout/app-layout';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Home, title: 'Visual DSA' },
      { path: 'graph/path-with-maximum-probability', component: PathWithMaximumProbabilityPage, title: '1514. Path with Maximum Probability' },
      { path: ':section/:topic', component: TopicPage },
      { path: '**', redirectTo: '' }
    ]
  },
  { path: '**', redirectTo: '' }
];
