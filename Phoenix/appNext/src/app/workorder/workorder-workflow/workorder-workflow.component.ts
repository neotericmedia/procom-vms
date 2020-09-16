import { StateAction, OnClickStateActionOption, StateActionButtonsOption } from './../../common/model/state-action';
import { IWorkorderValidationError, IAssignmentDto } from './../state/workorder.interface';
// angular
import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// common
import { PhxConstants, ApiService, WorkflowService, CommonService } from '../../common/index';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import {
  PhxDialogComponentConfigModel,
  PhxDialogComponentConfigModelDate,
  PhxDialogComponentConfigModelComment,
  PhxDialogComponentEventEmitterInterface,
  PhxDialogComponentConfigModelDropdown
} from '../../common/components/phx-dialog/phx-dialog.component.model';
import { WorkflowAction } from '../../common/model/index';
import { UserProfile } from './../../common/model/user';
import { filter, values, forEach } from 'lodash';
// workOrder
import { IWorkOrder, WorkorderAction } from '../state/index';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { WorkorderService } from '../workorder.service';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValueGroups } from '../../common/model/phx-code-value-groups';

@Component({
  selector: 'app-workorder-workflow',
  templateUrl: './workorder-workflow.component.html'
})
export class WorkOrdernWorkflowComponent extends BaseComponentActionContainer {
  static currentProfile: UserProfile;
  @ViewChild(PhxDialogComponent)
  phxDialogComponent: PhxDialogComponent;
  @ViewChild('modalTemplate') modalTemplate: PhxModalComponent;
  workOrderDetails: IWorkOrder;
  @Output() commandValidation = new EventEmitter<any>();
  rootObject: Partial<IAssignmentDto>;
  workorderAvailableActions: any;
  codeValueGroups: any;

  private validationMessages: Array<IWorkorderValidationError>;
  private phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
  private modelvalMessages: Array<any> = [];

  constructor(
    private commonService: CommonService,
    private apiService: ApiService,
    private workflowService: WorkflowService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private workOrderService: WorkorderService,
    private codeValueService: CodeValueService
  ) {
    super();
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  public onClickStateAction(action: StateAction, componentOption: StateActionButtonsOption, actionOption: OnClickStateActionOption, workOrder: IWorkOrder) {
    const workorder = { ...workOrder };
    this.rootObject = workorder.RootObject;
    delete workorder.RootObject;
    delete workorder.readOnlyStorage;
    workorder.WorkOrderVersion.TimeSheetApprovers = workorder.WorkOrderVersion.TimeSheetApprovers ? workorder.WorkOrderVersion.TimeSheetApprovers : [];
    workorder.WorkOrderVersion.ExpenseApprovers = workorder.WorkOrderVersion.ExpenseApprovers ? workorder.WorkOrderVersion.ExpenseApprovers : [];
    const map = {
      [PhxConstants.StateAction.WorkOrderVersionApprove]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Approve Workorder',
          BodyMessage: 'Are you sure you want to approve this Workorder?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 1,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Workorder Approved');
              }
            },
            { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      /* TBD */
      // [PhxConstants.CommandNamesSupportedByUi.WorkOrderActionCommand.WorkOrderVersionUserActionCancel]: () => {
      //   this.phxDialogComponentConfigModel = {
      //     HeaderTitle: 'Workorder',
      //     BodyMessage: 'This Work Order will be cancelled and discarded. Continue?',
      //     Buttons: [
      //       {
      //         Id: 1,
      //         SortOrder: 2,
      //         CheckValidation: true,
      //         Name: 'Yes',
      //         Class: 'btn-primary',
      //         ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
      //           this.commandExecuteByDialog(workorder, action.CommandName, action.WorkflowPendingTaskId, callBackObj.config, 'Workorder Cancelled');
      //         }
      //       },
      //       { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'No', Class: 'btn-default' }
      //     ],
      //     ObjectDate: null,
      //     ObjectComment: null
      //   };
      //   this.phxDialogComponent.open();
      // },

      [PhxConstants.StateAction.WorkOrderVersionRecallToDraft]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Recall Workorder',
          BodyMessage: 'Are you sure you want to recall this Workorder?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 1,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Workorder Recalled');
              }
            },
            { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.WorkOrderVersionDecline]: () => {
        this.commandExecuteByApi(workorder, action.actionId, action.commandName, 'Work Order declined', null, null, null, actionOption.comment);
      },

      [PhxConstants.StateAction.AssignmentExtend]: () => {
        this.workOrderDetails = workOrder;
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Extend Work Order',
          BodyMessage: 'This Work Order will be extended. Continue?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Workorder Extended');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.WorkOrderVersionDiscard]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Approved ? 'Cancel Work Order' : 'Discard Work Order',
          BodyMessage: workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Approved ? 'Are you sure you want to cancel this Workorder?' : 'Are you sure you want to discard this Workorder?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 1,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(
                  workorder,
                  action.actionId,
                  action.commandName,
                  callBackObj.config,
                  workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Approved ? 'Work Order Cancelled' : 'Work Order Discarded'
                );
              }
            },
            { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.WorkOrderVersionDeclineActivation]: () => {
        this.commandExecuteByApi(workorder, action.actionId, action.commandName, 'Work Order declined', null, null, null, actionOption.comment);
      },

      [PhxConstants.StateAction.WorkOrderUnterminate]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Unterminate Work Order',
          BodyMessage: 'Are you sure you want to Unterminate this Workorder?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 1,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Untermination request submitted');
              }
            },
            { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.WorkOrderVersionApproveReactivation]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Unterminate Work Order',
          BodyMessage: 'Are you sure you want to Unterminate this Workorder?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 1,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Work Order Unterminated');
              }
            },
            { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.WorkOrderReleaseVacationPay]: () => {
        this.router.navigate(['/next', 'transaction', 'releasevacationpay', workOrder.WorkOrderVersion.Id]);
      },

      [PhxConstants.StateAction.WorkOrderCreateGovernmentAdjustment]: () => {
        this.router.navigate(['/next', 'workorder', 'transaction', 'adjustment', workOrder.UserProfileIdWorker, workOrder.WorkOrderVersion.Id]);
      },

      [PhxConstants.StateAction.WorkOrderCreateTransaction]: () => {
        this.commandExecuteByApi(workorder, action.actionId, action.commandName, null, null, null);
      },

      [PhxConstants.StateAction.WorkOrderVersionEdit]: () => {
        this.workOrderDetails = workOrder;
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Correct a Work Order Version',
          BodyMessage: 'This action will replace the selected work order version',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Proceed',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Workorder Corrected');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Discard', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: {
            Label: 'Enter reason for correction',
            HelpBlock: '',
            Value: '',
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000
          }
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.WorkOrderScheduleChange]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Schedule a Work Order Change',
          BodyMessage: 'This action will create a new work order version',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Proceed',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Work Order Schedule Changed');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Discard', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: {
            Label: 'Enter the reason for the schedule change',
            HelpBlock: '',
            Value: null,
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000
          }
        };
        this.phxDialogComponent.open();
      },

      /* TBD */
      [PhxConstants.StateAction.WorkOrderTerminate]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Terminate Work Order',
          BodyMessage: 'This action will terminate the work order and cancel any future versions',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Proceed',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Work Order Terminated');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Discard', Class: 'btn-default' }
          ],
          ObjectDate: {
            Label: 'Termination Date',
            HelpBlock: null,
            Value: null,
            IsRequared: true,
            Min: workorder.StartDate,
            Max: workorder.EndDate
          },
          ObjectDropdown: {
            Label: 'Termination Reason',
            Value: '',
            IsRequared: true,
            HelpBlock: null,
            DropDownList: this.codeValueService.getCodeValues(this.codeValueGroups.TerminationReason, true)
          },
          ObjectComment: {
            Label: 'Enter the reason for termination',
            HelpBlock: '',
            Value: '',
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000
          }
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.WorkOrderVersionFinalize]: () => {
        workorder.WorkOrderVersion.TimeSheetPreviousApprovalRequired = false;
        workorder.WorkOrderVersion.AllowTimeImport = false;
        this.commandExecuteByApi(workorder, action.actionId, action.commandName, 'Work Order Finalized', null, null);
      },

      [PhxConstants.StateAction.WorkOrderVersionSubmit]: () => {
        workorder.WorkOrderVersion.TimeSheetPreviousApprovalRequired = false;
        workorder.WorkOrderVersion.AllowTimeImport = false;
        this.commandExecuteByApi(workorder, action.actionId, action.commandName, 'Work Order Submitted', null, null);
      },

      [PhxConstants.StateAction.WorkOrderVersionSave]: () => {
        workorder.StartDate = this.editableWorkOrderStartDateState(workorder) === true ? workorder.WorkOrderVersion.WorkOrderStartDateState : workorder.StartDate;
        workorder.WorkOrderVersion.AllowTimeImport = false;
        this.commandExecuteByApi(workorder, action.actionId, action.commandName, 'Work Order Saved', null, null);
      },

      [PhxConstants.StateAction.WorkOrderVersionReSyncATS]: () => {
        workorder.StartDate = this.editableWorkOrderStartDateState(workorder) === true ? workorder.WorkOrderVersion.WorkOrderStartDateState : workorder.StartDate;
        workorder.WorkOrderVersion.AllowTimeImport = false;
        this.commandExecuteByApi(workorder, action.actionId, action.commandName, 'Work Order synced with ATS', null, null);
      },

      [PhxConstants.StateAction.WorkOrderReactivate]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Workorder',
          BodyMessage: 'This Work Order will be changed. Continue?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Workorder Activated');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.StateAction.WorkOrderStopPayment]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Stop Payments',
          BodyMessage: 'Are you sure you want to stop payments for all parties in this work order?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Workorder Payments Stopped');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.WorkOrderResumePayment]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Resume Payments',
          BodyMessage: 'Are you sure you want to Resume payments for all parties in this work order?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 1,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Workorder Payments Resumed');
              }
            },
            { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },

      /* TBD */
      // [PhxConstants.CommandNamesSupportedByUi.WorkOrderActionCommand.WorkOrderVersionActiveToExpired]: () => {
      //   // this.commandExecuteByApi(workorder, action.CommandName, action.WorkflowPendingTaskId, 'Work Order Expire', null, null);
      //   this.phxDialogComponentConfigModel = {
      //     HeaderTitle: 'Workorder',
      //     BodyMessage: 'This Work Order will be changed. Continue?',
      //     Buttons: [
      //       {
      //         Id: 1,
      //         SortOrder: 2,
      //         CheckValidation: true,
      //         Name: 'Yes',
      //         Class: 'btn-primary',
      //         ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
      //           this.commandExecuteByDialog(workorder, action.CommandName, action.WorkflowPendingTaskId, callBackObj.config, 'Workorder Expire');
      //         }
      //       },
      //       { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'No', Class: 'btn-default' }
      //     ],
      //     ObjectDate: null,
      //     ObjectComment: null
      //   };
      //   this.phxDialogComponent.open();
      // },

      [PhxConstants.StateAction.WorkOrderVersionRecallToCompliance]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Workorder',
          BodyMessage: 'This Work Order will be changed. Continue?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(workorder, action.actionId, action.commandName, callBackObj.config, 'Workorder Recalled to Compliance Draft');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      }
    };

    if (action.commandName === PhxConstants.CommandNamesSupportedByUi.WorkOrderActionCommand.workOrderSaveAsTemplate) {
      this.workOrderDetails = workOrder;
      this.modalTemplate.show();
      return;
    }
    map[action.actionId]();
  }

  private commandExecuteByDialog(workorder: IWorkOrder, actionId: number, commandName: string, model: PhxDialogComponentConfigModel, messageOnSuccessResponse?: string, additionalComments?: any) {
    this.phxDialogComponent.close();
    this.commandExecuteByApi(workorder, actionId, commandName, messageOnSuccessResponse, model.ObjectDate, model.ObjectComment, model.ObjectDropdown, additionalComments);
  }

  private commandExecuteByApi(
    workorder: IWorkOrder,
    actionId: number,
    commandName: string,
    messageOnSuccessResponse?: string,
    phxDialogComponentConfigModelDate?: PhxDialogComponentConfigModelDate, // ie. TerminationDate
    phxDialogComponentConfigModelComment?: PhxDialogComponentConfigModelComment, // ie. AdditionalNotes
    phxDialogComponentConfigModelDropdown?: PhxDialogComponentConfigModelDropdown, // ie. TerminationReasonId
    otherComments?: any // ie. Decline Comments
  ) {
    const navigateTo = (assignmentId: number, workorderId: number, workorderVersionId: number, tabNavigationName: PhxConstants.WorkorderNavigationName) => {
      const navigatePath = `/next/workorder/${assignmentId}/${workorderId}/${workorderVersionId}/${tabNavigationName}`;
      this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-organization: error navigating to ${assignmentId} , ${workorderId}, ${workorderVersionId}, ${tabNavigationName}`, err);
      });
    };

    const navigateToSearch = () => {
     return this.router.navigate([`search`], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-organization: error navigating to next/organization/search`, err);
      });
    };

    this.phxDialogComponent.close();
    this.validationMessages = null;
    const versionId = workorder.WorkOrderVersion.Id;
    let commandBody: any = null;

    switch (actionId) {
      case PhxConstants.StateAction.AssignmentExtend:
        commandBody = {
          EntityIds: [workorder.AssignmentId]
        };
        break;
      case PhxConstants.StateAction.WorkOrderScheduleChange:
        commandBody = {
          EntityIds: [workorder.WorkOrderId],
          Comment: phxDialogComponentConfigModelComment.Value
        };
        break;
      case PhxConstants.StateAction.WorkOrderTerminate:
        commandBody = {
          EntityIds: [workorder.WorkOrderId],
          Comment: phxDialogComponentConfigModelComment.Value,
          TerminationDate: phxDialogComponentConfigModelDate.Value,
          TerminationReasonId: phxDialogComponentConfigModelDropdown.Value
        };
        break;
      case PhxConstants.StateAction.WorkOrderStopPayment:
      case PhxConstants.StateAction.WorkOrderResumePayment:
      case PhxConstants.StateAction.WorkOrderReactivate:
      case PhxConstants.StateAction.WorkOrderCreateTransaction:
      case PhxConstants.StateAction.WorkOrderReleaseVacationPay:
      case PhxConstants.StateAction.WorkOrderCreateGovernmentAdjustment:
      case PhxConstants.StateAction.WorkOrderUnterminate:
        commandBody = {
          EntityIds: [workorder.WorkOrderId]
        };
        break;
      case PhxConstants.StateAction.WorkOrderVersionSave:
      case PhxConstants.StateAction.WorkOrderVersionReSyncATS:
      case PhxConstants.StateAction.WorkOrderVersionSubmit:
      case PhxConstants.StateAction.WorkOrderVersionFinalize:
        commandBody = {
          EntityIds: [workorder.WorkOrderVersion.Id],
          ...workorder
        };
        break;
      case PhxConstants.StateAction.WorkOrderVersionDecline:
      case PhxConstants.StateAction.WorkOrderVersionDeclineActivation:
        commandBody = {
          EntityIds: [workorder.WorkOrderVersion.Id],
          Comment: otherComments
        };
        break;
      case PhxConstants.StateAction.WorkOrderVersionEdit:
        commandBody = {
          EntityIds: [workorder.WorkOrderVersion.Id],
          Comment: phxDialogComponentConfigModelComment.Value
        };
        break;
      case PhxConstants.StateAction.WorkOrderVersionApprove:
      case PhxConstants.StateAction.WorkOrderVersionRecallToDraft:
      case PhxConstants.StateAction.WorkOrderVersionRecallToCompliance:
      case PhxConstants.StateAction.WorkOrderVersionDiscard:
      case PhxConstants.StateAction.WorkOrderVersionApproveReactivation:
        commandBody = {
          EntityIds: [workorder.WorkOrderVersion.Id]
        };
        break;
      default:
        alert('Action is not supported');
        break;
    }

    this.validationMessages = null;

    this.apiService
      .command(commandName, commandBody)
      .then(responseSuccessOnExecuteCommand => {
        this.modelvalMessages = [];
        this.commandValidation.emit(this.modelvalMessages);
        if (!responseSuccessOnExecuteCommand.IsValid) {
          return;
        }
        if (messageOnSuccessResponse !== null && messageOnSuccessResponse.length > 0) {
          this.commonService.logSuccess(messageOnSuccessResponse);
        }

        if ((actionId === PhxConstants.StateAction.WorkOrderVersionDiscard) && !responseSuccessOnExecuteCommand.EntityTypeIdRedirect && !responseSuccessOnExecuteCommand.EntityIdRedirect) {
          // if work order version is deleted and there's no redirect entity, UI should navigate back to search view
          navigateToSearch().then( response => {
            this.stateService.dispatchOnAction(new WorkorderAction.WorkorderReload());
          }); 
        }
      
        else {
          this.stateService.dispatchOnAction(new WorkorderAction.WorkorderRefresh(versionId));

          if (actionId === PhxConstants.StateAction.WorkOrderCreateTransaction) {
            const transactionId = responseSuccessOnExecuteCommand.EntityIdRedirect;
            this.router.navigate(['/next', 'transaction', transactionId, 'detail'], { relativeTo: this.activatedRoute.parent }).catch(err => {
              console.error(`app-organization: error navigating to ${transactionId}/detail`, err);
            });
          } else if (actionId === PhxConstants.StateAction.WorkOrderVersionSave) {
            navigateTo(workorder.AssignmentId, workorder.WorkOrderId, workorder.WorkOrderVersion.Id, PhxConstants.WorkorderNavigationName.core);
          }
          else if ((actionId === PhxConstants.StateAction.WorkOrderVersionFinalize
             || actionId === PhxConstants.StateAction.WorkOrderVersionSubmit) && (this.activatedRoute.snapshot.url.join('').indexOf("clientspecificfields") > 0)) {
            navigateTo(workorder.AssignmentId, workorder.WorkOrderId, workorder.WorkOrderVersion.Id, PhxConstants.WorkorderNavigationName.core);
          }
          else {
            if (responseSuccessOnExecuteCommand.EntityTypeIdRedirect > 0 && responseSuccessOnExecuteCommand.EntityIdRedirect > 0) {
              if (responseSuccessOnExecuteCommand.EntityTypeIdRedirect === PhxConstants.EntityType.WorkOrderVersion) {
                this.workOrderService.getByWorkOrderVersionId(responseSuccessOnExecuteCommand.EntityIdRedirect, null).subscribe((data: any) => {
                  const workOrders = data ? data.WorkOrders || [] : [];
                  const foundWO = workOrders.find(wo => {
                    const workOrderVersions = wo ? wo.WorkOrderVersions || [] : [];
                    const foundWOV = workOrderVersions.find(wov => {
                      const id = wov ? wov.Id : null;
                      return id === +responseSuccessOnExecuteCommand.EntityIdRedirect;
                    });
                    return foundWOV;
                  });
                  if (foundWO) {
                    navigateTo(foundWO.AssignmentId, foundWO.Id, responseSuccessOnExecuteCommand.EntityIdRedirect, 'core');
                  }
                });
              } else {
                alert('Workorder response redirection does not supported. Will be redirected to workorder search');
                navigateToSearch();
              }
            }
          }
        }
      })
      .catch(responseExceptionOnExecuteCommand => {
        this.validationMessages = responseExceptionOnExecuteCommand;
        this.parseValidationMessages(versionId);
      });
  }

  private parseValidationMessages(versionId: number) {
    this.modelvalMessages = [];
    const result = {};
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
      this.stateService.dispatchOnAction(new WorkorderAction.WorkorderValidationErrorAdd(versionId, this.validationMessages));
    } else {
      this.stateService.dispatchOnAction(new WorkorderAction.WorkorderValidationErrorDelete(versionId));
    }
  }

  public dialogAction_CallBackObButtonClick(callBackObj: PhxDialogComponentEventEmitterInterface) {}

  editableWorkOrderStartDateState(workorder: IWorkOrder) {
    if (!this.displayWorkOrderStartDateState(workorder)) {
      return false;
    }

    if (workorder.AtsPlacementId > 0) {
      return this.editableStartAndEndDate(workorder);
    } else {
      return true;
    }
  }

  editableStartAndEndDate(workorder: IWorkOrder) {
    let editable = false;
    if (workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.New && workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingReview) {
      editable = true;
    } else if (this.currentProfileUnderAccountingRole() || this.currentProfileIsSystemAdministrator()) {
      if (workorder.WorkOrderVersion.IsDraftStatus) {
        editable = true;
      }

      if (workorder.WorkOrderVersion.IsDraftStatus && workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.Extend) {
        editable = true;
      }

      if (workorder.WorkOrderVersion.IsDraftStatus && this.correction(workorder)) {
        editable = true;
      }

      if (workorder.WorkOrderVersion.IsDraftStatus && workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.ScheduleChange) {
        editable = false;
      }
    }

    return editable;
  }

  displayWorkOrderStartDateState(workorder: IWorkOrder) {
    return (
      (workorder.WorkOrderVersion.IsDraftStatus || workorder.WorkOrderVersion.IsComplianceDraftStatus || workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingReview) &&
      (workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionEarliest ||
        workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique)
    );
  }

  currentProfileUnderAccountingRole() {
    return (
      filter(WorkOrdernWorkflowComponent.currentProfile.FunctionalRoles, function(item) {
        return (
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Finance ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Controller ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOffice ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.AccountsReceivable ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOfficeARAP
        );
      }).length > 0
    );
  }

  currentProfileIsSystemAdministrator() {
    return (
      filter(WorkOrdernWorkflowComponent.currentProfile.FunctionalRoles, function(item) {
        return item.FunctionalRoleId === PhxConstants.FunctionalRole.SystemAdministrator;
      }).length > 0
    );
  }
  /// assignment filed accessibility
  correction(workorder: IWorkOrder) {
    return (
      workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionEarliest ||
      workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionLatest ||
      workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionMiddle ||
      workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique
    );
  }

  // assignment filed accessibility
  editableWorkOrderEndDateState(workorder: IWorkOrder) {
    if (!this.displayWorkOrderEndDateState(workorder)) {
      return false;
    }

    if (workorder.AtsPlacementId > 0) {
      return this.editableStartAndEndDate(workorder);
    } else {
      return true;
    }
  }

  displayWorkOrderEndDateState(workorder: IWorkOrder) {
    return (
      (workorder.WorkOrderVersion.IsDraftStatus || workorder.WorkOrderVersion.IsComplianceDraftStatus || workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingReview) &&
      (workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionLatest ||
        workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique)
    );
  }
}
