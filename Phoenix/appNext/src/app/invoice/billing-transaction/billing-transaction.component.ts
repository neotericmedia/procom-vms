import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { CommonService, CodeValueService, PhxConstants } from '../../common';
import { PhxDataTableConfiguration, PhxDataTableSelectallMode, PhxDataTableSelectionMode, PhxDataTableColumn, CodeValue } from '../../common/model';
import { BillingTransactionBase } from '../shared/billing-transaction-base';
import { Router, ActivatedRoute } from '@angular/router';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';
import { WindowRefService, PhxLocalizationService } from '../../common/index';

@Component({
  selector: 'app-billing-transaction',
  templateUrl: './billing-transaction.component.html',
  styleUrls: ['./billing-transaction.component.less']
})
export class BillingTransactionComponent implements OnInit, OnDestroy, OnChanges {
  codeValueGroups: any;
  columns: Array<PhxDataTableColumn>;
  invoiceModuleResourceKeys: any;
  totalSelectedAmount: number = 0;
  totalSelectedRows: number = 0;
  selectedBillingTransactionIds: Array<number> = [];

  isAlive: boolean = true;
  odataParams: string;
  dataSourceUrl = '';
  componentName: string;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectAllMode: PhxDataTableSelectallMode.AllPages,
    selectionMode: PhxDataTableSelectionMode.Multiple,
  });

  @ViewChild('grid') grid: PhxDataTableComponent;
  @Input() organizationIdInternal: number;
  @Input() clientId: number = 0;
  @Input() currencyId: number = 0;
  @Input() invoicePresentationStyle: PhxConstants.BillingInvoicePresentationStyle;
  @Output() selectionChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private localizationService: PhxLocalizationService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.invoiceModuleResourceKeys = InvoiceModuleResourceKeys;
  }

  ngOnInit() {
    this.buildDataSourceUrl();
    this.buildColumns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.clientId || changes.currencyId || changes.organizationIdInternal) {
      this.buildDataSourceUrl();
    }
  }
  buildDataSourceUrl() {
    this.componentName = `billingTransactions${this.invoicePresentationStyle}`;
    if (this.invoicePresentationStyle === PhxConstants.BillingInvoicePresentationStyle.OneInvoicePerTransactions) {
      this.dataSourceUrl = `BillingTransaction/internalorganization/${this.organizationIdInternal}/billinginvoicepresentationstyle/${this.invoicePresentationStyle}`;
    } else {
      if (this.currencyId === undefined) {
        this.currencyId = 0;
      }
      this.dataSourceUrl = `BillingTransaction/internalorganization/${this.organizationIdInternal}/billinginvoicepresentationstyle/${this.invoicePresentationStyle}/client/${this.clientId}/currency/${this.currencyId}`;
    }
  }

  buildColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'BillingTransactionId',
        width: 100,
        caption: 'Id',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderNumber',
        caption: 'Work Order Number',
      }),
      new PhxDataTableColumn({
        dataField: 'BillingTransactionNumber',
        caption: 'Billing Transaction Number',
      }),
      new PhxDataTableColumn({
        dataField: 'TransactionTypeId',
        caption: 'Transaction Type',
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.TransactionType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoiceTemplateId',
        caption: 'Billing Invoice Template',
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.BillingInvoiceTemplate, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoiceTermId',
        caption: 'Payment Terms',
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.BillingInvoiceTerms, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'AgencyClientLegalName',
        caption: 'Agency',
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: 'Worker',
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerProfileTypeId',
        caption: 'Worker Type',
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.ProfileType, true).filter((codeValue: CodeValue) => codeValue.id !== 99),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingDate',
        caption: 'Transaction Date',
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: 'Start Date',
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: 'End Date',
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'PrimaryBillRate',
        caption: 'Bill Rate',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'SumUnits',
        caption: 'Units',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'BillRateUnitId',
        caption: 'Rate Unit',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.RateUnit, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'SubTotalAmount',
        caption: 'Subtotal',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'Tax',
        caption: 'Total Tax',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'GstHst',
        caption: 'GST/HST',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'Qst',
        caption: 'QST',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'Pst',
        caption: 'PST',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'TotalAmount',
        caption: 'Total Bill',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'BranchId',
        caption: 'Branch',
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.InternalOrganizationDefinition1, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'WorksiteId',
        caption: 'Worksite',
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.Worksite, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceToName',
        caption: 'Invoice To',
      }),
      new PhxDataTableColumn({
        dataField: 'ClientManagerName',
        caption: 'Client Manager',
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationClientRoleAlternateBillLegalName',
        caption: 'Alternate Bill Client',
      }),
      new PhxDataTableColumn({
        dataField: 'ProjectName',
        caption: 'Project Name',
      }),
      new PhxDataTableColumn({
        dataField: 'PurchaseOrderNumber',
        caption: 'PO. Number',
      }),
      new PhxDataTableColumn({
        dataField: 'DeliveryMethodId',
        caption: 'Delivery Method',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.DeliveryMethod, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNote1',
        caption: 'Invoice Note 1',
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNote2',
        caption: 'Invoice Note 2',
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNote3',
        caption: 'Invoice Note 3',
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNote4',
        caption: 'Invoice Note 4',
      }),
    ];
  }

  onSelectionChanged(event) {
    this.selectionChanged.emit(event);
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [{
        text: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.openTransactionTitle),
        onItemClick: () => {
          this.winRef.openUrl(`/#/next/transaction/${event.row.data.TransactionHeaderId}/summary`);
        }
      }];

      if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.CurrentWorkOrderVersionId) {
        event.items.push({
          text: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.openWorkorderTitle),
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.CurrentWorkOrderVersionId}/core`);
          }
        });
      }
    }
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  refresh() {
    this.grid.refresh();
  }

}
