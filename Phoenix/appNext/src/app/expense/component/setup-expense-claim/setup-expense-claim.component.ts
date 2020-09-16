import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AvailableWorkOrder } from './../../model/available-work-order';
import { DxDataGridComponent } from 'devextreme-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseClaimService } from './../../service/expense-claim.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonService, NavigationService, PhxLocalizationService } from '../../../common/index';
import { PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableColumn, PhxDataTableSelectionMode } from '../../../common/model/index';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';

@Component({
  selector: 'app-setup-expense-claim',
  templateUrl: './setup-expense-claim.component.html',
  styleUrls: ['./setup-expense-claim.component.less']
})
export class SetupExpenseClaimComponent implements OnInit, OnDestroy {
  id: number;
  formatDate: string;
  workOrders$: BehaviorSubject<AvailableWorkOrder[]>;
  validationMessages: any;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectionMode: PhxDataTableSelectionMode.None,
    enableExport: true,
    stateSavingMode: PhxDataTableStateSavingMode.Customizable,
    showTotalCount: false
  });

  columns: Array<PhxDataTableColumn>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseClaimService: ExpenseClaimService,
    private commonService: CommonService,
    private localizationService: PhxLocalizationService,
    private navigationService: NavigationService
  ) {
    this.navigationService.setTitle('expense-claim-setup');
  }

  ngOnInit() {
    this.initColumns();
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
    this.workOrders$ = this.expenseClaimService.getAvailableWorkOrders();
  }

  ngOnDestroy() {
  }

  initColumns() {
    this.columns = [
      new PhxDataTableColumn(
        {
          dataField: 'WorkOrderNumber',
          caption: this.localizationService.translate(ExpenseModuleResourceKeys.create.workOrderColumnHeader),
          hidingPriority: 4
        }),
      new PhxDataTableColumn(
        {
          dataField: 'ClientOrganizationDisplayName',
          caption: this.localizationService.translate(ExpenseModuleResourceKeys.create.clientColumnHeader),
          hidingPriority: 3
        }),
      new PhxDataTableColumn(
        {
          dataField: 'StartDate',
          caption: this.localizationService.translate(ExpenseModuleResourceKeys.create.startDateColumnHeader),
          dataType: 'date',
          cellTemplate: 'dateCellTemplate',
          hidingPriority: 5

        }),
      new PhxDataTableColumn(
        {
          dataField: 'EndDate',
          caption: this.localizationService.translate(ExpenseModuleResourceKeys.create.endDateColumnHeader),
          dataType: 'date',
          cellTemplate: 'dateCellTemplate',
          hidingPriority: 5

        }),
      new PhxDataTableColumn(
        {
          dataField: 'WorkerName',
          caption: this.localizationService.translate(ExpenseModuleResourceKeys.create.workerColumnHeader),
          dataType: 'string',
          hidingPriority: 2
        }),
      new PhxDataTableColumn(
        {
          dataField: 'ExpenseDescription',
          caption: this.localizationService.translate(ExpenseModuleResourceKeys.create.descriptionColumnHeader),
          hidingPriority: 1
        }),
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: '',
        cellTemplate: 'actionCellTemplate',
        width: 50,
        hidingPriority: 5,
        allowFiltering: false,
        allowSorting: false,
        allowExporting: false,
        allowGrouping: false,
        allowSearch: false,
        fixed: true,
        fixedPosition: 'right',
      }),
    ];
  }

  create(workOrderId: number) {
    this.expenseClaimService.create(workOrderId).then((expenseClaimId) => {
      this.validationMessages = null;
      this.router.navigate([`${expenseClaimId}`], { relativeTo: this.route.parent })
        .catch((err) => {
          console.error(`error navigating to expense/${expenseClaimId}`, err);
        });
    }).catch(err => {
      this.validationMessages = err;
    });
  }

}
