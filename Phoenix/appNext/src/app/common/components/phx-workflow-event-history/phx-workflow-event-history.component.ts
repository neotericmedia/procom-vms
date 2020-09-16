import { PhxLocalizationService } from './../../services/phx-localization.service';
import { CodeValueService } from './../../services/code-value.service';
import { Component, OnInit, Input, Output, Inject, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonService, ApiService } from '../../index';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableStateSavingMode } from '../../model/index';
import { PhxDataTableComponent } from '../phx-data-table/phx-data-table.component';
import { PhoenixCommonModuleResourceKeys } from '../../PhoenixCommonModule.resource-keys';
import { WorkflowDataService } from '../../services/workflowData.service';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-phx-workflow-event-history',
  templateUrl: './phx-workflow-event-history.component.html',
  styleUrls: ['./phx-workflow-event-history.component.less']
})
export class PhxWorkflowEventHistoryComponent implements OnInit, OnChanges {
  @Input() entityTypeId: number;
  @Input() entityId: number;
  @Input() approverName: string;
  @Input() funcGetHistoryLength: Function;
  @Input() funcGetLastItem: Function;
  @ViewChild('masterDataTable') masterDataTable: PhxDataTableComponent;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    columnHidingEnabled: true,
    masterDetailTemplateName: 'items',
    enableMasterDetail: true,
    stateSavingMode: PhxDataTableStateSavingMode.None,
    showFilter: false,
    showColumnChooser: false,
    showSearch: false,
    showGrouping: false,
    showTotalCount: false,
    showBorders: false,
    rowAlternationEnabled: false
  });

  detailDataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    columnHidingEnabled: true,
    stateSavingMode: PhxDataTableStateSavingMode.None,
    showFilter: false,
    showColumnChooser: false,
    showSearch: false,
    showGrouping: false,
    showTotalCount: false,
    showBorders: false,
    rowAlternationEnabled: false
  });

  columns: Array<PhxDataTableColumn>;

  detailColumns: Array<PhxDataTableColumn>;

  CodeValueGroups: any;
  ApplicationConstants: any;
  workflowItems: any[];
  workflowCount: number = 0;
  viewLoading: boolean = true;
  loadItemsPromise: any;
  unique: number;

  constructor(
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private workflowService: WorkflowService,
    private workflowDataService: WorkflowDataService,
    private localizationService: PhxLocalizationService
  ) {
    this.CodeValueGroups = this.commonService.CodeValueGroups;
    this.ApplicationConstants = this.commonService.ApplicationConstants;
    this.unique = Math.floor(Math.random() * 1000000);
  }

  buildColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'action',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.actionColumnHeader),
        width: 200
      }),
      new PhxDataTableColumn({
        dataField: 'started',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.startedColumnHeader),
        dataType: 'date',
        cellTemplate: 'dateCellTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'completed',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.completedColumnHeader),
        dataType: 'date',
        cellTemplate: 'dateCellTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'approver',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.approverColumnHeader)
      })
    ];

    this.detailColumns = [
      new PhxDataTableColumn({
        dataField: 'TaskTemplateDisplayHistoryEventName',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.taskColumnHeader)
      }),
      new PhxDataTableColumn({
        dataField: 'CreatedDatetime',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.assignedOnColumnHeader),
        dataType: 'date',
        cellTemplate: 'dateCellTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'LastModifiedDatetime',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.completedOnColumnHeader),
        dataType: 'date',
        cellTemplate: 'dateCellTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'LastModifiedByContactName',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.completedByColumnHeader)
      }),
      new PhxDataTableColumn({
        dataField: 'Comment',
        caption: this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxWorkflowEventHistory.notesColumnHeader)
      })
    ];
  }

  spliceItemsByAt(items) {
    return items;
  }

  splitUserActions(items: Array<any>) {
    const result = [];
    let temp = [];
    let k = 0;
    for (let i = 0; i < items.length; i++) {
      items[i].TaskResultName = this.codeValueService.getCodeValueText(items[i].TaskRoutingTaskResultId, this.CodeValueGroups.TaskResult);
      items[i].isLastInGroup = false;
      items[i].isFirstInGroup = false;
      if (items[i].TaskTemplateDisplayHistoryEventName === 'System Review') {
        items[i].LastModifiedByContactName = this.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.system);
      }
      if (!items[i].TaskRoutingTaskResultId) {
        items[i].LastModifiedDatetime = null;
        items[i].LastModifiedByContactName = null;
      }
      const idx = items[i].TaskTemplateDisplayHistoryEventName.indexOf('@');
      if (idx === 0) {
        const name = items[i].TaskTemplateDisplayHistoryEventName.substring(1);
        items[i].WorkflowTemplateName = items[i].TaskTemplateDisplayHistoryEventName = name;
        items[i].isFirstInGroup = true;
        items[i - 1].isLastInGroup = true;
        result[k] = temp;
        k++;
        temp = [];
      }
      temp.push(items[i]);
    }

    if (temp.length > 0) {
      result[k] = temp;
    }
    return result;
  }

  splitUserActionsForTimeSheet(items: Array<any>) {
    items = items.filter(x => !(x.TaskTemplateId === 20105 && !x.TaskRoutingTaskResultId)); // Don't show system pending task for ReverseTransaction without result

    const result = [];
    const temp = [];

    const reversalCommands: Array<String> = ['ChangeTimeSheetStatusToUnsubmitted', 'SendTimeSheetToBackOfficeReview']; // TODO: application constants?

    for (let k = 0; k < items.length; k++) {
      items[k].TaskResultName = this.codeValueService.getCodeValueText(items[k].TaskRoutingTaskResultId, this.CodeValueGroups.TaskResult);
      items[k].AssignedOnContactName = null;
      // TODO: comment out due to deleted TaskRoutings from new workflow, and how to handle AssignedOnContactName? (always null)
      /* if (!items[k].TaskRoutingTaskResultId) {
         items[k].LastModifiedDatetime = null;
         items[k].LastModifiedByContactName = null;
         items[k].AssignedOnContactName = (items[k].TaskTemplateDisplayHistoryEventName != "Timesheet Review") ? items[k].AssignedOnContactName : this.approverName;
       }
       else {
         items[k].AssignedOnContactName = null;
       }*/

      // Skip duplicate timesheet post-completion action history
      if (reversalCommands.find(x => x === items[k].TaskTemplateCommandName)) {
        const prev = items[k - 1];
        if (prev && prev.PreviousTaskTemplateCommandName === 'WorkflowExecuteUserTask') {
          continue;
        }
      }

      temp.push(items[k]);
    }
    result[0] = temp;
    return result;
  }

  workflowHistoryModelBuilder(items) {
    this.workflowCount = items.length;

    const eachCurrentItem = item => {
      const taskName = item.TaskTemplateDisplayHistoryEventName;
      item.CreatedDatetime = item.CreatedDatetime;
      item.LastModifiedDatetime = item.LastModifiedDatetime;
      item.Comment = (<Array<any>>item.TaskComments)
        .filter((taskComment: any) => taskComment.SystemCommentId || (taskComment.Comment && taskComment.Comment.length > 0))
        .map((taskComment: any) => {
          return this.localizationService.translate(taskComment.Comment);
        })
        .join(', ');
    };

    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i];
      if (currentItem && currentItem !== [] && currentItem.length > 0) {
        _.each(currentItem, eachCurrentItem);
        const len = currentItem.length - 1;
        const approver = this.entityTypeId === this.ApplicationConstants.EntityType.TimeSheet ? this.approverName : currentItem[len].LastModifiedByContactName;
        this.workflowItems[i] = {
          action: currentItem[0].WorkflowTemplateName,
          started: currentItem[0].CreatedDatetime,
          completed: currentItem[len].LastModifiedDatetime,
          approver: approver ? approver : '-',
          task: currentItem[len].TaskResultName ? '-' : currentItem[len].TaskTemplateDisplayHistoryEventName,
          status: this.codeValueService.getCodeValueText(currentItem[len].TaskStatusId, this.CodeValueGroups.TaskResult),
          items: currentItem
        };

        if (
          this.workflowItems[i].approver === null ||
          (currentItem[0].isFirstInGroup === true && currentItem.length === 1 && currentItem[0].isLastInGroup === false) ||
          (this.entityTypeId === this.ApplicationConstants.EntityType.TimeSheet && currentItem[len].TaskTemplateCommandName !== 'TriggerTimeSheetTransactionFlow')
        ) {
          this.workflowItems[i].completed = null;
        }

        if (
          this.workflowItems[i].approver === null ||
          currentItem[len].isLastInGroup === true ||
          currentItem[len].TaskTemplateDisplayHistoryEventName === 'Approved' ||
          (this.entityTypeId === this.ApplicationConstants.EntityType.Organization && currentItem[len].TaskTemplateCommandName === 'OrganizationChangeStatusFromPendingReviewToActive') ||
          (this.entityTypeId === this.ApplicationConstants.EntityType.UserProfile && currentItem[len].TaskTemplateCommandName === 'UserProfileApproval')
        ) {
          this.workflowItems[i].approver = '-';
        }
      }
    }

    if (typeof this.funcGetLastItem === 'function') {
      const resultingFunction = this.funcGetLastItem();
      if (typeof resultingFunction !== 'undefined') {
        const item = this.workflowItems && this.workflowItems.length ? this.workflowItems[Math.max(items.length - 1, 0)] : null;
        resultingFunction(item);
      }
    }

    if (typeof this.funcGetHistoryLength === 'function') {
      this.funcGetHistoryLength(this.workflowCount);
    }
  }

  getHistory() {
    this.workflowCount = 0;
    this.workflowItems = [];
    if (this.entityTypeId === this.ApplicationConstants.EntityType.WorkOrder) {
      const workflowHistoryModel = this.workflowDataService.getWorkflowHistoryModel(this.entityTypeId);
      if (_.isEmpty(workflowHistoryModel) || workflowHistoryModel.entityId !== this.entityId) {
        this.loadItemsPromise = this.workflowService.getWorkflowEventsHistory(this.entityTypeId, this.entityId).then((response: any) => {
          const Items = this.splitUserActions(response.Items);
          this.workflowDataService.setWorkflowHistoryModel(this.entityTypeId, { entityId: this.entityId, data: Items });
          if (response.Items.length > 0) {
            this.workflowHistoryModelBuilder(Items);
          }
          this.loadItemsPromise = null;
          this.masterDataTable.refresh();
        });
      } else {
        this.workflowHistoryModelBuilder(workflowHistoryModel.data);
        this.viewLoading = false;
      }
    } else {
      this.loadItemsPromise = this.workflowService.getWorkflowEventsHistory(this.entityTypeId, this.entityId).then((response: any) => {
        let Items;

        if (this.entityTypeId === this.ApplicationConstants.EntityType.TimeSheet) {
          Items = this.splitUserActionsForTimeSheet(response.Items || []);
        } else {
          response.Items = this.spliceItemsByAt(response.Items);
          Items = this.splitUserActions(response.Items || []);
        }

        this.workflowHistoryModelBuilder(Items);
        this.loadItemsPromise = null;

        this.masterDataTable.refresh();
      });
    }
  }

  ngOnInit() {
    this.buildColumns();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getHistory();
  }

  public reload() {
    this.getHistory();
  }
}
