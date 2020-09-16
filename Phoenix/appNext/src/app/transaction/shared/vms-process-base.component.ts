import { UserProfile } from './../../common/model/user';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';

import { NavigationService } from '../../common/services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableConfiguration, PhxDataTableColumn, StateAction, StateActionButtonStyle } from '../../common/model/index';
import { DialogService, CommonService, ApiService, LoadingSpinnerService, PhxConstants } from '../../common/index';
import * as _ from 'lodash';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { DialogResultType } from '../../common/model/dialog-result-type';
import { AuthService } from '../../common/services/auth.service';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { VmsService } from './Vms.service';

declare var oreq: any;

export class VmsProcessBaseComponent implements OnInit {
  phxConstants: any;
  isEnableWorkFlowAction: boolean;
  isEnableStateAction: boolean;
  userProfile: UserProfile;
  protected currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  organizationIdInternal: number;
  orgClients: any[];
  organizationIdClient: number;
  showTable: boolean = true;
  dataSourceUrl: string;
  oDataParams: string = '&$orderby=ImportDate';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration(<PhxDataTableConfiguration>{
    pageSize: 1000
  });
  items: any[];
  columns: Array<PhxDataTableColumn>;
  validationMessages: any;
  hasAccess: boolean = false;
  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  @ViewChild('grid') grid: PhxDataTableComponent;
  phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;

  tableStateActions: StateAction[];
  stateActions: StateAction[];

  // Virtual properties
  pageTitle: string;
  getItemPreparedCountValue: (item) => number; // For reusing orgClientListTemplate with different kinds of items.
  apiEndpointPathParameter: string;
  conflictRecordType: any;
  callSendToConflict: (record, reason) => Promise<any>;
  toSendNotifyOnPreExecutionNotValidResult: boolean;
  // taskResultId: number;
  // batchPreExecutionCommandName: string;
  // batchThreadExecutionCommandName: string;
  // batchPreExecutionManipulationCommandname: string;
  CommandName: string;
  // Common columns
  colDefs = {
    importDate: new PhxDataTableColumn({
      dataField: 'ImportDate',
      caption: 'Import Date',
      dataType: 'date'
    }),
    firstName: new PhxDataTableColumn({
      dataField: 'FirstName',
      caption: 'First Name'
    }),
    lastName: new PhxDataTableColumn({
      dataField: 'LastName',
      caption: 'Last Name'
    }),
    startDate: new PhxDataTableColumn({
      dataField: 'StartDate',
      caption: 'Start Date',
      dataType: 'date'
    }),
    endDate: new PhxDataTableColumn({
      dataField: 'EndDate',
      caption: 'End Date',
      dataType: 'date'
    }),
    userNotes: new PhxDataTableColumn({
      dataField: 'UserNotes',
      caption: 'Processing Note',
      encodeHtml: false
    }),
    fileName: new PhxDataTableColumn({
      dataField: 'FileName',
      caption: 'Import File Name'
    }),
    action: new PhxDataTableColumn({
      dataField: 'Id',
      caption: 'Action',
      cellTemplate: 'SendToConflictTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false
    })
  };

  constructor(
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private navigationService: NavigationService,
    protected commonService: CommonService,
    private apiService: ApiService,
    private authService: AuthService,
    private vmsService: VmsService
  ) {
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.navigationService.setTitle(this.pageTitle);
    this.authService
      .getCurrentProfile()
      .take(1)
      .subscribe(profile => {
        this.userProfile = profile;
      });
    this.organizationIdInternal = +this.route.snapshot.params['organizationIdInternal'];
    this.getOrgClients();
    this.hasAccess = this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.VMSImport);
  }

  orgClientListTemplate(item) {
    return `<div class="pull-left" style="margin-top:-1px;margin-right:10px;">${item && item.ClientOrgDisplayName}</div>
            <span class="pull-left badge badge-warning badge-conflict ng-binding">${item && item.Count}</span>
            <i class="pull-left icon-chevron-right" style="padding-top: 4px;margin-left:10px;"></i>`;
  }

  refreshAll() {
    this.getOrgClients();
    this.loadRecords();
  }

  getOrgClients = () => {
    const organizationIdInternal = this.organizationIdInternal;
    const oDataParams = oreq
      .request()
      .withSelect([
        'OrganizationIdInternal',
        'OrganizationIdClient',
        'ClientOrgDisplayName',
        'DiscountPreparedCount',
        'UnitedStatesSourceDeductionPreparedCount',
        'ExpensePreparedCount',
        'CommissionPreparedCount',
        'PreparedCount',
        'FixedPricePreparedCount'
      ])
      .url();
    this.vmsService.getVmsAllItems(oDataParams).then(
      (response: any) => {
        const orgClients = (response.Items || [])
          .filter(i => {
            return +i.OrganizationIdInternal === organizationIdInternal && this.getItemPreparedCountValue(i) > 0;
          })
          .map(i => {
            const j = i;
            j.Count = this.getItemPreparedCountValue(i);
            return j;
          });
        this.orgClients = orgClients;

        if (this.apiEndpointPathParameter === 'vms/getUnitedStatesSourceDeductionProcessedRecords') {
          this.onOrgClientSelected(-1);
        }
      },
      function(error) {
        this.commonService.logError('Client list retrieval error', error);
      }
    );
  };

  onOrgClientSelected(id) {
    this.organizationIdClient = id || 0;
    this.loadRecords();
  }

  loadRecords = () => {
    this.validationMessages = null;
    this.items = [];
    this.dataSourceUrl = `${this.apiEndpointPathParameter}/internalOrganization/${this.organizationIdInternal}/clientOrganization/${this.organizationIdClient}`;
    this.showTable = false;
    setTimeout(() => {
      this.showTable = true;
    }, 100);
  };

  dataReceived(data: any[]) {
    this.items = data;
    // this.isEnableCreateTransaction = (this.items && this.items.filter(d => d.WorkflowPendingTaskId && d.WorkflowAvailableActions && d.WorkflowAvailableActions.filter(w => w.TaskResultId === this.taskResultId).length > 0).length > 0);
    // this.isEnableWorkFlowAction = (this.items && this.items.filter(d => d.WorkflowPendingTaskId && d.WorkflowAvailableActions.length > 0).length > 0);
    this.isEnableStateAction = this.items && this.items.filter(d => d.AvailableStateActions.length > 0).length > 0;
  }

  sendToConflict = item => {
    if (item && item.data) {
      const record = item.data;
      this.showCommentDialog(record);
    }
  };

  /* createTransaction = () => {
        const notifyName = {
            NotifyName_BatchOperation_OnBatchMarkered: 'VmsTransactionCreateBatchMark' + new Date().getTime(),
            NotifyName_BatchPreExecution_OnReleased: 'NotifyName_BatchPreExecution_OnReleased' + new Date().getTime()
        };

        this.apiService.onPrivate(notifyName.NotifyName_BatchOperation_OnBatchMarkered, (event, data) => {
            this.commonService.logSuccess('Started processing.');
            this.organizationIdClient = 0;
            this.refreshAll();
        });

        const taskIds = _.chain(this.items)
            .flatMap('WorkflowAvailableActions')
            .filter(['TaskResultId', this.taskResultId])
            .map('WorkflowPendingTaskId')
            .value();

        const commandBody = {
            TaskIdsToBatch: taskIds,
            NotifyName_BatchOperation_OnBatchMarkered: notifyName.NotifyName_BatchOperation_OnBatchMarkered,
            CommandBatchPreExecutionJsonBody: {
                CommandName: this.batchPreExecutionCommandName,
                WorkflowPendingTaskId: -1,
                ToSendNotifyOnPreExecutionNotValidResult: this.toSendNotifyOnPreExecutionNotValidResult,
                NotifyName_BatchPreExecution_OnReleased: notifyName.NotifyName_BatchPreExecution_OnReleased
            },
            CommandBatchThreadExecutionJsonBody: {
                CommandName: this.batchThreadExecutionCommandName,
            },
        };
        if (this.batchPreExecutionManipulationCommandname) {
            Object.assign(commandBody,
            {
                CommandBatchPreExecutionManipulationJsonBody: {
                    CommandName: this.batchPreExecutionManipulationCommandname,
                }
            });
        }
        this.workflowService.workflowBatchOperationOnTasksSelected(commandBody).then(
            (success) => {
                // Whatever you place here will be executed after the batch has been processed (maybe in two hours) and will screw up a user action at the moment.
            },
            (error) => {
                this.validationMessages = error;
            });
    } */

  createTransaction = () => {
    const commandBody = {
      CommandName: this.CommandName,
      EntityIds: this.items.map(id => id.Id)
    };
    this.vmsService.createTransactions(commandBody).then(
      success => {
        this.organizationIdClient = 0;
        this.refreshAll();
        // Whatever you place here will be executed after the batch has been processed (maybe in two hours) and will screw up a user action at the moment.
      },
      error => {
        this.grid.grid.instance.refresh();
        this.validationMessages = error;
      }
    );
  };

  showCommentDialog(record: any) {
    this.phxDialogComponentConfigModel = {
      HeaderTitle: 'Import as Conflict',
      Buttons: [
        { Id: 1, Name: 'Cancel', SortOrder: 1, Class: 'btn-default' },
        {
          Id: 2,
          Name: 'Ok',
          SortOrder: 2,
          CheckValidation: true,
          Class: 'btn-primary',
          ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
            this.callSendToConflict(record, callBackObj.config.ObjectComment.Value).then(
              success => {
                this.refreshAll();
                this.commonService.logSuccess('Record changed status to Conflicted.');
              },
              error => {
                this.refreshAll();
                this.commonService.logError('VMS record is not valid.', error);
              }
            );
          }
        }
      ],
      ObjectComment: { Label: `Enter the note to Import as Conflict:`, HelpBlock: '', Value: record.UserNotes, IsRequared: true, LengthMin: 3, LengthMax: 256 }
    };
    this.phxDialogComponent.open();
  }

  _initTableStateActions(actionId) {
    const self = this;
    self.tableStateActions = [
      {
        // send to conflict
        displayText: 'Send to Conflict', // TODO - replace with actionId
        actionId: actionId,
        skipSecurityCheck: true,
        style: StateActionButtonStyle.WARNING,

        hiddenFn: function(action, componentOption) {
          return false; // !self.isEnableStateAction;
        },

        onClick: function(action, componentOption, actionOption) {
          const id = componentOption.refData ? componentOption.refData.Id : null;
          if (id) {
            const payload = {
              EntityIds: [id]
            };

            // TODO - call command once state action is ready!!
            self.showCommentDialog(componentOption.refData);
          }
        }
      }
    ];
  }

  _initStateActions(actionId) {
    const self = this;
    self.stateActions = [
      {
        // create transaction
        displayText: 'Create Transaction', // TODO - replace with actionId
        skipSecurityCheck: true,
        style: StateActionButtonStyle.PRIMARY,
        actionId: actionId,
        // TODO - remove this logic once state action is ready!! this is old workflow stuff.
        hiddenFn: function(action, componentOption) {
          return false; // !self.isEnableStateAction;
        },
        disabledFn: function(action, componentOption) {
          return !(self.items && self.items.length);
        },
        onClick: function(action, componentOption, actionOption) {
          const itemIds: number[] = self.items.map(row => row.Id);
          if (itemIds.length > 0) {
            const payload = {
              EntityIds: itemIds
            };
            // TODO - call batch command once state action is ready!!
            self.createTransaction();
          }
        }
      }
    ];
  }
}
