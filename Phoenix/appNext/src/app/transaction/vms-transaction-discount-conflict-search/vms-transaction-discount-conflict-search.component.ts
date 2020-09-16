import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, PhxLocalizationService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import * as moment from 'moment';
import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, PhxDataTableShowCheckboxesMode, PhxConstants, StateActionButtonStyle, StateAction } from '../../common/model/index';
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
const localizedContent = {

  discountMustBePositive: 'Imported records must have positive discount.',
  startDateEmpty: 'Imported records must have Start Date.',
  endDateEmpty: 'Imported records must have End Date.'
};

enum ActionType {
  Transfer = 1,
  Discard = 2,
  Revalidate = 3,
}
@Component({
  selector: 'app-vms-transaction-discount-conflict-search',
  templateUrl: './vms-transaction-discount-conflict-search.component.html',
  styleUrls: ['./vms-transaction-discount-conflict-search.component.less']
})

export class VmsTransactionDiscountConflictSearchComponent implements OnInit {
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
  canEdit: boolean = false;
  phxConstants: typeof PhxConstants = null;

  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;

  @ViewChild('phxTable') phxTable: PhxDataTableComponent;
  // Action dropdown options
  actionsArr: any = [
    { Id: 1, actionId: PhxConstants.StateAction.VmsDiscountProcessedRecordIntercompanyTransfer, DisplayName: 'Inter-Company Change' },
    { Id: 2, actionId: PhxConstants.StateAction.VmsDiscountProcessedRecordDiscard, DisplayName: 'Delete Record' },
    { Id: ActionType.Revalidate, actionId: PhxConstants.StateAction.VmsDiscountProcessedRecordAutoResolve, DisplayName: 'Revalidate Records' }
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
      dataField: 'Discount',
      caption: 'Discount',
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
      dataField: 'BillingTransactionNumber',
      caption: 'TRN. Number',
      alignment: 'right'
    }),
    new PhxDataTableColumn({
      dataField: 'Note',
      caption: 'Note'
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
        this.dataSourceUrl = this.organizationIdClient ? this.initialDataSourceUrl.replace(':OrganizationIdClient', this.organizationIdClient) : null;
        // this.oDataParams = d.oDataParameterFilters ? this.oDataParameterSelectFields + d.oDataParameterFilters : this.oDataParameterSelectFields;
        // this.dataGridComponentName = d.dataGridComponentName || this.dataGridComponentName;
        this.pageTitle = d.pageTitle || this.pageTitle;
        this.exportFileName = d.exportFileName || 'VmsDocuments';
      });

    this.navigationService.setTitle('thirdpartyimport-discount-conflict');

    this.canEdit = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
  }

  getOrganizationClients() {
    const orgClientDataParams = oreq.request().withSelect(['DiscountConflictCount', 'ClientOrgDisplayName', 'OrganizationIdClient', 'OrganizationIdInternal'])
      .withFilter(oreq.filter('OrganizationIdInternal').eq(this.organizationIdInternal).and().filter('DiscountConflictCount').gt(0)).url();
    this.trnService.getOrganizationClients(orgClientDataParams)
      .subscribe(response => {
        this.OrgClients = response.Items;
        this.OrgClients = this.OrgClients.map(i => {
          i.ConflictCount = i.DiscountConflictCount;
          return i;
        });
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
    const isRevalidate = actionId === PhxConstants.StateAction.VmsDiscountProcessedRecordAutoResolve;
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
      this.router.navigate(['/next', 'transaction', 'vms-discount-conflict', 'search', this.organizationIdInternal, 'client', id]);
      // this.dataSourceUrl = this.initialDataSourceUrl.replace(':OrganizationIdClient', id);
      // this.actionSelectRemoved();
      // this.WorkOrderMappingDataset = null;
    } else {
      this.organizationIdClientRemoved();
    }
  }

  organizationIdClientRemoved() {
    this.router.navigate(['/next', 'transaction', 'vms-discount-conflict', 'search', this.organizationIdInternal]);
    // this.dataSourceUrl = null;
    // this.actionSelectRemoved();
    // this.WorkOrderMappingDataset = null;
  }

  refreshProcess(selectedClient) {
    this.dialogService.confirm('Transaction', 'Do you want to revalidate all records?')
      .then((btn) => {
        if (btn === DialogResultType.Yes) {
          const commandName = this.codeValueService.getCodeValueCode(this.selectedAction, this.commonService.CodeValueGroups.StateAction);
          this.loadingSpinnerService.show();
          const payload = {
            EntityIds: this.selectedIds,
            EntityTypeId: PhxConstants.EntityType.VmsDiscountProcessedRecord,
            OrganizationIdInternal: selectedClient.organizationIdInternal,
            OrganizationIdClient: selectedClient.organizationIdClient,
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
      }, function (btn) {
        console.log(btn);
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
    this.canEdit = this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.VMSImport);
  }

  initStateActions() {
    const self = this;

    this.stateActions = [
      { // change Internal Org
        actionId: PhxConstants.StateAction.VmsDiscountProcessedRecordIntercompanyTransfer,
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
            EntityTypeId: PhxConstants.EntityType.VmsDiscountProcessedRecord,
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
        actionId: PhxConstants.StateAction.VmsDiscountProcessedRecordDiscard,
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
            EntityTypeId: PhxConstants.EntityType.VmsDiscountProcessedRecord,
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
      { // Resolve
        actionId: PhxConstants.StateAction.VmsDiscountProcessedRecordManualResolve,
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
            [PhxConstants.StateAction.VmsDiscountProcessedRecordIntercompanyTransfer
              , PhxConstants.StateAction.VmsDiscountProcessedRecordDiscard
              , PhxConstants.StateAction.VmsDiscountProcessedRecordManualResolve].includes(self.selectedAction)
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
    this.WorkOrderMappingDataset = rowdata.VmsBillingTransactions;
    this.WorkOrderMappingDatasetOriginal = JSON.parse(JSON.stringify(rowdata.VmsBillingTransactions));
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
    const errors = this.validateConflicts();

    if (errors.length > 0) {
      this.dialogService.notify('Errors on resolving conflicts', errors.join('<br>'));
    } else {
      const self = this;
      const payload = {
        EntityIds: this.selectedIds,
        EntityTypeId: PhxConstants.EntityType.VmsDiscountProcessedRecord,
        VmsDiscountRecordId: parent.Id,
        BillingTransactionId: this.WorkOrderMappingDataset.find(x => x.IsSelected).BillingTransactionId
      };
      const commandName = this.codeValueService.getCodeValueCode(PhxConstants.StateAction.VmsDiscountProcessedRecordManualResolve, this.commonService.CodeValueGroups.StateAction);
      this.trnService.executeStateCommand(commandName, payload)
        .then((success) => {
          self.commonService.logSuccess('Record resolved successfully');
          self.refreshAndDecreaseCount(1);
        },
          (error) => {
            self.onErrorResponse(error, 'VMS Record object is not valid');
          });
    }
  }

  validateConflicts(): any[] {
    const errors = [];

    const selectedRows = this.phxTable.getSelectedRowsData();

    for (let j = 0; j < selectedRows.length; j++) {
      if (selectedRows[j].Discount == null || selectedRows[j].Discount <= 0) {
        errors.push(localizedContent.discountMustBePositive);
      }

      if (selectedRows[j].StartDate == null) {
        errors.push(localizedContent.startDateEmpty);
      }

      if (selectedRows[j].EndDate == null) {
        errors.push(localizedContent.endDateEmpty);
      }
    }
    return errors;
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
      org.ConflictCount = Math.max(org.ConflictCount - decreaseCount, 0);
      this.showClients = false;
      setTimeout(() => this.showClients = true, 100);
    }
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
            this.vmsService.updateVmsDiscountProcessedRecordUserNotes({
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
