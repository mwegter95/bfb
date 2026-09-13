import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Belisle for Birchwood | Write in Ashley Belisle for City Council',
    loadComponent: () => import('./pages/home').then((m) => m.HomePage),
  },
  {
    path: 'meet-ashley',
    title: 'Meet Ashley | Belisle for Birchwood',
    loadComponent: () => import('./pages/meet-ashley').then((m) => m.MeetAshleyPage),
  },
  {
    path: 'connect',
    title: 'Connect | Belisle for Birchwood',
    loadComponent: () => import('./pages/connect').then((m) => m.ConnectPage),
  },
  { path: '**', redirectTo: '' },
];
