import { TimeSheetNotFoundComponent } from './component/time-sheet-not-found/time-sheet-not-found.component';
import { TimeSheetTimeCardSummaryComponent } from './component/time-sheet-time-card-summary/time-sheet-time-card-summary.component';
import { TimeSheetExceptionsComponent } from './component/time-sheet-exceptions/time-sheet-exceptions.component';
import { TimeSheetEntryComponent } from './component/time-sheet-entry/time-sheet-entry.component';
import { TimeSheetSearchComponent } from './component/time-sheet-search/time-sheet-search.component';
import { RouterModule } from '@angular/router';
import { TimeSheetComponent } from './component/time-sheet/time-sheet.component';
import { TimeSheetTimeCardComponent } from './component/time-sheet-time-card/time-sheet-time-card.component';
import { TimeSheetNotesAttachmentsComponent } from './component/time-sheet-notes-attachments/time-sheet-notes-attachments.component';
import { TimeSheetProjectsComponent } from './component/time-sheet-projects/time-sheet-projects.component';
import { TimeSheetHistoryComponent } from './component/time-sheet-history/time-sheet-history.component';

export const TimeSheetRouting = RouterModule.forChild([
  { path: 'entry', component: TimeSheetEntryComponent, pathMatch: 'full' },
  { path: 'not-found', component: TimeSheetNotFoundComponent, pathMatch: 'full' },
  { path: 'search', component: TimeSheetSearchComponent, pathMatch: 'full' },
  {
    path: 'search/pending-client-review', component: TimeSheetSearchComponent, pathMatch: 'full',
    data: {
      oDataParameterFilters: '&$filter=(TimeSheetStatusId eq 3)', // 3-PendingClientReview
      dataGridComponentName: 'TimeSheetPendingClientReview',
      pageTitleKey: 'timesheet-pending-client-review',
    }
  },
  {
    path: 'search/pending-review', component: TimeSheetSearchComponent, pathMatch: 'full',
    data: {
      oDataParameterFilters: '&$filter=(TimeSheetStatusId eq 8)', // 8-PendingSupportingDocumentReview
      dataGridComponentName: 'TimeSheetPendingReview',
      pageTitleKey: 'timesheet-pending-review',
    }
  },
  {
    path: 'search/declined', component: TimeSheetSearchComponent, pathMatch: 'full',
    data: {
      dataSourceUrl: 'timesheet/getTimesheetsDeclined',
      oDataParameterFilters: '',
      dataGridComponentName: 'TimeSheetDeclined',
      pageTitleKey: 'timesheet-declined',
    }
  },
  { path: 'exceptions', component: TimeSheetExceptionsComponent, pathMatch: 'full' },
  {
    path: ':TimeSheetId', component: TimeSheetComponent,
    children: [
      { path: 'projects', component: TimeSheetProjectsComponent },
      { path: 'notes-attachments', component: TimeSheetNotesAttachmentsComponent },
      { path: 'history', component: TimeSheetHistoryComponent },
      { path: 'summary', component: TimeSheetTimeCardSummaryComponent },
      { path: '**', component: TimeSheetTimeCardComponent, pathMatch: 'full' },
    ]
  },
  { path: '**', component: TimeSheetSearchComponent, pathMatch: 'full' },
]);
