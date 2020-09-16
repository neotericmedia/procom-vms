import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';

import { OrganizationApiService } from '../organization/organization.api.service';
import { WorkOrderSearchResolver } from './workorder-search/workorder-search.resolver';
import { WorkOrderSearchDatagridComponent } from './work-order-search-datagrid/work-order-search-datagrid.component';

import { DxDataGridModule } from 'devextreme-angular';
import { WorkorderTabCoreComponent } from './workorder-tab-core/workorder-tab-core.component';
import { WorkorderHeaderComponent } from './workorder-header/workorder-header.component';
import { WorkorderTabCoreCollaboratorsComponent } from './workorder-tab-core-collaborators/workorder-tab-core-collaborators.component';
import { WorkorderTabCoreDetailsComponent } from './workorder-tab-core-details/workorder-tab-core-details.component';
import { WorkorderTabCoreCommissionComponent } from './workorder-tab-core-commission/workorder-tab-core-commission.component';
import { WorkorderService } from './workorder.service';
import { WorkorderObservableService } from './state/workorder.observable.service';
import { WorkOrderApiServiceLocator } from './workorder.api.service.locator';
import { WorkorderComponent } from './workorder/workorder.component';
import { WorkOrdernWorkflowComponent } from './workorder-workflow/workorder-workflow.component';
import { WorkorderTabPartiesComponent } from './workorder-tab-parties/workorder-tab-parties.component';
import { WorkorderBillingPartiesComponent } from './workorder-billing-parties/workorder-billing-parties.component';
import { WorkorderPaymentPartiesComponent } from './workorder-payment-parties/workorder-payment-parties.component';
import { WorkorderTabTimeMaterialAndInvoiceComponent } from './workorder-tab-time-material/workorder-tab-time-material.component';
import { WorkorderTabExpenseInvoiceComponent } from './workorder-tab-expense-invoice/workorder-tab-expense-invoice.component';
import { WorkorderTabPurchaseOrderComponent } from './workorder-tab-purchase-order/workorder-tab-purchase-order.component';
import { WorkorderTabEarningsDeductionsComponent } from './workorder-tab-earnings-deduction/workorder-tab-earnings-deduction.component';
import { WorkorderTabTaxesComponent } from './workorder-tab-taxes/workorder-tab-taxes.component';
import { WorkorderTabDocumentsComponent } from './workorder-tab-documents/workorder-tab-documents.component';
import { WorkorderTabActivityComponent } from './workorder-tab-activity/workorder-tab-activity.component';
import { WorkorderTabActivityDocumentsComponent } from './workorder-tab-activity-documents/workorder-tab-activity-documents.component';
import { WorkorderTabActivityTransactionComponent } from './workorder-tab-activity-transaction/workorder-tab-activity-transaction.component';
import { WorkorderTimeMaterialDetailComponent } from './workorder-time-material-detail/workorder-time-material-detail.component';
import { WorkorderBillingInvoicesComponent } from './workorder-billing-invoices/workorder-billing-invoices.component';
import { WorkorderBillingInvoiceComponent } from './workorder-billing-invoice/workorder-billing-invoice.component';
import { WorkorderBillingRecipientComponent } from './workorder-billing-recipient/workorder-billing-recipient.component';
import { WorkorderPaymentInvoicesComponent } from './workorder-payment-invoices/workorder-payment-invoices.component';
import { WorkorderPaymentReleaseScheduleComponent } from './workorder-payment-release-schedule/workorder-payment-release-schedule.component';
import { WorkorderPaymentInvoiceComponent } from './workorder-payment-invoice/workorder-payment-invoice.component';
import { WorkorderPaymentContactComponent } from './workorder-payment-contact/workorder-payment-contact.component';
import { WorkorderExpenseDetailComponent } from './workorder-expense-detail/workorder-expense-detail.component';
import { WorkorderBillingTaxesComponent } from './workorder-billing-taxes/workorder-billing-taxes.component';
import { WorkorderPaymentTaxesComponent } from './workorder-payment-taxes/workorder-payment-taxes.component';
import { WorkorderIncentiveCompensationComponent } from './workorder-incentive-compensation/workorder-incentive-compensation.component';
import { WorkorderBillingPartyComponent } from './workorder-billing-party/workorder-billing-party.component';
import { WorkorderBillingRatesComponent } from './workorder-billing-rates/workorder-billing-rates.component';
import { WorkorderBillingRateComponent } from './workorder-billing-rate/workorder-billing-rate.component';
import { WorkorderRebateVmsfeeComponent } from './workorder-rebate-vmsfee/workorder-rebate-vmsfee.component';
import { WorkorderPaymentPartyComponent } from './workorder-payment-party/workorder-payment-party.component';
import { WorkorderPaymentRatesComponent } from './workorder-payment-rates/workorder-payment-rates.component';
import { WorkorderPaymentRateComponent } from './workorder-payment-rate/workorder-payment-rate.component';
import { WorkorderTabEarningsAndDeductionOtherEarningsComponent } from './workorder-tab-earnings-and-deduction-other-earnings/workorder-tab-earnings-and-deduction-other-earnings.component';
import { WorkorderTabEarningsAndDeductionSafetyInsuranceComponent } from './workorder-tab-earnings-and-deduction-safety-insurance/workorder-tab-earnings-and-deduction-safety-insurance.component';
import { WorkorderTabEarningsAndDeductionStatutoryHolidayComponent } from './workorder-tab-earnings-deduction-statutory-holiday/workorder-tab-earnings-deduction-statutory-holiday.component';
import { WorkorderTabEarningsAndDeductionSourceDeductionComponent } from './workorder-tab-earnings-deduction-source-deductions/workorder-tab-earnings-deduction-source-deduction.component';
import { WorkorderTabEarningsAndDeductionTaxesComponent } from './workorder-tab-earnings-deduction-taxes/workorder-tab-earnings-deduction-taxes.component';
import { WorkorderTabPurchaseorderLinesComponent } from './workorder-tab-purchaseorder-lines/workorder-tab-purchaseorder-lines.component';
import { PurchaseorderlinetoworkorderComponent } from './purchaseorderlinetoworkorder/purchaseorderlinetoworkorder.component';
import { PurchaseorderlinepopupComponent } from './purchaseorderlinepopup/purchaseorderlinepopup.component';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { WorkorderSaveAsTemplateComponent } from './workorder-save-as-template/workorder-save-as-template.component';
import { WorkorderCreateAdjustmentComponent } from './workorder-create-adjustment/workorder-create-adjustment.component';
import { ContactService } from '../contact/shared/contact.service';
import { ProfileService } from '../contact/shared/profile.service';
import { ComplianceModule } from '../compliance/compliance.module';
import { ClientSpecificFieldsModule } from '../client-specific-fields/client-specific-fields.module';

@NgModule({
  imports: [
    CommonModule,
    PhoenixCommonModule,
    DxDataGridModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ComplianceModule,
    PhxDocumentFileUploadModule,
    InfiniteScrollModule,
    ClientSpecificFieldsModule
  ],
  declarations: [
    WorkOrderSearchDatagridComponent,
    WorkorderComponent,
    WorkorderTabCoreComponent,
    WorkorderHeaderComponent,
    WorkorderTabCoreCollaboratorsComponent,
    WorkorderTabCoreDetailsComponent,
    WorkorderTabCoreCommissionComponent,
    WorkOrdernWorkflowComponent,
    WorkorderTabPartiesComponent,
    WorkorderBillingPartiesComponent,
    WorkorderPaymentPartiesComponent,
    WorkorderTabTimeMaterialAndInvoiceComponent,
    WorkorderTabExpenseInvoiceComponent,
    WorkorderTabPurchaseOrderComponent,
    WorkorderTabEarningsDeductionsComponent,
    WorkorderTabTaxesComponent,
    WorkorderTabDocumentsComponent,
    WorkorderTabActivityComponent,
    WorkorderTabActivityDocumentsComponent,
    WorkorderTabActivityTransactionComponent,
    WorkorderTimeMaterialDetailComponent,
    WorkorderBillingInvoicesComponent,
    WorkorderBillingInvoiceComponent,
    WorkorderBillingRecipientComponent,
    WorkorderPaymentInvoicesComponent,
    WorkorderPaymentReleaseScheduleComponent,
    WorkorderPaymentInvoiceComponent,
    WorkorderPaymentContactComponent,
    WorkorderExpenseDetailComponent,
    WorkorderBillingTaxesComponent,
    WorkorderPaymentTaxesComponent,
    WorkorderIncentiveCompensationComponent,
    WorkorderBillingPartyComponent,
    WorkorderBillingRatesComponent,
    WorkorderBillingRateComponent,
    WorkorderRebateVmsfeeComponent,
    WorkorderPaymentPartyComponent,
    WorkorderPaymentRatesComponent,
    WorkorderPaymentRateComponent,
    WorkorderTabEarningsAndDeductionOtherEarningsComponent,
    WorkorderTabEarningsAndDeductionSafetyInsuranceComponent,
    WorkorderTabEarningsAndDeductionStatutoryHolidayComponent,
    WorkorderTabEarningsAndDeductionSourceDeductionComponent,
    WorkorderTabEarningsAndDeductionTaxesComponent,
    WorkorderTabPurchaseorderLinesComponent,
    PurchaseorderlinetoworkorderComponent,
    PurchaseorderlinepopupComponent,
    WorkorderSaveAsTemplateComponent,
    WorkorderCreateAdjustmentComponent,

  ],
  providers: [
    OrganizationApiService,
    WorkOrderSearchResolver,
    WorkorderService,
    WorkorderObservableService,
    ContactService,
    ProfileService
  ],
  exports: [
    WorkOrderSearchDatagridComponent,
    WorkorderComponent,
    WorkorderTabCoreComponent,
    WorkorderHeaderComponent,
    WorkorderTabCoreCollaboratorsComponent,
    WorkorderTabCoreDetailsComponent,
    WorkorderTabCoreCommissionComponent,
    WorkOrdernWorkflowComponent,
    WorkorderTabPartiesComponent,
    WorkorderBillingPartiesComponent,
    WorkorderPaymentPartiesComponent,
    WorkorderTabTimeMaterialAndInvoiceComponent,
    WorkorderTabExpenseInvoiceComponent,
    WorkorderTabPurchaseOrderComponent,
    WorkorderTabEarningsDeductionsComponent,
    WorkorderTabTaxesComponent,
    WorkorderTabDocumentsComponent,
    WorkorderTabActivityComponent,
    WorkorderTabActivityDocumentsComponent,
    WorkorderTabActivityTransactionComponent,
    WorkorderTimeMaterialDetailComponent,
    WorkorderBillingInvoicesComponent,
    WorkorderBillingInvoiceComponent,
    WorkorderBillingRecipientComponent,
    WorkorderPaymentInvoicesComponent,
    WorkorderPaymentReleaseScheduleComponent,
    WorkorderPaymentInvoiceComponent,
    WorkorderPaymentContactComponent,
    WorkorderExpenseDetailComponent,
    WorkorderBillingTaxesComponent,
    WorkorderPaymentTaxesComponent,
    WorkorderIncentiveCompensationComponent,
    WorkorderBillingPartyComponent,
    WorkorderBillingRatesComponent,
    WorkorderBillingRateComponent,
    WorkorderRebateVmsfeeComponent,
    WorkorderPaymentPartyComponent,
    WorkorderPaymentRatesComponent,
    WorkorderPaymentRateComponent,
    WorkorderTabEarningsAndDeductionOtherEarningsComponent,
    WorkorderTabEarningsAndDeductionSafetyInsuranceComponent,
    WorkorderTabEarningsAndDeductionStatutoryHolidayComponent,
    WorkorderTabEarningsAndDeductionSourceDeductionComponent,
    WorkorderTabEarningsAndDeductionTaxesComponent,
    WorkorderTabPurchaseorderLinesComponent,
    PurchaseorderlinetoworkorderComponent,
    PurchaseorderlinepopupComponent,
    WorkorderSaveAsTemplateComponent,
    WorkorderCreateAdjustmentComponent,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WorkorderCommonModule {
  constructor(private injector: Injector) {
    WorkOrderApiServiceLocator.injector = this.injector;
  }
}
