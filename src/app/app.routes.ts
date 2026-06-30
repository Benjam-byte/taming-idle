import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () =>
      import('./screen/main/main.page').then((m) => m.MainPage),
  },
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
];
