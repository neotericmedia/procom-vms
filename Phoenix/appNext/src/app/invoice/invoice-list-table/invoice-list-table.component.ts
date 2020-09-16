import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableConfiguration, PhxDataTableColumn } from '../../common/model';
import { CodeValueService, CommonService, PhxLocalizationService } from '../../common';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';
import { WindowRefService } from '../../common/index';
declare var oreq: any;

@Component({
  selector: 'app-invoice-list-table',
  templateUrl: './invoice-list-table.component.html',
  styleUrls: ['./invoice-list-table.component.less']
})
export class InvoiceListTableComponent implements OnInit {
  @ViewChild('grid') grid: PhxDataTableComponent;
  @Input() dataSourceUrl: string;
  @Input() componentName: string;
  @Input() configuration: PhxDataTableConfiguration;

  @Output() selectionChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() contentReady: EventEmitter<any> = new EventEmitter<any>();

  columns: Array<PhxDataTableColumn>;
  oDataParams = oreq
    .request()
    .withSelect([
      'Id',
      'InvoiceNumber',
      'InternalCompanyLegalName',
      'OrganizationClientLegalName',
      'OrganizationClientRoleAlternateBillLegalName',
      'StatusId',
      'InvoiceDate',
      'CurrencyId',
      'Total',
      'Subtotal',
      'Tax',
      'BillingInvoicePresentationStyleId',
      'AttachmentCount',
      'InvoiceBillingTransactionCount',
      'DeliveryMethodId',
      'BillingInvoiceTemplateId',
      'BillingInvoiceTermId',
      'IsTest'
    ])
    .url();

  codeValueGroups: any;

  constructor(private router: Router, private route: ActivatedRoute, private codeValueService: CodeValueService, private localizationService: PhxLocalizationService, private winRef: WindowRefService, private commonService: CommonService) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.buildColumns();
  }

  buildColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        dataType: 'number',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.id)
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceNumber',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.invoiceNumber)
      }),
      new PhxDataTableColumn({
        dataField: 'InternalCompanyLegalName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.internalOrganization)
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationClientLegalName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.clientName)
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationClientRoleAlternateBillLegalName',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.alternateBillClient)
      }),
      new PhxDataTableColumn({
        dataField: 'StatusId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.status),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.InvoiceStatus, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceDate',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.invoiceDate),
        dataType: 'date'
      }),
      new PhxDataTableColumn({
        dataField: 'CurrencyId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.currency),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true),
          valueExpr: 'id',
          displayExpr: 'code'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'Total',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.total),
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'Subtotal',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.subtotal),
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'Tax',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.totalTax),
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoicePresentationStyleId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.invoicingType),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoicePresentationStyle, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'AttachmentCount',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.noOfAttachments),
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceBillingTransactionCount',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.noOfTransactions),
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'DeliveryMethodId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.deliveryMethod),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.DeliveryMethod, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoiceTemplateId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.template),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoiceTemplate, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingInvoiceTermId',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.paymentTerms),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoiceTerms, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: this.localizationService.translate(InvoiceModuleResourceKeys.list.action),
        cellTemplate: 'actionCellTemplate',
        allowFiltering: false,
        allowSorting: false,
        allowExporting: false,
        allowGrouping: false,
        allowSearch: false,
        fixed: true,
        fixedPosition: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'IsTest',
        caption: this.localizationService.translate('common.phxDataTable.implementationHeader'),
        dataType: 'boolean',
        lookup: {
          dataSource: PhxDataTableColumn.isTest.lookupDataSource(this.localizationService),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      })
    ];
  }

  onRowClick(event: any) {
    if (event && event.rowType === 'data') {
      this.view(event.data.Id, 'detail');
    }
  }

  view(id: number, tab: string) {
    this.router.navigate(['/next', 'invoice', `${id}`, tab]).catch(err => {
      console.error(`error navigating to invoice/${id}`, err);
    });
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/next/invoice/${item.Id}/detail`, '_blank');
  }

  onSelectionChanged(event) {
    this.selectionChanged.emit(event);
  }

  onContentReady(event) {
    this.contentReady.emit(event);
  }

  public refresh() {
    this.grid.refresh();
  }

  public clearSelection() {
    this.grid.clearSelection();
  }
}
