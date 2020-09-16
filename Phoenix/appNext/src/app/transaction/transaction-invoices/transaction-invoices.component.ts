// angualr
import { Component, OnInit, Input } from '@angular/core';
// common
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { CodeValueService } from '../../common/services/code-value.service';
import { CommonService, WindowRefService } from '../../common/index';
declare var oreq: any;

@Component({
  selector: 'app-transaction-invoices',
  templateUrl: './transaction-invoices.component.html',
  styleUrls: ['./transaction-invoices.component.less']
})
export class TransactionInvoicesComponent implements OnInit {
  @Input() transactionHeaderId: number;

  codeValueGroups: any;
  odataParams: string = oreq.request().withSelect([
    'Id',
    'InvoiceNumber',
    'InternalCompanyLegalName',
    'OrganizationClientLegalName',
    'BillingInvoiceTemplateId',
    'BillingInvoiceTermId',
    'DeliveryMethodId',
    'InvoiceDate',
    'CurrencyId',
    'Subtotal',
    'Tax',
    'Total',
    'StatusId',
    'BillingInvoicePresentationStyleId',
    'InvoiceBillingTransactionCount',
    'OrganizationClientRoleAlternateBillLegalName',
    'AttachmentCount'
  ]).url();

  dataSourceUrl: string;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});
  columns: Array<PhxDataTableColumn>;

  constructor(
    private codeValueService: CodeValueService,
    public commonService: CommonService,
    private winRef: WindowRefService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.dataSourceUrl = 'invoice/transactionheaderInvoices/' + this.transactionHeaderId;
    this.initColumns();
  }

  initColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        dataType: 'number',
        caption: 'ID',
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNumber',
        caption: 'Invoice #',
      }),
      new PhxDataTableColumn({
        dataField: 'InternalCompanyLegalName',
        caption: 'Internal Organization',
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationClientLegalName',
        caption: 'Client Name',
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationClientRoleAlternateBillLegalName',
        caption: 'Alternate Bill Client',
      }),
      new PhxDataTableColumn({
        dataField: 'StatusId',
        caption: 'Status',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.InvoiceStatus, true),
          valueExpr: 'id',
          displayExpr: 'text'
        },
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceDate',
        caption: 'Invoice Date',
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'CurrencyId',
        caption: 'Currency',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true),
          valueExpr: 'id',
          displayExpr: 'code'
        },
      }),
      new PhxDataTableColumn({
        dataField: 'Total',
        caption: 'Total',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'Subtotal',
        caption: 'Subtotal',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'Tax',
        caption: 'Total Tax',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoicePresentationStyleId',
        caption: 'Invoicing Type',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoicePresentationStyle, true),
          valueExpr: 'id',
          displayExpr: 'text'
        },
      }),
      new PhxDataTableColumn({
        dataField: 'AttachmentCount',
        caption: 'No. of Attachments',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceBillingTransactionCount',
        caption: 'No. of Transactions',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'DeliveryMethodId',
        caption: 'Delivery Method',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.DeliveryMethod, true),
          valueExpr: 'id',
          displayExpr: 'text'
        },
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoiceTemplateId',
        caption: 'Template',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoiceTemplate, true),
          valueExpr: 'id',
          displayExpr: 'text'
        },
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoiceTermId',
        caption: 'Payment Terms',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoiceTerms, true),
          valueExpr: 'id',
          displayExpr: 'text'
        },
      })
    ];
  }

  onRowClick(event: any) {
    if (event && event.rowType === 'data') {
      this.winRef.nativeWindow.open(`#/next/invoice/${event.data.Id}`, '_blank');
    }
  }
}
