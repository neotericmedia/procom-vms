import { DatexPipe } from './../common/pipes/Datex.pipe';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import {
  DxButtonModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxTextAreaModule,
  DxNumberBoxModule, DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule, DxTreeViewModule
} from 'devextreme-angular';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';

import { InvoiceRoutingModule } from './invoice.routing';
import { OrganizationApiService } from './../organization/organization.api.service';
import { InvoiceService } from './shared/invoice.service';
import { InvoiceSearchComponent } from './invoice-search/invoice-search.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceHeaderComponent } from './invoice-header/invoice-header.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { InvoicebillingTransactionsComponent } from './invoice-billing-transactions/invoice-billing-transactions.component';
import { InvoiceDetailNotesComponent } from './invoice-detail-notes/invoice-detail-notes.component';
import { InvoiceDetailInfoComponent } from './invoice-detail-info/invoice-detail-info.component';
import { InvoiceDetailRecipientsComponent } from './invoice-detail-recipients/invoice-detail-recipients.component';
import { InvoiceRecipientEditorComponent } from './invoice-recipient-editor/invoice-recipient-editor.component';
import { InvoiceBillingTransactionDocumentsComponent } from './invoice-billing-transaction-documents/invoice-billing-transaction-documents.component';
import { CodeValuePipe } from '../common';
import { BillingTransactionClearingGroupedComponent } from './billing-transaction-clearing-grouped/billing-transaction-clearing-grouped.component';
import { InvoiceListTableComponent } from './invoice-list-table/invoice-list-table.component';
import { InvoiceClearingGroupedComponent } from './invoice-clearing-grouped/invoice-clearing-grouped.component';
import { InvoiceClearingComponent } from './invoice-clearing/invoice-clearing.component';
import { InvoiceClearingListComponent } from './invoice-clearing-list/invoice-clearing-list.component';
import { ConsolidatedBillingTransactionClearingComponent } from './consolidated-billing-transaction-clearing/consolidated-billing-transaction-clearing.component';
import { SingleBillingTransactionClearingComponent } from './single-billing-transaction-clearing/single-billing-transaction-clearing.component';
import { BillingTransactionComponent } from './billing-transaction/billing-transaction.component';
import { BillingTransactionClearingComponent } from './billing-transaction-clearing/billing-transaction-clearing.component';
import { InvoiceAddBillingTransactionsComponent } from './invoice-add-billing-transactions/invoice-add-billing-transactions.component';
import { InvoiceHistoryComponent } from './invoice-history/invoice-history.component';


@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    PhoenixCommonModule,
    DxButtonModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxTreeViewModule,
    DxRadioGroupModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    InvoiceRoutingModule,
  ],
  declarations: [
    InvoiceSearchComponent,
    InvoiceComponent,
    InvoiceHeaderComponent,
    InvoiceDetailComponent,
    InvoicebillingTransactionsComponent,
    InvoiceDetailNotesComponent,
    InvoiceDetailInfoComponent,
    InvoiceDetailRecipientsComponent,
    InvoiceRecipientEditorComponent,
    InvoiceBillingTransactionDocumentsComponent,
    BillingTransactionClearingGroupedComponent,
    InvoiceListTableComponent,
    InvoiceClearingGroupedComponent,
    InvoiceClearingComponent,
    InvoiceClearingListComponent,
    ConsolidatedBillingTransactionClearingComponent,
    SingleBillingTransactionClearingComponent,
    BillingTransactionComponent,
    BillingTransactionClearingComponent,
    InvoiceAddBillingTransactionsComponent,
    InvoiceHistoryComponent
  ],
  providers: [
    OrganizationApiService,
    InvoiceService,
    CodeValuePipe,
    DatexPipe
  ],
  exports: [
  ]
})
export class InvoiceModule {

}
