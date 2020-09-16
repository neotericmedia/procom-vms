import { RouterModule } from '@angular/router';
import { ActivityCentreComponent } from '../activity-centre-2/activity-centre/activity-centre.component';
export const ActivityCentreRouting = RouterModule.forChild([
  {
    path: '',
    component: ActivityCentreComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'to-do' },
      { path: 'to-do', pathMatch: 'full', component: ActivityCentreComponent },
      { path: 'in-progress', component: ActivityCentreComponent },
      { path: 'completed', pathMatch: 'full', component: ActivityCentreComponent },
      { path: '**', redirectTo: 'to-do', pathMatch: 'full' }
    ]
  }
]);

