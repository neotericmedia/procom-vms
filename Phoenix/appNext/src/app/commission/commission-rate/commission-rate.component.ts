// angular
import { Component, ViewChild, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// common
import { NavigationService } from './../../common/services/navigation.service';
import { CustomFieldService, PhxConstants, CommonService } from '../../common';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { NavigationBarItem, WorkflowAction, StateAction, StateActionDisplayType } from '../../common/model';
import { CodeValueService } from '../../common/services/code-value.service';
import { HashModel } from '../../common/utility/hash-model';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
// commission rate
import { IFormGroupSetup, ICommissionRate, IRoot, CommissionRateAction, ICommissionRateVersion } from '../state';
import { CommissionRateObservableService } from '../state/commission-rate.observable.service';
import { CommissionRateTabDetailsComponent } from '../commission-rate-tab-details/commission-rate-tab-details.component';
import { CommissionRateWorkflowComponent } from '../commission-rate-workflow/commission-rate-workflow.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommissionService } from '../commission.service';
import { some } from 'lodash';


const Command = PhxConstants.CommissionRateVersionStateActionCommand;
const StateAction = PhxConstants.StateAction;
const EntityType = PhxConstants.EntityType;

@Component({
  selector: 'app-commission-rate',
  templateUrl: './commission-rate.component.html'
})
export class CommissionRateComponent extends BaseComponentActionContainer implements OnInit, OnChanges {
  @ViewChild('workFlow')
  commissionRateWorkflow: CommissionRateWorkflowComponent;
  commmissionVersionId: number;
  commissionVersion: ICommissionRateVersion;
  commissionVersionDetails: Array<any>;
  commissionId: number;
  commissionRateRestrictionsValidionMessage: string;
  phxConstants: typeof PhxConstants = null;
  formGroupSetup: IFormGroupSetup;
  rootFormGroup: FormGroup<IRoot>;
  commissionRate: ICommissionRate;

  stateActions: StateAction[];
  selectedStateAction: StateAction;
  ActionDisplayType = StateActionDisplayType;

  html: {
    navigationBarContent: Array<NavigationBarItem>;
    phxConstants: any;
    validationMessages: any;
    codeValueLists: {};
    commonLists: {};
    list: {
      CommissionRateVersionStatus: Array<any>;
    };
    access: {};
  } = {
      navigationBarContent: null,
      phxConstants: PhxConstants,
      validationMessages: [],
      codeValueLists: {},
      commonLists: {},
      list: {
        CommissionRateVersionStatus: []
      },
      access: {}
    };
  actionButton = {
    show: {
      transactionSave: false,
      transactionSubmit: false,
      TransactionHeaderManualDiscard: false,
      transactionLineAdd: false,
      transactionLineRemove: false,
      transactionPOAdd: false,
      transactionPOLink: false,
      transactionPOChange: false,
      transactionPORemove: false,
      transactionPoNavigation: false
    }
  };
  routerState: any = null;
  routerParams: any;
  codeValueGroups: any;
  readOnlyStorage: any;
  filteredVersionDetails: ICommissionRateVersion;
  customStatusId: number = 0;
  constructor(
    private navigationService: NavigationService,
    private commissionRateObservableService: CommissionRateObservableService,
    private customFieldService: CustomFieldService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private codeValueService: CodeValueService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private commissionService: CommissionService
  ) {
    super();
    console.log(this.constructor.name + '.constructor');
    this.navigationService.setTitle('commission-rate-viewedit');
    this.html.phxConstants = PhxConstants;
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.phxConstants = PhxConstants;
  }

  ngOnChanges() {
    this.customStatusId = 0;
  }

  ngOnInit(): void {
    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        console.log(this.constructor.name + '.routerStateResult.location: ' + routerStateResult.location);
        this.routerParams = routerStateResult.params;
        this.commmissionVersionId = this.routerParams.commissionRateVersionId || 0;
        if (routerStateResult.location.includes(PhxConstants.CommissionRateNavigationName.detail)) {
          this.setRouterState(routerStateResult, PhxConstants.CommissionRateNavigationName.detail);
          return this.routerParams.commissionRateVersionId ? this.commissionRateObservableService.commissionRate$(this, this.routerParams) : Observable.of(null);
        } else if (routerStateResult.location.includes(PhxConstants.CommissionRateNavigationName.workorders)) {
          this.setRouterState(routerStateResult, PhxConstants.CommissionRateNavigationName.workorders);
          return this.routerParams.commissionRateVersionId ? this.commissionRateObservableService.commissionRate$(this, this.routerParams) : Observable.of(null);
        } else if (this.routerParams.commissionUserProfileId > 0 && this.routerParams.commissionRoleId > 0 && this.routerParams.commissionRateTypeId > 0) {
          this.routerState = {};
          this.routerParams.commissionRateVersionId = 0;
          this.stateService.dispatchOnAction(new CommissionRateAction.CommissionRateDelete(this.routerParams.commissionRateVersionId));
          return this.commissionRateObservableService.commissionRate$(this, this.routerParams);
        }
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((commissionRate: any) => {
        if (commissionRate) {
          this.selectedStateAction = null;
          this.commissionRate = commissionRate;
          this.commissionRateRestrictionsToValid();
          this.html.list.CommissionRateVersionStatus = this.codeValueService.getCodeValues(this.codeValueGroups.CommissionRateVersionStatus, true);
          this.commissionId = this.routerParams.commissionRateVersionId || 0;
          const commissionVersionDetails = this.commissionRate.CommissionRateVersions.find(a => a.Id === +this.commmissionVersionId);
          this.commissionVersion = commissionVersionDetails;
          this.readOnlyStorage = this.commissionRate.ReadOnlyStorage = {
            IsDebugMode: true,
            IsEditable:
              commissionVersionDetails.customStatusId === PhxConstants.commissionCustomStatusType.ToScheduleChange ||
              commissionVersionDetails.customStatusId === PhxConstants.commissionCustomStatusType.ToCorrect ||
              commissionRate.CommissionRateHeaderStatusId === PhxConstants.CommissionRateHeaderStatus.New,
            AccessActions: null
          };
          this.html.navigationBarContent = this.navigationBarContentSetup();
          this.formBuilderGroupSetup(this.commissionRate);
          this.filteredVersionDetails = this.commissionRate.CommissionRateVersions.find(item => item.Id === +this.commmissionVersionId);
          this.customStatusId = this.filteredVersionDetails.customStatusId;
          this.navigationService.setTitle('commission-rate-viewedit', [`${this.commissionRate.CommissionUserProfileFirstName} ${this.commissionRate.CommissionUserProfileLastName}`]);
          this._initStateActions(commissionRate);
        }
      });
  }

  commissionRateRestrictionsToValid() {
    this.commissionRateRestrictionsValidionMessage = null;
    if (+this.routerParams.commissionRoleId === this.phxConstants.CommissionRole.NationalAccountsRole) {
      if (!this.commissionRateRestrictionTypeExists(PhxConstants.CommissionRateRestrictionType.ClientOrganization)) {
        this.commissionRateRestrictionsValidionMessage = 'Client restriction must be selected for a "National Accounts Role"';
      }
    } else if (+this.routerParams.commissionRoleId === PhxConstants.CommissionRole.BranchManagerRole) {
      if (!this.commissionRateRestrictionTypeExists(PhxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1)) {
        this.commissionRateRestrictionsValidionMessage = 'Branch restriction must be selected for a "Branch Manager Role"';
      }
    }
  }

  commissionRateRestrictionTypeExists(commissionRateRestrictionTypeId) {
    return some(this.commissionRate.CommissionRateRestrictions, (restriction) => {
      return restriction.CommissionRateRestrictionTypeId === commissionRateRestrictionTypeId;
    });
  }

  setRouterState(routerStateResult: IRouterState, WorkorderNavigationName: string) {
    this.routerState = {
      Id: routerStateResult.params.workOrderId,
      RouterPath: WorkorderNavigationName,
      Url: routerStateResult.location
    };
  }

  navigationBarContentSetup(): Array<NavigationBarItem> {
    const path = `/next/commission/rate/${this.routerParams.commissionRateHeaderId}/${this.routerParams.commissionRateVersionId}/`;
    return [
      {
        Id: 1,
        IsDefault: true,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.CommissionRateNavigationName.detail,
        Path: path + PhxConstants.TransactionNavigationName.detail,
        DisplayText: 'Details'
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.CommissionRateNavigationName.workorders,
        Path: path + PhxConstants.CommissionRateNavigationName.workorders,
        DisplayText: 'Work Orders'
      }
    ];
  }

  onClickWorkflowAction(action: StateAction, commissionRate: ICommissionRate) {
    this.commissionRateWorkflow.workflowActionOnClick(action, commissionRate, this.commmissionVersionId);
    this.selectedStateAction = action;
  }

  formBuilderGroupSetup(commissionRate: ICommissionRate) {
    this.rootFormGroup = this.formGroupSetup.formBuilder.group<IRoot>({
      Id: [commissionRate.Id],
      TabDetails: CommissionRateTabDetailsComponent.formBuilderGroupSetup(this.formGroupSetup, commissionRate, this.routerParams.commissionRateVersionId)
    });
  }

  onOutputEvent() {
    const commissionRate = CommissionRateTabDetailsComponent.formGroupToPartial(this.commissionRate, <any>this.rootFormGroup.controls.TabDetails, this.routerParams.commissionRateVersionId);
    this.stateService.dispatchOnAction(
      new CommissionRateAction.CommissionRateUpdate(this.routerParams.commissionRateVersionId, {
        ...commissionRate
      })
    );
  }

  actionClick(actionName) {
    this.commissionRateWorkflow.customButtonOnClick(this.filteredVersionDetails, actionName, this.commissionRate);
  }

  onVersionClick(version) {
    if (
      this.filteredVersionDetails.CommissionRateVersionStatusId === this.html.phxConstants.CommissionRateVersionStatus.New ||
      this.customStatusId === this.html.phxConstants.commissionCustomStatusType.ToCorrect ||
      this.customStatusId === this.html.phxConstants.commissionCustomStatusType.ToScheduleChange ||
      this.customStatusId === this.html.phxConstants.commissionCustomStatusType.ToManageRestrictions
    ) {
      this.commonService.logWarning('Option to change version is disabled in "Edit" mode');
    } else {
      this.routerParams.versionId = Number(version.Id);
      this.navigationTo();
    }
  }

  navigationTo() {
    const navigateCommand = ['/next/commission/rate', this.routerParams.commissionRateHeaderId, this.routerParams.versionId, 'detail'];
    const navigationExtras = { relativeTo: this.activatedRoute };
    this.router
      .navigate(navigateCommand, navigationExtras)
      .catch(err => {
        console.error(this.constructor.name + '.error in router.navigate: ', navigateCommand, navigationExtras, err);
      })
      .then(r => {
        console.log(this.constructor.name + '.success: ', navigateCommand, navigationExtras);
      });
  }

  navToSearch() {
    const navigateToDetailPage = (tabNavigationName: PhxConstants.CommissionRateNavigationName) => {
      const navigatePath = `/next/commission/${tabNavigationName}`;
      this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-organization: error navigating to  ${tabNavigationName}`, err);
      });
    };
    navigateToDetailPage('search');
  }


  _initStateActions(commissionRate: any) {
    const self = this;
    self.stateActions = [
      {
        displayText: 'Correction',
        commandName: Command.CommissionRateVersionCorrect,
        actionId: StateAction.CommissionRateVersionEdit,
        onClick: function (action, componentOption, actionOption) {
          self.onClickWorkflowAction(action, commissionRate);
        }
      },
      {
        displayText: 'Schedule a Change',
        commandName: Command.CommissionRateVersionScheduleChange,
        actionId: StateAction.CommissionRateVersionScheduleChange,
        onClick: function (action, componentOption, actionOption) {
          self.onClickWorkflowAction(action, commissionRate);
        }
      },
      {
        displayText: 'Manage Restriction',
        commandName: Command.CommissionRateVersionManageRestrictions,
        actionId: StateAction.CommissionRateHeaderManageRestriction,
        onClick: function (action, componentOption, actionOption) {
          self.onClickWorkflowAction(action, commissionRate);
        }
      },
      {
        displayText: 'Delete',
        commandName: Command.CommissionRateVersionDelete,
        actionId: StateAction.CommissionRateHeaderDelete,
        onClick: function (action, componentOption, actionOption) {
          self.onClickWorkflowAction(action, commissionRate);
        }
      },
      /*{ displayText: 'Deactivate',
        commandName: Command.CommissionRateHeaderDeactivate,
        actionId: StateAction.CommissionRateHeaderDeactivate,
        onClick: (action, componentOption, actionOption) => {
          // self.onClickWorkflowAction(action, commissionRate);
          this.commissionRateWorkflow.customButtonOnClick(this.filteredVersionDetails, action.commandName, this.commissionRate);
        }
      }*/
    ];
}

  public getValidationMessages(messages) {
  if (messages) {
    this.html.validationMessages = messages;
  } else {
    this.html.validationMessages = [];
  }
}

}
