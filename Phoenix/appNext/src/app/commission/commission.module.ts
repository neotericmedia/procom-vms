import { CommissionReportResolver } from './commission-report/commission-report.resolver';
import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionRouting } from './commission-routing.module';
import { CommissionSearchComponent } from './commission-search/commission-search.component';
import { CommissionRatesSearchComponent } from './commission-search/commission-rates-search.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { DxButtonModule, DxPopupModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxTextAreaModule, DxNumberBoxModule, DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule, DxTagBoxModule } from 'devextreme-angular';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommissionSearchTemplatesComponent } from './commission-search-templates/commission-search-templates.component';
import { CommissionAdjustmentComponent } from './commission-adjustment/commission-adjustment.component';
import { CommissionAdjustmentEditComponent } from './commission-adjustment-edit/commission-adjustment-edit.component';
import { CommissionPendingInterestSearchComponent } from './commission-pending-interest-search/commission-pending-interest-search.component';
import { CommissionService } from './commission.service';
import { CommissionSalesPatternsComponent } from './commission-sales-patterns/commission-sales-patterns.component';
import { CommissionBranchSummaryComponent } from './commission-branch-summary/commission-branch-summary.component';
import { CommissionBranchSummaryResolver } from './commission-branch-summary/commission-branch-summary.resolver';
import { OrganizationApiService } from '../organization/organization.api.service';
import { WorkorderService } from '../workorder/workorder.service';
import { CommissionReportComponent } from './commission-report/commission-report.component';
import { CommissionReportDrilldownComponent } from './commission-report-drilldown/commission-report-drilldown.component';
import { CommissionSalesPatternDetailsComponent } from './commission-sales-pattern-details/commission-sales-pattern-details.component';
import { CommmissionTemplateDetailsComponent } from './commission-template-details/commission-template-details.component';
import { CommissionRateAddRestrictionComponent } from './commission-rate-add-restriction/commission-rate-add-restriction.component';
import { CommissionAddWorkOrderComponent } from './commission-add-work-order/commission-add-work-order.component';
import { CommissionAddWorkOrderDialogComponent } from './commission-add-work-order-dialog/commission-add-work-order-dialog.component';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { CommissionRateComponent } from './commission-rate/commission-rate.component';
import { CommissionRateObservableService } from './state/commission-rate.observable.service';
import { CommissionRateApiServiceLocator } from './commission-rate-api.service.locator';
import { CommissionRateTabDetailsComponent } from './commission-rate-tab-details/commission-rate-tab-details.component';
import { RestrictionModule } from './../restriction/restriction.module';
import { CommissionDowngradeModule } from './commission-downgrade.module';
import { CommissionHeaderComponent } from './commission-header/commission-header.component';
import { CommissionRateWorkflowComponent } from './commission-rate-workflow/commission-rate-workflow.component';
import { CommissionRateSetUpComponent } from './commission-rate-setup/commission-rate-setup.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    PhoenixCommonModule,
    DxButtonModule,
    DxPopupModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxRadioGroupModule,
    DxTagBoxModule,
    CommissionRouting,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    PhxDocumentFileUploadModule,
    RestrictionModule,
    CommissionDowngradeModule

  ],
  declarations: [
    CommissionSearchComponent,
    CommissionRatesSearchComponent,
    CommissionSearchTemplatesComponent,
    CommissionAdjustmentComponent,
    CommissionPendingInterestSearchComponent,
    CommissionSalesPatternsComponent,
    CommissionBranchSummaryComponent,
    CommissionReportComponent,
    CommissionReportDrilldownComponent,
    CommissionSalesPatternDetailsComponent,
    CommmissionTemplateDetailsComponent,
    CommissionRateAddRestrictionComponent,
    CommissionAdjustmentEditComponent,
    CommissionAddWorkOrderComponent,
    CommissionAddWorkOrderDialogComponent,
    CommissionRateComponent,
    CommissionRateTabDetailsComponent,
    CommissionHeaderComponent,
    CommissionRateWorkflowComponent,
    CommissionRateSetUpComponent,
],
  providers: [
    CommissionBranchSummaryResolver,
    CommissionReportResolver,
    OrganizationApiService,
    WorkorderService,
    CommissionService,
    CommissionRateObservableService
    ]

})
export class CommissionModule {
  constructor(private injector: Injector) {
    CommissionRateApiServiceLocator.injector = this.injector;
  }
}
