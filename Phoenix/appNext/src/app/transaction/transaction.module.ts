import { VmsService } from './shared/Vms.service';
import { FormsModule } from '@angular/forms';
import { NgModule, Injector } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDataGridModule, DxButtonModule, DxDateBoxModule, DxNumberBoxModule, DxTextAreaModule, DxRadioGroupModule, DxTreeViewModule } from 'devextreme-angular';

import { PhoenixCommonModule } from './../common/PhoenixCommon.module';

import { TransactionRouting } from './transaction.routing';
import { TransactionSearchComponent } from './component/transaction-search/transaction-search.component';
import { TransactionReleaseVacationPayComponent } from './transaction-release-vacation-pay/transaction-release-vacation-pay.component';
import { TransactionService } from './transaction.service';
import { OrganizationApiService } from './../organization/organization.api.service';
import { VmsBatchSearchComponent } from './vms-batch-search/vms-batch-search.component';
import { VmsTransactionConflictSearchComponent } from './vms-transaction-conflict-search/vms-transaction-conflict-search.component';
import { VmsTransactionExpenseConflictSearchComponent } from './vms-transaction-expense-conflict-search/vms-transaction-expense-conflict-search.component';
import { VmsTransactionCommissionConflictSearchComponent } from './vms-transaction-commission-conflict-search/vms-transaction-commission-conflict-search.component';
import { VmsTransactionFixedPriceConflictSearchComponent } from './vms-transaction-fixedprice-conflict-search/vms-transaction-fixedprice-conflict-search.component';
import { VmsTransactionDiscountConflictSearchComponent } from './vms-transaction-discount-conflict-search/vms-transaction-discount-conflict-search.component';
import { VmsDiscountProcessComponent } from './vms-discount-process/vms-discount-process.component';
import { VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent } from './vms-transaction-ussourcededuction-conflict-search/vms-transaction-ussourcededuction-conflict-search.component';
import { VmsUnitedStatesSourceDeductionProcessComponent } from './vms-ussourcededuction-process/vms-ussourcededuction-process.component';
import { VmsExpenseProcessComponent } from './vms-expense-process/vms-expense-process.component';
import { VmsTimesheetProcessComponent } from './vms-timesheet-process/vms-timesheet-process.component';
import { VmsCommissionProcessComponent } from './vms-commission-process/vms-commission-process.component';
import { VmsFixedPriceProcessComponent } from './vms-fixedprice-process/vms-fixedprice-process.component';
import { PaymentSharedModule } from '../payment/share/payment-shared.module';
import { VmsPreprocessComponent } from './vms-preprocess/vms-preprocess.component';
import { VmsPreprocessDocumentListResolver } from './vms-preprocess/vms-preprocess-document-list.resolver';
import { VmsPreprocessDetailService } from './vms-preprocess/vms-preprocess-detail.service';
import { VmsPreprocessDetailTimesheetComponent } from './vms-preprocess/vms-preprocess-detail-timesheet.component';
import { VmsPreprocessDetailDiscountComponent } from './vms-preprocess/vms-preprocess-detail-discount.component';
import { VmsPreprocessDetailExpenseComponent } from './vms-preprocess/vms-preprocess-detail-expense.component';
import { VmsPreprocessDetailCommissionComponent } from './vms-preprocess/vms-preprocess-detail-commission.component';
import { VmsPreprocessDetailFixedPriceComponent } from './vms-preprocess/vms-preprocess-detail-fixedprice.component';
import { VmsPreprocessDetailUnitedstatessourcedeductionComponent } from './vms-preprocess/vms-preprocess-detail-unitedstatessourcededuction.component';
import { VmsBatchManagementComponent } from './vms-batch-management/vms-batch-management.component';
import { VmsManagementComponent } from './vms-management/vms-management.component';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionObservableService } from './state/transaction.observable.service';
import { TransactionHeaderComponent } from './transaction-header/transaction-header.component';
import { TransactionSummaryComponent } from './transaction-summary/transaction-summary.component';
import { TransactionPaymentsComponent } from './transaction-payments/transaction-payments.component';
import { TransactionInvoicesComponent } from './transaction-invoices/transaction-invoices.component';
import { TransactionApiServiceLocator } from './transaction.api.service.locator';
import { TransactionDetailsComponent } from './transaction-detail/transaction-detail.component';
import { TransactionDetailsNotesComponent } from './transaction-details-notes/transaction-details-notes.component';
import { TransactionDetailsStatHolidayLineComponent } from './transaction-details-stat-holiday-line/transaction-details-stat-holiday-line.component';
import { TransactionDetailsTransactionLinesComponent } from './transaction-details-transaction-lines/transaction-details-transaction-lines.component';
import { TransactionDetailsGrossProfitComponent } from './transaction-details-gross-profit/transaction-details-gross-profit.component';
import { TransactionDetailsAmountSummaryComponent } from './transaction-details-amount-summary/transaction-details-amount-summary.component';
import { TransactionDetailsViewComponent } from './transaction-details-view/transaction-details-view.component';
import { TransactionWorkflowComponent } from './transaction-workflow/transaction-workflow.component';
import { TransactionBillingDocumentsComponent } from './transaction-billing-documents/transaction-billing-documents.component';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { TransactionPurchaseOrderComponent } from './transaction-purchase-order/transaction-purchase-order.component';
import { TransactionWorkflowHistoryComponent } from './transaction-workflow-history/transaction-workflow-history.component';
import { TransactionVmsRecordComponent } from './transaction-vms-record/transaction-vms-record.component';
import { AuthService } from '../common/services/auth.service';
import { ApiService } from '../common';
// import { VmsDocumentsComponent } from './vms-documents/vms-documents.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    PhoenixCommonModule,
    PaymentSharedModule,
    DxButtonModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxTreeViewModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxRadioGroupModule,
    TransactionRouting,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    PhxDocumentFileUploadModule
  ],
  declarations: [
    TransactionSearchComponent,
    TransactionReleaseVacationPayComponent,
    VmsBatchSearchComponent,
    VmsTransactionConflictSearchComponent,
    VmsTransactionDiscountConflictSearchComponent,
    VmsDiscountProcessComponent,
    VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent,
    VmsUnitedStatesSourceDeductionProcessComponent,
    VmsTransactionExpenseConflictSearchComponent,
    VmsTransactionCommissionConflictSearchComponent,
    VmsTransactionFixedPriceConflictSearchComponent,
    VmsExpenseProcessComponent,
    VmsTimesheetProcessComponent,
    VmsCommissionProcessComponent,
    VmsFixedPriceProcessComponent,
    VmsPreprocessComponent,
    VmsPreprocessDetailTimesheetComponent,
    VmsPreprocessDetailDiscountComponent,
    VmsPreprocessDetailExpenseComponent,
    VmsPreprocessDetailCommissionComponent,
    VmsPreprocessDetailFixedPriceComponent,
    VmsPreprocessDetailUnitedstatessourcedeductionComponent,
    VmsBatchManagementComponent,
    VmsManagementComponent,
    TransactionComponent,
    TransactionHeaderComponent,
    TransactionSummaryComponent,
    TransactionPaymentsComponent,
    TransactionInvoicesComponent,
    TransactionDetailsComponent,
    TransactionDetailsNotesComponent,
    TransactionDetailsStatHolidayLineComponent,
    TransactionDetailsTransactionLinesComponent,
    TransactionDetailsGrossProfitComponent,
    TransactionDetailsAmountSummaryComponent,
    TransactionDetailsViewComponent,
    TransactionWorkflowComponent,
    TransactionBillingDocumentsComponent,
    TransactionPurchaseOrderComponent,
    TransactionWorkflowHistoryComponent,
    TransactionVmsRecordComponent,
    // VmsDocumentsComponent
  ],
  providers: [
    AuthService,
    ApiService,
    TransactionService,
    VmsService,
    OrganizationApiService,
    VmsPreprocessDocumentListResolver,
    VmsPreprocessDetailService,
    TransactionObservableService
  ]
})

export class TransactionModule {
  constructor(private injector: Injector) {
    TransactionApiServiceLocator.injector = this.injector;
  }
}
