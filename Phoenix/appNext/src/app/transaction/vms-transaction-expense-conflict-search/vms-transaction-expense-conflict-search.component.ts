import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, PhxLocalizationService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import * as moment from 'moment';
import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, PhxDataTableShowCheckboxesMode, StateAction, StateActionDisplayType, StateActionButtonStyle, PhxConstants } from '../../common/model/index';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';

import { Router, ActivatedRoute } from '@angular/router';

import { TransactionService } from '../transaction.service';
import { OrganizationApiService } from './../../organization/organization.api.service';
import { DialogService } from './../../common/services/dialog.service';
import { DialogResultType } from './../../common/model/index';
import { ApiService } from './../../common/services/api.service';
import * as _ from 'lodash';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { AuthService } from '../../common/services/auth.service';
import { PhoenixCommonModuleResourceKeys } from '../../common/PhoenixCommon.module';
import { VmsService } from '../shared/Vms.service';

declare var oreq: any;
enum ActionType {
  Transfer = 1,
  Discard = 2,
  Revalidate = 3,
}
const messages: any = {
  MessageNonCriticalTransactionDateRange: 'One of the transaction dates is outside the range of the work order date',
  MessageCriticalTransactionDateRange: 'One of the transaction dates is outside the range of the work order date'
};
@Component({
  selector: 'app-vms-transaction-expense-conflict-search',
  templateUrl: './vms-transaction-expense-conflict-search.component.html',
  styleUrls: ['./vms-transaction-expense-conflict-search.component.less']
})
export class VmsTransactionExpenseConflictSearchComponent implements OnInit, OnDestroy {
  routeData: any;
  selectedAction: any;
  selectedIds: any[] = [];
  OrgClients: any[];
  organizationIdInternal: any;
  organizationIdClient: any;
  showClients: boolean = true;
  listOrganizationsInternal: any[];
  transferToOrganization: any;
  exportFileName: string;
  WorkOrderMappingDataset: any[];
  WorkOrderMappingDatasetOriginal: any[];
  WorkOrderMappingDatasetParent: any;
  codeRateType: any[];
  validationMessages: any;
  canEdit: boolean = false;
  phxConstants: typeof PhxConstants = null;
  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;

  @ViewChild('phxTable') phxTable: PhxDataTableComponent;
  // Action dropdown options
  actionsArr: any = [
    { Id: ActionType.Transfer, actionId: PhxConstants.StateAction.VmsExpenseProcessedRecordIntercompanyTransfer, DisplayName: 'Inter-Company Change' },
    { Id: ActionType.Discard, actionId: PhxConstants.StateAction.VmsExpenseProcessedRecordDiscard, DisplayName: 'Delete Record' },
    { Id: ActionType.Revalidate, actionId: PhxConstants.StateAction.VmsExpenseProcessedRecordAutoResolve, DisplayName: 'Revalidate Records' }
  ];
  stateActions: StateAction[] = [];
  availableStateActions: StateAction[];
  actions: any[] = [];
  notifyName: any;
  unregisterList: any[] = [];
  ValidationMessages: any;
  pageTitle: string = 'Search';
  dataSourceUrl: string;
  initialDataSourceUrl: string;
  dataGridComponentName: string = 'ConflictSearch';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectionMode: PhxDataTableSelectionMode.Single,
    showFilter: true,
    enableExport: true,
    // showCheckBoxesMode:PhxDataTableShowCheckboxesMode.Always
  });
  oDataParams: string;
  oDataParameterSelectFields: string;
  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };

  columns: Array<PhxDataTableColumn> = [

    new PhxDataTableColumn({
      dataField: 'ImportDate',
      caption: 'Import Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'ThirdPartyWorkerId',
      caption: 'Third Party Worker Id'
    }),
    new PhxDataTableColumn({
      dataField: 'FirstName',
      caption: 'First Name'
    }),
    new PhxDataTableColumn({
      dataField: 'LastName',
      caption: 'Last Name'
    }),
    new PhxDataTableColumn({
      dataField: 'AmountBillable',
      caption: 'Expense Amount',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
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
      dataField: 'FileName',
      caption: 'Import File Name',
    }),
    new PhxDataTableColumn({
      dataField: 'ValidationMessages',
      caption: 'Reason',
      cellTemplate: 'reasonTemplate',
      calculateFilterExpression: function (filterValue, selectedFilterOperation) {
        let newFilterValue = '';
        if (filterValue.length > 1000) {
          newFilterValue = filterValue.substring(0, 1000);
        } else {
          newFilterValue = filterValue;
        }
        return this.defaultCalculateFilterExpression(
          newFilterValue
          , selectedFilterOperation
        );
      }
    }),
    new PhxDataTableColumn({
      dataField: 'UserNotes',
      caption: 'Processing Note',
      encodeHtml: false,
    }),
    new PhxDataTableColumn({
      dataField: 'Id',
      caption: 'Action',
      cellTemplate: 'actionTemplate',
      allowFiltering: false,
      allowSorting: false,
      allowSearch: false,
      allowExporting: false,
      allowGrouping: false,
      fixed: true,
      fixedPosition: 'right',
    })

  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    protected commonService: CommonService,
    private authService: AuthService,
    private navigationService: NavigationService,
    protected codeValueService: CodeValueService,
    private trnService: TransactionService,
    private orgService: OrganizationApiService,
    private dialogService: DialogService,
    private apiService: ApiService,
    private vmsService: VmsService,
    private localizationService: PhxLocalizationService,
  ) {
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organizationIdInternal = +params['OrganizationIdInternal'];
      this.organizationIdClient = params['OrganizationIdClient'] === undefined ? 0 : +params['OrganizationIdClient'];
    });

    this.getOrganizationClients();
    this.getListOrganizationsInternal();

    this.route.data
      .subscribe(d => {
        this.routeData = d;
        this.initialDataSourceUrl = d.dataSourceUrl.toString().replace(':OrganizationIdInternal', this.organizationIdInternal);
        this.dataSourceUrl = this.initialDataSourceUrl.replace(':OrganizationIdClient', this.organizationIdClient);
        this.oDataParams = d.oDataParameterFilters ? this.oDataParameterSelectFields + d.oDataParameterFilters : this.oDataParameterSelectFields;
        this.dataGridComponentName = d.dataGridComponentName || this.dataGridComponentName;
        this.pageTitle = d.pageTitle || this.pageTitle;
        this.exportFileName = d.exportFileName || 'VmsDocuments';
      });

    this.navigationService.setTitle('thirdpartyimport-expense-conflict');

    this.canEdit = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
  }

  getOrganizationClients() {
    const orgClientDataParams = oreq.request().withSelect(['ExpenseConflictCount', 'ClientOrgDisplayName', 'OrganizationIdClient', 'OrganizationIdInternal'])
      .withFilter(oreq.filter('OrganizationIdInternal').eq(this.organizationIdInternal).and().filter('ExpenseConflictCount').gt(0)).url();
    this.trnService.getOrganizationClients(orgClientDataParams)
      .subscribe(response => {
        this.OrgClients = response.Items;
      },
        error => {
          console.log(error);
        }
      );
  }
  getListOrganizationsInternal() {
    const orgOrgDataParams = oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest'])
      .withFilter(oreq.filter('Id').ne(this.organizationIdInternal)).url();

    this.orgService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole(orgOrgDataParams)
      .subscribe(response => {
        this.listOrganizationsInternal = response.Items;
      },
        error => {
          console.log(error);
        }
      );


  }

  transferOrganization(id) {
    this.transferToOrganization = id;
  }
  actionSelect(actionId) {
    if (!actionId) {
      this.actionSelectRemoved();
      return;
    }
    this.WorkOrderMappingDataset = null;
    this.WorkOrderMappingDatasetParent = null;
    this.phxTable.clearSelection();
    this.selectedAction = actionId;
    const isRevalidate = actionId === PhxConstants.StateAction.VmsExpenseProcessedRecordAutoResolve;
    if (isRevalidate) {
      this.dataTableConfiguration.selectionMode = PhxDataTableSelectionMode.Single;
      const selectedClient = _.find(this.OrgClients, (c) => c.OrganizationIdClient === this.organizationIdClient);
      if (selectedClient) {
        this.refreshProcess(selectedClient);
      }
    } else {
      this.dataTableConfiguration.selectionMode = actionId ? PhxDataTableSelectionMode.Multiple : PhxDataTableSelectionMode.Single;
    }
    this.WorkOrderMappingDataset = null;
  }

  actionSelectRemoved() {
    this.dataTableConfiguration.selectionMode = PhxDataTableSelectionMode.Single;
    this.WorkOrderMappingDataset = null;
    this.selectedAction = null;
  }
  newClientOrgSelected(id) {
    if (id) {
      this.router.navigate(['/next', 'transaction', 'vms-expense-conflict', 'search', this.organizationIdInternal, 'client', id]);
      this.dataSourceUrl = this.initialDataSourceUrl.replace(':OrganizationIdClient', id);
      this.actionSelectRemoved();
      this.WorkOrderMappingDataset = null;
    } else {
      this.organizationIdClientRemoved();
    }
  }
  organizationIdClientRemoved() {
    this.router.navigate(['/next', 'transaction', 'vms-expense-conflict', 'search', this.organizationIdInternal]);
    this.dataSourceUrl = null;
    this.actionSelectRemoved();
    this.WorkOrderMappingDataset = null;
  }
  ngOnDestroy() {
    if (this.unregisterList && this.unregisterList.length) {
      for (const sub of this.unregisterList) {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      }
    }
  }

  btnCancelClick() {
    this.selectedAction = null;
  }

  refreshProcess(selectedClient) {
    this.dialogService.confirm('Transaction', 'Do you want to revalidate all records?')
      .then((btn) => {
        if (btn === DialogResultType.Yes) {
          const commandName = this.codeValueService.getCodeValueCode(this.selectedAction, this.commonService.CodeValueGroups.StateAction);
          this.loadingSpinnerService.show();
          const payload = {
            EntityIds: this.selectedIds,
            EntityTypeId: PhxConstants.EntityType.VmsExpenseProcessedRecord,
            OrganizationIdInternal: this.organizationIdInternal,
            OrganizationIdClient: this.organizationIdClient,
          };
          this.trnService.executeStateCommand(commandName, payload)
            .then((response: any) => {
              this.loadingSpinnerService.hideAll();
              if (response.ValidationMessages && response.ValidationMessages[0].Message > 0) {
                this.commonService.logSuccess(`${response.ValidationMessages[0].Message} number of conflicts have been resolved and moved to Pending transaction creation`);
              }
              this.refreshAndDecreaseCount(response.ValidationMessages[0].Message);
              this.actionSelectRemoved();
            },
              (error) => {
                this.loadingSpinnerService.hideAll();
                this.onErrorResponse(error, 'VMS Record object is not valid');
                this.actionSelectRemoved();
              });
        }
      }, (err) => {
        this.actionSelectRemoved();
      });
  }

  dxRowClick(e) {

    if (this.dataTableConfiguration.selectionMode === PhxDataTableSelectionMode.Single) {
      this.getWorkOrderMappings(e.data);
    }
  }

  dataReceived(data: any[]) {
    this.availableStateActions = _(data).map('AvailableStateActions').flatten().uniq().value();
    this.initStateActions();
    this.canEdit = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
  }

  initStateActions() {
    const self = this;

    this.stateActions = [
      { // change Internal Org
        actionId: PhxConstants.StateAction.VmsExpenseProcessedRecordIntercompanyTransfer,
        displayText: 'Transfer',
        style: StateActionButtonStyle.PRIMARY,
        skipSecurityCheck: true, // todo
        hiddenFn: (action, componentOption) => {
          return this.selectedAction !== action.actionId;
        },
        disabledFn: (action, componentOption) => {
          return !this.selectedIds || !(this.selectedIds.length > 0) || !this.transferToOrganization;
        },
        onClick: (action, componentOption, actionOption) => {
          const payload = {
            EntityIds: this.selectedIds,
            EntityTypeId: PhxConstants.EntityType.VmsExpenseProcessedRecord,
            OrganizationIdInternal: this.transferToOrganization,
          };
          this.trnService.executeStateCommand(action.commandName, payload)
            .then(
              (success: any) => {
                this.loadingSpinnerService.hideAll();
                self.refreshAndDecreaseCount(self.selectedIds.length || 0);
              },
              (error) => {
                this.loadingSpinnerService.hideAll();
                this.onErrorResponse(error, 'VMS Record object is not valid');
              });

        }
      },
      { // Discard
        actionId: PhxConstants.StateAction.VmsExpenseProcessedRecordDiscard,
        displayText: 'Delete Record',
        style: StateActionButtonStyle.PRIMARY,
        skipSecurityCheck: true, // todo
        hiddenFn: (action, componentOption) => {
          return this.selectedAction !== action.actionId;
        },
        disabledFn: (action, componentOption) => {
          return !this.selectedIds || !(this.selectedIds.length > 0);
        },
        onClick: (action, componentOption, actionOption) => {
          const payload = {
            EntityIds: this.selectedIds,
            EntityTypeId: PhxConstants.EntityType.VmsExpenseProcessedRecord,
          };
          this.loadingSpinnerService.show();
          this.trnService.executeStateCommand(action.commandName, payload)
            .then(
              (success: any) => {
                self.refreshAndDecreaseCount(self.selectedIds.length || 0);
              },
              (error) => {
                this.loadingSpinnerService.hideAll();
                this.onErrorResponse(error, 'VMS Record object is not valid');
              });
        }
      },
      { // Discard
        actionId: PhxConstants.StateAction.VmsExpenseProcessedRecordManualResolve,
        displayText: 'Resolve',
        style: StateActionButtonStyle.PRIMARY,
        skipSecurityCheck: true, // todo
        hiddenFn: (action, componentOption) => {
          return !(this.canEdit && !this.selectedAction && this.WorkOrderMappingDatasetParent && this.WorkOrderMappingDatasetParent.Id);
        },
        disabledFn: (action, componentOption) => {
          return this.anythingToResolve();
        },
        onClick: (action, componentOption, actionOption) => {
          this.resolve();
        }
      },
      { // cancel
        displayText: self.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.cancel),
        skipSecurityCheck: true,
        hiddenFn: (action, componentOption) => {
          return !(
            [PhxConstants.StateAction.VmsExpenseProcessedRecordIntercompanyTransfer
              , PhxConstants.StateAction.VmsExpenseProcessedRecordDiscard
              , PhxConstants.StateAction.VmsExpenseProcessedRecordManualResolve].includes(self.selectedAction)
            || (self.WorkOrderMappingDataset && self.WorkOrderMappingDataset.length > 0)
          );
        },
        onClick: (action, componentOption, actionOption) => {
          this.actionSelectRemoved();
        }
      },

    ];
  }

  selections(e: any) {
    if (e && e.selectedRowsData) {
      this.selectedIds = e.selectedRowsData.map((i: any) => { return i.Id; });
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  getWorkOrderMappings(rowdata: any) {
    this.WorkOrderMappingDatasetParent = rowdata;
    this.WorkOrderMappingDataset = rowdata.VmsExpenseWorkOrders.filter(x => x.ExpenseMethodologyId !== 4);
    this.WorkOrderMappingDatasetOriginal = JSON.parse(JSON.stringify(rowdata.VmsExpenseWorkOrders.filter(x => x.ExpenseMethodologyId !== 4)));
  }

  conflictRowClick(wov, e) {
    this.WorkOrderMappingDataset.filter(x => x.WorkOrderId !== wov.WorkOrderId && x.IsSelected === true).forEach(w => {
      w.IsSelected = false;
    });

  }

  setDate(dateProperty, e) {
    dateProperty = e.value;
  }
  formatDate(x) {
    return moment(x).format('MMM DD, YYYY');
  }

  anythingToResolve() {
    return this.WorkOrderMappingDataset && this.WorkOrderMappingDataset.filter(x => x.IsSelected).length === 0;
  }
  resolve() {
    const parent = this.WorkOrderMappingDatasetParent;
    const self = this;
    const payload = {
      EntityIds: this.selectedIds,
      EntityTypeId: PhxConstants.EntityType.VmsExpenseProcessedRecord,
      VmsExpenseRecordId: parent.Id,
      WorkOrderId: this.WorkOrderMappingDataset.find(x => x.IsSelected).WorkOrderId
    };
    const commandName = this.codeValueService.getCodeValueCode(PhxConstants.StateAction.VmsExpenseProcessedRecordManualResolve, this.commonService.CodeValueGroups.StateAction);
    this.trnService.executeStateCommand(commandName, payload)
      .then((success) => {
        this.commonService.logSuccess('Record resolved successfully');
        this.refreshAndDecreaseCount(1);
      },
        (error) => {
          this.onErrorResponse(error, 'VMS Record object is not valid');
          this.validationMessages = error;
        });
  }

  validateAndResolve() {
    const criticalErrors = [], nonCriticialErros = [];
    let item = null;
    const checkedRows = this.WorkOrderMappingDataset.filter(x => x.IsSelected);
    const parent = this.WorkOrderMappingDatasetParent;
    for (let i = 0; i < checkedRows.length; i++) {
      item = checkedRows[i];
      const transactionStartDate = new Date(parent.StartDate);
      const transactionEndDate = new Date(parent.EndDate);
      const workOrderStartDate = new Date(item.StartDate);
      const workOrderEndDate = new Date(item.EndDate);

      if ((transactionStartDate < workOrderStartDate && transactionEndDate < workOrderStartDate)
        || (transactionStartDate > workOrderEndDate && transactionEndDate > workOrderEndDate)
        || (transactionStartDate < workOrderStartDate && transactionEndDate > workOrderEndDate)) {
        criticalErrors.push(messages.MessageNonCriticalTransactionDateRange);
      } else if ((transactionStartDate >= workOrderStartDate && transactionStartDate <= workOrderEndDate)
        && (transactionEndDate >= workOrderStartDate && transactionEndDate <= workOrderEndDate) && transactionStartDate <= transactionEndDate) {

      } else {
        nonCriticialErros.push(messages.MessageCriticalTransactionDateRange);
      }
    }

    if (criticalErrors.length > 0) {
      this.dialogService.notify('Errors on resolving conflicts', criticalErrors.join('<br>'));
    } else {
      if (nonCriticialErros.length > 0) {
        this.dialogService.confirm('Warning', nonCriticialErros.join('<br><br>') + '  <br><br>Continue?')
          .then((btn) => {
            if (btn === DialogResultType.Yes) {
              this.resolve();
            }
          }, (btn) => {

          });
      } else {
        this.resolve();
      }
    }

  }

  onErrorResponse(responseError, message) {
    if (message && message.length > 0) {
      this.commonService.logError(message);
    }
  }

  refreshAndDecreaseCount(decreaseCount: number) {
    this.phxTable.grid.instance.refresh().then(() => {
      this.loadingSpinnerService.hideAll();
    });
    this.WorkOrderMappingDataset = null;
    const org = _.find(this.OrgClients, i => i.OrganizationIdClient === this.organizationIdClient);
    if (org) {
      org.ExpenseConflictCount = Math.max(org.ExpenseConflictCount - decreaseCount, 0);
      this.showClients = false;
      setTimeout(() => this.showClients = true, 100);
    }
  }

  validateConflicts(): any[] {
    const errors = [];
    let tempItem = null;

    const parent = this.WorkOrderMappingDatasetParent;
    const selectedMappings = this.WorkOrderMappingDataset.filter(x => x.IsSelected);

    for (let j = 0; j < selectedMappings.length; j++) {
      tempItem = JSON.parse(JSON.stringify(selectedMappings[j]));
      if (moment(tempItem.TrnStartDate) < tempItem.StartDate || moment(tempItem.TrnEndDate) > tempItem.EndDate) {
        errors.push('Transaction dates should be within Work Order Version Effective dates.');
        break;
      }
      if (moment(tempItem.TrnStartDate) > moment(tempItem.TrnEndDate)) {
        errors.push('Transaction start date cannot be greater than end date.');
        break;
      }
    }

    for (let k = 0; k < selectedMappings.length; k++) {
      tempItem = JSON.parse(JSON.stringify(selectedMappings[k]));
      if ((parent.V2RateTypeId > 0 && parent.V2BillRate > 0 && !tempItem.V2RateTypeId) || (tempItem.V2RateTypeId && tempItem.V2RateTypeId !== this.WorkOrderMappingDatasetParent.V2RateTypeId)) {
        errors.push('VMS item rate type doesn\'t match to selected Work Order Version rate type.');
        break;
      }
    }

    let aggregateV1RateUnits = 0, aggregateV2RateUnits = 0;
    selectedMappings.forEach(value => {
      value.V1BillUnits = value && value.V1BillUnits ? +(value.V1BillUnits.toFixed(2)) : 0;
      value.V2BillUnits = value && value.V2BillUnits ? +(value.V2BillUnits.toFixed(2)) : 0;
      aggregateV1RateUnits += value.V1BillUnits / 1;
      aggregateV2RateUnits += value.V2BillUnits / 1;
    });

    if (aggregateV1RateUnits <= parent.V1BillUnits) {
      if (parent.V2BillUnits && parent.V2BillUnits >= 0 && +aggregateV2RateUnits > parent.V2BillUnits) {
        errors.push('Units aggregate cannot exceed VMS item Units.');
      }
      if (!parent.V2BillUnits && aggregateV2RateUnits > 0) {
        errors.push('Units aggregate cannot exceed VMS item Units.');
      }
    } else {
      errors.push('Units aggregate cannot exceed VMS item Units.');
    }

    return errors;

  }

  displayCurrencyCode(currencyId): string {
    // return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
    return '';
  }

  getCodeValue(codeTable: string) {
    return this.codeValueService.getCodeValues(codeTable, true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          id: codeValue.id,
          code: codeValue.code,
        };
      });
  }

  editNote(item, event) {
    event.stopPropagation();
    const record = item.row.data;
    this.phxDialogComponentConfigModel = {
      HeaderTitle: 'Edit Note',
      Buttons: [
        { Id: 1, Name: 'Cancel', SortOrder: 1, Class: 'btn-default' },
        {
          Id: 2, Name: 'Save', SortOrder: 2, CheckValidation: true, Class: 'btn-primary',
          ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
            this.vmsService.updateVmsExpenseProcessedRecordUserNotes({
              EntityIds: [record.Id],
              UserNotes: callBackObj.config.ObjectComment.Value
            })
              .then((response) => {
                this.commonService.logSuccess('Note updated successfully.');
                this.phxTable.refresh();
              })
              .catch((error) => {
                this.commonService.logError('Error on updating note.', error);
              });
          }
        },
      ],
      ObjectComment: { Label: `Enter the note:`, HelpBlock: '', Value: record.UserNotes, IsRequared: false, LengthMin: 0, LengthMax: 256 },
    };
    this.phxDialogComponent.open();
  }

}


