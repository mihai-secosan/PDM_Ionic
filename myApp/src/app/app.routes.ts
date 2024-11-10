import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'email',
    pathMatch: 'full',
  },
  {
    path: 'master',
    loadComponent: () => import('./master/master.page').then( m => m.MasterPage)
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./detail/detail.page').then((m) => m.DetailPage)
  },
  {
    path: 'email',
    loadComponent: () => import('./email/email.page').then( m => m.EmailPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.page').then( m => m.SignupPage)
  },
];
