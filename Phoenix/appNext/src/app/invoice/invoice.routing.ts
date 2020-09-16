import { NgModule, ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvoiceSearchComponent } from './invoice-search/invoice-search.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { InvoicebillingTransactionsComponent } from './invoice-billing-transactions/invoice-billing-transactions.component';
import { InvoiceBillingTransactionDocumentsComponent } from './invoice-billing-transaction-documents/invoice-billing-transaction-documents.component';
import { InvoiceClearingGroupedComponent } from './invoice-clearing-grouped/invoice-clearing-grouped.component';
import { InvoiceClientRelatedRolesRouteGuard } from './shared/invoice-client-related-roles-route-guard';
import { BillingTransactionClearingGroupedComponent } from './billing-transaction-clearing-grouped/billing-transaction-clearing-grouped.component';
import { InvoiceClearingComponent } from './invoice-clearing/invoice-clearing.component';
import { InvoiceClearingListComponent } from './invoice-clearing-list/invoice-clearing-list.component';
import { ConsolidatedBillingTransactionClearingComponent } from './consolidated-billing-transaction-clearing/consolidated-billing-transaction-clearing.component';
import { SingleBillingTransactionClearingComponent } from './single-billing-transaction-clearing/single-billing-transaction-clearing.component';
import { BillingTransactionClearingComponent } from './billing-transaction-clearing/billing-transaction-clearing.component';
import { InvoiceAddBillingTransactionsComponent } from './invoice-add-billing-transactions/invoice-add-billing-transactions.component';
import { InvoiceHistoryComponent } from './invoice-history/invoice-history.component';

const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: InvoiceSearchComponent },
  { path: 'billingtransactionclearing', component: BillingTransactionClearingGroupedComponent },
  { path: 'invoiceclearing', component: InvoiceClearingGroupedComponent, canActivate: [InvoiceClientRelatedRolesRouteGuard] },
  {
    path: 'billingtransactionclearing/internalorganization/:organizationIdInternal', component: BillingTransactionClearingComponent,
    children: [
      { path: 'invoicingtype/1', component: ConsolidatedBillingTransactionClearingComponent, pathMatch: 'full' }, // consolidated
      { path: 'invoicingtype/2', component: SingleBillingTransactionClearingComponent, pathMatch: 'full' } // single
    ]
  },
  {
    path: 'invoiceclearing/internalorganization/:organizationIdInternal', component: InvoiceClearingComponent,
    children: [
      { path: 'invoicingtype/1', component: InvoiceClearingListComponent, pathMatch: 'full' }, // consolidated
      { path: 'invoicingtype/2', component: InvoiceClearingListComponent, pathMatch: 'full' } // single
    ],
    canActivate: [InvoiceClientRelatedRolesRouteGuard]
  },
  {
    path: 'addbillingtransactions/invoice/:invoiceId',
    component: InvoiceAddBillingTransactionsComponent,
    canActivate: [InvoiceClientRelatedRolesRouteGuard]
  },
  {
    path: ':Id', component: InvoiceComponent,
    children: [
      { path: 'detail', component: InvoiceDetailComponent },
      { path: 'transactions', component: InvoicebillingTransactionsComponent },
      { path: 'documents', component: InvoiceBillingTransactionDocumentsComponent },
      { path: 'history', component: InvoiceHistoryComponent },
      { path: '**', component: InvoiceDetailComponent, pathMatch: 'full' },
    ]
  },
  { path: '**', component: InvoiceSearchComponent }
];

const invoiceRoutes: ModuleWithProviders = RouterModule.forChild(routes);

@NgModule({
  imports: [invoiceRoutes],
  providers: [InvoiceClientRelatedRolesRouteGuard],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }

