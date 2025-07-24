import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'exploration',
        loadComponent: () =>
          import('../../../pages/exploration/exploration.page').then(
            (m) => m.ExplorationPage
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/exploration',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/exploration',
    pathMatch: 'full',
  },
];
