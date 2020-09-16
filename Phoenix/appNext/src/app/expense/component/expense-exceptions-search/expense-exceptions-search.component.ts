import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService, NavigationService, CodeValueService, PhxLocalizationService, WindowRefService } from '../../../common';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';
import { PhxDataTableColumn, PhxDataTableConfiguration } from '../../../common/model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-expense-exceptions-search',
  templateUrl: './expense-exceptions-search.component.html',
  styleUrls: ['./expense-exceptions-search.component.less']
})
export class ExpenseExceptionsSearchComponent implements OnInit, OnDestroy {

  isAlive: boolean = true;
  isCurrentUserWorker: boolean;
  disabledNewClaim: Boolean = true;
  codeValueGroups: any;
  odataParams: string = oreq.request().url();

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});

  columns: Array<PhxDataTableColumn>;

  expenseModuleResourceKeys: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private localizationService: PhxLocalizationService,
    private winRef: WindowRefService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.navigationService.setTitle('expense-claim-exceptions');
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {

    this.initColumns();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  initColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.idColumnHeader),
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'Comments',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.commentsColumnHeader),
        cellTemplate: 'commentsCellTemplate',
        width: '300px',
        allowFiltering: false,
        allowSearch: false,
        allowSorting: false,
        allowExporting: false,
        allowGrouping: false,
      }),
      new PhxDataTableColumn({
        dataField: 'Title',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.titleColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'ClientDisplayName',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.clientNameColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationInternalDisplayName',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.organizationInternalDisplayNameColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.workerNameColumnHeader),
        visible: !this.isCurrentUserWorker
      }),
      new PhxDataTableColumn({
        dataField: 'Total',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.totalColumnHeader),
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'CurrencyId',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.currencyColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true),
          valueExpr: 'id',
          displayExpr: 'code'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'FromDate',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.fromDateColumnHeader),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'ToDate',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.toDateColumnHeader),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'InternalOrganizationDefinition1Id',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.internalOrganizationDefinition1ColumnHeader),
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText(this.codeValueGroups.InternalOrganizationDefinition1, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderNumber',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.workOrderColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderStartDate',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.workOrderStartDateColumnHeader),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderEndDate',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.workOrderEndDateColumnHeader),
        dataType: 'date',
      }),
    ];
  }

  onRowClick(event: any) {
    if (event && event.rowType === 'data') {
      this.viewExpenseClaim(event.data.Id);
    }
  }

  viewExpenseClaim(id) {
    this.router.navigate([`${id}`], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to expense/${id}`, err);
      });
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [{
        text: this.localizationService.translate(ExpenseModuleResourceKeys.search.openExpenseInNewTab),
        onItemClick: () => {
          this.openExpense(event.row.data);
        }
      }, {
        text: this.localizationService.translate(ExpenseModuleResourceKeys.search.openWorkorderInNewTab),
        onItemClick: () => {
          this.openWorkOrder(event.row.data);
        }
      }, {
        text: this.localizationService.translate(ExpenseModuleResourceKeys.search.openWorkerInNewTab),
        onItemClick: () => {
          this.openWorker(event.row.data);
        }
      }];
    }
  }

  openWorkOrder(data) {
    this.winRef.openUrl(`/#/next/workorder/${data.AssignmentId}/${data.WorkOrderId}/${data.WorkOrderVersionId}/core`);
  }

  openExpense(data) {
    this.winRef.nativeWindow.open('#/next/expense/' + data.Id, '_blank');
  }

  openWorker(data) {
    this.winRef.openUrl(this.getPeopleNavigationLink(data.UserProfileIdWorker, data.ProfileTypeId, data.ContactId));
  }

  private getPeopleNavigationLink(entityId: number, profileTypeId: number, contactId: number) {
    switch (profileTypeId) {
      case 1:
        return `/#/next/contact/${contactId}/profile/organizational/${entityId}`;
      case 2:
        return `/#/next/contact/${contactId}/profile/internal/${entityId}`;
      case 3:
        return `/#/next/contact/${contactId}/profile/workertemp/${entityId}`;
      case 4:
        return `/#/next/contact/${contactId}/profile/workercanadiansp/${entityId}`;
      case 5:
        return `/#/next/contact/${contactId}/profile/workercanadianinc/${entityId}`;
      case 6:
        return `/#/next/contact/${contactId}/profile/workersubvendor/${entityId}`;
      case 7:
        return `/#/next/contact/${contactId}/profile/workerunitedstatesw2/${entityId}`;
      case 8:
        return `/#/next/contact/${contactId}/profile/workerunitedstatesllc/${entityId}`;
      case 9:
        return `/#/next/contact/${contactId}/profile/workerunitedstatesllc/${entityId}`;
      default:
        return null;
    }
  }
}

