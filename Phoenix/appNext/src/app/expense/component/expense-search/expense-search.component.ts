import { WindowRefService } from './../../../common/services/WindowRef.service';
import { Http, HttpModule } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { NavigationService } from './../../../common/services/navigation.service';
import { CommonService, PhxConstants, PhxLocalizationService } from '../../../common/index';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';

import { PhxDataTableSummaryItem } from './../../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../../common/model/index';

import { ExpenseClaimService } from './../../service/expense-claim.service';
import { ExpenseClaim } from './../../model/expense-claim';

import { CodeValueService } from '../../../common/services/code-value.service';
import { CodeValue } from '../../../common/model/code-value';

import CustomStore from 'devextreme/data/custom_store';
import { AuthService } from '../../../common/services/auth.service';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';

declare var oreq: any;

@Component({
  selector: 'app-expense-search',
  templateUrl: './expense-search.component.html',
  styleUrls: ['./expense-search.component.less']
})
export class ExpenseSearchComponent implements OnInit, OnDestroy {

  isAlive: boolean = true;
  isCurrentUserWorker: boolean;
  activeWorkOrders$: BehaviorSubject<any[]>;
  workOrders: Array<any>;
  disabledNewClaim: Boolean = true;
  codeValueGroups: any;
  odataParams: string = oreq.request().withSelect([
    'Id',
    'Title',
    'Total',
    'CurrencyId',
    'ExpenseClaimStatusId',
    'ExpenseClaimStatusDescription',
    'CurrentApproverNames',
    'SubmissionDatetime',
    'ClientDisplayName',
    'WorkOrderNumber',
    'WorkerName',
    'AssignmentId',
    'WorkOrderId',
    'WorkOrderVersionId',
    'UserProfileIdWorker',
    'ProfileTypeId',
    'ContactId'
  ]).url();

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true,
  });

  columns: Array<PhxDataTableColumn>;

  expenseModuleResourceKeys: any;

  constructor(
    public expenseClaimService: ExpenseClaimService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private authService: AuthService,
    private localizationService: PhxLocalizationService,
    private winRef: WindowRefService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.navigationService.setTitle('expense-claim-search');
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
    this.activeWorkOrders$ = this.expenseClaimService.getAvailableWorkOrders();

    this.activeWorkOrders$.subscribe(value => {
      this.workOrders = value;
      this.disabledNewClaim = !(this.workOrders && this.workOrders.length > 0);
    });

    this.authService.getCurrentProfile()
      .takeWhile(() => this.isAlive)
      .subscribe(userProfile => {
        const rolesIndex = userProfile.FunctionalRoles.findIndex(item =>
          item.FunctionalRoleId === this.commonService.ApplicationConstants.FunctionalRole.Worker
        );
        this.isCurrentUserWorker = (rolesIndex !== -1);
        this.initColumns();
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
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

  initColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.idColumnHeader),
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'Title',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.titleColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.workerNameColumnHeader),
        visible: !this.isCurrentUserWorker
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderNumber',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.workOrderColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'ClientDisplayName',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.clientNameColumnHeader),
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
        dataField: 'SubmissionDatetime',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.submissionDateColumnHeader),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'CurrentApproverNames',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.approversColumnHeader),
      }),
      new PhxDataTableColumn({
        dataField: 'ExpenseClaimStatusDescription',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.search.statusColumnHeader),
        lookup: {
          dataSource: this.getStatusLookup(),
          valueExpr: 'text',
          displayExpr: 'text'
        }
      }),
    ];
  }

  createNewClaim() {

    if (this.workOrders.length === 0) {
      console.error('Missing active work order for expense claim creation');
    } else if (this.workOrders.length === 1) {
      this.expenseClaimService.create(this.workOrders[0].Id).then(expenseClaimId => {
        this.router.navigate([`${expenseClaimId}`], { relativeTo: this.route.parent })
          .catch((err) => {
            console.error(`error navigating to expense/${expenseClaimId}`, err);
          });
      });
    } else {
      this.router.navigate([`setup`], { relativeTo: this.route.parent })
        .catch((err) => {
          console.error(`error navigating to expense/setup`, err);
        });
    }
  }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.viewExpenseClaim(event.currentSelectedRowKeys[0].Id);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewExpenseClaim(id) {
    this.router.navigate([`${id}`], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to expense/${id}`, err);
      });
  }

  getStatusLookup() {
    const codeValues = this.codeValueService.getCodeValues(this.codeValueGroups.ExpenseClaimStatus, true)
      .filter((codeValue: CodeValue) => { return codeValue.id !== PhxConstants.ExpenseClaimStatus.New; });
    const uniqueValues = Array.from(new Set(codeValues.map(o => o.text)));
    return uniqueValues.map((str) => {
      return {
        text: str,
        value: str
      };
    });
  }

  onRowExpanding(event: any) {
    if (event.key && event.key.Id) {
      this.expenseClaimService.getExpenseClaim(event.key.Id).subscribe(data => {
        if (data) {
          this.expenseClaimService.getExpenseClaimItems(event.key.Id);
        }
      });
    }
  }
}
