import { RouterModule } from '@angular/router';
import { ActivityCentreComponent } from './activity-centre/activity-centre.component';
import { ActivityCentreSummaryComponent } from './activity-centre-summary/activity-centre-summary.component';
import { ActivityCentreDummyFilterComponent } from './activity-centre-dummy-filter/activity-centre-dummy-filter.component';

export const ActivityCentreRouting = RouterModule.forChild([
  {
    path: '',
    component: ActivityCentreComponent,
    children: [
      { path: '', redirectTo: 'my-tasks', pathMatch: 'full' },
      { path: 'my-tasks', component: ActivityCentreSummaryComponent },
      { path: 'all-tasks', component: ActivityCentreSummaryComponent },
      {
        path: 'my-tasks/:EntityTypeId',
        component: ActivityCentreSummaryComponent,
        children: [{ path: ':filters', component: ActivityCentreDummyFilterComponent }]
      },
      {
        path: 'all-tasks/:EntityTypeId',
        component: ActivityCentreSummaryComponent,
        children: [{ path: ':filters', component: ActivityCentreDummyFilterComponent }]
      },
      { path: '**', component: ActivityCentreSummaryComponent, pathMatch: 'full' }
    ]
  },

]);
