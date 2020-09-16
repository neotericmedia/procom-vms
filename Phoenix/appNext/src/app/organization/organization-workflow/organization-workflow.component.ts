import { IOrganizationValidationError } from './../state/organization.interface';
// angular
import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// common
import { PhxConstants, ApiService, WorkflowService, CommonService, LoadingSpinnerService } from '../../common/index';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { PhxDialogComponentConfigModel, PhxDialogComponentConfigModelDate, PhxDialogComponentConfigModelComment, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { WorkflowAction } from '../../common/model/index';
// organization
import { IOrganization, OrganizationAction, IReadOnlyStorage } from '../state/index';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';

@Component({
  selector: 'app-organization-workflow',
  templateUrl: './organization-workflow.component.html',
  styleUrls: ['./organization-workflow.component.less']
})
export class OrganizationWorkflowComponent extends BaseComponentActionContainer {
  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  @Output() commandExecuted = new EventEmitter<any>();

  private validationMessages: Array<any>;
  public phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
  private phxDialogComponentConfigModelDate: PhxDialogComponentConfigModelDate = null;
  private phxDialogComponentConfigModelComment: PhxDialogComponentConfigModelComment = null;
  constructor(private commonService: CommonService, private apiService: ApiService, private workflowService: WorkflowService, private router: Router, private activatedRoute: ActivatedRoute, private loader: LoadingSpinnerService) {
    super();
  }

  public onClickWorkflowAction(action: any, organization: IOrganization) {
    const map = {
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationApprovalApprove]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Organization Action',
          BodyMessage: 'Are you sure you want to approve this Organization?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Approve Organization',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(organization, action.commandName, callBackObj.config, 'Organization Approved');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationApprovalDecline]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Organization Action',
          BodyMessage: 'Are you sure you want to decline this Organization?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Decline Organization',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(organization, action.commandName, callBackObj.config, 'Organization Declined');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: { Label: 'Decline Organization Comment', HelpBlock: 'Decline Organization Comment must be entered', Value: null, IsRequared: true, LengthMin: 3, LengthMax: 256 }
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationApprovalRecall]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Organization Action',
          BodyMessage: 'Are you sure you want to recall this Organization?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Recall Organization',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(organization, action.commandName, callBackObj.config, 'Organization Recalled');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationDiscard]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Organization Action',
          BodyMessage: 'Are you sure you want to discard this Organization?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Discard Organization',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(organization, action.commandName, callBackObj.config, 'Organization Discarded');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationOriginalCorrect]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Organization Action',
          BodyMessage: 'Are you sure you want to make a correction to this Organization?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Yes',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(organization, action.commandName, callBackObj.config, 'Organization Correction');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'No', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationSave]: () => {
        this.commandExecuteByApi(organization, action.commandName, 'Organization Saved', null, null).then(x => this.commandExecuted.emit(x));
      },
      // [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationSubmit]: () => {
      //   this.phxDialogComponentConfigModel = {
      //     HeaderTitle: 'Organization Action',
      //     BodyMessage: 'Are you sure you want to submit this Organization?',
      //     Buttons: [
      //       {
      //         Id: 1,
      //         SortOrder: 1,
      //         CheckValidation: true,
      //         Name: 'Submit Organization',
      //         Class: 'btn-primary',
      //         ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
      //           this.commandExecuteByDialog(organization, action.commandName, action.WorkflowPendingTaskId, callBackObj.config, 'Organization Submitted');
      //         }
      //       },
      //       { Id: 2, SortOrder: 2, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
      //     ],
      //     ObjectDate: null,
      //     ObjectComment: null
      //   };
      //   this.phxDialogComponent.open();
      // },
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationSubmit]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Organization Action',
          BodyMessage: 'Are you sure you want to submit this Organization?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Submit Organization',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(organization, action.commandName, callBackObj.config, 'Organization Submitted');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationFinalize]: () => {
        this.commandExecuteByApi(organization, action.commandName, 'Organization Finalized', null, null).then(x => this.commandExecuted.emit(x));
      },
      [PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationApprovalRecallCompliance]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Organization Action',
          BodyMessage: 'Are you sure you want to recall this Organization to Accounting Draft?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: false,
              Name: 'Recall to Accounting Draft',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(organization, action.commandName, callBackObj.config, 'Organization Recalled to Accounting Draft');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      }
    };
    map[action.commandName]();
  }

  private commandExecuteByDialog(organization: IOrganization, commandName: PhxConstants.CommandNamesSupportedByUi, model: PhxDialogComponentConfigModel, messageOnSuccessResponse?: string) {
    this.phxDialogComponent.close();
    this.commandExecuteByApi(organization, commandName, messageOnSuccessResponse, model.ObjectDate, model.ObjectComment).then(x => {
      //this.commandExecuted.emit(x);
      //console.log(this.commandExecuted.emit(x));
    });
  }

  // tslint:disable-next-line:max-line-length
  private commandExecuteByApi(
    organization: IOrganization,
    commandName: PhxConstants.CommandNamesSupportedByUi,
    messageOnSuccessResponse?: string,
    phxDialogComponentConfigModelDate?: PhxDialogComponentConfigModelDate,
    phxDialogComponentConfigModelComment?: PhxDialogComponentConfigModelComment
  ) {
    this.phxDialogComponent.close();
    this.validationMessages = null;
    const organizationId = organization.Id;
    let commandBody: any = null;
    if (
      commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationApprovalApprove ||
      commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationApprovalRecall ||
      commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationDiscard ||
      commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationOriginalCorrect ||
      commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationApprovalRecallCompliance
    ) {
      commandBody = { CommandName: commandName, EntityIds: [organizationId] };
    } else if (commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationApprovalDecline) {
      const comments = phxDialogComponentConfigModelComment != null && phxDialogComponentConfigModelComment.Value != null ? phxDialogComponentConfigModelComment.Value : null;
      commandBody = { CommandName: commandName, EntityIds: [organizationId], Comments: comments };
    } else if (
      commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationSave ||
      commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationSubmit ||
      commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationFinalize
    ) {
      commandBody = { CommandName: commandName, EntityIds: [organizationId], ...organization };
    } else {
      alert('Action does not supported');
    }

    this.validationMessages = null;
    commandName = commandName;
    const navigateTo = (organizationIdNavigateTo: number, tabNavigationName: PhxConstants.OrganizationNavigationName, roleId: number = null, roleType: PhxConstants.OrganizationNavigationName = null) => {
      const navigatePath = `/next/organization/${organizationIdNavigateTo}/${tabNavigationName}` + (roleId ? `/${roleType}/${roleId}` : ``);
      this.router.navigate([navigatePath]).catch(err => {
        console.error(`app-organization: error navigating to ${organizationIdNavigateTo} , ${tabNavigationName}`, err);
      });
    };

    const navigateToSearch = () => {
      this.router.navigate([`search`], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-organization: error navigating to next/organization/search`, err);
      });
    };

    //commandBody.WorkflowAvailableActions = null;

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
      this.apiService.command(commandName.toString(), commandBody).then(
        responseSuccessOnExecuteCommand => {
          // debugger;
          // this.stateService.dispatchOnAction(new OrganizationAction.OrganizationDelete(organizationId));

          if (!responseSuccessOnExecuteCommand.IsValid) {
            reject(responseSuccessOnExecuteCommand.ValidationMessages);
            return;
          }
          const stateIncludesFilter: string = '/next/organization/';
          if (messageOnSuccessResponse !== null && messageOnSuccessResponse.length > 0) {
            this.commonService.logSuccess(messageOnSuccessResponse);
          }

          if (responseSuccessOnExecuteCommand.EntityTypeIdRedirect === PhxConstants.EntityType.Organization && responseSuccessOnExecuteCommand.EntityIdRedirect > 0) {
            this.stateService.dispatchOnAction(new OrganizationAction.OrganizationDelete(organizationId));
            if (
              (responseSuccessOnExecuteCommand.CommandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationFinalize ||
                PhxConstants.CommandNamesSupportedByUi.BaseOrganizationSaveCommand.OrganizationSubmit) &&
              responseSuccessOnExecuteCommand.EntityIdRedirect !== organizationId
            ) {
              this.stateService.dispatchOnAction(new OrganizationAction.OrganizationDelete(responseSuccessOnExecuteCommand.EntityIdRedirect));
            }
            navigateTo(responseSuccessOnExecuteCommand.EntityIdRedirect, PhxConstants.OrganizationNavigationName.details);
          } else if (responseSuccessOnExecuteCommand.CommandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationDiscard) {
            navigateToSearch();
          } else if (responseSuccessOnExecuteCommand.TaskResultId === PhxConstants.TaskResult.Complete) {
            const routeParams = (<any>this.activatedRoute.params).value;
            this.stateService.dispatchOnAction(new OrganizationAction.OrganizationDelete(organizationId));
            if (responseSuccessOnExecuteCommand.CommandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationOriginalCorrect && routeParams.tabId === 'roles') {
              navigateTo(responseSuccessOnExecuteCommand.EntityId, routeParams.tabId);
            } else {
              navigateTo(responseSuccessOnExecuteCommand.EntityId, routeParams.tabId, routeParams.tabId === 'roles' ? routeParams.roleId : null, routeParams.tabId === 'roles' ? routeParams.roleType : null);
            }
          } else {
            alert('Organization response redirection does not supported. Will be redirected to organization search');
            navigateToSearch();
          }
        },
        responseExceptionOnExecuteCommand => {
          // debugger;
          this.stateService.dispatchOnAction(new OrganizationAction.OrganizationDelete(organizationId));

          console.error(commandName, commandBody, responseExceptionOnExecuteCommand);
          //this.validationMessages = responseExceptionOnExecuteCommand;
          //this.parseValidationMessages(responseExceptionOnExecuteCommand);
          this.validationMessages = this.commonService.responseErrorMessages(responseExceptionOnExecuteCommand, null);
          if (this.validationMessages && this.validationMessages.length > 0) {
            this.validationMessages.forEach(x => {
              this.commonService.logError(x.Message);
            });
          }
          reject(responseExceptionOnExecuteCommand);
        }
      );
    });

    return p;
  }

  private parseValidationMessages(organizationId: number) {
    const result = {};
    const that = this;
    if (this.validationMessages) {
      Object.keys(this.validationMessages).forEach(item => {
        if (item === 'ValidationMessages' && this.validationMessages[item].length) {
          for (let index = 0; index < this.validationMessages[item].length; index++) {
            const msg = this.validationMessages[item][index];
            this.commonService.logError(msg.Message);
          }
        }
      });
      this.stateService.dispatchOnAction(new OrganizationAction.OrganizationValidationErrorAdd(organizationId, this.validationMessages));
      // this.validationMessages = result;
    } else {
      this.stateService.dispatchOnAction(new OrganizationAction.OrganizationValidationErrorDelete(organizationId));
    }
  }
}
