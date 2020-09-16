import { StateAction } from './../../common/model/state-action';
import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import {
  PhxDialogComponentConfigModel,
  PhxDialogComponentEventEmitterInterface,
} from '../../common/components/phx-dialog/phx-dialog.component.model';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { PhxConstants, ApiService, CommonService } from '../../common/index';
import { WorkflowAction } from '../../common/model/index';
import { forEach, values } from 'lodash';
import { ICommissionRateValidationError, ICommissionRate, ICommissionRateVersion } from '../state/commission-rate.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { CommissionRateAction } from '../state/commission-rate.action';

@Component({
  selector: 'app-commission-rate-workflow',
  templateUrl: './commission-rate-workflow.component.html',
  styleUrls: ['./commission-rate-workflow.component.less']
})
export class CommissionRateWorkflowComponent extends BaseComponentActionContainer {

  @ViewChild(PhxDialogComponent)
  phxDialogComponent: PhxDialogComponent;
  private validationMessages: Array<ICommissionRateValidationError> = [];
  customStatusId: number;
  WorkFlowPendingTaskId: number;
  filteredVersionDetails: Array<ICommissionRateVersion> = [];
  private modelvalMessages: Array<any> = [];
  public phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
  @Output() commandValidation = new EventEmitter<any>();
  constructor(private commonService: CommonService, private apiService: ApiService,
    private router: Router, private activatedRoute: ActivatedRoute,
  ) {
    super();
  }

  public workflowActionOnClick(action: StateAction, commissionRate: ICommissionRate, commissionversionId: number) {
    this.filteredVersionDetails = commissionRate.CommissionRateVersions.filter(item => item.Id === +commissionversionId);
    const mapCommission = {
      [PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionCorrect]: () => {
        // this.WorkFlowPendingTaskId = action.WorkflowPendingTaskId;
        this.customStatusId = PhxConstants.commissionCustomStatusType.ToCorrect;
        this.filteredVersionDetails[0].customStatusId = this.customStatusId;
        this.filteredVersionDetails[0].WorkflowPendingTaskId = this.WorkFlowPendingTaskId;
        commissionRate.CommissionRateVersions.map(obj => this.filteredVersionDetails.find(o => o.Id === obj.Id) || obj);
        this.stateService.dispatchOnAction(
          new CommissionRateAction.CommissionRateUpdate(+commissionversionId, {
            ...commissionRate
          })
        );
      },
      [PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionScheduleChange]: () => {
        // this.WorkFlowPendingTaskId = action.WorkflowPendingTaskId;
        this.customStatusId = PhxConstants.commissionCustomStatusType.ToScheduleChange;
        this.filteredVersionDetails[0].customStatusId = this.customStatusId;
        this.filteredVersionDetails[0].WorkflowPendingTaskId = this.WorkFlowPendingTaskId;
        this.filteredVersionDetails[0].EffectiveDate = null;
        commissionRate.CommissionRateVersions.map(obj => this.filteredVersionDetails.find(o => o.Id === obj.Id) || obj);
        this.stateService.dispatchOnAction(
          new CommissionRateAction.CommissionRateUpdate(+commissionversionId, {
            ...commissionRate
          })
        );
      },
      [PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionManageRestrictions]: () => {
        // this.WorkFlowPendingTaskId = action.WorkflowPendingTaskId;
        this.customStatusId = PhxConstants.commissionCustomStatusType.ToManageRestrictions;
        this.filteredVersionDetails[0].customStatusId = this.customStatusId;
        this.filteredVersionDetails[0].WorkflowPendingTaskId = this.WorkFlowPendingTaskId;
        commissionRate.CommissionRateVersions.map(obj => this.filteredVersionDetails.find(o => o.Id === obj.Id) || obj);
        this.stateService.dispatchOnAction(
          new CommissionRateAction.CommissionRateUpdate(+commissionversionId, {
            ...commissionRate
          })
        );
      },
      [PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionDelete]: () => {
        // this.WorkFlowPendingTaskId = action.WorkflowPendingTaskId;
        this.filteredVersionDetails[0].WorkflowPendingTaskId = this.WorkFlowPendingTaskId;
        this.customButtonOnClick(this.filteredVersionDetails[0], action.commandName, commissionRate);
      },
    };
    mapCommission[action.commandName]();
  }

  customButtonOnClick(version, action, commissionRate: ICommissionRate, actionCustomId?: number) {
    if (action === 'NewCreate') {
      this.actionExecute(commissionRate, version, 'Create', 'CommissionRateHeaderNew', 'Created Successfully', {
        WorkflowPendingTaskId: -1,
        CommandName: 'CommissionRateHeaderNew',
        CommissionUserProfileId: commissionRate.CommissionUserProfileId,
        CommissionRateTypeId: commissionRate.CommissionRateTypeId,
        CommissionRoleId: commissionRate.CommissionRoleId,
        CommissionRateHeaderStatusId: commissionRate.CommissionRateHeaderStatusId,
        Description: commissionRate.Description,
        CommissionRateVersion: version,
        CommissionRateRestrictions: commissionRate.CommissionRateRestrictions,
      });
    } else if (action === 'NewCancel') {
      this.router.navigate(['/next/commission/search']);
    } else if (action === 'ToCorrect') {
      this.actionExecute(commissionRate, version, 'Submit', PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionCorrect, 'Commission Rate Version Corrected');
    } else if (action === 'ToScheduleChange') {
      this.actionExecute(commissionRate, version, 'Schedule Change', PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionScheduleChange, 'Commission Rate Version Schedule Changed');
    } else if (action === 'ToManageRestrictions') {
      this.actionExecute(commissionRate, version, 'Submit', PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionManageRestrictions, 'Restriction Managed');
    } else if (action === PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionDelete) {
      this.actionExecute(commissionRate, version, 'Delete', PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateVersionDelete, 'Commission Deleted');
    } else if (action === PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateHeaderDeactivate) {
      this.actionExecute(commissionRate, version, 'Deactivate', PhxConstants.CommissionRateVersionStateActionCommand.CommissionRateHeaderDeactivate, 'Commission Deactivated');
    } else if (action === 'Cancel') {
      if (version.customStatusId) {
        version.customStatusId = 0;
      }
      this.stateService.dispatchOnAction(
        new CommissionRateAction.CommissionRateDelete(+version.Id)
      );
      const navigateTo = (commissionRateHeaderId: number, commissionRateVersionId: number, tabNavigationName: PhxConstants.CommissionRateNavigationName) => {
        const navigatePath = `/next/commission/rate/${commissionRateHeaderId}/${commissionRateVersionId}/${tabNavigationName}`;
        this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
          console.error(`app-organization: error navigating to ${commissionRateHeaderId} , ${commissionRateVersionId}, ${tabNavigationName}`, err);
        });
      };
      // fix me
      // this.$state.reload();
      navigateTo(commissionRate.Id, version.Id, PhxConstants.CommissionRateNavigationName.detail);
    }
  }

  actionExecute(commissionRate: ICommissionRate, version, actionName, actionCommandName, messageOnSuccessResponse: string, actionCommandBody?: any) {
    this.phxDialogComponentConfigModel = {
      HeaderTitle: 'Commission Rate Action',
      BodyMessage: 'Are you sure you want to ' + actionName + ' this Commission Rate?',
      Buttons: [
        {
          Id: 1,
          SortOrder: 1,
          CheckValidation: true,
          Name: 'Yes',
          Class: 'btn-primary',
          ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
            this.executeCommand(commissionRate, version, actionName, actionCommandName, messageOnSuccessResponse, actionCommandBody);
          }
        },
        { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
      ],
      ObjectDate: null,
      ObjectComment: null
    };
    this.phxDialogComponent.open();
  }

  executeCommand(commissionRate: ICommissionRate, version, actionName, actionCommandName, messageOnSuccessResponse: string, actionCommandBody?: any) {
    actionCommandBody = actionCommandBody || {
      WorkflowPendingTaskId: (actionCommandName === 'CommissionRateHeaderNew') ? -1 : this.WorkFlowPendingTaskId,
      CommandName: actionCommandName,
      Id: commissionRate.Id.toString(),
      EntityIds: [commissionRate.Id],
      CommissionRateVersion: version,
      Description: commissionRate.Description,
      CommissionRateRestrictions: commissionRate.CommissionRateRestrictions
    };

    const p = new Promise((resolve, reject) => {
      this.apiService
        .command(actionCommandName.toString(), actionCommandBody)
        .then(responseSuccessOnExecuteCommand => {
          this.modelvalMessages = [];
          this.commandValidation.emit(this.modelvalMessages);
          const navigateToDetailPage = (commissionRateHeaderId: number, commissionRateVersionId: number, tabNavigationName: PhxConstants.CommissionRateNavigationName) => {
            const navigatePath = `/next/commission/rate/${commissionRateHeaderId}/${commissionRateVersionId}/${tabNavigationName}`;
            this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
              console.error(`app-organization: error navigating to ${commissionRateHeaderId} , ${commissionRateVersionId}, ${tabNavigationName}`, err);
            });
          };
          const navigateToSearch = (commissionUserProfileId: number, commissionRateVersionId: number, tabNavigationName: PhxConstants.CommissionRateNavigationName) => {
            const navigatePath = `/next/commission/rates-search/${commissionUserProfileId}`;
            this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
              console.error(`app-organization: error navigating to /next/commission/search`, err);
            });
          };
          if (version.Id) {
            this.stateService.dispatchOnAction(new CommissionRateAction.CommissionRateDelete(version.Id));
          }
          if (responseSuccessOnExecuteCommand.TaskResultId === PhxConstants.TaskResult.CommissionRateDuplicateFound) {
            this.phxDialogComponentConfigModel = {
              HeaderTitle: 'Duplicate Commission Rate Found',
              BodyMessage: 'Duplicate Commission Rate Found, A different commission rate with the same settings and restrictions already exists for this person. Are you sure you want to ' + actionName + ' this Commission Rate?',
              Buttons: [
                {
                  Id: 1,
                  SortOrder: 1,
                  CheckValidation: true,
                  Name: 'Yes',
                  Class: 'btn-primary',
                  ClickEvent: () => {
                    actionCommandBody.ForceCreation = true;
                    this.executeCommand(commissionRate, version, actionName, actionCommandName, messageOnSuccessResponse, actionCommandBody);
                  }
                },
                { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
              ],
              ObjectDate: null,
              ObjectComment: null
            };
            this.phxDialogComponent.open();
          } else {
            if (!responseSuccessOnExecuteCommand.IsValid) {
              reject(responseSuccessOnExecuteCommand.ValidationMessages);
              return;
            }

            if (actionCommandName === 'CommissionRateHeaderDelete') {
              if (messageOnSuccessResponse !== null && messageOnSuccessResponse.length > 0) {
                this.commonService.logSuccess(messageOnSuccessResponse);
                navigateToSearch(commissionRate.CommissionUserProfileId, responseSuccessOnExecuteCommand.EntityId, PhxConstants.CommissionRateNavigationName.detail);
              }
            } else if (actionCommandName === 'CommissionRateHeaderNew') {
              this.apiService.query('Commission/getCommissionRateHeaderByCommissionRateVersionId/' + responseSuccessOnExecuteCommand.EntityId).then((result: any) => {
                navigateToDetailPage(result.Id, responseSuccessOnExecuteCommand.EntityId, PhxConstants.CommissionRateNavigationName.detail);
              });
            } else if (actionCommandName === 'CommissionRateHeaderDeactivate') {
              if (messageOnSuccessResponse !== null && messageOnSuccessResponse.length > 0) {
                this.commonService.logSuccess(messageOnSuccessResponse);
                navigateToDetailPage(commissionRate.Id, version.Id, PhxConstants.CommissionRateNavigationName.detail);
              }
            } else {
              if (messageOnSuccessResponse !== null && messageOnSuccessResponse.length > 0) {
                this.commonService.logSuccess(messageOnSuccessResponse);
                navigateToDetailPage(commissionRate.Id, responseSuccessOnExecuteCommand.EntityId, PhxConstants.CommissionRateNavigationName.detail);
              }
            }
          }
        })
        .catch(responseExceptionOnExecuteCommand => {
          console.error(actionCommandName, actionCommandBody, responseExceptionOnExecuteCommand);
          this.validationMessages = responseExceptionOnExecuteCommand;
          this.parseValidationMessages(actionCommandBody.CommissionRateVersion.Id);
          reject(responseExceptionOnExecuteCommand);
        });
    });
  }

  private parseValidationMessages(versionId: number) {
    this.modelvalMessages = [];
    let checkInvalid = true;
    if (this.validationMessages) {
      Object.keys(this.validationMessages).forEach(item => {
        if (item === 'ValidationMessages' && Object.keys(this.validationMessages[item]).length) {
          checkInvalid = false;
          const val = values(this.validationMessages['ValidationMessages']);
          forEach(val, value => {
            this.modelvalMessages.push(value.Message);
          });
        }
        if (checkInvalid) {
          if (item === 'ModelState' && Object.keys(this.validationMessages[item]).length) {
            const val = values(this.validationMessages['ModelState']);
            forEach(val, value => {
              for (let index = 0; index < value.length; index++) {
                const msg = value[index];
                this.modelvalMessages.push(msg);
              }
            });
          }
        }
      });
      if (this.modelvalMessages.length > 0) {
        this.commonService.logError('Your Submission has ' + this.modelvalMessages.length + ' validation message(s)');
        this.commandValidation.emit(this.modelvalMessages);
      }
      this.stateService.dispatchOnAction(new CommissionRateAction.CommissionRateValidationErrorAdd(versionId, this.validationMessages));
    } else {
      this.stateService.dispatchOnAction(new CommissionRateAction.CommissionRateValidationErrorDelete(versionId));
    }
  }

}
