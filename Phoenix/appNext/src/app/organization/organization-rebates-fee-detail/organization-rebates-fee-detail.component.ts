import { Component, OnInit } from '@angular/core';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { StateService } from '../../common/state/state.module';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { OrganizationApiService } from '../organization.api.service';
import { CodeValueService, CommonService, PhxConstants, CustomFieldService, ValidationExtensions, ApiService, WorkflowService } from '../../common';
import { cloneDeep, orderBy, filter, forEach } from 'lodash';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { HashModel } from '../../common/utility/hash-model';
import { IFormGroupSetup, TFConstants, IRebateFee } from '../state/organization.interface';
import { StateActionDisplayType, StateActionButtonStyle, StateAction } from '../../common/model/state-action';
import { CustomFieldErrorType } from '../../common/model';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-organization-rebates-fees-detail',
  templateUrl: './organization-rebates-fee-detail.component.html',
  styleUrls: ['./organization-rebates-fee-detail.component.less']
})

export class OrganizationRebatesFeesDetailComponent extends BaseComponentOnDestroy implements OnInit {
  organizationId: number;
  rebateVersionId: number;
  rebateFeeData: any;
  routerParams: any;
  clientOrganizations: Array<any>;
  rebateVersionStatuses: Array<any>;
  actionStatuses: Array<any>;
  lineOfBusiness: Array<any>;
  rebateTypes: Array<any>;
  phxConstants: any;
  formGroupSetup: IFormGroupSetup;
  rebateForm: FormGroup<IRebateFee>;
  actionStatusType = { ToCorrect: 1, ToScheduleChange: 2 };
  validationMessages: Array<any> = [];
  isWorkflowRunning: boolean = false;
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
    this.rebateVersionStatuses = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RebateVersionStatus, true);
    this.actionStatuses = [{ id: 1, code: 'ToCorrect', text: 'To Correct' }, { id: 2, code: 'ToScheduleChange', text: 'To Schedule Change' }];
    this.lineOfBusiness = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.LineOfBusiness, true);
    this.rebateTypes = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RebateType, true);
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
        if (this.routerParams.rebateHeaderId && this.routerParams.rebateHeaderId > 0 && this.routerParams.rebateVersionId && this.routerParams.rebateVersionId > 0) {
          this.rebateVersionId = +this.routerParams.rebateVersionId;
          this.getSingleRebateHeaderByVersion();
        } else {
          this.rebateFeeData = {
            Id: 0,
            RebateHeaderId: null,
            OrganizationId: null,
            Description: '',
            RebateHeaderStatusId: 1,
            RebateVersion: {
              Id: 0,
              LineOfBusinessId: null,
              RebateTypeId: null,
              Rate: null,
              RebateVersionStatusId: 1,
              EffectiveDate: new Date(),
              SourceId: null
            },
            RebateVersions: [
              {
                Id: 0,
                LineOfBusinessId: null,
                RebateTypeId: null,
                Rate: null,
                RebateVersionStatusId: 1,
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
    this.workflowService.getAvailableActions(PhxConstants.EntityType.RebateVersion, +this.rebateVersionId, false).then(result => {
      this.rebateFeeData.RebateVersion.WorkflowAvailableActions = result;
    });
  }

  onClickWorkflowAction(action) {
    this.rebateFeeData.RebateVersion.WorkflowAvailableActions = [];
    this.rebateFeeData.RebateVersion.WorkflowPendingTaskId = action.WorkflowPendingTaskId;
    switch (action.CommandName) {
      case 'RebateVersionCorrect':
        this.rebateFeeData.selectedActionId = this.actionStatusType.ToCorrect;
        break;
      case 'RebateVersionScheduleChange':
        this.rebateForm.get('EffectiveDate').patchValue(null);
        this.rebateFeeData.selectedActionId = this.actionStatusType.ToScheduleChange;
        break;
      default:
        this.rebateFeeData.selectedActionId = null;
    }
  }

  getSingleRebateHeaderByVersion() {
    this.isWorkflowRunning = false;
    this.organizationApiService
      .getSingleRebateHeaderByVersion(this.rebateVersionId)
      .takeUntil(this.isDestroyed$)
      .subscribe((data: any) => {
        this.rebateFeeData = {
          Description: data.Description,
          OrganizationDisplayName: data.OrganizationDisplayName,
          Id: data.Id,
          OrganizationId: data.OrganizationId,
          RebateHeaderStatusId: data.RebateHeaderStatusId,
          RebateVersion: data.RebateVersions.find(a => a.Id === +this.rebateVersionId),
          RebateVersions: orderBy(data.RebateVersions, ['EffectiveDate'], ['desc'])
        };
        this.getWorkflowAvailableAction();
        this.createForm();
        this.initStateActions();
      });
  }

  createForm() {
    this.rebateForm = this.formGroupSetup.formBuilder.group<IRebateFee>({
      Id: [this.rebateFeeData.RebateVersion.Id],
      OrganizationId: [this.rebateFeeData.OrganizationId, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('OrganizationId', CustomFieldErrorType.required))]],
      Description: [this.rebateFeeData.Description, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))]],
      LineOfBusinessId: [this.rebateFeeData.RebateVersion.LineOfBusinessId, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('LineOfBusinessId', CustomFieldErrorType.required))]],
      RebateTypeId: [this.rebateFeeData.RebateVersion.RebateTypeId, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('RebateTypeId', CustomFieldErrorType.required))]],
      Rate: [this.rebateFeeData.RebateVersion.Rate, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('Rate', CustomFieldErrorType.required))]],
      EffectiveDate: [this.rebateFeeData.RebateVersion.EffectiveDate, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('EffectiveDate', CustomFieldErrorType.required))]]
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

  rebateButtonsHandler(action: string) {
    const currentVersion = cloneDeep(this.rebateForm.value);
    delete currentVersion.Description;
    delete currentVersion.OrganizationId;
    const data = {
      Description: this.rebateForm.get('Description').value,
      Id: this.rebateFeeData.Id,
      OrganizationId: this.rebateForm.get('OrganizationId').value,
      RebateHeaderStatusId: this.rebateFeeData.RebateHeaderStatusId,
      RebateVersion: {
        ...this.rebateFeeData.RebateVersions.find(a => a.Id === +this.rebateVersionId),
        ...currentVersion
      }
    };
    switch (action) {
      case 'Created':
        this.actionExecute('RebateHeaderNew', data, action);
        break;
      case 'Corrected':
        this.actionExecute('RebateVersionCorrect', data, action);
        break;
      case 'Schedule Changed':
        this.actionExecute('RebateVersionScheduleChange', data, action);
        break;
      case 'Cancelled':
        this.getSingleRebateHeaderByVersion();
        break;
      default:
        this.router.navigate(['next', 'organization', 'rebatesandfees']);
    }
  }

  actionExecute(commandName: string, data: { Description?: string; Id?: any; OrganizationId?: number; RebateHeaderStatusId?: any; RebateVersion: any; }, action: string) {
    this.isWorkflowRunning = true;
    this.validationMessages = [];
    data.RebateVersion.EffectiveDate = moment(data.RebateVersion.EffectiveDate).format('YYYY-MM-DD');
    const actionCommandBody = {
      WorkflowPendingTaskId: commandName === 'RebateHeaderNew' ? -1 : data.RebateVersion.WorkflowPendingTaskId,
      CommandName: commandName,
      ...data
    };
    this.apiService
      .command(commandName.toString(), actionCommandBody)
      .then(responseSuccessOnExecuteCommand => {
        this.isWorkflowRunning = false;
        if (action === 'Corrected') {
          this.commonService.logSuccess('Organization rebate corrected');
          this.router.navigate(['next', 'organization', 'rebate', 'rebateHeader', this.routerParams.rebateHeaderId, 'rebateVersion', responseSuccessOnExecuteCommand.EntityId, this.routerParams.organizationId]);
        } else if (action === 'Schedule Changed') {
          this.commonService.logSuccess('Organization rebate schedule changed');
          this.router.navigate(['next', 'organization', 'rebate', 'rebateHeader', this.routerParams.rebateHeaderId, 'rebateVersion', responseSuccessOnExecuteCommand.EntityId, this.routerParams.organizationId]);
        } else if (action === 'Created') {
          this.commonService.logSuccess('Organization rebate created');
          this.organizationApiService
            .getSingleRebateHeaderByVersion(responseSuccessOnExecuteCommand.EntityId)
            .takeUntil(this.isDestroyed$)
            .subscribe((result: any) => {
              this.router.navigate(['next', 'organization', 'rebate', 'rebateHeader', result.Id, 'rebateVersion', responseSuccessOnExecuteCommand.EntityId, result.OrganizationId]);
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
      this.rebateFeeData.RebateVersion.RebateVersionStatusId === PhxConstants.RebateVersionStatus.New ||
      this.rebateFeeData.selectedActionId === this.actionStatusType.ToCorrect ||
      this.rebateFeeData.selectedActionId === this.actionStatusType.ToScheduleChange
    ) {
      this.commonService.logWarning('Option to change version is disabled in "Edit" mode');
    } else {
      this.router.navigate(['next', 'organization', 'rebate', 'rebateHeader', this.routerParams.rebateHeaderId, 'rebateVersion', version.Id, this.routerParams.organizationId]);
    }
  }

  funcToCheckViewStatus(modelPrefix: string, fieldName: string) {
    if (this.routerParams.rebateVersionId === 0 || this.routerParams.rebateVersionId === '0') {
      return TFConstants.edit;
    } else if (this.isWorkflowRunning) {
      return TFConstants.view;
    } else if (this.rebateFeeData.selectedActionId === this.actionStatusType.ToCorrect) {
      if (modelPrefix === 'rebateFeeData' && fieldName === 'OrganizationId') {
        return TFConstants.view;
      }
      if (modelPrefix === 'rebateFeeData.RebateVersion' && fieldName === 'LineOfBusinessId') {
        return TFConstants.view;
      }
      if (modelPrefix === 'rebateFeeData.RebateVersion' && fieldName === 'EffectiveDate') {
        return TFConstants.view;
      } else {
        return TFConstants.edit;
      }
    } else if (this.rebateFeeData.selectedActionId === this.actionStatusType.ToScheduleChange) {
      if (modelPrefix === 'rebateFeeData' && fieldName === 'OrganizationId') {
        return TFConstants.view;
      }
      if (modelPrefix === 'rebateFeeData.RebateVersion' && fieldName === 'LineOfBusinessId') {
        return TFConstants.view;
      }
      return TFConstants.edit;
    } else {
      return TFConstants.view;
    }
  }

  rebateChanged() {
    this.rebateForm.get('Rate').patchValue(null);
  }

  showAction() {
    return this.rebateFeeData.RebateVersion.RebateVersionStatusId === this.phxConstants.RebateVersionStatus.New || this.rebateFeeData.selectedActionId === this.actionStatusType.ToCorrect || this.rebateFeeData.selectedActionId === this.actionStatusType.ToScheduleChange;
  }

  initStateActions() {
    this.stateActions = [
      {
        displayText: 'Cancel',
        onClick: () => this.rebateButtonsHandler('CancelNew'),
        hiddenFn: () => this.rebateFeeData.RebateVersion.RebateVersionStatusId !== this.phxConstants.RebateVersionStatus.New
      },
      {
        displayText: 'Create',
        onClick: () => this.rebateButtonsHandler('Created'),
        hiddenFn: () => this.rebateFeeData.RebateVersion.RebateVersionStatusId !== this.phxConstants.RebateVersionStatus.New,
        disabledFn: () => this.rebateForm.invalid,
        style: StateActionButtonStyle.PRIMARY
      },
      {
        displayText: 'Cancel',
        onClick: () => this.rebateButtonsHandler('Cancelled'),
        hiddenFn: () => !(this.rebateFeeData.selectedActionId === this.actionStatusType.ToCorrect || this.rebateFeeData.selectedActionId === this.actionStatusType.ToScheduleChange)
      },
      {
        displayText: 'Correct',
        onClick: () => this.rebateButtonsHandler('Corrected'),
        hiddenFn: () => this.rebateFeeData.selectedActionId !== this.actionStatusType.ToCorrect,
        disabledFn: () => this.rebateForm.invalid,
        style: StateActionButtonStyle.PRIMARY
      },
      {
        displayText: 'Schedule Change',
        onClick: () => this.rebateButtonsHandler('Schedule Changed'),
        hiddenFn: () => this.rebateFeeData.selectedActionId !== this.actionStatusType.ToScheduleChange,
        disabledFn: () => this.rebateForm.invalid,
        style: StateActionButtonStyle.PRIMARY
      }
    ];
  }
}


