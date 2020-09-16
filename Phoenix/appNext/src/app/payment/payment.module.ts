import { T4Service } from './t4.service';
import { OrganizationApiService } from './../organization/organization.api.service';
import {
  DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDataGridModule,
  DxButtonModule, DxDateBoxModule, DxNumberBoxModule, DxTextAreaModule, DxRadioGroupModule
} from 'devextreme-angular';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { PhoenixCommonModule } from './../common/PhoenixCommon.module';

import { PaymentRoutingModule } from './payment.routing.module';
import { PaymentService } from './payment.service';
import { PaymentSearchComponent } from './payment-search/payment-search.component';
import { PaymentDirectDepositBatchSearchComponent } from './payment-direct-deposit-batch-search/payment-direct-deposit-batch-search.component';

import { ChequeSummaryComponent } from './cheque-summary/cheque-summary.component';
import { ChequeListComponent } from './cheque-list/cheque-list.component';
import { ChequeInprogressListComponent } from './cheque-inprogress-list/cheque-inprogress-list.component';
import { ChequeService } from './cheque.service';
import { ChequeWorkflowCommentDialogComponent } from './cheque-workflow-comment-dialog/cheque-workflow-comment-dialog.component';
import { PaymentWireTransferBatchSearchComponent } from './payment-wire-transfer-batch-search/payment-wire-transfer-batch-search.component';
import { PaymentTransactionComponent } from './payment-transaction/payment-transaction.component';
import { PaymentSharedModule } from './share/payment-shared.module';
import { PaymentGarnisheePendingReleaseComponent } from './payment-garnishee-pending-release/payment-garnishee-pending-release.component';
import { PendingPaymentComponent } from './pending-payment/pending-payment.component';
import { PaymentAdpBatchSearchComponent } from './payment-adp-batch-search/payment-adp-batch-search.component';
import { PaymentAdpBatchDetailsComponent } from './payment-adp-batch-details/payment-adp-batch-details.component';
import { PaymentAdpBatchSearchGroupComponent } from './payment-adp-batch-search-group/payment-adp-batch-search-group.component';
import { PaymentADPBatchComponent } from './payment-adp-batch/payment-adp-batch.component';
import { PaymentWireTransferBatchComponent } from './payment-wire-transfer-batch/payment-wire-transfer-batch.component';
import { PaymentYtdEarningsComponent } from './payment-ytd-earnings/payment-ytd-earnings.component';
import { PaymentYtdEarningsSummaryComponent } from './payment-ytd-earnings-summary/payment-ytd-earnings-summary.component';
import { PaymentYtdEarningsDetailsComponent } from './payment-ytd-earnings-details/payment-ytd-earnings-details.component';
import { PaymentYtdEarningsResolver } from './payment-ytd-earnings/payment-ytd-earnings.resolver';
import { AddToBatchComponent } from './add-to-batch/add-to-batch.component';
import { PaymentDirectDepositBatchComponent } from './payment-direct-deposit-batch/payment-direct-deposit-batch.component';
import { BatchGroupedByPayeeDialogComponent } from './batch-grouped-by-payee-dialog/batch-grouped-by-payee-dialog.component';
import { EppPendingReleaseComponent } from './epp-pending-release/epp-pending-release.component';
import { EppChequeBatchDetailComponent } from './epp-cheque-batch-detail/epp-cheque-batch-detail.component';
import { EppChequeBatchListComponent } from './epp-cheque-batch-list/epp-cheque-batch-list.component';
// import { PaymentADPDraftBatchComponent } from './payment-adp-draft-batch/payment-adp-draft-batch.component';
import { PendingPaymentListComponent } from './pending-payment-list/pending-payment-list.component';
import { PaymentManageDirectDepositsComponent } from './payment-manage-direct-deposits/payment-manage-direct-deposits.component';
import { PaymentManageWireTransfersComponent } from './payment-manage-wire-transfers/payment-manage-wire-transfers.component';
import { GroupByPipe } from './../common/pipes/groupby.pipe';
import { PayrollService } from './../payroll/payroll.service';
import { T4PrintingComponent } from './t4-printing/t4-printing.component';
import { CodeValuePipe } from '../common/pipes/code-value.pipe';


@NgModule({
  imports: [FormsModule, ReactiveFormsModule, CommonModule,
    RouterModule,
    PhoenixCommonModule,
    DxButtonModule, DxDataGridModule, DxSelectBoxModule,
    DxTextBoxModule, DxTextAreaModule, DxNumberBoxModule,
    DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule,
    ModalModule.forRoot(),
    PaymentRoutingModule,
    PaymentSharedModule,
    AccordionModule.forRoot()
  ],
  declarations: [
    PaymentSearchComponent,
    PaymentDirectDepositBatchSearchComponent,
    ChequeSummaryComponent,
    ChequeListComponent,
    ChequeInprogressListComponent,
    ChequeWorkflowCommentDialogComponent,
    PaymentWireTransferBatchSearchComponent,
    PaymentGarnisheePendingReleaseComponent,
    PendingPaymentComponent,
    PaymentAdpBatchSearchComponent,
    PaymentAdpBatchDetailsComponent,
    PaymentAdpBatchSearchGroupComponent,
    PaymentYtdEarningsComponent,
    PaymentYtdEarningsSummaryComponent,
    PaymentYtdEarningsDetailsComponent,
    PaymentDirectDepositBatchComponent,
    PaymentADPBatchComponent,
    PaymentWireTransferBatchComponent,
    AddToBatchComponent,
    BatchGroupedByPayeeDialogComponent,
    EppPendingReleaseComponent,
    EppChequeBatchDetailComponent,
    EppChequeBatchListComponent,
    PendingPaymentListComponent,
    PaymentManageDirectDepositsComponent,
    PaymentManageWireTransfersComponent,
    T4PrintingComponent,
  ],
  providers: [
    PaymentService,
    ChequeService,
    OrganizationApiService,
    PaymentYtdEarningsResolver,
    PayrollService,
    GroupByPipe,
    CodeValuePipe,
    T4Service
  ]
})
export class PaymentModule { }
