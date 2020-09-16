import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { IDocumentRule, IReadOnlyStorage, IRoot, IDocumentRuleDetails, IRules } from '../state/document-rule.interface';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { IFormGroupSetup } from '../state/document-rule.state';
import { NavigationBarItem, CodeValue, PhxConstants, CommandResponse, WorkflowAction } from '../../common/model';
import { NavigationService, CommonService, CodeValueService, CustomFieldService, LoadingSpinnerService, WorkflowService, DialogService } from '../../common';
import { DocumentRuleObservableService } from '../state/document-rule.observable.service';
import { Router, ActivatedRoute } from '@angular/router';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { IOrganizationBase } from '../../contact/state';
import { OrganizationApiService } from '../../organization/organization.api.service';
import { Observable } from 'rxjs/Observable';
import { DocumentRuleDetailsComponent } from '../document-rule-details/document-rule-details.component';
import { DocumentRuleActions } from '../state';
import { HashModel } from '../../common/utility/hash-model';
import { DocumentRuleTabRulesComponent } from '../document-rule-tab-rules/document-rule-tab-rules.component';

import { ButtonBarSortDirection } from '../../common/components/phx-workflow-buttons/phx-workflow-buttons.component';
import { PhxWorkflowButtonsComponent } from '../../common/components/phx-workflow-buttons/phx-workflow-buttons.component';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { DocumentRuleService } from '../shared/document-rule.service';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';


@Component({
  selector: 'app-document-rule',
  templateUrl: './document-rule.component.html',
  styleUrls: ['./document-rule.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentRuleComponent extends BaseComponentActionContainer implements OnInit, AfterViewInit {

  @ViewChild('footerbar') footerbar: PhxWorkflowButtonsComponent;
  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;


  public routerParams: any;
  public routerState: {
    Id: number;
    tabId: string;
    url: string;
  };
  public documentRule: IDocumentRule;
  readOnlyStorage: IReadOnlyStorage;
  rootFormGroup: FormGroup<IRoot>;
  formGroupSetup: IFormGroupSetup;

  public phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;

  html: {
    buttonSortDirections: typeof ButtonBarSortDirection;
    listOrganizationClient: IOrganizationBase[];
    navigationBarContent: Array<NavigationBarItem>;
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    validationMessages: any;
    codeValueLists: {};
  } = {
      buttonSortDirections: ButtonBarSortDirection,
      listOrganizationClient: [],
      navigationBarContent: null,
      codeValueGroups: null,
      phxConstants: PhxConstants,
      validationMessages: null,
      codeValueLists: {}
    };

  constructor(
    private navigationService: NavigationService,
    private documentRuleObservableService: DocumentRuleObservableService,
    private router: Router,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private orgService: OrganizationApiService,
    private customFieldService: CustomFieldService,
    private spinner: LoadingSpinnerService,
    private workflowService: WorkflowService,
    private dialogs: DialogService,
    private documentRuleService: DocumentRuleService
  ) {
    super();
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    orgService.getListClient().subscribe(x => {
      this.html.listOrganizationClient = x;
    });
  }

  ngAfterViewInit() { }

  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        if (routerStateResult.location.includes(PhxConstants.DocumentRuleNavigationName.details)) {
          this.setRouterState(routerStateResult, PhxConstants.DocumentRuleNavigationName.details);
        } else if (routerStateResult.location.includes(PhxConstants.DocumentRuleNavigationName.rules)) {
          this.setRouterState(routerStateResult, PhxConstants.DocumentRuleNavigationName.rules);
        } else if (routerStateResult.location.includes(PhxConstants.DocumentRuleNavigationName.templates)) {
          this.setRouterState(routerStateResult, PhxConstants.DocumentRuleNavigationName.templates);
        } else if (routerStateResult.location.includes(PhxConstants.DocumentRuleNavigationName.history)) {
          this.setRouterState(routerStateResult, PhxConstants.DocumentRuleNavigationName.history);
        } else {
          this.setRouterState(routerStateResult, PhxConstants.DocumentRuleNavigationName.history);
        }

        this.routerParams = routerStateResult.params;

        return routerStateResult.params.documentRuleId ? this.documentRuleObservableService.documentRule$(this, +routerStateResult.params.documentRuleId) : Observable.of(null);
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((documentRule: IDocumentRule) => {
        if (documentRule) {
          this.documentRule = documentRule;
          this.onInitDocumentRule(documentRule);

          setTimeout(() => {
            const ruleAreaType = this.codeValueService.getCodeValues(this.html.codeValueGroups.ComplianceDocumentRuleAreaType, true).find(x => x.id === documentRule.ComplianceDocumentRuleAreaTypeId);

            if (this.documentRule.ComplianceDocumentRuleAreaTypeId ===
              this.html.phxConstants.ComplianceDocumentRuleAreaType.OrganizationClient && this.documentRule.OrganizationIdClient > 0) {
              const organizationClient = this.html.listOrganizationClient.find(x => x.Id === documentRule.OrganizationIdClient);

              this.navigationService.setTitle('document-rule-viewedit', [organizationClient.DisplayName]);
            } else {
              this.navigationService.setTitle('document-rule-viewedit', [ruleAreaType.text]);
            }

            this.footerbar.repaintActionButtons();

          }, 500);

          if (documentRule.ValidationErrors !== null) {
            const validationMessages = this.commonService.parseResponseError(documentRule.ValidationErrors);
            if (validationMessages.length > 0) {
              this.html.validationMessages = [];
              validationMessages.forEach(element => {
                this.html.validationMessages.push(element.Message);
              });
            }
          }
        }
      });
  }

  onInitDocumentRule(documentRule: IDocumentRule) {
    setTimeout(() => (this.html.navigationBarContent = this.navigationBarContentSetup()), 1000);
    this.readOnlyStorage = documentRule.ReadOnlyStorage;
    this.formBuilderGroupSetup(this.formGroupSetup, documentRule, this.documentRuleObservableService);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, documentRule: IDocumentRule, documentRuleObservableService: DocumentRuleObservableService) {
    this.rootFormGroup = formGroupSetup.formBuilder.group<IRoot>({
      Id: documentRule.Id,
      DocumentRuleDetails: DocumentRuleDetailsComponent.formBuilderGroupSetup(formGroupSetup, documentRule, documentRule.ComplianceDocumentRuleAreaTypeId
        === this.html.phxConstants.ComplianceDocumentRuleAreaType.OrganizationClient),
      DocumentRules: DocumentRuleTabRulesComponent.formBuilderGroupSetup(formGroupSetup, documentRule, documentRule.ComplianceDocumentRuleEntityTypeId
        === this.html.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder)
    });
  }

  onOutputEvent() {
    const documentRule = this.documentRule;
    const documentRuleDetails = DocumentRuleDetailsComponent.formGroupToPartial(documentRule,
      <FormGroup<IDocumentRuleDetails>>this.rootFormGroup.controls.DocumentRuleDetails);
    const rules = DocumentRuleTabRulesComponent.formGroupToPartial(documentRule,
      <FormGroup<IRules>>this.rootFormGroup.controls.DocumentRules);

    this.stateService.dispatchOnAction(
      new DocumentRuleActions.DocumentRuleUpdate({
        ...documentRule,
        ...documentRuleDetails,
        ...rules
      })
    );
  }

  clickOnWorkflowAvailableAction(action: WorkflowAction, documentRule: IDocumentRule) {

    const that = this;
    this.html.validationMessages = [];
    if (action.CommandName === 'ComplianceDocumentRuleUserActionSave') {
      this.spinner.show();
      this.documentRuleService.complianceDocumentRuleUserActionSave(documentRule).then(
        (responseSuccess) => {
          this.onResponseSuccesWatchWorkflowEvent(responseSuccess, documentRule.Id, 'Document Rule Saved');
        },
        (responseError) => {
          this.onResponseError(responseError, 'Document Rule was NOT saved');
        });
    }
    else if (action.CommandName === 'ComplianceDocumentRuleUserActionSubmit') {
      if (this.rootFormGroup.invalid) {
        this.commonService.logError('The ComplianceDocumentRule tabs "Details" and/or "Roles" are NOT valid');
      }
      else {
        this.spinner.show();
        this.documentRuleService.complianceDocumentRuleUserActionSubmit(documentRule).then(
          (responseSuccess) => {
            this.onResponseSuccesWatchWorkflowEvent(responseSuccess, documentRule.Id, 'Document Rule Submitted');
          },
          (responseError) => {
            this.onResponseError(responseError, 'Document Rule is NOT valid');
          });
      }
    }
    else {
      let dialogHeader = `Are you sure you want to ${action.Name} this Document Rule?`;
      let successMessage = action.Name;
      if (action.CommandName === 'ComplianceDocumentRuleUserActionOriginalCorrect') {
        dialogHeader = 'Are you sure you want to make a correction to this Document Rule?';
        successMessage = 'Document Rule Correction';
      }
      else if (action.CommandName === 'ComplianceDocumentRuleUserActionApprovalRecall') {
        dialogHeader = 'Are you sure you want to recall this Document Rule?';
        successMessage = 'Document Rule Recalled';
      }
      else if (action.CommandName === 'ComplianceDocumentRuleUserActionApprovalApprove') {
        dialogHeader = 'Are you sure you want to approve this Document Rule?';
        successMessage = 'Document Rule Approved';
      }
      else if (action.CommandName === 'ComplianceDocumentRuleUserActionDiscard') {
        dialogHeader = 'Are you sure you want to Discard this Document Rule?';
        successMessage = 'Document Rule Discarded';
      }
      else if (action.CommandName === 'ComplianceDocumentRuleUserActionApprovalDecline') {
        dialogHeader = 'Are you sure you want to Decline this Document Rule?';
        successMessage = 'Document Rule Declined';

        this.phxDialogComponentConfigModel = {
          HeaderTitle: dialogHeader,
          BodyMessage: 'If you decline, then please enter a valid reason otherwise click Cancel button.',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'OK',
              Class: 'btn-primary',
              ClickEvent: (result: PhxDialogComponentEventEmitterInterface) => {
                if (!result.config.ObjectComment.Value) {
                  that.commonService.logError('A valid reason must be entered');
                  return;
                }

                that.documentRuleService.executeAction(action.CommandName, {
                  CommandName: action.CommandName,
                  Comments: result.config.ObjectComment.Value,
                  ComplianceDocumentRuleId: that.routerState.Id,
                  WorkflowPendingTaskId: that.documentRule.WorkflowPendingTaskId
                }).then(
                  (responseSuccess) => {
                    that.onResponseSuccesWatchWorkflowEvent(responseSuccess, responseSuccess.EntityId, successMessage);
                  },
                  (responseError) => {
                    that.onResponseError(responseError);
                  });
              }
            },
            {
              Id: 2,
              SortOrder: 1,
              CheckValidation: false,
              Name: 'Cancel',
              Class: 'btn-default',
              ClickEvent: (result: PhxDialogComponentEventEmitterInterface) => {
                that.spinner.hide();
              }
            }
          ],
          ObjectDate: null,
          ObjectComment: {
            HelpBlock: 'Reason must be entered',
            IsRequared: true,
            LengthMin: 0,
            LengthMax: 32000,
            Label: 'Reason'
          }
        };

        this.phxDialogComponent.open();

      }

      if (action.CommandName !== this.html.phxConstants.CommandNamesSupportedByUi.BaseDocumentRuleCommand.ComplianceDocumentRuleUserActionApprovalDecline) {
        this.dialogs.confirm('Document Rule Action', dialogHeader).then((btn) => {

          that.spinner.show();

          that.documentRuleService.executeAction(action.CommandName, {
            CommandName: action.CommandName,
            ComplianceDocumentRuleId: that.routerState.Id,
            WorkflowPendingTaskId: that.documentRule.WorkflowPendingTaskId
          }).then(
            (responseSuccess) => {
              that.onResponseSuccesWatchWorkflowEvent(responseSuccess, responseSuccess.EntityId, successMessage);
            },
            (responseError) => {
              that.onResponseError(responseError);
            });

        }, (btn) => {
          console.log('Action cancelled by user');
        });

      }
    }

  }

  onVersionClick(documentRule: IDocumentRule) {
    this.routerParams.documentRuleId = documentRule.Id;
    // this.routerParams.tabId = documentRule.Id;

    this.router.navigateByUrl(`/next/document/rule/edit/${this.routerParams.documentRuleId}/${this.routerParams.tabId}`);

    if (this.footerbar) {
      this.footerbar.repaintActionButtons();
    }

  }

  navigationBarContentSetup(): Array<NavigationBarItem> {
    const path = `/next/document/rule/edit/${this.routerParams.documentRuleId}`;
    const isHidden = !(this.documentRule.Id > 0 && this.documentRule.OriginalId > 0);
    return [
      {
        Id: 1,
        IsDefault: true,
        IsHidden: false,
        Valid: this.rootFormGroup ? this.rootFormGroup.controls.DocumentRuleDetails.valid : true,
        Name: PhxConstants.DocumentRuleNavigationName.details,
        Path: `${path}/${PhxConstants.DocumentRuleNavigationName.details}`,
        DisplayText: 'Details'
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: false,
        Valid: this.rootFormGroup ? this.rootFormGroup.controls.DocumentRules.valid : true,
        Name: PhxConstants.DocumentRuleNavigationName.rules,
        Path: `${path}/${PhxConstants.DocumentRuleNavigationName.rules}`,
        DisplayText: 'Rules'
      },
      {
        Id: 3,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.DocumentRuleNavigationName.templates,
        Path: `${path}/${PhxConstants.DocumentRuleNavigationName.templates}`,
        DisplayText: 'Templates'
      },
      {
        Id: 4,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.ContactNavigationName.history,
        Path: `${path}/${PhxConstants.DocumentRuleNavigationName.history}`,
        DisplayText: 'History'
      }
    ];
  }

  setRouterState(routerStateResult: IRouterState, ProfileNavigationName: string) {
    this.routerState = {
      Id: +routerStateResult.params.documentRuleId,
      tabId: routerStateResult.params.tabId,
      url: routerStateResult.location
    };
  }

  onResponseSuccesWatchWorkflowEvent(responseSuccess: CommandResponse, documentRuleId: number, message: string) {
    this.html.validationMessages = [];
    this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(documentRuleId));

    if (!responseSuccess.IsValid) {
      this.onResponseError(responseSuccess.ValidationMessages);
      return;
    }

    const stateIncludesFilter: string = `compliancedocument.documentrule.edit`;
    const groupingEntityTypeId: number = PhxConstants.EntityType.ComplianceDocumentRule;
    const targetEntityTypeId: number = PhxConstants.EntityType.ComplianceDocumentRule;

    if (message && message.length > 0) {
      this.commonService.logSuccess(message);
    }

    this.spinner.hide();

    this.html.validationMessages = [];

    if (responseSuccess.TaskResultId === PhxConstants.TaskResult.Complete && responseSuccess.EntityTypeIdRedirect ===
      PhxConstants.EntityType.ComplianceDocumentRule && responseSuccess.EntityIdRedirect > 0) {
      // this.workflowService.setWatchConfigOnWorkflowEvent(
      //   stateIncludesFilter,
      //   groupingEntityTypeId,
      //   targetEntityTypeId,
      //   responseSuccess.EntityIdRedirect, //targetEntityId
      // ).then((response: any) => {
      //   this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(responseSuccess.EntityIdRedirect));
      //   this.navigateTo(responseSuccess.EntityIdRedirect);
      // }).catch(error => {
      //     alert("Action response redirection does not supported. Will be redirected to Documents rule's search page");
      //     console.log(error);
      //     this.navigateToSearch();
      //   });
      setTimeout(() => {
        this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(responseSuccess.EntityIdRedirect));
        this.navigateTo(responseSuccess.EntityIdRedirect);
      }, 3000);

    } else if (responseSuccess.EntityId !== this.documentRule.OriginalId && responseSuccess.TaskResultId === PhxConstants.TaskResult.Complete) {
      // this.workflowService.setWatchConfigOnWorkflowEvent(
      //   stateIncludesFilter,
      //   groupingEntityTypeId,
      //   targetEntityTypeId,
      //   responseSuccess.EntityId, //targetEntityId
      // ).then((response: any) => {
      //   this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(this.documentRule.OriginalId));
      //   this.navigateTo(responseSuccess.EntityId);
      // })
      //   .catch(error => {
      //     alert("Action response redirection does not supported. Will be redirected to Documents rule's search page");
      //     console.log(error);
      //     this.navigateToSearch();
      //   });

      if (responseSuccess.CommandName === this.html.phxConstants.CommandNamesSupportedByUi.BaseDocumentRuleCommand.ComplianceDocumentRuleUserActionOriginalCorrect) {
        setTimeout(() => {
          this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(this.documentRule.OriginalId));
          this.navigateTo(responseSuccess.EntityId);
        }, 3000);
      } else if (responseSuccess.CommandName === this.html.phxConstants.CommandNamesSupportedByUi.BaseDocumentRuleCommand.ComplianceDocumentRuleUserActionSubmit || 
        responseSuccess.CommandName === this.html.phxConstants.CommandNamesSupportedByUi.BaseDocumentRuleCommand.ComplianceDocumentRuleUserActionApprovalDecline) {
        setTimeout(() => {
          this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(responseSuccess.EntityId));
          this.navigateTo(responseSuccess.EntityId);
        }, 3000);
      } else {
        setTimeout(() => {
          this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(this.documentRule.OriginalId));
          this.navigateTo(responseSuccess.EntityId);
        }, 3000);
      }
    } else {
      // this.workflowService.setWatchConfigOnWorkflowEvent(
      //   stateIncludesFilter,
      //   groupingEntityTypeId,
      //   targetEntityTypeId,
      //   responseSuccess.EntityId,//targetEntityId
      // ).then((response: any) => {
      //   this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(this.documentRule.OriginalId));
      //   this.navigateTo(this.documentRule.OriginalId);
      // })
      //   .catch(error => {
      //     alert("Action response redirection does not supported. Will be redirected to Documents rule's search page");
      //     console.log(error);
      //     this.navigateToSearch();
      //   });
      if (responseSuccess.CommandName === this.html.phxConstants.CommandNamesSupportedByUi.BaseDocumentRuleCommand.ComplianceDocumentRuleUserActionDiscard) {
        setTimeout(() => {
          const xId = this.documentRule.ComplianceDocumentRuleAreaTypeId;
          this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(this.documentRule.OriginalId));
          this.navigateToSearch(xId);
        }, 3000);
      } else {
        setTimeout(() => {
          this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleDelete(this.documentRule.OriginalId));
          this.navigateTo(this.documentRule.OriginalId);
        }, 3000);
      } 
    }
  }

  navigateTo(EntityId: number): any {
    this.router.navigate(['next', 'document', 'rule', 'edit', EntityId, this.routerState.tabId]).catch(res => {
      console.log(res);
    });
  }

  navigateToSearch(xId: number): any {
    this.router.navigateByUrl(`/next/compliance/document-rule/search/${xId}`);
  }

  onResponseError(responseError, errorMessage = null) {
    if (errorMessage && errorMessage.length > 0) {
      this.commonService.logError(errorMessage);
    }

    this.html.validationMessages = this.commonService.parseResponseError(responseError);
    // this.complianceDocument.triggerToRefreshComplianceDocument++;
    this.spinner.hide();
  }

  buttonClass(command: WorkflowAction) {
    if (command.CommandName.indexOf('Approve') > -1) {
      return 'primary';
    }
    switch (command.CommandName) {
      case 'ComplianceDocumentRuleUserActionSubmit':
      case 'ComplianceDocumentRuleUserActionFinalize':
      case 'ComplianceDocumentRuleUserActionApproval':
        return 'primary';
      default:
        return 'default';
    }
  }
}
