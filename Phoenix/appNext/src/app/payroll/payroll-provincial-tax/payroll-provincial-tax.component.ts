import { Component, OnInit, OnDestroy, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService, CommonService, CodeValueService, DialogService, ApiService, LoadingSpinnerService } from '../../common';
import { PayrollService } from '../payroll.service';
import { ProvincialTaxHeader, ProvincialTaxVersion, Workflow } from '../model/provincialtax';
import { WorkflowAction, PhxConstants } from '../../common/model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PayrollTaxrateComponent } from '../payroll-taxrate/payroll-taxrate.component';

@Component({
  selector: 'app-payroll-provincial-tax',
  templateUrl: './payroll-provincial-tax.component.html',
  styleUrls: ['./payroll-provincial-tax.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class PayrollProvincialTaxComponent implements OnInit, OnDestroy {

  taxVersionId: number;
  taxId: number;
  isAlive: boolean = true;

  CodeValueGroups: any;
  ApplicationConstants: any;

  isInEditMode: boolean;
  taxVersion: ProvincialTaxVersion;
  taxVersions: ProvincialTaxVersion[];
  header: ProvincialTaxHeader;
  workflowAvailableActions: WorkflowAction[];
  form: FormGroup;
  isNew: boolean;
  isForCorrection: boolean;
  isForScheduleChange: boolean;

  currencyFilter: any = { 'from': 0, 'to': 999999999999.99, 'decimalplaces': 2 };
  percentageFilter: any = { 'from': 0, 'to': 100, 'decimalplaces': 4 };
  numberFilter: any = { 'from': 0, 'to': 199, 'decimalplaces': 0 };

  @ViewChild('ProvincialHealthPremiums') provincialHealthPremiumsRef: PayrollTaxrateComponent;
  @ViewChild('ProvincialTaxRates') provincialTaxRatesRef: PayrollTaxrateComponent;
  @ViewChild('ProvincialSurtaxRates') provincialSurtaxRatesRef: PayrollTaxrateComponent;

  customStatusId: string;
  isWorkflowRunning: boolean;

  taxVersionStatusText: string;

  lists = {
    listCurrency: [],
    listSubdivision: [],
    listTaxVersionStatus: [],
    listCustomStatus: []
  };

  constructor(protected commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    protected payrollService: PayrollService,
    private codeValueService: CodeValueService,
    protected fb: FormBuilder, protected dialog: DialogService, protected loaderService: LoadingSpinnerService) {
    this.CodeValueGroups = this.commonService.CodeValueGroups;
    this.ApplicationConstants = PhxConstants;
  }

  ngOnInit() {
    this.isInEditMode = false;
    this.navigationService.setTitle('payroll-provincial-taxes');

    const routParams = this.activatedRoute.params.subscribe(res => {
      this.taxId = +res['taxId'];
      this.taxVersionId = +res['taxVersionId'];
      this.loadLists();
      this.loadWorkflowActions(this.taxVersionId);
      if (this.taxId && this.taxVersionId) {
        this.loadTaxHeader(this.taxVersionId);
      } else {
        this.isNew = true;
        this.isInEditMode = true;
        this.header = this.newForm();
        this.taxVersions = this.header.ProvincialTaxVersions;
        this.taxVersion = this.header.ProvincialTaxVersions[0];
        this.initForm(this.taxVersion, this.header);
      }
    });
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  onWorkflowActionSelected($event) {
    console.log($event);
    this.form.get('WorkflowPendingTaskId').setValue($event.WorkflowPendingTaskId);
    switch ($event.CommandName) {
      case 'ProvincialTaxVersionScheduleChange':
        this.isInEditMode = true;
        this.isForScheduleChange = true;
        this.isForCorrection = false;
        this.form.get('EffectiveDate').setValue(null);
        this.form.get('EffectiveDate').reset();
        break;
      case 'ProvincialTaxVersionCorrect':
        this.isInEditMode = true;
        this.isForScheduleChange = false;
        this.isForCorrection = true;
        break;
      case 'ProvincialTaxHeaderNew':
        this.isInEditMode = true;
        this.isForScheduleChange = false;
        this.isForCorrection = true;
        break;
      default:
        this.isInEditMode = false;
        this.isForScheduleChange = false;
        this.isForCorrection = false;
        break;
    }
  }

  onTaxVersionSelected($event) {
    this.taxVersion = $event;
  }

  cancelEdit() {
    this.isInEditMode = false;
    this.isForScheduleChange = false;
    this.isForCorrection = false;
    this.taxVersion = _.clone(this.header.ProvincialTaxVersions.find(x => x.Id === this.taxVersionId));
    this.form.patchValue(this.taxVersion);
    this.provincialHealthPremiumsRef.refresh(this.taxVersion.ProvincialHealthPremiums);
    this.provincialSurtaxRatesRef.refresh(this.taxVersion.ProvincialSurtaxRates);
    this.provincialTaxRatesRef.refresh(this.taxVersion.ProvincialTaxRates);
  }

  cancelNewEdit() {
    this.isInEditMode = false;
    this.isForScheduleChange = false;
    this.isForCorrection = false;
    this.isNew = false;
    this.router.navigate(['/next', 'payroll', 'payroll-taxes-search']);
  }

  getTaxStatus(id: number) {
    return (this.codeValueService.getCodeValue(id, 'payroll.CodeTaxVersionStatus')).text;
  }

  onScheduleChangeCommand() {
    this.actionExecute('Schedule Change', 'ProvincialTaxVersionScheduleChange');
  }

  onCorrectCommand() {
    this.actionExecute('Correct', 'ProvincialTaxVersionCorrect');
  }

  onCreateCommand() {
    this.actionExecute('Create', 'ProvincialTaxHeaderNew');
  }

  public actionExecute(actionName: string, actionCommandName: string) {
    const dlgOnCreate = this.dialog.confirm('Payroll Provincial Tax Action', `Are you sure you want to ${actionName.toLowerCase()} this Payroll Provincial Tax?`);
    const self = this;
    dlgOnCreate.then(function (btn) {

      const command = {
        WorkflowPendingTaskId: actionCommandName === 'ProvincialTaxHeaderNew' ? -1 : self.taxVersion.WorkflowPendingTaskId,
        CommandName: actionCommandName,
        Id: self.taxId,
        SubdivisionId: self.header.SubdivisionId,
        ProvincialTaxVersion: self.taxVersion
      };
      self.loaderService.show();
      const response = self.payrollService.executeAction(actionCommandName, command);

      response.subscribe(x => {
        // debugger;
        console.log(x);
        self.isInEditMode = false;
        self.isForScheduleChange = false;
        self.isForCorrection = false;
        self.isNew = false;

        if (x.IsValid) {
          self.commonService.logSuccess(`Payroll Provincial Tax ${self.setActionNameInPlural(actionName)}`);
          self.loaderService.hideAll();
          if (actionName === 'Create') {
            this.router.navigate(['/next', 'payroll', 'payroll-provincial-tax', x.EntityId, 0]);
          } else if (actionName === 'Correct') {
            this.router.navigate(['/next', 'payroll', 'payroll-provincial-tax', self.taxId, x.EntityId]);
          } else if (actionName === 'Schedule Change') {
            this.router.navigate(['/next', 'payroll', 'payroll-provincial-tax', self.taxId, x.EntityId]);
          }
        }

      });

      response.toPromise().catch(x => {
        // debugger;
        self.isInEditMode = false;
        self.isForScheduleChange = false;
        self.isForCorrection = false;
        self.isNew = false;

        if (x.ModelState) {
          if (x.ModelState['command.Validation Summary']) {
            x.ModelState['command.Validation Summary'].forEach(error => {
              self.commonService.logError(error);
            });
          }
        }

        if (x.Message) {
          self.commonService.logError(x.Message);
        }

        console.log(x);
        self.router.navigate(['/next', 'payroll', 'payroll-taxes-search']);
      });

    }, function (btn) {
      self.isInEditMode = false;
      self.isNew = false;
      self.isForScheduleChange = false;
      self.isForCorrection = false;
    });
  }

  private loadTaxHeader(taxId: number) {

    this.payrollService.getProvincialTaxHeaderByProvincialTaxVersionId(taxId).subscribe((res: ProvincialTaxHeader) => {
      this.header = res;
      this.taxVersion = _.clone(this.header.ProvincialTaxVersions.find(x => x.Id === this.taxVersionId));
      this.taxVersions = _.orderBy(this.header.ProvincialTaxVersions, [x => x.EffectiveDate, x => this.getTaxStatus(x.TaxVersionStatusId)], ['desc', 'asc']);
      this.loadWorkflowActions(this.taxVersionId);
      this.initForm(this.taxVersion, this.header);
    });
  }

  private loadWorkflowActions(taxVersionId: number) {
    return this.payrollService.getWorkflowAvailableActions(this.ApplicationConstants.EntityType.ProvincialTaxVersion, taxVersionId).subscribe((res: Workflow) => {
      this.workflowAvailableActions = res ? res.Items.length > 0 ? _.orderBy(res.Items[0].WorkflowAvailableActions, [x => x.DisplayButtonOrder]) : [] : [];
    });
  }

  private loadLists() {
    this.lists.listCurrency = this.codeValueService.getCodeValues(this.CodeValueGroups.Currency, true);
    this.lists.listSubdivision = this.codeValueService.getRelatedCodeValues(this.CodeValueGroups.Subdivision,
      this.ApplicationConstants.CountryCanada, this.CodeValueGroups.Country);
    this.lists.listTaxVersionStatus = this.codeValueService.getCodeValues(this.CodeValueGroups.TaxVersionStatus, {});
    this.lists.listCustomStatus = [
      { id: 1, code: 'ToCorrect', text: 'To Correct' },
      { id: 2, code: 'ToScheduleChange', text: 'To Schedule Change' }];
  }

  private initForm(currentTaxVersion: ProvincialTaxVersion, taxHeader: ProvincialTaxHeader) {
    this.form = this.fb.group({
      'WorkflowPendingTaskId': this.fb.control(currentTaxVersion.WorkflowPendingTaskId),
      'SubDivisionId': this.fb.control(taxHeader.SubdivisionId, [Validators.required]),
      'EffectiveDate': this.fb.control(currentTaxVersion.EffectiveDate, [Validators.required]),
      'TD1Minimum': this.fb.control(currentTaxVersion.TD1Minimum, [Validators.required]),
      'WCBMaximum': this.fb.control(currentTaxVersion.WCBMaximum, [Validators.required]),
      'CanadaEmploymentAmount': this.fb.control(currentTaxVersion.CanadaEmploymentAmount, [Validators.required]),
      'TaxTypeHealthCare': this.fb.group({
        Id: [currentTaxVersion.TaxTypeHealthCare.Id],
        IsEligible: [currentTaxVersion.TaxTypeHealthCare.IsEligible],
        SourceDeductionTypeId: [currentTaxVersion.TaxTypeHealthCare.SourceDeductionTypeId],
        EmployeeRatePercentage: [currentTaxVersion.TaxTypeHealthCare.EmployeeRatePercentage, [Validators.required]]
      }),
      'TaxTypeParentalInsurancePlan': this.fb.group({
        Id: [currentTaxVersion.TaxTypeParentalInsurancePlan.Id],
        IsEligible: [currentTaxVersion.TaxTypeParentalInsurancePlan.IsEligible, [Validators.required]],
        MaxInsurable: [currentTaxVersion.TaxTypeParentalInsurancePlan.MaxInsurable, [Validators.required]],
        EmployeeRatePercentage: [currentTaxVersion.TaxTypeParentalInsurancePlan.EmployeeRatePercentage, [Validators.required]],
        EmployerMultiplerPercentage: [currentTaxVersion.TaxTypeParentalInsurancePlan.EmployerMultiplerPercentage, [Validators.required]]
      }),
      'TaxTypeCanadaPensionPlan': this.fb.group({
        Id: [currentTaxVersion.TaxTypeParentalInsurancePlan.Id],
        IsEligible: [currentTaxVersion.TaxTypeCanadaPensionPlan.IsEligible, [Validators.required]],
        MinAge: [currentTaxVersion.TaxTypeCanadaPensionPlan.MinAge, [Validators.required]],
        MaxAge: [currentTaxVersion.TaxTypeCanadaPensionPlan.MaxAge, [Validators.required]],
        EmployeeRatePercentage: [currentTaxVersion.TaxTypeCanadaPensionPlan.EmployeeRatePercentage, [Validators.required]],
        EmployerMultiplerPercentage: [currentTaxVersion.TaxTypeCanadaPensionPlan.EmployerMultiplerPercentage, [Validators.required]],
        MaxEarnings: [currentTaxVersion.TaxTypeCanadaPensionPlan.MaxEarnings, [Validators.required]],
        AnnualExemption: [currentTaxVersion.TaxTypeCanadaPensionPlan.AnnualExemption, [Validators.required]]
      }),
      'TaxTypeEmploymentInsurance': this.fb.group({
        Id: [currentTaxVersion.TaxTypeParentalInsurancePlan.Id],
        IsEligible: [currentTaxVersion.TaxTypeEmploymentInsurance.IsEligible, [Validators.required]],
        MaxEarnings: [currentTaxVersion.TaxTypeEmploymentInsurance.MaxEarnings, [Validators.required]],
        MaxInsurable: [currentTaxVersion.TaxTypeEmploymentInsurance.MaxInsurable, [Validators.required]],
        EmployeeRatePercentage: [currentTaxVersion.TaxTypeEmploymentInsurance.EmployeeRatePercentage, [Validators.required]],
        EmployerMultiplerPercentage: [currentTaxVersion.TaxTypeEmploymentInsurance.EmployerMultiplerPercentage, [Validators.required]]
      }),
      'TaxTypeQuebecPensionPlan': this.fb.group({
        Id: [currentTaxVersion.TaxTypeParentalInsurancePlan.Id],
        IsEligible: [currentTaxVersion.TaxTypeQuebecPensionPlan.IsEligible, [Validators.required]],
        MinAge: [currentTaxVersion.TaxTypeQuebecPensionPlan.MinAge, [Validators.required]],
        MaxAge: [currentTaxVersion.TaxTypeQuebecPensionPlan.MaxAge, [Validators.required]],
        EmployeeRatePercentage: [currentTaxVersion.TaxTypeQuebecPensionPlan.EmployeeRatePercentage, [Validators.required]],
        EmployerMultiplerPercentage: [currentTaxVersion.TaxTypeQuebecPensionPlan.EmployerMultiplerPercentage, [Validators.required]],
        MaxEarnings: [currentTaxVersion.TaxTypeQuebecPensionPlan.MaxEarnings, [Validators.required]],
        AnnualExemption: [currentTaxVersion.TaxTypeQuebecPensionPlan.AnnualExemption, [Validators.required]]
      }),
      'TaxTypeQuebecTrainingFee': this.fb.group({
        Id: [currentTaxVersion.TaxTypeParentalInsurancePlan.Id],
        IsEligible: [currentTaxVersion.TaxTypeQuebecTrainingFee.IsEligible, [Validators.required]],
        EmployeeRatePercentage: [currentTaxVersion.TaxTypeQuebecTrainingFee.EmployeeRatePercentage, [Validators.required]]
      })
    });

    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => {
        console.log('form change', value);
        Object.assign(this.taxVersion, value);
        if (value.SubDivisionId) {
          this.header.SubdivisionId = value.SubDivisionId;
        }
        console.log(this.taxVersion);
      });
  }

  setActionNameInPlural(actionName: string) {
    let result = actionName;
    const lastSymbol = actionName.slice(-1);
    if (lastSymbol === 'e') {
      result += 'd';
    } else {
      result += 'ed';
    }
    return result;
  }

  newForm() {
    const provTaxes: ProvincialTaxHeader = {
      AccessActions: [],
      AccessLevelId: 0,
      Id: 0,
      SubdivisionId: null,
      CreatedDatetime: new Date(),
      ProvincialTaxVersions: [{
        CreatedDatetime: new Date(),
        Id: 0,
        TaxVersionStatusId: 1,
        EffectiveDate: new Date(),
        TD1Minimum: 0.00,
        WCBMaximum: 0.00,
        CanadaEmploymentAmount: 0.00,
        ProvincialTaxRates: [{
          Id: 0,
          IncomeFrom: 0.00,
          IncomeTo: this.ApplicationConstants.max.currency,
          RatePercentage: 0.00,
          Constant: 0.00,
        }],
        ProvincialSurtaxRates: [{
          Id: 0,
          IncomeFrom: 0.00,
          IncomeTo: this.ApplicationConstants.max.currency,
          RatePercentage: 0.00,
        }],
        ProvincialHealthPremiums: [{
          Id: 0,
          IncomeFrom: 0.00,
          IncomeTo: this.ApplicationConstants.max.currency,
          RatePercentage: 0.00,
          Constant: 0.00
        }],
        TaxTypeHealthCare: {
          Id: 0,
          SourceDeductionTypeId: this.ApplicationConstants.SourceDeductionType.HealthCare,
          IsEligible: true,
          EmployeeRatePercentage: 0.00
        },
        TaxTypeCanadaPensionPlan: {
          Id: 0,
          SourceDeductionTypeId: this.ApplicationConstants.SourceDeductionType.CanadaPensionPlan,
          IsEligible: true,
          EmployeeRatePercentage: 0.00,
          EmployerMultiplerPercentage: 0.00,
          MinAge: 0,
          MaxAge: 0,
          MaxEarnings: 0.00,
          AnnualExemption: 0.00
        },
        TaxTypeEmploymentInsurance: {
          Id: 0,
          SourceDeductionTypeId: this.ApplicationConstants.SourceDeductionType.EmploymentInsurance,
          IsEligible: true,
          EmployeeRatePercentage: 0.00,
          EmployerMultiplerPercentage: 0.00,
          MaxEarnings: 0.00,
          MaxInsurable: 0.00,
        },
        TaxTypeParentalInsurancePlan: {
          Id: 0,
          SourceDeductionTypeId: this.ApplicationConstants.SourceDeductionType.ParentalInsurancePlan,
          IsEligible: false,
          EmployeeRatePercentage: 0.00,
          EmployerMultiplerPercentage: 0.00,
          MaxInsurable: 0.00
        },
        TaxTypeQuebecPensionPlan: {
          Id: 0,
          SourceDeductionTypeId: this.ApplicationConstants.SourceDeductionType.QuebecPensionPlan,
          IsEligible: false,
          EmployeeRatePercentage: 0.00,
          EmployerMultiplerPercentage: 0.00,
          MinAge: 0,
          MaxAge: 0,
          MaxEarnings: 0.00,
          AnnualExemption: 0.00,
        },
        TaxTypeQuebecTrainingFee: {
          Id: 0,
          EmployeeRatePercentage: 0.00,
          IsEligible: false,
          SourceDeductionTypeId: this.ApplicationConstants.SourceDeductionType.QuebecPensionPlan
        }
      }]
    };

    return provTaxes;
  }

}
