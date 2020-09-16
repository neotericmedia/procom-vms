// angular
import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
// common
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { NavigationService } from './../../common/services/navigation.service';
import { CustomFieldService, PhxConstants, CommonService, CodeValueService } from '../../common';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { NavigationBarItem, FunctionalRole, StateAction, StateActionButtonStyle, StateActionDisplayType } from '../../common/model';
// organization
import { IOrganization, IVersion, OrganizationAction } from '../state/index';
import { OrganizationWorkflowComponent } from '../organization-workflow/organization-workflow.component';
import { OrganizationObservableService } from '../state/organization.observable.service';
import { OrganizationTabDetailComponent } from '../organization-tab-detail/organization-tab-detail.component';
import { OrganizationTabRolesComponent } from '../organization-tab-roles/organization-tab-roles.component';
import { IReadOnlyStorage, IOrganizationRouterState, IRoot, IFormGroupSetup, IOrganizationCollaborators } from './../state/organization.interface';
import { HashModel } from '../../common/utility/hash-model';
import { PhxWorkflowButtonsComponent } from '../../common/components/phx-workflow-buttons/phx-workflow-buttons.component';
import { PhxNavigationBarComponent } from '../../common/components/phx-navigation-bar/phx-navigation-bar.component';
import { OrganizationApiService } from '../organization.api.service';
import { OrganizationCollaboratorsComponent } from '../organization-collaborators/organization-collaborators.component';
import { AuthService } from '../../common/services/auth.service';
import { PhxNoteHeaderComponent } from '../../common/components/phx-note-header/phx-note-header.component';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.less']
})
export class OrganizationComponent extends BaseComponentActionContainer implements OnInit {
  @ViewChild(OrganizationWorkflowComponent) organizationWorkflow: OrganizationWorkflowComponent;

  @ViewChild('buttonActionButtonsTop') buttonActionButtonsTop: PhxWorkflowButtonsComponent;
  @ViewChild('buttonActionButtons') buttonActionButtons: PhxWorkflowButtonsComponent;

  @ViewChild('navigationBar') navigationBar: PhxNavigationBarComponent;
  @ViewChild(PhxNoteHeaderComponent) notesHeader: PhxNoteHeaderComponent;

  organization: IOrganization = null;
  readOnlyStorage: IReadOnlyStorage = null;
  stateActions: StateAction[];
  rootFormGroup: FormGroup<IRoot>;

  routerState: IOrganizationRouterState = null;
  isOrgDetails: boolean = true;
  currentOrganizationId: number;

  html: {
    navigationBarContent: Array<NavigationBarItem>;
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    validationMessages: any;
    versionsOrdered: Array<IVersion>;
    codeValueLists: {};
    functionalRoles: FunctionalRole[];
    commonLists: {};
    access: {};
    modifyInternalRoleBankAccount: boolean;
  } = {
      navigationBarContent: null,
      codeValueGroups: null,
      phxConstants: null,
      functionalRoles: [],
      validationMessages: null,
      versionsOrdered: null,
      codeValueLists: {},
      commonLists: {},
      access: {},
      modifyInternalRoleBankAccount: false
    };

  formGroupSetup: IFormGroupSetup;

  constructor(
    private navigationService: NavigationService,
    private organizationObservableService: OrganizationObservableService,
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private orgApiService: OrganizationApiService,
    private authService: AuthService
  ) {
    super();
    console.log(this.constructor.name + '.constructor');
    this.html.phxConstants = PhxConstants;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };

    this.authService.getCurrentProfile().subscribe(data => {
      this.html.functionalRoles = data.FunctionalRoles;
    });
  }

  ngOnInit() {
    this.initStateActions();
    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.details)) {
          this.routerState = {
            organizationId: routerStateResult.params.organizationId,
            routerPath: PhxConstants.OrganizationNavigationName.details,
            url: routerStateResult.location
          };
        } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.roles)) {
          this.routerState = {
            organizationId: routerStateResult.params.organizationId,
            routerPath: PhxConstants.OrganizationNavigationName.roles,
            roleType: null,
            roleId: null,
            url: routerStateResult.location
          };
          if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.roleClient)) {
            this.routerState.roleType = PhxConstants.OrganizationRoleType.Client;
            this.routerState.roleId = +routerStateResult.params.roleId;
          } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.roleIndependentContractor)) {
            this.routerState.roleType = PhxConstants.OrganizationRoleType.IndependentContractor;
            this.routerState.roleId = +routerStateResult.params.roleId;
          } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.roleInternal)) {
            this.routerState.roleType = PhxConstants.OrganizationRoleType.Internal;
            this.routerState.roleId = +routerStateResult.params.roleId;
          } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.roleLimitedLiabilityCompany)) {
            this.routerState.roleType = PhxConstants.OrganizationRoleType.LimitedLiabilityCompany;
            this.routerState.roleId = +routerStateResult.params.roleId;
          } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.roleSubVendor)) {
            this.routerState.roleType = PhxConstants.OrganizationRoleType.SubVendor;
            this.routerState.roleId = +routerStateResult.params.roleId;
          }
        } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.contacts)) {
          this.routerState = {
            organizationId: routerStateResult.params.organizationId,
            routerPath: PhxConstants.OrganizationNavigationName.contacts,
            url: routerStateResult.location
          };
        } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.collaborators)) {
          this.routerState = {
            organizationId: routerStateResult.params.organizationId,
            routerPath: PhxConstants.OrganizationNavigationName.collaborators,
            url: routerStateResult.location
          };
        } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.history)) {
          this.routerState = {
            organizationId: routerStateResult.params.organizationId,
            routerPath: PhxConstants.OrganizationNavigationName.history,
            url: routerStateResult.location
          };
        } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.advances)) {
          this.routerState = {
            organizationId: routerStateResult.params.organizationId,
            routerPath: PhxConstants.OrganizationNavigationName.advances,
            url: routerStateResult.location
          };
        } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.notes)) {
          this.routerState = {
            organizationId: routerStateResult.params.organizationId,
            routerPath: PhxConstants.OrganizationNavigationName.notes,
            url: routerStateResult.location
          };
        } else if (routerStateResult.location.includes(PhxConstants.OrganizationNavigationName.garnishees)) {
          this.routerState = {
            organizationId: routerStateResult.params.organizationId,
            routerPath: PhxConstants.OrganizationNavigationName.garnishees,
            url: routerStateResult.location
          };
        } else {
          this.routerState = { organizationId: null, routerPath: null, roleType: null, roleId: null, url: null };
        }

        return this.routerState.organizationId ? this.organizationObservableService.organization$(this, this.routerState.organizationId) : Observable.of(null);
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((organization: IOrganization) => {
        const organizationId = organization ? organization.Id : null;
        if (organizationId) {
          !organization.LegalName
            ? this.navigationService.setTitle('organization-new')
            : this.navigationService.setTitle('organization-edit', [organization.LegalName]);

          if (organizationId !== this.currentOrganizationId) {
            this.loadOrganizationOtherVersion(organization, false);
          }
          this.onInitOrganization(organization);
        }
        this.currentOrganizationId = organizationId;
      });
  }

  onInitOrganization(organization: IOrganization) {
    console.log(this.constructor.name + '.onInitOrganization()');
    this.readOnlyStorage = organization.ReadOnlyStorage;
    this.formBuilderGroupSetup(this.formGroupSetup, organization, this.organizationObservableService);

    this.html.versionsOrdered = organization.Versions.sort((a, b) => {
      if (a.Id < b.Id) {
        return -1;
      }
      if (a.Id > b.Id) {
        return 1;
      }
      return 0;
    });

    setTimeout(() => {
      this.html.navigationBarContent = this.navigationBarContentSetup(
        organization.Id,
        this.readOnlyStorage,
        this.rootFormGroup.controls.TabDetails.valid,
        this.rootFormGroup.controls.TabRoles.valid,
        this.rootFormGroup.controls.TabCollaborators.valid
      );

      if (this.buttonActionButtons) {
        this.buttonActionButtons.repaintActionButtons();
      }

      if (this.navigationBar) {
        this.navigationBar.repaint();
      }
    });
    this.organization = organization;

    this.html.modifyInternalRoleBankAccount = this.readOnlyStorage.IsEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationInternalRoleAddBankAccount);
  }

  getNavigationBarContentSetup() {
    return [
      ...this.navigationBarContentSetup(this.routerState.organizationId, this.readOnlyStorage, this.rootFormGroup.controls.TabDetails.valid, this.rootFormGroup.controls.TabRoles.valid, this.rootFormGroup.controls.TabCollaborators.valid)
    ];
  }

  loadOrganizationOtherVersion(organization: IOrganization, force = false) {
    const versionNotCurrent: IVersion = organization.Versions.find(version => version.Id !== organization.Id);
    if (versionNotCurrent) {
      this.organizationObservableService.organization$(this, versionNotCurrent.Id, force).subscribe(organizationOther => { });
    } else if (!versionNotCurrent && force) {
      this.organizationObservableService.organization$(this, organization.Id, force).subscribe(organizationOther => { });
    }
  }

  public get orgWorkflowActions() {
    const actions = this.organization.WorkflowAvailableActions;
    const submitCommand = actions.find(x => x.Name === 'Submit');
    if (submitCommand) {
      submitCommand.checkValidation = this.isRolesTabValid();
    }

    return actions;
  }

  public isRolesTabValid(): boolean {
    return (
      this.rootFormGroup.controls.TabRoles.valid &&
      (this.rootFormGroup.value.TabRoles.OrganizationClientRoles.length > 0 ||
        this.rootFormGroup.value.TabRoles.OrganizationIndependentContractorRoles.length > 0 ||
        this.rootFormGroup.value.TabRoles.OrganizationInternalRoles.length > 0 ||
        this.rootFormGroup.value.TabRoles.OrganizationLimitedLiabilityCompanyRoles.length > 0 ||
        this.rootFormGroup.value.TabRoles.OrganizationSubVendorRoles.length > 0)
    );
  }

  onClickWorkflowAction(action: any, organization: IOrganization) {
    if (action.commandName === PhxConstants.CommandNamesSupportedByUi.BaseOrganizationIdCommand.OrganizationDiscardChanges) {
      this.stateService.dispatchOnAction(new OrganizationAction.OrganizationDelete(organization.Id));
      return;
    }

    this.onOutputEvent();
    this.organizationWorkflow.onClickWorkflowAction(action, {
      ...this.organization,
      ...OrganizationTabDetailComponent.formGroupToPartial(this.rootFormGroup),
      ...OrganizationTabRolesComponent.formGroupToPartial(this.rootFormGroup),
      ...OrganizationCollaboratorsComponent.formGroupToPartial(<FormGroup<IOrganizationCollaborators>>this.rootFormGroup.controls.TabCollaborators)
    });
  }

  onCommandExecutedSuccessfully() {
    // this.buttonActionButtons.repaintActionButtons();
    this.onInitOrganization(this.organization);
    this.navigationBar.repaint();
  }

  setCssClassForActionButton(action: any) {
    return action.commandName === 'OrganizationSubmit' || action.commandName === 'OrganizationFinalize' || action.commandName === 'OrganizationApprovalApprove' ? 'primary' : 'default';
  }

  onNotesCountUpdated($event) {
    this.notesHeader.getComments();
  }

  onVersionClick(version) {
    if (version.Id !== this.organization.Id) {
      const tabNavigationName: PhxConstants.OrganizationNavigationName =
        this.routerState.routerPath === PhxConstants.OrganizationNavigationName.advances || this.routerState.routerPath === PhxConstants.OrganizationNavigationName.garnishees
          ? PhxConstants.OrganizationNavigationName.details
          : this.routerState.routerPath;
      const navigateCommand = ['/next/organization', version.Id, tabNavigationName];
      const navigationExtras = { relativeTo: this.activatedRoute };

      this.router
        .navigate(navigateCommand, navigationExtras)
        .catch(err => {
          console.error(this.constructor.name + '.error in router.navigate: ', navigateCommand, navigationExtras, err);
        })
        .then(r => {
          console.log(this.constructor.name + '.onVersionClick', version, navigateCommand, navigationExtras);
        });
    }
  }

  navigationBarContentSetup(organizationId: number, readOnlyStorage: IReadOnlyStorage, isValidTabDetails: boolean, isValidTabRoles: boolean, isValidTabCollaborators): Array<NavigationBarItem> {
    return [
      ...[
        {
          Id: 1,
          IsDefault: true,
          IsHidden: false,
          Valid: isValidTabDetails,
          Name: PhxConstants.OrganizationNavigationName.details,
          Path: `/next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.details,
          DisplayText: 'Details'
          // , Icon: 'fontello-icon-doc-7',
        },
        {
          Id: 2,
          IsDefault: false,
          IsHidden: false,
          Valid: this.isRolesTabValid(),
          Name: PhxConstants.OrganizationNavigationName.roles,
          Path: `/next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.roles,
          DisplayText: 'Roles'
          //  , Icon: 'fontello-icon-network'
        },
        {
          Id: 3,
          IsDefault: false,
          IsHidden: false,
          Valid: true,
          Name: PhxConstants.OrganizationNavigationName.contacts,
          Path: `/next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.contacts,
          DisplayText: 'Contacts'
          // , Icon: 'fontello-icon-contacts'
        },
        {
          Id: 7,
          IsDefault: false,
          IsHidden: false,
          Valid: isValidTabCollaborators,
          Name: PhxConstants.OrganizationNavigationName.collaborators,
          Path: `/next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.collaborators,
          DisplayText: 'Collaborators'
          // , Icon: 'fontello-icon-hammer'
        },
        {
          Id: 8,
          IsDefault: false,
          IsHidden: !this.organization.IsOriginal,
          Valid: true,
          Name: PhxConstants.OrganizationNavigationName.notes,
          Path: `/next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.notes,
          DisplayText: 'Notes'
          //  , Icon: 'fontello-icon-th-4'
        },
        {
          Id: 4,
          IsDefault: false,
          IsHidden: false,
          Valid: true,
          Name: PhxConstants.OrganizationNavigationName.history,
          Path: `/next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.history,
          DisplayText: 'History'
          //  , Icon: 'fontello-icon-th-4'
        },
        {
          Id: 5,
          IsDefault: false,
          IsHidden: !(this.organization.IsOriginalAndStatusIsAtiveOrPendingChange && (this.organization.IsOrganizationIndependentContractorRole || this.organization.IsOrganizationSubVendorRole)),
          Valid: true,
          Name: PhxConstants.OrganizationNavigationName.advances,
          Path: `/next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.advances,
          DisplayText: 'Advances',
          BadgeCount: this.organization.ActiveAdvancesCount
          // , Icon: 'fontello-icon-money'
        },
        {
          Id: 6,
          IsDefault: false,
          IsHidden: !(this.organization.IsOriginalAndStatusIsAtiveOrPendingChange && this.organization.IsOrganizationIndependentContractorRole),
          Valid: true,
          Name: PhxConstants.OrganizationNavigationName.garnishees,
          Path: `/next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.garnishees,
          DisplayText: 'Garnishees',
          BadgeCount: this.organization.ActiveGarnisheesCount
          // , Icon: 'fontello-icon-hammer'
        }
      ]
    ];
  }

  onNotesHeaderClicked($event) {
    const navigatePath = `/next/organization/${this.organization.Id}/${this.html.phxConstants.OrganizationNavigationName.notes}`;

    this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
      console.error(`app-organization: error navigating to ${this.organization.Id} , ${this.html.phxConstants.OrganizationNavigationName.notes}`, err);
    });
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, organization: IOrganization, organizationObservableService: OrganizationObservableService) {
    this.rootFormGroup = formGroupSetup.formBuilder.group<IRoot>({
      OrganizationId: [organization.Id],
      TabDetails: OrganizationTabDetailComponent.formBuilderGroupSetup(formGroupSetup, organization, organizationObservableService),
      TabRoles: OrganizationTabRolesComponent.formBuilderGroupSetup(formGroupSetup, organization, this.codeValueService, this.commonService.CodeValueGroups, this.html.modifyInternalRoleBankAccount),
      TabCollaborators: OrganizationCollaboratorsComponent.formBuilderGroupSetup(formGroupSetup, organization)
    });

    if (organization.OrganizationStatusId === this.html.phxConstants.OrganizationStatus.Active || organization.OrganizationStatusId === this.html.phxConstants.OrganizationStatus.PendingChange) {
      // this.rootFormGroup.controls.TabDetails.get('TabDetailsDetail').get('Code').clearAsyncValidators();
      // this.rootFormGroup.controls.TabDetails.get('TabDetailsDetail').get('LegalName').clearAsyncValidators();
      // this.rootFormGroup.controls.TabDetails.get('TabDetailsDetail').get('LegalName').setErrors(null);
      // this.rootFormGroup.controls.TabDetails.get('TabDetailsDetail').get('Code').setErrors(null);
      // this.rootFormGroup.controls.TabDetails.get('TabDetailsDetail').updateValueAndValidity();
      // console.log('TabDetailsDetail: ' + this.rootFormGroup.controls.TabDetails.get('TabDetailsDetail').status);
    }
  }

  onOutputEvent() {
    this.organization = {
      ...this.organization,
      ...OrganizationTabDetailComponent.formGroupToPartial(this.rootFormGroup),
      ...OrganizationTabRolesComponent.formGroupToPartial(this.rootFormGroup),
      ...OrganizationCollaboratorsComponent.formGroupToPartial(<FormGroup<IOrganizationCollaborators>>this.rootFormGroup.controls.TabCollaborators)
    };

    // const applyChanges = <S, K extends keyof S>(state: S, changes: Pick<S, K>): S =>
    //   Object.assign({}, state, changes);
    this.stateService.dispatchOnAction(
      new OrganizationAction.OrganizationUpdate({
        ...this.organization,
        ...OrganizationTabDetailComponent.formGroupToPartial(this.rootFormGroup),
        ...OrganizationTabRolesComponent.formGroupToPartial(this.rootFormGroup),
        ...OrganizationCollaboratorsComponent.formGroupToPartial(<FormGroup<IOrganizationCollaborators>>this.rootFormGroup.controls.TabCollaborators)
      })
    );

    // this.buttonActionButtons.repaintActionButtons();
    // this.buttonActionButtonsTop.repaintActionButtons();
  }

  onCountRefreshEvent() {
    this.orgApiService.refreshActiveAdvancesAndActiveGarnisheesCount(this.organization.Id).subscribe((response: any) => {
      this.organization.ActiveAdvancesCount = response.ActiveAdvancesCount;
      this.organization.ActiveGarnisheesCount = response.ActiveGarnisheesCount;
      this.onOutputEvent();
    });
  }

  initStateActions() {
    this.stateActions = [
      {
        // Org Save
        actionId: PhxConstants.StateAction.OrganizationSave,
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Approve
        actionId: PhxConstants.StateAction.OrganizationApprove,
        style: StateActionButtonStyle.PRIMARY,
        disabledFn: (action, componentOption) => !(this.rootFormGroup.valid && this.isRolesTabValid()),
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Decline
        actionId: PhxConstants.StateAction.OrganizationDecline,
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Discard
        actionId: PhxConstants.StateAction.OrganizationDiscard,
        hiddenFn: (action, componentOption) => componentOption.displayType !== StateActionDisplayType.DROPDOWN,
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Edit
        actionId: PhxConstants.StateAction.OrganizationEditActive,
        hiddenFn: (action, componentOption) => {
          /*
            Business logic on top of "Org Edit" backend access restriction:
            If you don't belong to any of the unconditionalRoles,
            you can only edit if the organization has SubVendorRole, LimitedLiabilityCompanyRole, or IndependentContractorRole.
          */
          const unconditionalRoles = [
            PhxConstants.FunctionalRole.BackOffice,
            PhxConstants.FunctionalRole.Finance,
            PhxConstants.FunctionalRole.SystemAdministrator,
            PhxConstants.FunctionalRole.Controller,
            PhxConstants.FunctionalRole.BackOfficeARAP,
            PhxConstants.FunctionalRole.AccountsReceivable
          ];
          const hasUnconditionalRoleAccess = this.html.functionalRoles ? this.html.functionalRoles.some(r => unconditionalRoles.includes(r.FunctionalRoleId)) : false;
          const hasSubVendorRoles = this.organization && this.organization.OrganizationSubVendorRoles && this.organization.OrganizationSubVendorRoles.length;
          const hasLimitedLiabilityCompanyRoles = this.organization && this.organization.OrganizationLimitedLiabilityCompanyRoles && this.organization.OrganizationLimitedLiabilityCompanyRoles.length;
          const hasIndependentContractorRoles = this.organization && this.organization.OrganizationIndependentContractorRoles && this.organization.OrganizationIndependentContractorRoles.length;
          return !(hasUnconditionalRoleAccess || (hasSubVendorRoles || hasLimitedLiabilityCompanyRoles || hasIndependentContractorRoles));
        },
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Finalize
        actionId: PhxConstants.StateAction.OrganizationFinalizeComplianceDraft,
        style: StateActionButtonStyle.PRIMARY,
        disabledFn: (action, componentOption) => !(this.rootFormGroup.valid && this.isRolesTabValid()),
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Recall
        actionId: PhxConstants.StateAction.OrganizationRecall,
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Recall To Compliance
        actionId: PhxConstants.StateAction.OrganizationRecallToCompliance,
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Submit
        actionId: PhxConstants.StateAction.OrganizationSubmit,
        style: StateActionButtonStyle.PRIMARY,
        disabledFn: (action, componentOption) => !(this.rootFormGroup.valid && this.isRolesTabValid()),
        onClick: (action, componentOption, actionOption) => this.onClickWorkflowAction(action, this.organization)
      },
      {
        // Org Discard Changes
        displayText: 'Cancel',
        hiddenFn: (action, componentOption) => {
          return !(
            this.organization &&
            this.organization.AvailableStateActions &&
            this.organization.AvailableStateActions.includes(PhxConstants.StateAction.OrganizationSave) &&
            (this.organization.OrganizationStatusId === PhxConstants.OrganizationStatus.Draft ||
              this.organization.OrganizationStatusId === PhxConstants.OrganizationStatus.Recalled ||
              this.organization.OrganizationStatusId === PhxConstants.OrganizationStatus.Declined ||
              this.organization.OrganizationStatusId === PhxConstants.OrganizationStatus.ComplianceDraft ||
              this.organization.OrganizationStatusId === PhxConstants.OrganizationStatus.RecalledCompliance)
          );
        },
        onClick: (action, componentOption, actionOption) => {
          action.commandName = 'OrganizationDiscardChanges';
          this.onClickWorkflowAction(action, this.organization);
        }
      }
    ];
  }
}
