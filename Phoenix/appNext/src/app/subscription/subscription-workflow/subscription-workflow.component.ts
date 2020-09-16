import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { UserProfile, WorkflowAction, PhxConstants } from '../../common/model';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { ISubscriptionValidationError, ISubscription, SubscriptionAction } from '../state';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface, PhxDialogComponentConfigModelDate, PhxDialogComponentConfigModelComment, PhxDialogComponentConfigModelDropdown } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { CommonService, ApiService, WorkflowService } from '../../common';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-subscription-workflow',
  templateUrl: './subscription-workflow.component.html',
  styleUrls: ['./subscription-workflow.component.less']
})
export class SubscriptionWorkflowComponent extends BaseComponentActionContainer {
  static currentProfile: UserProfile;
  @ViewChild(PhxDialogComponent)
  phxDialogComponent: PhxDialogComponent;

  private validationMessages: Array<ISubscriptionValidationError>;
  public phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
  constructor(private commonService: CommonService, private apiService: ApiService,
    private workflowService: WorkflowService, private router: Router, private activatedRoute: ActivatedRoute) {
    super();
  }

  public onClickWorkflowAction(action: WorkflowAction, Subscription: ISubscription) {
    // debugger;
    const subscription = { ...Subscription };
    // delete workorder.RootObject;
    // delete workorder.readOnlyStorage;
    delete subscription.WorkflowAvailableActions;
    const map = {
      [PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionDiscard]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Discard Subscription',
          BodyMessage: 'Do you want to discard changes to this Subscription?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 1,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(subscription, action.CommandName, action.WorkflowPendingTaskId, callBackObj.config, null);
              }
            },
            { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionApprovalDecline]: () => {
        this.commandExecuteByApi(Subscription, action.CommandName, action.WorkflowPendingTaskId, 'Request Processed', null, action.Comments);

      },

      [PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionSave]: () => {
        this.commandExecuteByApi(Subscription, action.CommandName, action.WorkflowPendingTaskId, 'Subscription Saved', null, null);
      },

      [PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionSubmit]: () => {
        this.commandExecuteByApi(Subscription, action.CommandName, action.WorkflowPendingTaskId, 'Subscription submitted successfully.', null, null);
      },

      [PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionOriginalCorrect]: () => {
        this.commandExecuteByApi(Subscription, action.CommandName, action.WorkflowPendingTaskId, 'Request Processed', null, null);
      },

      [PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionApprovalRecall]: () => {
        this.commandExecuteByApi(Subscription, action.CommandName, action.WorkflowPendingTaskId, 'Request Processed', null, null);
      },

      [PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionApprovalApprove]: () => {
        this.commandExecuteByApi(Subscription, action.CommandName, action.WorkflowPendingTaskId, 'Request Processed', null, null);
      },
    };
    map[action.CommandName]();
  }

  private commandExecuteByDialog(Subscription: ISubscription, commandName: PhxConstants.CommandNamesSupportedByUi, workflowPendingTaskId: number, model: PhxDialogComponentConfigModel, messageOnSuccessResponse?: string) {
    this.phxDialogComponent.close();
    this.commandExecuteByApi(Subscription, commandName, workflowPendingTaskId, messageOnSuccessResponse, model.ObjectDate, null);
  }

  private commandExecuteByApi(
    Subscription: ISubscription,
    commandName: PhxConstants.CommandNamesSupportedByUi,
    workflowPendingTaskId: number,
    messageOnSuccessResponse?: string,
    phxDialogComponentConfigModelDate?: PhxDialogComponentConfigModelDate,
    phxDialogComponentConfigModelComment?: string
  ) {
    this.phxDialogComponent.close();
    this.validationMessages = null;
    const subscriptionId = Subscription.Id;
    let commandBody: any = null;
    if (
      commandName === PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionApprovalDecline) {
      commandBody = {
        AccessSubscriptionId: subscriptionId,
        WorkflowPendingTaskId: workflowPendingTaskId,
        Comments: phxDialogComponentConfigModelComment
      };
    } else if (
      commandName === PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionDiscard ||
      commandName === PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionOriginalCorrect ||
      commandName === PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionApprovalRecall ||
      commandName === PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionApprovalApprove) {
      commandBody = {
        AccessSubscriptionId: subscriptionId,
        WorkflowPendingTaskId: workflowPendingTaskId,
      };
    } else if (commandName === PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionSave ||
      commandName === PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionSubmit) {
      commandBody = Subscription;
    } else {
      alert('Action does not supported');
    }

    this.validationMessages = null;

    commandBody.WorkflowAvailableActions = null;

    if (commandBody.Versions) {
      commandBody.Versions = commandBody.Versions.sort((x, y) => {
        if (x.Id < y.Id) {
          return 1;
        } else if (x.Id > x.Id) {
          return -1;
        } else {
          return 0;
        }
      });
    }

    const p = new Promise((resolve, reject) => {
      this.apiService
        .command(commandName.toString(), commandBody)
        .then(responseSuccessOnExecuteCommand => {
          // this.stateService.dispatchOnAction(new SubscriptionAction.SubscriptionDelete(subscriptionId));
          if (!responseSuccessOnExecuteCommand.IsValid) {
            reject(responseSuccessOnExecuteCommand.ValidationMessages);
            return;
          }
          const stateIncludesFilter: string = 'ngtwo.m';
          const groupingEntityTypeId: number = PhxConstants.EntityType.AccessSubscription;
          const targetEntityTypeId: number = PhxConstants.EntityType.AccessSubscription;

          if (messageOnSuccessResponse !== null && messageOnSuccessResponse.length > 0) {
            this.commonService.logSuccess(messageOnSuccessResponse);
          }

          if (
            responseSuccessOnExecuteCommand.TaskResultId === PhxConstants.TaskResult.Complete &&
            responseSuccessOnExecuteCommand.EntityTypeIdRedirect === PhxConstants.EntityType.AccessSubscription &&
            responseSuccessOnExecuteCommand.EntityIdRedirect > 0
          ) {
            // this.workflowService.setWatchConfigOnWorkflowEvent(stateIncludesFilter,
            //   groupingEntityTypeId, targetEntityTypeId,
            //   responseSuccessOnExecuteCommand.EntityIdRedirect)
            //   .then((response: any) => {

            //   });

            setTimeout(() => {
              this.stateService.dispatchOnAction(new SubscriptionAction.SubscriptionDelete(subscriptionId));
              navigateTo(responseSuccessOnExecuteCommand.EntityIdRedirect, null);
            }, 3000);

          } else if (
            responseSuccessOnExecuteCommand.TaskResultId === PhxConstants.TaskResult.Complete &&
            responseSuccessOnExecuteCommand.CommandName === PhxConstants.CommandNamesSupportedByUi.AccessSubscriptionDiscard
          ) {
            if (responseSuccessOnExecuteCommand.EntityIdRedirect) {
              setTimeout(() => {
                this.stateService.dispatchOnAction(new SubscriptionAction.SubscriptionDelete(subscriptionId));
                navigateTo(responseSuccessOnExecuteCommand.EntityIdRedirect, null);
              }, 3000);
            } else {
              navigateToSearch('next/contact/subscriptions');
            }
          } else if (responseSuccessOnExecuteCommand.TaskResultId === PhxConstants.TaskResult.Complete) {
            // this.workflowService.setWatchConfigOnWorkflowEvent(stateIncludesFilter,
            //   groupingEntityTypeId, targetEntityTypeId,
            //   responseSuccessOnExecuteCommand.EntityId)
            //   .then((response: any) => {

            //   });

            setTimeout(() => {
              this.stateService.dispatchOnAction(new SubscriptionAction.SubscriptionDelete(subscriptionId));
              navigateTo(responseSuccessOnExecuteCommand.EntityId, PhxConstants.SubscriptionNavigationName);
            }, 3000);

          } else {
            navigateToSearch('next/contact/subscriptions');
          }
        })
        .catch(responseExceptionOnExecuteCommand => {
          console.error(commandName, commandBody, responseExceptionOnExecuteCommand);
          this.validationMessages = responseExceptionOnExecuteCommand;
          this.parseValidationMessages(subscriptionId);
          reject(responseExceptionOnExecuteCommand);
        });
    });

    const navigateTo = (assignmentId: number, tabNavigationName: PhxConstants.WorkorderNavigationName) => {
      const navigatePath = `/next/subscription/edit/${assignmentId}/`;

      this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-subscription: error navigating to ${assignmentId} , ${tabNavigationName}`, err);
      });
    };

    const navigateToSearch = (route) => {
      this.router.navigate([route]).catch(err => {
        console.error(`app-subscription: error navigating to next/contact/subscriptions`, err);
      });
    };
  }

  private dialogAction_CallBackObButtonClick(callBackObj: PhxDialogComponentEventEmitterInterface) { }

  private parseValidationMessages(subscriptionId: number) {
    const result = {};
    if (this.validationMessages) {
      this.stateService.dispatchOnAction(new SubscriptionAction.SubscriptionValidationErrorAdd(subscriptionId, this.validationMessages));
    } else {
      this.stateService.dispatchOnAction(new SubscriptionAction.SubscriptionValidationErrorDelete(subscriptionId));
    }
  }
}
