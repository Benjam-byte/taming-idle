import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/exploration/exploration.page').then(
        (m) => m.ExplorationPage
      ),
  },  {
    path: 'relic-list',
    loadComponent: () => import('./modal/relic-list/relic-list.page').then( m => m.RelicListPage)
  },

];
