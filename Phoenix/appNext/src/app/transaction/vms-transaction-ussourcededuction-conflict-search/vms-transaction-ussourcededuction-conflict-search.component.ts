import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, PhxLocalizationService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import * as moment from 'moment';
import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, PhxDataTableShowCheckboxesMode, PhxConstants, StateAction, StateActionButtonStyle } from '../../common/model/index';
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
@Component({
  selector: 'app-vms-transaction-ussourcededuction-conflict-search',
  templateUrl: './vms-transaction-ussourcededuction-conflict-search.component.html',
  styleUrls: ['./vms-transaction-ussourcededuction-conflict-search.component.less']
})

export class VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent implements OnInit, OnDestroy {
  routeData: any;
  selectedAction: any;
  selectedIds: any[] = [];
  // OrgClients: any[];
  organizationIdInternal: any;
  // organizationIdClient: any;
  showClients: boolean = true;
  listOrganizationsInternal: any[];
  transferToOrganization: any;
  exportFileName: string;
  WorkOrderMappingDataset: any[];
  WorkOrderMappingDatasetOriginal: any[];
  WorkOrderMappingDatasetParent: any;
  codeRateType: any[];
  canEdit: boolean = false;
  phxConstants: typeof PhxConstants = null;

  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;

  @ViewChild('phxTable') phxTable: PhxDataTableComponent;
  // Action dropdown options
  actionsArr: any = [
    { Id: ActionType.Transfer, actionId: PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordIntercompanyTransfer, DisplayName: 'Inter-Company Change' },
    { Id: ActionType.Discard, actionId: PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordDiscard, DisplayName: 'Delete Record' },
    { Id: ActionType.Revalidate, actionId: PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordAutoResolve, DisplayName: 'Revalidate Records' }
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
      dataField: 'PaymentTransactionNumber',
      caption: 'TRN. Number',
      alignment: 'right'
    }),
    new PhxDataTableColumn({
      dataField: 'LastName',
      caption: 'Last Name'
    }),
    new PhxDataTableColumn({
      dataField: 'Date',
      caption: 'Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'GrossAmount',
      caption: 'Gross Amount',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'MedicareAmount',
      caption: 'Medicare Amount',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'SocialSecurityAmount',
      caption: 'Social Security Amount',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'FudiAmount',
      caption: 'Fudi Amount',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'SuiAmount',
      caption: 'Sui Amount',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
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
      // this.organizationIdClient = params['OrganizationIdClient'] === undefined ? 0 : +params['OrganizationIdClient'];
    });

    // this.getOrganizationClients();
    this.getListOrganizationsInternal();

    this.route.data
      .subscribe(d => {
        this.routeData = d;
        this.initialDataSourceUrl = d.dataSourceUrl.toString().replace(':OrganizationIdInternal', this.organizationIdInternal);
        this.dataSourceUrl = this.initialDataSourceUrl; // .replace(':OrganizationIdClient', this.organizationIdClient);
        this.oDataParams = d.oDataParameterFilters ? this.oDataParameterSelectFields + d.oDataParameterFilters : this.oDataParameterSelectFields;
        this.dataGridComponentName = d.dataGridComponentName || this.dataGridComponentName;
        this.pageTitle = d.pageTitle || this.pageTitle;
        this.exportFileName = d.exportFileName || 'VmsDocuments';
      });

    this.navigationService.setTitle('thirdpartyimport-ussourcededuction-conflict');

    this.canEdit = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
  }


  // getOrganizationClients() {
  //  const orgClientDataParams = oreq.request().withSelect(['UnitedStatesSourceDeductionConflictCount', 'OrganizationIdInternal'])
  //    .withFilter(oreq.filter('OrganizationIdInternal').eq(this.organizationIdInternal)).url();
  //  this.trnService.getOrganizationClients(orgClientDataParams)
  //    .subscribe(response => {
  //      this.OrgClients = response.Items.filter(x => x.UnitedStatesSourceDeductionConflictCount > 0);
  //      this.OrgClients = this.OrgClients.map(i => {
  //        i.ConflictCount = i.UnitedStatesSourceDeductionConflictCount;
  //        return i;
  //      });
  //    },
  //    error => {
  //      console.log(error);
  //    }
  //    );
  // }
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
    const isRevalidate = actionId === PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordAutoResolve;
    if (isRevalidate) {
      this.dataTableConfiguration.selectionMode = PhxDataTableSelectionMode.Single;
      this.revalidateRecords();
    } else {
      this.dataTableConfiguration.selectionMode = actionId ? PhxDataTableSelectionMode.Multiple : PhxDataTableSelectionMode.Single;
    }
  }

  actionSelectRemoved() {
    this.dataTableConfiguration.selectionMode = PhxDataTableSelectionMode.Single;
    this.WorkOrderMappingDataset = null;
    this.selectedAction = null;
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


  revalidateRecords() {
    this.dialogService.confirm('Transaction', 'Do you want to revalidate all records?')
      .then((btn) => {
        if (btn === DialogResultType.Yes) {
          const commandName = this.codeValueService.getCodeValueCode(this.selectedAction, this.commonService.CodeValueGroups.StateAction);
          this.loadingSpinnerService.show();

          const payload = {
            EntityIds: this.selectedIds,
            EntityTypeId: PhxConstants.EntityType.VmsUnitedStatesSourceDeductionProcessedRecord,
            OrganizationIdInternal: this.organizationIdInternal,
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
      }, (btn) => {
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
        actionId: PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordIntercompanyTransfer,
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
            EntityTypeId: PhxConstants.EntityType.VmsUnitedStatesSourceDeductionProcessedRecord,
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
        actionId: PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordDiscard,
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
            EntityTypeId: PhxConstants.EntityType.VmsUnitedStatesSourceDeductionProcessedRecord,
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
        actionId: PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordManualResolve,
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
            [PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordIntercompanyTransfer
              , PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordDiscard
              , PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordManualResolve].includes(self.selectedAction)
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
    this.WorkOrderMappingDataset = rowdata.VmsPaymentTransactions;
    this.WorkOrderMappingDatasetOriginal = JSON.parse(JSON.stringify(rowdata.VmsPaymentTransactions));
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
      EntityTypeId: PhxConstants.EntityType.VmsUnitedStatesSourceDeductionProcessedRecord,
      VmsUnitedStatesSourceDeductionRecordId: parent.Id,
      PaymentTransactionId: this.WorkOrderMappingDataset.find(x => x.IsSelected).PaymentTransactionId
    };
    const commandName = this.codeValueService.getCodeValueCode(PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordManualResolve, this.commonService.CodeValueGroups.StateAction);
    this.trnService.executeStateCommand(commandName, payload)
      .then(
        (success) => {
          self.commonService.logSuccess('Record resolved successfully');
          self.refreshAndDecreaseCount(1);
        },
        (error) => {
          self.onErrorResponse(error, 'VMS Record object is not valid');
        });
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
    // const org = _.find(this.OrgClients, i => i.OrganizationIdClient === this.organizationIdClient);
    // if (org) {
    //    org.ConflictCount = Math.max(org.ConflictCount - decreaseCount, 0);
    //    this.showClients = false;
    //    setTimeout(() => this.showClients = true, 100);
    // }
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
            this.vmsService.updateVmsUnitedStatesSourceDeductionProcessedRecordUserNotes({
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


