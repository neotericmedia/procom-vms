import { RouterModule } from '@angular/router';
import { UserGuidesComponent } from './user-guides/user-guides.component';

export const UserGuidesRouting = RouterModule.forChild([
  { path: '**', component: UserGuidesComponent, pathMatch: 'full' }
]);
