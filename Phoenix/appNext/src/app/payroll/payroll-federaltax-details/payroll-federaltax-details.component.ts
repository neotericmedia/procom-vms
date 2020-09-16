import { StateAction, StateActionButtonStyle } from './../../common/model/state-action';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from '../payroll.service';
import { FederalTax, FederalTaxVersion } from '../model/federaltax';
import { CommonService, PhxConstants, ValidationExtensions, NavigationService, DialogService } from '../../common';
import { WorkflowAction } from '../../common/model/index';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { CodeValueService } from '../../common/services/code-value.service';
import { PayrollTaxrateComponent } from './../payroll-taxrate/payroll-taxrate.component';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
// Temporary!!!!! TODO: replace code with real State Actions
enum TempStateAction {
  FederalTaxEdit,
  FederalTaxScheduleChange
}

@Component({
  selector: 'app-payroll-federaltax-details',
  templateUrl: './payroll-federaltax-details.component.html',
  styleUrls: ['./payroll-federaltax-details.component.less']
})
export class PayrollFederaltaxDetailsComponent implements OnInit, OnDestroy {

  @ViewChild('federalTaxComponent') payrollTaxRate: PayrollTaxrateComponent;
  taxDetails: FederalTax;
  codeValueGroups: any;
  phxConstants: any;
  federalTaxVersionId: number;
  currentVersion: FederalTaxVersion;
  tempTaxrates: FederalTaxVersion;
  federalTaxHeaderId: number;
  workflowAvailableActions: WorkflowAction[] = [];
  formFederalTax: FormGroup;
  isAlive: boolean = true;
  editable: boolean = false;
  isCorrection: boolean = false;
  showButtons: boolean = false;
  displayConstant: boolean = true;
  numberFilter = { from: 0, to: 999999999999.99, decimalplaces: 2 };
  percentageFilter = { from: 0, to: 100, decimalplaces: 4 };
  stateActions: StateAction[] = [
    {
      displayText: 'Create',
      commandName: 'FederalTaxHeaderNew',
      style: StateActionButtonStyle.PRIMARY,
      hiddenFn: () => !this.isNew,
      disabledFn: () => !this.formFederalTax || !this.formFederalTax.valid,
      onClick: (action) => this.openModal(action)
    },
    {
      displayText: 'Correct',
      commandName: 'FederalTaxVersionCorrect',
      style: StateActionButtonStyle.PRIMARY,
      hiddenFn: () => !this.isCorrection,
      disabledFn: () => !this.formFederalTax || !this.formFederalTax.valid,
      onClick: (action) => this.openModal(action)
    },
    {
      displayText: 'ScheduleChange',
      commandName: 'FederalTaxVersionScheduleChange',
      style: StateActionButtonStyle.PRIMARY,
      hiddenFn: () => !this.isScheduleChange,
      disabledFn: () => !this.formFederalTax || !this.formFederalTax.valid,
      onClick: (action) => this.openModal(action)
    },
    {
      displayText: 'Cancel and Discard',
      onClick: (action) => {
        if (this.isNew) {
          this.onNewCancelClick();
        } else {
          this.onCancelClick();
        }
      }
    }
  ];
  isNew: boolean;
  isScheduleChange: boolean;
  lists = {
    listCurrency: [],
    listTaxVersionStatus: [],
    listCustomStatus: []
  };

  validationMessages: any;

  todaysDate: Date;
  constructor(private route: ActivatedRoute,
    private payrollService: PayrollService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private navigationService: NavigationService,
    private loadingSpinnerService: LoadingSpinnerService,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private router: Router) {
    this.route.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.federalTaxVersionId = +params['federalTaxVersionId'];
        this.federalTaxHeaderId = +params['federalTaxHeaderId'];
      });
    this.codeValueGroups = this.commonService.CodeValueGroups;
    const todaysDate = new Date();
  }

  ngOnInit() {
    this.navigationService.setTitle('payroll-federal-taxes');
    this.phxConstants = PhxConstants;
    if (this.federalTaxVersionId > 0) {
      this.initForm();
      this.getFederalTaxDetails();
      this.getWorkFlowActions();
    } else {
      this.taxDetails = this.newForm();
      this.isNew = true;
      this.currentVersion = this.taxDetails.FederalTaxVersions[0];
      this.initForm();
      this.formFederalTax.patchValue(this.formatToFractionValue());
      this.formFederalTax.get('EffectiveDate').setValue(new Date());
      this.editable = true;
      this.showButtons = true;
    }

  }

  getFederalTaxDetails() {
    this.loadingSpinnerService.show();
    this.payrollService.getFederalTaxHeaderByFederalTaxVersionId(this.federalTaxVersionId)
      .takeWhile(() => this.isAlive)
      .subscribe(response => {
        this.taxDetails = response;
        this.taxDetails.FederalTaxVersions = _.orderBy(this.taxDetails.FederalTaxVersions, [o => o.EffectiveDate, o => this.getFederalTaxStatus(o.TaxVersionStatusId)], ['desc', 'asc']);
        this.currentVersion = _.clone(this.taxDetails.FederalTaxVersions.find(i => i.Id === this.federalTaxVersionId));
        this.tempTaxrates = _.clone(this.taxDetails.FederalTaxVersions.find(i => i.Id === this.federalTaxVersionId));
        this.formFederalTax.patchValue({
          ...this.formatToFractionValue(),
          CountryId: this.taxDetails.CountryId
        }, { emitEvent: false });
        this.loadingSpinnerService.hide();

      },
        error => {
          window.alert('Error occured!');
        });
  }

  getWorkFlowActions() {
    this.loadingSpinnerService.show();
    this.payrollService.getWorkflowAvailableActions(this.phxConstants.EntityType.FederalTaxVersion, this.federalTaxVersionId)
      .takeWhile(() => this.isAlive)
      .subscribe((response: any) => {
        this.workflowAvailableActions = response.Items.length > 0 ? _.orderBy(response.Items[0].WorkflowAvailableActions, [o => o.Name], ['asc']) : null;
        this.loadingSpinnerService.hide();
      });
  }
  initForm() {
    this.formFederalTax = this.fb.group({
      CountryId: ['', [ValidationExtensions.required()]],
      EffectiveDate: ['', [ValidationExtensions.required()]],
      TD1Minimum: ['', [ValidationExtensions.required()]],
      AbatementRatePercentage: ['', [ValidationExtensions.required()]],
      NonResidentWithholdingPercentage: ['', [ValidationExtensions.required()]],
      CanadaEmploymentAmount: ['', [ValidationExtensions.required()]],
      WorkflowPendingTaskId: [''],
    });

    this.formFederalTax.valueChanges
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe(value => {
        Object.assign(this.currentVersion, value);
        if (this.isNew) {
          this.taxDetails.CountryId = value.CountryId;
          this.currentVersion.CreatedDatetime = value.EffectiveDate;
        }
      });
  }
  newForm() {
    const fedTaxes: FederalTax = {
      AccessActions: [],
      AccessLevelId: 0,
      Id: 0,
      CountryId: 0,
      CreatedDatetime: null,
      FederalTaxVersions: [{
        Id: 0,
        TaxVersionStatusId: 1,
        EffectiveDate: null,
        TD1Minimum: 0.00,
        AbatementRatePercentage: 0,
        NonResidentWithholdingPercentage: 0,
        CanadaEmploymentAmount: 0,
        CreatedDatetime: null,
        FederalTaxRates: [{
          Id: 0,
          IncomeFrom: 0,
          IncomeTo: 9999999999999.99,
          RatePercentage: 0,
          Constant: 0
        }],
      }],
    };
    return fedTaxes;
  }

  currentFederalTaxVersion(version: FederalTaxVersion) {
    this.loadingSpinnerService.show();
    this.currentVersion = this.taxDetails.FederalTaxVersions.find(i => i.Id === version.Id);
    this.federalTaxVersionId = version.Id;
    this.formFederalTax.patchValue(this.formatToFractionValue());
    this.payrollTaxRate.refresh(this.currentVersion.FederalTaxRates);
    this.getWorkFlowActions();
  }

  getFederalTaxStatus(id: number) {
    return (this.codeValueService.getCodeValue(id, 'payroll.CodeTaxVersionStatus')).text;
  }

  getControl(name: string, index: number) {
    return this.formFederalTax.get(name + index);
  }

  executeWorkflowAction(action: WorkflowAction) {
    this.editable = true;
    switch (action.CommandName) {
      case 'FederalTaxVersionScheduleChange':
        this.formFederalTax.get('EffectiveDate').setValue(null);
        this.isScheduleChange = true;
        this.showButtons = true;
        this.isCorrection = false;
        this.isNew = false;
        this.formFederalTax.get('WorkflowPendingTaskId').setValue(action.WorkflowPendingTaskId);
        break;
      case 'FederalTaxVersionCorrect':
        this.isCorrection = true;
        this.showButtons = true;
        this.isScheduleChange = false;
        this.isNew = false;
        this.formFederalTax.get('WorkflowPendingTaskId').setValue(action.WorkflowPendingTaskId);
        break;
    }
  }

  onCancelClick() {
    this.loadingSpinnerService.show();
    this.editable = this.showButtons = false;
    Object.assign(this.currentVersion, this.tempTaxrates);
    this.formFederalTax.patchValue(this.formatToFractionValue(), { onlySelf: true, emitEvent: false });
    this.payrollTaxRate.refresh(this.currentVersion.FederalTaxRates);
    this.loadingSpinnerService.hide();
  }
  onNewCancelClick() {
    this.editable = false;
    this.isScheduleChange = false;
    this.isCorrection = false;
    this.isNew = false;
    this.router.navigate(['/next', 'payroll', 'payroll-taxes-search']);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  formatToFractionValue() {
    this.currentVersion.TD1Minimum = this.currentVersion.TD1Minimum ? Number(this.currentVersion.TD1Minimum.toFixed(2)) : 0.00;
    this.currentVersion.AbatementRatePercentage = this.currentVersion.AbatementRatePercentage ? Number(this.currentVersion.AbatementRatePercentage.toFixed(2)) : 0.00;
    this.currentVersion.NonResidentWithholdingPercentage = this.currentVersion.NonResidentWithholdingPercentage ? Number(this.currentVersion.NonResidentWithholdingPercentage.toFixed(2)) : 0.00;
    this.currentVersion.CanadaEmploymentAmount = this.currentVersion.CanadaEmploymentAmount ? Number(Number(this.currentVersion.CanadaEmploymentAmount).toFixed(2)) : 0.00;
    return this.currentVersion;
  }

  customButtonClick(currentVersion: FederalTaxVersion, countryId: number, action: StateAction) {
    let successAction: string;
    if (action.actionId === TempStateAction.FederalTaxEdit) {
      successAction = 'Corrected';
    } else if (action.actionId === TempStateAction.FederalTaxScheduleChange) {
      successAction = 'Schedule Changed';
    } else if (action.commandName === 'FederalTaxHeaderNew') {
      successAction = 'Created';
    } else {
      successAction = 'action completed';
    }

    this.validationMessages = null;

    this.payrollService.actionExecute(currentVersion, this.federalTaxHeaderId, countryId, action.commandName).subscribe
      (data => {
        this.editable = this.showButtons = false;
        this.federalTaxVersionId = data.EntityId;
        this.commonService.logSuccess('Payroll Federal Tax' + successAction);
        this.getFederalTaxDetails();
        this.getWorkFlowActions();
      },
      error => {
          this.validationMessages = error;
      });
  }

  openModal(action: StateAction) {
    this.dialogService.confirm('Payroll Federal Tax Action', `Are you sure you want to ${action.displayText} this Payroll Federal Tax?`)
    .then(() => {
      this.customButtonClick(this.currentVersion, this.taxDetails.CountryId, action);
    });
  }
}
