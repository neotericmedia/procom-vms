import { RouterModule } from '@angular/router';
import { ReportListComponent } from './component/report-list/report-list.component';
import { ReportComponent } from './component/report/report.component';

export const ReportRouting = RouterModule.forChild([
  { path: ':reportId', component: ReportComponent, pathMatch: 'full' },
  { path: '**', component: ReportListComponent, pathMatch: 'full' }
]);
