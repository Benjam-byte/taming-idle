import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/exploration/exploration.page').then(
        (m) => m.ExplorationPage
      ),
  },
];
