import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PhxDataTableConfiguration, PhxDataTableColumn, CodeValue, PhxDataTableSummaryItem, PhxDataTableSummaryType, DialogResultType } from '../../common/model/index';
import { CodeValueService, CommonService, DialogService, PhxConstants, WindowRefService, PhxLocalizationService } from '../../common/index';
import { Router, ActivatedRoute } from '@angular/router';
import { Invoice, InvoiceBillingTransaction, InvoiceExtension } from '../shared/index';
import { InvoiceService } from '../shared/invoice.service';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';

@Component({
  selector: 'app-invoice-billing-transactions',
  templateUrl: './invoice-billing-transactions.component.html',
  styleUrls: ['./invoice-billing-transactions.component.less']
})
export class InvoicebillingTransactionsComponent implements OnInit, OnDestroy {
  codeValueGroups: any;
  invoiceModuleResourceKeys: any;
  invoice: Invoice;
  id: number;

  editable: boolean = true;
  isAlive: boolean = true;
  isCurrentUserHasClientRelatedRoles: boolean = true;

  BillingInvoicePresentationStyle = PhxConstants.BillingInvoicePresentationStyle;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showTotalCount: false
  });
  columns: Array<PhxDataTableColumn>;

  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'Id',
      summaryType: PhxDataTableSummaryType.Count
    }),
    new PhxDataTableSummaryItem({
      column: 'Tax',
      summaryType: PhxDataTableSummaryType.Sum,
      showInColumn: 'Tax',
    }),
    new PhxDataTableSummaryItem({
      column: 'GstHst',
      summaryType: PhxDataTableSummaryType.Sum,
      showInColumn: 'GstHst',
    }),
    new PhxDataTableSummaryItem({
      column: 'Pst',
      summaryType: PhxDataTableSummaryType.Sum,
      showInColumn: 'Pst',
    }),
    new PhxDataTableSummaryItem({
      column: 'Qst',
      summaryType: PhxDataTableSummaryType.Sum,
      showInColumn: 'Qst',
    }),
    new PhxDataTableSummaryItem({
      column: 'TotalAmount',
      summaryType: PhxDataTableSummaryType.Sum,
      showInColumn: 'TotalAmount',
    }),
    new PhxDataTableSummaryItem({
      column: 'SubTotalAmount',
      summaryType: PhxDataTableSummaryType.Sum,
      showInColumn: 'SubTotalAmount',
    }),
  ];

  constructor(
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private winRef: WindowRefService,
    private invoiceService: InvoiceService,
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.invoiceModuleResourceKeys = InvoiceModuleResourceKeys;
  }

  ngOnInit() {
    this.buildColumns(true);
    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.loadInvoice(this.id);
      });

    this.invoiceService.isCurrentUserHasClientRelatedRoles()
      .takeWhile(() => this.isAlive)
      .subscribe((data: boolean) => {
        this.isCurrentUserHasClientRelatedRoles = data;
      });
  }

  loadInvoice(id: number, force: boolean = false) {
    this.invoiceService.getInvoice(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.invoice = data;
        this.setInvoiceEditableStatus(this.invoice);
      });
  }

  setInvoiceEditableStatus(invoice: Invoice) {
    this.editable = InvoiceExtension.isEditable(invoice, false);
    if (this.editable === false ||
      this.invoice.BillingInvoicePresentationStyleId === PhxConstants.BillingInvoicePresentationStyle.OneInvoicePerTransactions) {
      this.buildColumns(false);
    }
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  buildColumns(showAction: boolean) {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'BillingTransactionId',
        width: 100,
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.idColumnHeader),
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderNumber',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.workOrderNumberColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'BillingTransactionNumber',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.billingTransactionNumberColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'TransactionTypeId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.transactionTypeColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.TransactionType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoiceTemplateId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.billingInvoiceTemplateColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.BillingInvoiceTemplate, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoiceTermId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.paymentTermsColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.BillingInvoiceTerms, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'AgencyClientLegalName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.agencyColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.workerColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerProfileTypeId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.workerTypeColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.ProfileType, true).filter((codeValue: CodeValue) => codeValue.id !== 99),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingDate',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.transactionDateColumnHeader),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.startDateColumnHeader),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.endDateColumnHeader),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'PrimaryBillRate',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.billRateColumnHeader),
        dataType: 'money',
        isFromOdata: false,
      }),
      new PhxDataTableColumn({
        dataField: 'SumUnits',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.unitsColumnHeader),
        dataType: 'money',
        isFromOdata: false,
      }),
      new PhxDataTableColumn({
        dataField: 'BillRateUnitId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.rateUnitColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.RateUnit, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'SubTotalAmount',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.subtotalColumnHeader),
        dataType: 'money',
        isFromOdata: false,
      }),
      new PhxDataTableColumn({
        dataField: 'Tax',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.totalTaxColumnHeader),
        dataType: 'money',
        isFromOdata: false,
      }),
      new PhxDataTableColumn({
        dataField: 'GstHst',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.GSTHSTColumnHeader),
        dataType: 'money',
        isFromOdata: false,
      }),
      new PhxDataTableColumn({
        dataField: 'Qst',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.QSTColumnHeader),
        dataType: 'money',
        isFromOdata: false,
      }),
      new PhxDataTableColumn({
        dataField: 'Pst',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.PSTColumnHeader),
        dataType: 'money',
        isFromOdata: false,
      }),
      new PhxDataTableColumn({
        dataField: 'TotalAmount',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.totalBillColumnHeader),
        dataType: 'money',
        isFromOdata: false,
      }),
      new PhxDataTableColumn({
        dataField: 'BranchId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.branchColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.InternalOrganizationDefinition1, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'WorksiteId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.worksiteColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.Worksite, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceToName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.invoiceToColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'ClientManagerName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.clientManagerColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationClientRoleAlternateBillLegalName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.alternateBillClientColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'ProjectName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.projectNameColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'PurchaseOrderNumber',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.purchaseOrderNumberColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'DeliveryMethodId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.deliveryMethodColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.DeliveryMethod, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNote1',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.invoiceNote1ColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNote2',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.invoiceNote2ColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNote3',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.invoiceNote3ColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNote4',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.invoiceNote4ColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'ARStatusId',
        caption: 'Payment Status',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.ARStatus, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'ARPayDate',
        caption: 'Payment Date',
        dataType: 'date'
      }),
    ];

    if (showAction) {
      this.columns.push(new PhxDataTableColumn({
        dataField: 'Id',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.actionColumnHeader),
        cellTemplate: 'actionCellTemplate',
        allowFiltering: false,
        allowSearch: false,
        allowSorting: false,
        allowExporting: false,
        allowGrouping: false,
        fixed: true,
        fixedPosition: 'right',
      }));
    }
  }
  addTransactionToInvoice() {
    this.router.navigate([
      '/next',
      'invoice',
      'addbillingtransactions',
      'invoice',
      this.invoice.Id])
      .catch((err) => {
        console.error(`error navigating to add invoice transactions`, err);
      });
  }

  removeTransactionFromInvoice(invoiceBillingTransaction: InvoiceBillingTransaction) {
    this.dialogService.confirm(this.localizationService.translate(InvoiceModuleResourceKeys.transactions.removeTransactionHeader),
                               this.localizationService.translate(InvoiceModuleResourceKeys.transactions.removeTransactionMessage, invoiceBillingTransaction.BillingTransactionNumber)
    )
      .then((button) => {
        if (button === DialogResultType.Yes) {
          this.invoiceService.removeInvoiceBillingTransaction(invoiceBillingTransaction);
        }
      });
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      if (this.isCurrentUserHasClientRelatedRoles === false) {
        event.items = [{
          text: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.openTransactionTitle),
          onItemClick: () => {
            this.openTransaction(event.row.data);
          }
        }];
        if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.CurrentWorkOrderVersionId) {
          event.items.push({
            text: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.openWorkorderTitle),
            onItemClick: () => {
              this.openWorkOrder(event.row.data);
            }
          });
        }
        if (event.row.data.TransactionHeaderTimeSheetId) {
          event.items.push({
            text: this.localizationService.translate(InvoiceModuleResourceKeys.transactions.openTimesheetTitle),
            onItemClick: () => {
              this.openTimeSheet(event.row.data);
            }
          });
        }
      }
    }
  }

  openWorkOrder(data) {
    this.winRef.openUrl(`/#/next/workorder/${data.AssignmentId}/${data.WorkOrderId}/${data.CurrentWorkOrderVersionId}/core`);
  }

  openTransaction(data) {
    this.winRef.openUrl(`/#/next/transaction/${data.TransactionHeaderId}/detail`);
  }

  openTimeSheet(data) {
    this.winRef.nativeWindow.open(`#/next/timesheet/${data.TransactionHeaderTimeSheetId}`, '_blank');
  }
}
