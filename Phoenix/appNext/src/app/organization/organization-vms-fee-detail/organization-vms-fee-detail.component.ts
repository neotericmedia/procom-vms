import { Component, OnInit } from '@angular/core';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { StateService } from '../../common/state/state.module';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { OrganizationApiService } from '../organization.api.service';
import { CodeValueService, CommonService, PhxConstants, CustomFieldService, ValidationExtensions, ApiService, WorkflowService } from '../../common';
import { StateActionDisplayType, StateActionButtonStyle, StateAction } from '../../common/model/state-action';
import { cloneDeep, orderBy, filter, forEach } from 'lodash';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { HashModel } from '../../common/utility/hash-model';
import { IFormGroupSetup, TFConstants, IVmsFee } from '../state/organization.interface';
import { CustomFieldErrorType } from '../../common/model';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-organization-vms-fees-detail',
  templateUrl: './organization-vms-fee-detail.component.html',
  styleUrls: ['./organization-vms-fee-detail.component.less']
})

export class OrganizationVmsFeesDetailComponent extends BaseComponentOnDestroy implements OnInit {
  organizationId: number;
  vmsFeeVersionId: number;
  vmsFeeData: any;
  routerParams: any;
  isWorkflowRunning: boolean;
  clientOrganizations: Array<any>;
  vmsFeeVersionStatuses: Array<any>;
  actionStatuses: Array<any>;
  lineOfBusiness: Array<any>;
  vmsFeeTypes: Array<any>;
  vmsItems: any;
  phxConstants: any;
  formGroupSetup: IFormGroupSetup;
  vmsForm: FormGroup<IVmsFee>;
  actionStatusType = { ToCorrect: 1, ToScheduleChange: 2 };
  validationMessages: Array<any> = [];
  stateActions: StateAction[];
  StateActionDisplayType = StateActionDisplayType;

  constructor(
    private stateService: StateService,
    private organizationApiService: OrganizationApiService,
    private codeValueService: CodeValueService,
    private customFieldService: CustomFieldService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private workflowService: WorkflowService,
    public router: Router,
    private commonService: CommonService
  ) {
    super();
    this.vmsFeeVersionStatuses = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.VmsFeeVersionStatus, true);
    this.actionStatuses = [{ id: 1, code: 'ToCorrect', text: 'To Correct' }, { id: 2, code: 'ToScheduleChange', text: 'To Schedule Change' }];
    this.lineOfBusiness = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.LineOfBusiness, true);
    this.vmsFeeTypes = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RebateType, true);
    this.phxConstants = PhxConstants;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.getListOrganizationClient1();
  }

  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState)
      .takeUntil(this.isDestroyed$)
      .subscribe((routerStateResult: IRouterState) => {
        this.routerParams = routerStateResult.params;
        if (this.routerParams.vmsFeeHeaderId && this.routerParams.vmsFeeHeaderId > 0 && this.routerParams.vmsFeeVersionId && this.routerParams.vmsFeeVersionId > 0) {
          this.vmsFeeVersionId = +this.routerParams.vmsFeeVersionId;
          this.getSingleVmsFeeHeaderByVersion();
        } else {
          this.vmsFeeData = {
            Id: 0,
            VmsFeeHeaderId: null,
            OrganizationId: null,
            Description: '',
            VmsFeeHeaderStatusId: 1,
            VmsFeeVersion: {
              Id: 0,
              LineOfBusinessId: null,
              RebateTypeId: null,
              Rate: null,
              VmsFeeVersionStatusId: 1,
              EffectiveDate: new Date(),
              SourceId: null
            },
            VmsFeeVersions: [
              {
                Id: 0,
                LineOfBusinessId: null,
                RebateTypeId: null,
                Rate: null,
                VmsFeeVersionStatusId: 1,
                EffectiveDate: new Date(),
                SourceId: null
              }
            ]
          };
          this.createForm();
          this.initStateActions();
        }
      });
  }

  getWorkflowAvailableAction() {
    this.workflowService.getAvailableActions(PhxConstants.EntityType.VmsFeeVersion, +this.vmsFeeVersionId, false).then(result => {
      this.vmsFeeData.VmsFeeVersion.WorkflowAvailableActions = result;
    });
  }

  onClickWorkflowAction(action: { WorkflowPendingTaskId: any; CommandName: any; }) {
    this.vmsFeeData.VmsFeeVersion.WorkflowAvailableActions = [];
    this.vmsFeeData.VmsFeeVersion.WorkflowPendingTaskId = action.WorkflowPendingTaskId;
    switch (action.CommandName) {
      case 'VmsFeeVersionCorrect':
        this.vmsFeeData.selectedActionId = this.actionStatusType.ToCorrect;
        break;
      case 'VmsFeeVersionScheduleChange':
        this.vmsForm.get('EffectiveDate').patchValue(null);
        this.vmsFeeData.selectedActionId = this.actionStatusType.ToScheduleChange;
        break;
      default:
        this.vmsFeeData.selectedActionId = null;
    }
  }

  getSingleVmsFeeHeaderByVersion() {
    this.isWorkflowRunning = false;
    this.organizationApiService
      .getSingleVmsFeeHeaderByVersion(this.vmsFeeVersionId)
      .takeUntil(this.isDestroyed$)
      .subscribe((data: any) => {
        this.vmsFeeData = {
          Description: data.Description,
          OrganizationDisplayName: data.OrganizationDisplayName,
          Id: data.Id,
          OrganizationId: data.OrganizationId,
          VmsFeeHeaderStatusId: data.VmsFeeHeaderStatusId,
          VmsFeeVersion: data.VmsFeeVersions.find(a => a.Id === +this.vmsFeeVersionId),
          VmsFeeVersions: orderBy(data.VmsFeeVersions, ['EffectiveDate'], ['desc'])
        };
        this.getWorkflowAvailableAction();
        this.createForm();
        this.initStateActions();
      });
  }

  createForm() {
    this.vmsForm = this.formGroupSetup.formBuilder.group<IVmsFee>({
      Id: [this.vmsFeeData.VmsFeeVersion.Id],
      OrganizationId: [this.vmsFeeData.OrganizationId, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('OrganizationId', CustomFieldErrorType.required))]],
      Description: [this.vmsFeeData.Description, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))]],
      LineOfBusinessId: [this.vmsFeeData.VmsFeeVersion.LineOfBusinessId, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('LineOfBusinessId', CustomFieldErrorType.required))]],
      RebateTypeId: [this.vmsFeeData.VmsFeeVersion.RebateTypeId, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('RebateTypeId', CustomFieldErrorType.required))]],
      Rate: [this.vmsFeeData.VmsFeeVersion.Rate, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('Rate', CustomFieldErrorType.required))]],
      EffectiveDate: [this.vmsFeeData.VmsFeeVersion.EffectiveDate, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('EffectiveDate', CustomFieldErrorType.required))]]
    });
  }

  getListOrganizationClient1() {
    this.organizationApiService
      .getListOrganizationClient1()
      .takeUntil(this.isDestroyed$)
      .subscribe((result: any) => {
        this.clientOrganizations = filter(result.Items, item => item.DisplayName);
      });
  }

  vmsFeeButtonsHandler(action: string) {
    const currentVersion = cloneDeep(this.vmsForm.value);
    delete currentVersion.Description;
    delete currentVersion.OrganizationId;
    const data = {
      Description: this.vmsForm.get('Description').value,
      Id: this.vmsFeeData.Id,
      OrganizationId: this.vmsForm.get('OrganizationId').value,
      VmsFeeHeaderStatusId: this.vmsFeeData.VmsFeeHeaderStatusId,
      VmsFeeVersion: {
        ...this.vmsFeeData.VmsFeeVersions.find(a => a.Id === +this.vmsFeeVersionId),
        ...currentVersion
      }
    };
    switch (action) {
      case 'Created':
        this.actionExecute('VmsFeeHeaderNew', data, action);
        break;
      case 'Corrected':
        this.actionExecute('VmsFeeVersionCorrect', data, action);
        break;
      case 'Schedule Changed':
        this.actionExecute('VmsFeeVersionScheduleChange', data, action);
        break;
      case 'Cancelled':
        this.getSingleVmsFeeHeaderByVersion();
        break;
      default:
        this.router.navigate(['next', 'organization', 'rebatesandfees']);
    }
  }

  actionExecute(commandName: string, data: { Description?: string; Id?: any; OrganizationId?: number; VmsFeeHeaderStatusId?: any; VmsFeeVersion: any; }, action: string) {
    this.isWorkflowRunning = true;
    this.validationMessages = [];
    data.VmsFeeVersion.EffectiveDate = moment(data.VmsFeeVersion.EffectiveDate).format('YYYY-MM-DD');
    const actionCommandBody = {
      WorkflowPendingTaskId: commandName === 'VmsFeeHeaderNew' ? -1 : data.VmsFeeVersion.WorkflowPendingTaskId,
      CommandName: commandName,
      ...data
    };
    this.apiService
      .command(commandName.toString(), actionCommandBody)
      .then(responseSuccessOnExecuteCommand => {
        if (action === 'Corrected') {
          this.commonService.logSuccess('Organization vms fee corrected');
          this.router.navigate(['next', 'organization', 'vmsfee', 'vmsFeeHeader', this.routerParams.vmsFeeHeaderId, 'vmsFeeVersion', responseSuccessOnExecuteCommand.EntityId, this.routerParams.organizationId]);
        } else if (action === 'Schedule Changed') {
          this.commonService.logSuccess('Organization vms fee schedule changed');
          this.router.navigate(['next', 'organization', 'vmsfee', 'vmsFeeHeader', this.routerParams.vmsFeeHeaderId, 'vmsFeeVersion', responseSuccessOnExecuteCommand.EntityId, this.routerParams.organizationId]);
        } else if (action === 'Created') {
          this.commonService.logSuccess('Organization vms fee created');
          this.organizationApiService
            .getSingleVmsFeeHeaderByVersion(responseSuccessOnExecuteCommand.EntityId)
            .takeUntil(this.isDestroyed$)
            .subscribe((result: any) => {
              this.router.navigate(['next', 'organization', 'vmsfee', 'vmsFeeHeader', result.Id, 'vmsFeeVersion', responseSuccessOnExecuteCommand.EntityId, result.OrganizationId]);
            });
        }
      })
      .catch(ex => {
        this.isWorkflowRunning = false;
        forEach((Object.keys(ex.ModelState)), key => {
          forEach((ex.ModelState[key] || []), val => {
            this.validationMessages.push(val);
          });
        });
        this.commonService.logError('Your Submission has ' + this.validationMessages.length + ' validation message(s)');
      });
  }

  onVersionClick(version: { Id: any; }) {
    if (
      this.vmsFeeData.VmsFeeVersion.VmsFeeVersionStatusId === PhxConstants.VmsFeeVersionStatus.New ||
      this.vmsFeeData.selectedActionId === this.actionStatusType.ToCorrect ||
      this.vmsFeeData.selectedActionId === this.actionStatusType.ToScheduleChange
    ) {
      this.commonService.logWarning('Option to change version is disabled in "Edit" mode');
    } else {
      this.router.navigate(['next', 'organization', 'vmsfee', 'vmsFeeHeader', this.routerParams.vmsFeeHeaderId, 'vmsFeeVersion', version.Id, this.routerParams.organizationId]);
    }
  }

  funcToCheckViewStatus(modelPrefix: string, fieldName: string) {
    if (this.routerParams.vmsFeeVersionId === 0 || this.routerParams.vmsFeeVersionId === '0') {
      return TFConstants.edit;
    } else if (this.isWorkflowRunning) {
      return TFConstants.view;
    } else if (this.vmsFeeData.selectedActionId === this.actionStatusType.ToCorrect) {
      if (modelPrefix === 'vmsFeeData' && fieldName === 'OrganizationId') {
        return TFConstants.view;
      }
      if (modelPrefix === 'vmsFeeData.VmsFeeVersion' && fieldName === 'LineOfBusinessId') {
        return TFConstants.view;
      }
      if (modelPrefix === 'vmsFeeData.VmsFeeVersion' && fieldName === 'EffectiveDate') {
        return TFConstants.view;
      } else {
        return TFConstants.edit;
      }
    } else if (this.vmsFeeData.selectedActionId === this.actionStatusType.ToScheduleChange) {
      if (modelPrefix === 'vmsFeeData' && fieldName === 'OrganizationId') {
        return TFConstants.view;
      }
      if (modelPrefix === 'vmsFeeData.VmsFeeVersion' && fieldName === 'LineOfBusinessId') {
        return TFConstants.view;
      }
      return TFConstants.edit;
    } else {
      return TFConstants.view;
    }
  }

  rebateChanged() {
    this.vmsForm.get('Rate').patchValue(null);
  }

  showAction() {
    return this.vmsFeeData.VmsFeeVersion.VmsFeeVersionStatusId === this.phxConstants.VmsFeeVersionStatus.New || this.vmsFeeData.selectedActionId === this.actionStatusType.ToCorrect || this.vmsFeeData.selectedActionId === this.actionStatusType.ToScheduleChange;
  }

  initStateActions() {
    this.stateActions = [
      {
        displayText: 'Cancel',
        onClick: () => this.vmsFeeButtonsHandler('CancelNew'),
        hiddenFn: () => this.vmsFeeData.VmsFeeVersion.VmsFeeVersionStatusId !== this.phxConstants.VmsFeeVersionStatus.New
      },
      {
        displayText: 'Create',
        onClick: () => this.vmsFeeButtonsHandler('Created'),
        hiddenFn: () => this.vmsFeeData.VmsFeeVersion.VmsFeeVersionStatusId !== this.phxConstants.VmsFeeVersionStatus.New,
        disabledFn: () => this.vmsForm.invalid,
        style: StateActionButtonStyle.PRIMARY
      },
      {
        displayText: 'Cancel',
        onClick: () => this.vmsFeeButtonsHandler('Cancelled'),
        hiddenFn: () => !(this.vmsFeeData.selectedActionId === this.actionStatusType.ToCorrect || this.vmsFeeData.selectedActionId === this.actionStatusType.ToScheduleChange)
      },
      {
        displayText: 'Correct',
        onClick: () => this.vmsFeeButtonsHandler('Corrected'),
        hiddenFn: () => this.vmsFeeData.selectedActionId !== this.actionStatusType.ToCorrect,
        disabledFn: () => this.vmsForm.invalid,
        style: StateActionButtonStyle.PRIMARY
      },
      {
        displayText: 'Schedule Change',
        onClick: () => this.vmsFeeButtonsHandler('Schedule Changed'),
        hiddenFn: () => this.vmsFeeData.selectedActionId !== this.actionStatusType.ToScheduleChange,
        disabledFn: () => this.vmsForm.invalid,
        style: StateActionButtonStyle.PRIMARY
      }
    ];
  }
}

