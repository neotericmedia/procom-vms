import { Routes, RouterModule } from '@angular/router';

import { WorkorderSearchComponent } from './workorder-search/workorder-search.component';
import { WorkOrderSearchResolver } from './workorder-search/workorder-search.resolver';
import { PendingDocumentSearchComponent } from './pending-document-search/pending-document-search.component';
import { WorkorderTemplateSearchComponent } from './workorder-template-search/workorder-template-search.component';
import { WorkorderRootComponent } from './workorder-root/workorder-root.component';

// common
import { PhxConstants } from './../common/index';
import { AssignmentCreateSetupComponent } from './assignment-create-setup/assignment-create-setup.component';
import { AssignmentCreateComponent } from './assignment-create/assignment-create.component';
import { WorkorderCreateAdjustmentComponent } from './workorder-create-adjustment/workorder-create-adjustment.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'search'
  },
  {
    path: 'search',
    component: WorkorderSearchComponent,
    pathMatch: 'full',
    resolve: {
      resolvedData: WorkOrderSearchResolver
    }
  },
  {
    path: 'search/declined',
    component: WorkorderSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Declined Work Orders',
      dataSourceUrl: 'assignment/getDeclinedAssignmentSearch',
      dataGridComponentName: 'workorderSearchDeclined'
    },
    resolve: {
      resolvedData: WorkOrderSearchResolver
    }
  },
  {
    path: 'search/pending-review',
    component: WorkorderSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Work Orders Pending Review',
      dataSourceUrl: 'assignment/getPendingReview',
      dataGridComponentName: 'workorderSearchPendingReview'
    },
    resolve: {
      resolvedData: WorkOrderSearchResolver
    }
  },
  {
    path: 'search/pending-documents',
    component: PendingDocumentSearchComponent,
    pathMatch: 'full',
    resolve: {
      resolvedData: WorkOrderSearchResolver
    }
  },
  {
    path: 'search/templates',
    component: WorkorderTemplateSearchComponent
  },
  {
    path: 'transaction/adjustment/:userProfileId/:workOrderVersionId',
    component: WorkorderCreateAdjustmentComponent,
    pathMatch: 'full'
  },
  {
    path: ':assignmentId/:workorderId/:versionId/:tabId',
    component: WorkorderRootComponent,
    pathMatch: 'full'
  },
  {
    path: ':assignmentId/:workorderId/:versionId/activity/notes',
    component: WorkorderRootComponent,
    pathMatch: 'full'
  },
  {
    path: ':assignmentId/:workorderId/:versionId/activity/history',
    component: WorkorderRootComponent,
    pathMatch: 'full'
  },
  {
    path: ':assignmentId/:workorderId/:versionId/activity/transaction',
    component: WorkorderRootComponent,
    pathMatch: 'full'
  },
  {
    path: ':assignmentId/:workorderId/:versionId/activity/documents',
    component: WorkorderRootComponent,
    pathMatch: 'full'
  },
  {
    path: ':assignmentId/:workorderId/:versionId/activity/workflow',
    component: WorkorderRootComponent,
    pathMatch: 'full'
  },
  {
    path: 'createsetup',
    component: AssignmentCreateSetupComponent,
    pathMatch: 'full'
  },
  {
    path: 'createsetup/lineofbusiness/:lineofbusinessId/atssource/:atssourceId/atsplacement/:atsplacementId',
    component: AssignmentCreateSetupComponent,
    pathMatch: 'full'
  },
  {
    path: 'create/lineofbusiness/:lineofbusinessId/atssource/:atssourceId/atsplacement/:atsplacementId',
    component: AssignmentCreateComponent,
    pathMatch: 'full'
  }
];

export const WorkorderRoutes = RouterModule.forChild(routes);

