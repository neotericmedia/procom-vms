import { CommissionReportComponent } from './commission-report/commission-report.component';
import { CommissionPendingInterestSearchComponent } from './commission-pending-interest-search/commission-pending-interest-search.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommissionSearchComponent } from './commission-search/commission-search.component';
import { CommissionRatesSearchComponent } from './commission-search/commission-rates-search.component';
import { CommissionSearchTemplatesComponent } from './commission-search-templates/commission-search-templates.component';
import { CommissionAdjustmentComponent } from './commission-adjustment/commission-adjustment.component';
import { CommissionAdjustmentEditComponent } from './commission-adjustment-edit/commission-adjustment-edit.component';
import { CommissionSalesPatternsComponent } from './commission-sales-patterns/commission-sales-patterns.component';
import { CommissionBranchSummaryComponent } from './commission-branch-summary/commission-branch-summary.component';
import { CommissionBranchSummaryResolver } from './commission-branch-summary/commission-branch-summary.resolver';
import { CommissionReportResolver } from './commission-report/commission-report.resolver';
import { CommissionSalesPatternDetailsComponent } from './commission-sales-pattern-details/commission-sales-pattern-details.component';
import { CommmissionTemplateDetailsComponent } from './commission-template-details/commission-template-details.component';
import { CommissionRateComponent } from './commission-rate/commission-rate.component';
import { CommissionRateSetUpComponent } from './commission-rate-setup/commission-rate-setup.component';

export const CommissionRouting = RouterModule.forChild([
  { path: 'search', component: CommissionSearchComponent, pathMatch: 'full' },
  { path: 'rates-search/:commissionUserProfileId', component: CommissionRatesSearchComponent, pathMatch: 'full' },
  { path: 'search-templates', component: CommissionSearchTemplatesComponent, pathMatch: 'full' },
  { path: 'adjustment', component: CommissionAdjustmentComponent, pathMatch: 'full' },
  { path: 'adjustment/edit/:Id', component: CommissionAdjustmentEditComponent, pathMatch: 'full' },
  { path: 'pendinginterest', component: CommissionPendingInterestSearchComponent, pathMatch: 'full' },
  { path: 'pendinginterest/:reportUserProfileId', component: CommissionPendingInterestSearchComponent, pathMatch: 'full' },
  { path: 'salespatterns', component: CommissionSalesPatternsComponent, pathMatch: 'full' },
  { path: 'pattern-sales/:salesPatternId', component: CommissionSalesPatternDetailsComponent, pathMatch: 'full' },
  {
    path: 'branchsummary',
    component: CommissionBranchSummaryComponent,
    pathMatch: 'full',
    resolve: {
      resolvedData: CommissionBranchSummaryResolver
    }
  },
  {
    path: 'report',
    component: CommissionReportComponent,
    pathMatch: 'full',
    resolve: {
      resolvedData: CommissionReportResolver
    }
  },
  {
    path: 'report/:CommissionUserProfileId/:reportYear/:reportMonth/:OrganizationIdInternal',
    component: CommissionReportComponent,
    pathMatch: 'full',
    resolve: {
      resolvedData: CommissionReportResolver
    }
  },
  { path: 'templateedit/:id', component: CommmissionTemplateDetailsComponent, pathMatch: 'full' },
  { path: 'rate/:commissionRateHeaderId/:commissionRateVersionId/:tabName', component: CommissionRateComponent },
  { path: 'ratesetup/:id', component: CommissionRateSetUpComponent },
  { path: 'ratecreate/:commissionUserProfileId/:commissionRoleId/:commissionRateTypeId/:commissionTemplateId', component: CommissionRateComponent }
]);
