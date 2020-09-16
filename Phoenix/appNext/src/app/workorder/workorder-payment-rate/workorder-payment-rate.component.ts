import { Component, OnInit, Input } from '@angular/core';
import { IFormGroupSetup, IPaymentRate, IReadOnlyStorage, IFormGroupOnNew, IPaymentRatesDetail, IRoot } from '../state/workorder.interface';
import { FormArray, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions, PhxConstants } from '../../common';
import { CustomFieldErrorType, CodeValue, PhxFormControlLayoutType } from '../../common/model';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { WorkorderService } from '../workorder.service';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { filter, cloneDeep } from 'lodash';
import { Validators } from '../../../../node_modules/@angular/forms';
import { IFormGroupValue } from '../../common/utility/form-group';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-payment-rate',
  templateUrl: './workorder-payment-rate.component.html',
  styleUrls: ['./workorder-payment-rate.component.less']
})
export class WorkorderPaymentRateComponent extends WorkOrderBaseComponentPresentational<IPaymentRate> implements OnInit {
  @Input() rateIndex: number;
  @Input() paymentInfoIndex: number;
  @Input() readOnlyStorage: IReadOnlyStorage;
  billingRates: Array<any> = [];
  WorksiteId: number;
  workerProfileTypeId: number;
  layoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.InputOnly;
  phxConstants: any;

  html: {
    codeValueLists: {
      listCurrency: Array<CodeValue>;
      listProfileTypeList: Array<CodeValue>;
      listworkOrderRateTypes: Array<CodeValue>;
      listWorkOrderRateUnits: Array<CodeValue>;
    };
    commonLists: {
      listUserProfileWorker: Array<any>;
      listOrganizationSupplier: Array<any>;
      listavailableRebates: Array<any>;
      listavailableVmsFees: Array<any>;
    };
  } = {
    codeValueLists: {
      listCurrency: [],
      listProfileTypeList: [],
      listworkOrderRateTypes: [],
      listWorkOrderRateUnits: []
    },
    commonLists: {
      listUserProfileWorker: [],
      listOrganizationSupplier: [],
      listavailableRebates: [],
      listavailableVmsFees: []
    }
  };
  rootFormGroup: FormGroup<any>;
  static newForm: IFormGroupOnNew;
  constructor(private workorderObservableService: WorkorderObservableService) {
    super('WorkorderPayementRateComponent');
    this.getCodeValuelistsStatic();
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.workorderObservableService
      .workorderOnRouteChange$(this, true)
      .takeUntil(this.isDestroyed$)
      .subscribe(workorder => {
        if (workorder) {
          this.billingRates = cloneDeep(workorder.WorkOrderVersion.BillingInfoes[0].BillingRates);
          this.WorksiteId = workorder.WorkOrderVersion.WorksiteId;
          this.workerProfileTypeId = workorder.workerProfileTypeId;
        }
      });

    this.rootFormGroup = this.getRootFormGroup(this.inputFormGroup) as FormGroup<any>;
    WorkorderPaymentRateComponent.newForm = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listProfileTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.ProfileType, true);
    this.html.codeValueLists.listCurrency = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true);
    this.html.codeValueLists.listworkOrderRateTypes = this.codeValueService.getCodeValues(this.codeValueGroups.RateType, true);
    this.html.codeValueLists.listworkOrderRateTypes.splice(5, 1);
    this.html.codeValueLists.listworkOrderRateTypes.splice(4, 1);
    this.html.codeValueLists.listWorkOrderRateUnits = this.codeValueService.getCodeValues(this.codeValueGroups.RateUnit, true);
  }

  businessRules(obj: IFormGroupValue): void {
    if (obj.name === 'RateUnitId') {
      const val = this.workerProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp && this.inputFormGroup.controls.RateTypeId.value === this.phxConstants.RateType.Primary;
      this.inputFormGroup.controls.IsApplyStatHoliday.patchValue(val);
    }
  }

  recalcLocalProperties() {}

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, paymentRate: Array<IPaymentRate>): FormArray<IPaymentRate> {
    const form = formGroupSetup.formBuilder.array<IPaymentRate>(
      paymentRate.map((rate: IPaymentRate, index) =>
        formGroupSetup.formBuilder.group<IPaymentRate>({
          PaymentInfoId: [rate.PaymentInfoId],
          Id: [rate.Id],
          IsDraft: [rate.IsDraft],
          Rate: [
            rate.Rate,
            PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentRates', 'Rate', rate, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Rate', CustomFieldErrorType.required))
            ])
          ],
          RateTypeId: [rate.RateTypeId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RateTypeId', CustomFieldErrorType.required))]],
          RateUnitId: [
            rate.RateUnitId,
            PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentRates', 'RateUnitId', rate, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RateUnitId', CustomFieldErrorType.required))
            ])
          ],
          SourceId: [rate.SourceId],
          IsApplyDeductions: [rate.IsApplyDeductions],
          IsApplyVacation: [rate.IsApplyVacation],
          IsApplyStatHoliday: [rate.IsApplyStatHoliday]
        })
      )
    );
    return form;
  }

  public static formBuilderGroupAddNewRate(formGroupOnNew: IFormGroupOnNew, rate: IPaymentRate): FormGroup<IPaymentRate> {
    const newForm = formGroupOnNew.formBuilder.group<IPaymentRate>({
      PaymentInfoId: 0,
      Id: 0,
      IsDraft: null,
      Rate: [null, Validators.required],
      RateTypeId: [rate.RateTypeId],
      RateUnitId: [rate.RateUnitId],
      SourceId: null,
      IsApplyDeductions: true,
      IsApplyVacation: true,
      IsApplyStatHoliday: null
    });
    return newForm;
  }

  public static formBuilderNewPaymentRates(formGroupOnNew: IFormGroupOnNew, rates: IPaymentRate[]): FormArray<IPaymentRate> {
    const form = formGroupOnNew.formBuilder.array<IPaymentRate>(rates.map((rate: IPaymentRate, index) => WorkorderPaymentRateComponent.formBuilderGroupAddNewRate(formGroupOnNew, rate)));
    return form;
  }

  floatApplyTwoDecimalPlaces(value: string) {
    if (isNaN(Number(value)) || value === null) {
      return null;
    }
    const key = parseFloat(value).toFixed(2);
    return key;
  }
}
