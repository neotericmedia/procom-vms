import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesTaxService } from '../Services/SalesTax.service';
import { SalesTax, SalesTaxVersion, SalesTaxVersionRate } from '../model/salestax';
import { CodeValueService } from '../../common/services/code-value.service';
import { StateAction, StateActionButtonStyle, StateActionDisplayType, AvailableStateActions } from './../../common/model';
import * as _ from 'lodash';
import { CommonService, PhxConstants, NavigationService } from '../../common/index';
import { WorkflowAction } from '../../common/model/index';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { CodeValueGroups } from '../../common/model/phx-code-value-groups';

@Component({
  selector: 'app-sales-tax-details',
  templateUrl: './sales-tax-details.component.html',
  styleUrls: ['./sales-tax-details.component.less']
})
export class SalesTaxDetailsComponent extends BaseComponentOnDestroy implements OnInit {
  tax: SalesTax;
  SalesTaxHeaderId: number;
  taxVersionId: number;
  validationMessages: any;

  salesTaxForm: FormGroup;
  salesTaxFormChanges$: Subscription;
  stateActions: StateAction[];

  editable: boolean = false;
  isCorrection: boolean = false;
  isScheduleChange: boolean = false;

  phxConstants = PhxConstants;
  codeValueGroups = CodeValueGroups;
  stateActionDisplayType = StateActionDisplayType;

  constructor(
    private salesTaxService: SalesTaxService,
    private codeValueService: CodeValueService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private fb: FormBuilder,
    private loadingSpinnerService: LoadingSpinnerService,
    private navigationService: NavigationService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.navigationService.setTitle('payroll-sales-tax-details');
    this.activatedRoute.params.takeUntil(this.isDestroyed$).subscribe(params => {
      this.SalesTaxHeaderId = +params['salesTaxId'];
      this.taxVersionId = +params['salesTaxVersionId'];
      this.initSalesTaxData();
    });
    this._initStateActions();
  }

  initSalesTaxData() {
    this.isCorrection = false;
    this.isScheduleChange = false;
    this.editable = false;
    this.getSalesTaxDetails();
  }

  getSalesTaxDetails() {
    this.loadingSpinnerService.show();
    this.validationMessages = null;
    if (this.tax && this.tax.SalesTaxVersions && this.tax.SalesTaxVersions.some(v => v.Id === this.taxVersionId)) {
      this.tax.CurrentVersion = _.clone(this.tax.SalesTaxVersions.find(i => i.Id === this.taxVersionId));
      this.initSalesTaxForm(this.tax);
      this.getAvailableStateActions();
    } else {
      this.salesTaxService
        .getSelectedSalesTax(this.taxVersionId)
        .takeUntil(this.isDestroyed$)
        .subscribe((response: SalesTax) => {
          this.tax = response;
          this.tax.SalesTaxVersions = _.orderBy(this.tax.SalesTaxVersions, [o => o.EffectiveDate, o => this.getSalesTaxStatus(o.TaxVersionStatusId), o => o.Id], ['desc', 'asc', 'desc']);
          this.tax.CurrentVersion = _.clone(this.tax.SalesTaxVersions.find(i => i.Id === this.taxVersionId));
          this.initSalesTaxForm(this.tax);
          this.getAvailableStateActions();
        });
    }
  }

  getAvailableStateActions() {
    this.salesTaxService
      .getAvailableStateActions(this.taxVersionId)
      .takeUntil(this.isDestroyed$)
      .subscribe((stateActions: Array<AvailableStateActions>) => {
        const availableStateActions = stateActions.find(x => x.EntityStatusId === this.tax.CurrentVersion.TaxVersionStatusId);
        this.tax.AvailableStateActions = availableStateActions ? availableStateActions.AvailableStateActions : null;
        this.loadingSpinnerService.hide();
      });
  }

  initSalesTaxForm(salesTax: SalesTax) {
    if (salesTax) {
      if (this.salesTaxFormChanges$) {
        this.salesTaxFormChanges$.unsubscribe();
      }
      this.salesTaxForm = this.fb.group({
        Id: [salesTax.Id],
        CountryId: [salesTax.CountryId],
        SalesTaxId: [salesTax.SalesTaxId],
        CurrentVersion: this.getSalesTaxCurrentVersionForm(salesTax.CurrentVersion)
      });
      this.salesTaxFormChanges$ = this.salesTaxForm.valueChanges
        .takeUntil(this.isDestroyed$)
        .debounceTime(500)
        .distinctUntilChanged()
        .subscribe(value => {
          this.tax = { ...this.tax, ...value };
          this.initSalesTaxForm(this.tax);
        });
    }
  }

  getSalesTaxCurrentVersionForm(salesTaxVersion: SalesTaxVersion) {
    return this.fb.group({
      Id: [salesTaxVersion.Id],
      TaxVersionStatusId: [salesTaxVersion.TaxVersionStatusId],
      EffectiveDate: [salesTaxVersion.EffectiveDate, [Validators.required]],
      SalesTaxVersionRates: this.getSalesTaxVersionRatesFormArray(salesTaxVersion.SalesTaxVersionRates)
    });
  }

  getSalesTaxVersionRatesFormArray(salesTaxVersionRates: SalesTaxVersionRate[]) {
    return this.fb.array(
      salesTaxVersionRates
        ? salesTaxVersionRates.map((salesTaxVersionRate: SalesTaxVersionRate) =>
            this.fb.group({
              Id: [salesTaxVersionRate.Id],
              SalesTaxVersionId: [salesTaxVersionRate.SalesTaxVersionId],
              SubdivisionId: [salesTaxVersionRate.SubdivisionId],
              RatePercentage: [salesTaxVersionRate.RatePercentage, salesTaxVersionRate.IsApplied ? [Validators.required] : null],
              IsApplied: [salesTaxVersionRate.IsApplied, [Validators.required]]
            })
          )
        : []
    );
  }

  getSalesTaxStatus(id: number) {
    return this.codeValueService.getCodeValue(id, 'payroll.CodeTaxVersionStatus').text;
  }

  setEffectiveDateControlValueAsNull() {
    this.salesTaxForm
      .get('CurrentVersion')
      .get('EffectiveDate')
      .setValue(null);
    this.salesTaxForm
      .get('CurrentVersion')
      .get('EffectiveDate')
      .reset();
  }

  selectedSalesTaxVersion(version: SalesTaxVersion) {
    this.router.navigate(['/next', 'payroll', 'salesTaxDetails', version.SalesTaxHeaderId, 'salesTaxVersion', version.Id]);
  }

  executeAction(commandName: string, successMsg: string) {
    this.tax = { ...this.tax, ...this.salesTaxForm.value };
    this.salesTaxService.executeWorkflowAction(commandName, this.tax.CurrentVersion).subscribe(
      (response: any) => {
        if (successMsg) {
          this.commonService.logSuccess(successMsg);
        }
        if (response && response.EntityIdRedirect) {
          this.router.navigate(['/next', 'payroll', 'salesTaxDetails', this.SalesTaxHeaderId, 'salesTaxVersion', response.EntityIdRedirect]);
        } else {
          this.initSalesTaxData();
        }
      },
      (responseError: any) => {
        this.validationMessages = responseError;
      }
    );
  }

  _initStateActions() {
    this.stateActions = [
      {
        actionId: PhxConstants.StateAction.SalesTaxCorrect,
        hiddenFn: (action, componentOption) => this.editable || componentOption.displayType !== StateActionDisplayType.DROPDOWN,
        onClick: () => {
          this.editable = true;
          this.isCorrection = true;
        }
      },
      {
        actionId: PhxConstants.StateAction.SalesTaxScheduleChange,
        hiddenFn: (action, componentOption) => this.editable || componentOption.displayType !== StateActionDisplayType.DROPDOWN,
        onClick: () => {
          this.editable = true;
          this.isScheduleChange = true;
          this.setEffectiveDateControlValueAsNull();
        }
      },
      {
        actionId: PhxConstants.StateAction.SalesTaxCorrect,
        style: StateActionButtonStyle.PRIMARY,
        hiddenFn: (action, componentOption) => !this.isCorrection || componentOption.displayType !== StateActionDisplayType.BUTTON,
        disabledFn: () => !this.salesTaxForm || !this.salesTaxForm.valid,
        onClick: action => this.executeAction(action.commandName, 'Payroll Sales Tax Corrected')
      },
      {
        actionId: PhxConstants.StateAction.SalesTaxScheduleChange,
        style: StateActionButtonStyle.PRIMARY,
        hiddenFn: (action, componentOption) => !this.isScheduleChange || componentOption.displayType !== StateActionDisplayType.BUTTON,
        disabledFn: () => !this.salesTaxForm || !this.salesTaxForm.valid,
        onClick: action => this.executeAction(action.commandName, 'Payroll Sales Tax Schedule Changed')
      },
      {
        displayText: 'Cancel and Discard',
        hiddenFn: (action, componentOption) => !this.editable || componentOption.displayType !== StateActionDisplayType.BUTTON,
        onClick: () => this.initSalesTaxData()
      }
    ];
  }
}
