import { EppPendingReleaseComponent } from './epp-pending-release/epp-pending-release.component';
import { PaymentYtdEarningsSummaryComponent } from './payment-ytd-earnings-summary/payment-ytd-earnings-summary.component';
import { PaymentYtdEarningsComponent } from './payment-ytd-earnings/payment-ytd-earnings.component';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentSearchComponent } from './payment-search/payment-search.component';
import { ChequeSummaryComponent } from './cheque-summary/cheque-summary.component';
import { ChequeListComponent } from './cheque-list/cheque-list.component';
import { ChequeInprogressListComponent } from './cheque-inprogress-list/cheque-inprogress-list.component';
import { PaymentDirectDepositBatchSearchComponent } from './payment-direct-deposit-batch-search/payment-direct-deposit-batch-search.component';
import { PaymentWireTransferBatchSearchComponent } from './payment-wire-transfer-batch-search/payment-wire-transfer-batch-search.component';
import { PaymentAdpBatchSearchComponent } from './payment-adp-batch-search/payment-adp-batch-search.component';
import { PaymentGarnisheePendingReleaseComponent } from './payment-garnishee-pending-release/payment-garnishee-pending-release.component';
import { PendingPaymentComponent } from './pending-payment/pending-payment.component';
import { PaymentAdpBatchDetailsComponent } from './payment-adp-batch-details/payment-adp-batch-details.component';
import { PaymentAdpBatchSearchGroupComponent } from './payment-adp-batch-search-group/payment-adp-batch-search-group.component';
import { PaymentYtdEarningsDetailsComponent } from './payment-ytd-earnings-details/payment-ytd-earnings-details.component';
import { PaymentYtdEarningsResolver } from './payment-ytd-earnings/payment-ytd-earnings.resolver';
import { PaymentDirectDepositBatchComponent } from './payment-direct-deposit-batch/payment-direct-deposit-batch.component';
import { EppChequeBatchDetailComponent } from './epp-cheque-batch-detail/epp-cheque-batch-detail.component';
import { EppChequeBatchListComponent } from './epp-cheque-batch-list/epp-cheque-batch-list.component';
// import { PaymentADPDraftBatchComponent } from './payment-adp-draft-batch/payment-adp-draft-batch.component';
// import { PaymentWireTransferDraftBatchComponent } from './payment-wire-transfer-draft-batch/payment-wire-transfer-draft-batch.component';
import { PendingPaymentListComponent } from './pending-payment-list/pending-payment-list.component';
import { PaymentManageDirectDepositsComponent } from './payment-manage-direct-deposits/payment-manage-direct-deposits.component';
import { PaymentManageWireTransfersComponent } from './payment-manage-wire-transfers/payment-manage-wire-transfers.component';
import { PaymentADPBatchComponent } from './payment-adp-batch/payment-adp-batch.component';
import { PaymentWireTransferBatchComponent } from './payment-wire-transfer-batch/payment-wire-transfer-batch.component';
import { T4PrintingComponent } from './t4-printing/t4-printing.component';

const routing: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: PaymentSearchComponent },
  { path: 'search/:PaymentId', component: PaymentSearchComponent },
  { path: 'chequesummary', component: ChequeSummaryComponent },
  { path: 'cheques/org/:orgId/bank/:bankId/currency/:currencyId', component: ChequeListComponent },
  { path: 'cheques', component: ChequeListComponent },
  { path: 'chequesinprogress/org/:orgId/bank/:bankId/currency/:currencyId', component: ChequeInprogressListComponent },
  { path: 'chequesinprogress', component: ChequeInprogressListComponent },
  { path: 'epppendingrelease/org/:orgId/bank/:bankId/currency/:currencyId', component: EppPendingReleaseComponent },
  { path: 'epp-cheque-batch-detail/:eppChequeBatchId', component: EppChequeBatchDetailComponent },
  { path: 'directdepositbatch/searchbybankaccount/:bankAccountId/:currencyId', component: PaymentDirectDepositBatchSearchComponent },
  { path: 'wiretransferbatch/searchbybankaccount/:bankAccountId/:currencyId', component: PaymentWireTransferBatchSearchComponent },
  // { path: 'paymenttransactiongarnishee/release/internalorganization/:organizationIdInternal/currency/:currencyId/readytorelease/:isReadyToRelease', component: PaymentGarnisheePendingReleaseComponent },
  { path: 'organization/:orgId/currency/:currencyId/method/:methodId/status/:statusId/due/:dueId', component: PendingPaymentComponent },
  { path: 'organization/:orgId/currency/:currencyId/method/:methodId/due/:dueId/stopped', component: PendingPaymentComponent },




  { path: 'pending', component: PendingPaymentListComponent },
  { path: 'directdepositbatch', component: PaymentManageDirectDepositsComponent },
  { path: 'wiretransferbatch', component: PaymentManageWireTransfersComponent },




  { path: 'adp/:organizationIdInternal/:currencyId', component: PaymentAdpBatchSearchComponent },
  // { path: 'adp/:organizationIdInternal/:currencyId/details/:batchId', component: PaymentAdpBatchDetailsComponent },
  { path: 'adpbatch/management/:taskId', component: PaymentAdpBatchDetailsComponent },
  { path: 'adp-batch/search-group', component: PaymentAdpBatchSearchGroupComponent },
  { path: 'directdepositbatch/:organizationIdInternal/:currencyId/details/:batchId', component: PaymentDirectDepositBatchComponent },
  { path: 'wiretransferbatch/:organizationIdInternal/:currencyId/details/:batchId', component: PaymentWireTransferBatchComponent },
  { path: 'adpbatch/:organizationIdInternal/:currencyId/details/:batchId', component: PaymentADPBatchComponent },
  {
    path: 'ytdearning', component: PaymentYtdEarningsComponent,
    resolve: {
      resolvedData: PaymentYtdEarningsResolver
    }
  },
  { path: 'eppchequebatch/org/:orgId/bank/:bankId/currency/:currencyId', component: EppChequeBatchListComponent },
  { path: 't4-printing', component: T4PrintingComponent },
  { path: '**', component: PaymentSearchComponent, }
];

const paymentRouting: ModuleWithProviders = RouterModule.forChild(routing);

@NgModule({
  imports: [paymentRouting],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
