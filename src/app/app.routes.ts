import { Routes } from '@angular/router';
import { DetailComponent } from './dashboard/detail/detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];
