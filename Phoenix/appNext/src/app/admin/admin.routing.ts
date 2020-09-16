import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';

export const AdminRouting = RouterModule.forChild([
  {
    path: '',
    component: AdminComponent
  },

]);
