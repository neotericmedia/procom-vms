import { AvailableStateActions } from './../model/available-state-actions';
import { DialogService } from './dialog.service';
import { CommonService } from './common.service';
import { BatchCommand } from './../model/batch-command';
import { WorkflowAction } from './../model/workflow-action';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonDataService } from './commonData.service';
import { StateHistoryVersionHeader } from '../model';

@Injectable()
export class WorkflowService {
  constructor(private apiService: ApiService, private commonDataService: CommonDataService, private commonService: CommonService, private dialogService: DialogService) {}

  getAvailableActions(entityTypeId: number, entityId: number, showLoader: boolean = true): Promise<Array<WorkflowAction>> {
    const query = `task/getTasksAvailableActionsByTargetEntity/targetEntityTypeId/${entityTypeId}/targetEntityId/${entityId}`;

    return new Promise((resolve, reject) => {
      this.apiService
        .query(query, showLoader)
        .then((result: any) => {
          if (result && result.Items && result.Items.length > 0 && result.Items[0].WorkflowAvailableActions) {
            resolve(<Array<WorkflowAction>>result.Items[0].WorkflowAvailableActions.sort((a, b) => b.DisplayButtonOrder - a.DisplayButtonOrder));
          } else {
            resolve(<Array<WorkflowAction>>[]);
          }
        })
        .catch(err => reject(err));
    });
  }

  getAvailableActionsObservable(entityTypeId: number, entityId: number, showLoader: boolean = true): Observable<Array<WorkflowAction>> {
    const query = `task/getTasksAvailableActionsByTargetEntity/targetEntityTypeId/${entityTypeId}/targetEntityId/${entityId}`;
    return Observable.create(observer => {
      this.apiService
        .query(query, showLoader)
        .then((result: any) => {
          if (result && result.Items && result.Items.length > 0 && result.Items[0].WorkflowAvailableActions) {
            observer.next(<Array<WorkflowAction>>result.Items[0].WorkflowAvailableActions.sort((a, b) => b.DisplayButtonOrder - a.DisplayButtonOrder));
            observer.complete();
          } else {
            observer.next(<Array<WorkflowAction>>[]);
            observer.complete();
          }
        })
        .catch(err => {
          observer.next(<Array<WorkflowAction>>[]);
          observer.complete();
        });
    });
  }

  // public setWatchConfigOnWorkflowEventAndRedirect(
  //   stateToGo: string = '/next/',
  //   stateIncludesFilter: string = '/next/',
  //   groupingEntityTypeId: number,
  //   targetEntityTypeId: number,
  //   targetEntityId: number,
  //   stateParams: any = {}
  // ) {
  //   this.commonDataService.setWatchConfigOnWorkflowEvent(
  //     stateToGo,
  //     stateIncludesFilter,
  //     groupingEntityTypeId,
  //     targetEntityTypeId,
  //     targetEntityId,
  //     stateParams);
  // }

  hasWorkflowAction(actions: WorkflowAction[], commandName: string) {
    if (actions) {
      return actions.find(a => a.CommandName === commandName);
    }
    return false;
  }

  getAvailableStateActions(EntityTypeId: number, EntityId: number, showLoader: boolean = true): Promise<Array<AvailableStateActions>> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.apiService.query(`state/getAvailableStateActions/EntityTypeId/${EntityTypeId}/EntityId/${EntityId}`, showLoader).then(
        (responseSuccess: any) => {
          resolve(responseSuccess.Items);
        },
        (responseError: any) => {
          reject(responseError);
        }
      );
    });
  }

  getStateHistory(EntityTypeId: number, EntityId: number, showLoader: boolean = true): Promise<Array<StateHistoryVersionHeader>> {
    return this.apiService.query(`state/getStateHistory/EntityTypeId/${EntityTypeId}/EntityId/${EntityId}`, showLoader).then((res: any) => (res ? res.Items : []));
  }

  getPreferredEntityStatusId(EntityTypeId: number, statusId: number): number {
    const preferredEntityStatus = (<any>window).PhxPreferredEntityStatus;
    const nextStatus = preferredEntityStatus ? preferredEntityStatus.find(x => x.EntityTypeId === EntityTypeId && x.FromStatusId === statusId) : null;
    return nextStatus ? nextStatus.ToStatusId : null;
  }

  getPreferredEntityStatusIdPath(EntityTypeId: number, statusId: number): Array<number> {
    const path = [];
    while (statusId) {
      statusId = this.getPreferredEntityStatusId(EntityTypeId, statusId);
      if (statusId) {
        if (path.some(x => x === statusId)) {
          break;  // prevent infinite loop
        }
        path.push(statusId);
      }
    }
    return path;
  }

  /*
   BELOW ARE MOVED FROM workflowApi.service.ts
   */

  public setWatchConfigOnWorkflowEvent(stateIncludesFilter: string = '/next/', groupingEntityTypeId: number, targetEntityTypeId: number, targetEntityId: number) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.commonDataService.setWatchConfigOnWorkflowEvent('Notemptyrandomstring', stateIncludesFilter, groupingEntityTypeId, targetEntityTypeId, targetEntityId, null, resolve);
    });
  }

  workflowBatchOperationOnTasksSelected(command: BatchCommand) {
    //if (typeof command.WorkflowPendingTaskId === 'undefined' || command.WorkflowPendingTaskId === null) {
    //    jQuery.extend(command, { WorkflowPendingTaskId: -1 });
    //}

    if (typeof command.CommandBatchPreExecutionJsonBody !== 'string') {
      command.CommandBatchPreExecutionJsonBody = JSON.stringify(command.CommandBatchPreExecutionJsonBody);
    }

    if (command.CommandBatchPreExecutionManipulationJsonBody && typeof command.CommandBatchPreExecutionManipulationJsonBody !== 'string') {
      command.CommandBatchPreExecutionManipulationJsonBody = JSON.stringify(command.CommandBatchPreExecutionManipulationJsonBody);
    }

    if (typeof command.CommandBatchThreadExecutionJsonBody !== 'string') {
      command.CommandBatchThreadExecutionJsonBody = JSON.stringify(command.CommandBatchThreadExecutionJsonBody);
    }
    return this.apiService.command('WorkflowBatchOperationOnTasksSelected', command);
  }

  getWorkflowEventsHistory(entityTypeId: number, entityId: number) {
    return this.apiService.query(`task/getWorkflowEventsHistory/entityType/${entityTypeId}/entity/${entityId}`);
  }

  executeAction(action: any, entityTypeId, entityId) {
    const self = this;
    if (action.TaskRoutingDialogTypeId === this.commonService.ApplicationConstants.TaskRoutingDialogType.Decline) {
      const dlg = /*(action.TaskResultId === this.commonService.ApplicationConstants.TaskResult.Decline ||
            action.TaskResultId === this.commonService.ApplicationConstants.TaskResult.ComplianceDocumentRuleActionApprovalDecline ||
            action.TaskResultId === this.commonService.ApplicationConstants.TaskResult.DeclineTimeSheet)
            ? this.dialogService.comment('Decline', 'Reason for declining must be entered', 'Enter the decline reason:',
                action.TaskResultId === this.commonService.ApplicationConstants.TaskResult.ComplianceDocumentRuleActionApprovalDecline ? 4000 : 32000,
                'Decline')
            :*/ this.dialogService.comment();

      dlg
        .then(function(comments) {
          if (typeof action.startLoading === 'function') {
            action.startLoading();
          }
          action.Comments = comments;
          self.actionToCommand(action, entityTypeId, entityId);
        })
        .catch(function() {
          action.Comments = '';
          const watchConfigOnWorkflowEvent = this.commonDataService.getWatchConfigOnWorkflowEvent();
          if (watchConfigOnWorkflowEvent !== null && typeof watchConfigOnWorkflowEvent.stateNameGo === 'string' && watchConfigOnWorkflowEvent.stateNameGo.length > 0 && watchConfigOnWorkflowEvent.stateParamMapping !== null) {
            this.transitionTo(watchConfigOnWorkflowEvent.stateNameGo, watchConfigOnWorkflowEvent.stateParamMapping, { reload: true, inherit: true, notify: true });
          }
        });
    } else {
      if (typeof action.startLoading === 'function') {
        action.startLoading();
      }
      return new Promise((resolve, reject) => {
        self.actionToCommand(action, entityTypeId, entityId).then(
          responseSucces => {
            resolve(responseSucces);
          },
          responseError => {
            reject(responseError);
          }
        );
      });
    }
  }

  actionToCommand(action: any, entityTypeId, entityId) {
    const self = this;
    if (typeof entityTypeId !== 'undefined' && entityTypeId > 0 && typeof entityId !== 'undefined' && entityId > 0) {
      let command: any = {};
      if (entityTypeId === this.commonService.ApplicationConstants.EntityType.Organization) {
        command = {
          CommandName: action.CommandName,
          OrganizationId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.WorkOrderVersion) {
        command = {
          CommandName: action.CommandName,
          WorkOrderVersionId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.TimeSheet) {
        command = {
          CommandName: action.CommandName,
          TimeSheetId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.Payment) {
        command = {
          CommandName: action.CommandName,
          PaymentId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.PaymentReleaseBatch) {
        command = {
          CommandName: action.CommandName,
          PaymentReleaseBatchId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.AccessSubscription) {
        command = {
          CommandName: action.CommandName,
          AccessSubscriptionId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.ComplianceDocumentRule) {
        command = {
          CommandName: action.CommandName,
          ComplianceDocumentRuleId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.ComplianceDocument) {
        command = {
          CommandName: action.CommandName,
          ComplianceDocumentId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.VmsDocument) {
        command = {
          CommandName: action.CommandName,
          VmsDocumentId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      } else {
        alert('Developer notification: Update required FROM "WorkflowService.executeAction(action);" TO "WorkflowService.executeAction(action, entityTypeId, entityId);"');

        command = {
          CommandName: action.CommandName,
          EntityTypeId: entityTypeId,
          EntityId: entityId,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId
        };
      }

      if (typeof action.Comments !== 'undefined' && action.Comments !== null) {
        command.Comments = action.Comments;
      }

      return new Promise((resolve, reject) => {
        this.apiService.command(command).then(
          responseSucces => {
            resolve(responseSucces);
            self.completeActionSuccessDialog(action, entityId);
            if (typeof action.stopLoading === 'function') {
              action.stopLoading();
            }
          },
          responseError => {
            reject(responseError);
            if (typeof action.stopLoading === 'function') {
              action.stopLoading();
            }
          }
        );
      });
    } else {
      return new Promise((resolve, reject) => {
        this.apiService.command(action.PendingCommandName, action).then(
          responseSucces => {
            resolve(responseSucces);
            self.completeActionSuccessDialog(action, entityTypeId);
            if (typeof action.stopLoading === 'function') {
              action.stopLoading();
            }
          },
          responseError => {
            reject(responseError);
            if (typeof action.stopLoading === 'function') {
              action.stopLoading();
            }
          }
        );
      });
    }
  }

  completeActionSuccessDialog(action: any, entityTypeId: number) {
    // custom success messages per entity
    // if (entityTypeId === this.commonService.ApplicationConstants.EntityType.TimeSheet) {
    //     switch (action.TaskResultId) {
    //         case this.commonService.ApplicationConstants.TaskRoutingDialogType.Decline
    //             this.commonService.logSuccess('Timesheet Declined');
    //             break;
    //         case this.commonService.ApplicationConstants.TaskResult.Approve:
    //             this.commonService.logSuccess('Timesheet Approved Successfully');
    //             break;
    //         default:
    //             this.commonService.logSuccess('Request processed');
    //     }
    // } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.WorkOrderVersion) {
    //     switch (action.TaskResultId) {
    //         case this.commonService.ApplicationConstants.TaskResult.Decline:
    //             this.commonService.logSuccess('WorkOrder Declined');
    //             break;
    //         case this.commonService.ApplicationConstants.TaskResult.Approve:
    //             this.commonService.logSuccess('WorkOrder Approved Successfully');
    //             break;
    //         default:
    //             this.commonService.logSuccess('Request processed');
    //     }
    // } else {
    this.commonService.logSuccess('Request processed');
    // }
  }
}
