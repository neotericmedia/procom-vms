import { PtFieldViewCustomValidator } from './../ptFieldCustomValidator';
import { CustomFieldErrorType } from './../../common/model/custom-field-error-type';
import { ValidationExtensions } from './../../common/components/phx-form-control/validation.extensions';
import { PhxFormControlLayoutType } from './../../common/model/phx-form-control-layout-type';
// Angular
import { Component, OnInit } from '@angular/core';
// Common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
// Work order
import { IWorkOrder, IFormGroupSetup, IPaymentSourceDeductions, ITabEarningsAndDeductions, IPaymentInfoDetails } from './../state/index';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { PhxConstants } from '../../common';

@Component({
  selector: 'app-workorder-tab-earnings-deduction-taxes',
  templateUrl: './workorder-tab-earnings-deduction-taxes.component.html'
})
export class WorkorderTabEarningsAndDeductionTaxesComponent extends WorkOrderBaseComponentPresentational<IPaymentSourceDeductions> implements OnInit {
  workOrder: IWorkOrder;
  formGroupTabEarningsAndDeductions: FormGroup<ITabEarningsAndDeductions>;
  html: {
    lists: {
      sourceDeductionTypeList: Array<any>;
    };
  } = {
    lists: {
      sourceDeductionTypeList: []
    }
  };
  percentageFilter: any = { from: 0, to: 100, decimalplaces: 4 };
  rateAmountFilter: any = { from: 0, to: 9999999999999.99, decimalplaces: 2 };

  layoutType = PhxFormControlLayoutType;

  constructor(private workorderObservableService: WorkorderObservableService) {
    super('WorkorderTabEarningsAndDeductionOtherEarningsComponent');
    this.excludedFields = ['IsOverWritable', 'ToShow'];
  }

  ngOnInit() {
    this.html.lists.sourceDeductionTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.SourceDeductionType, null);
    this.workorderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        this.workOrder = workorder;
      });
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  businessRules(obj: any) {}

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, paymentSourceDeductions: Array<IPaymentSourceDeductions>): FormArray<IPaymentSourceDeductions> {
    return formGroupSetup.formBuilder.array<IPaymentSourceDeductions>(paymentSourceDeductions.map((paymentSourceDeduction: any, index: number) => this.paymentSourceDeduction(formGroupSetup, paymentSourceDeduction)));
  }

  public static paymentSourceDeduction(formGroupSetup: IFormGroupSetup, paymentSourceDeduction: IPaymentSourceDeductions): FormGroup<IPaymentSourceDeductions> {
    return formGroupSetup.formBuilder.group<IPaymentSourceDeductions>({
      IsApplied: [
        paymentSourceDeduction.IsApplied,
        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentSourceDeductions', 'IsApplied', null, [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsApplied', CustomFieldErrorType.required))
        ])
      ],
      RatePercentage: [
        paymentSourceDeduction.RatePercentage,
        paymentSourceDeduction.IsApplied && paymentSourceDeduction.RatePercentage !== null
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentSourceDeductions', 'RatePercentage', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RatePercentage', CustomFieldErrorType.required))
            ])
          : null
      ],
      RateAmount: [
        paymentSourceDeduction.RateAmount,
        paymentSourceDeduction.IsApplied && paymentSourceDeduction.SourceDeductionTypeId === PhxConstants.SourceDeductionType.AdditionalTax
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentSourceDeductions', 'RateAmount', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RateAmount', CustomFieldErrorType.required))
            ])
          : null
      ],
      IsOverWritable: [paymentSourceDeduction.IsOverWritable],
      SourceDeductionTypeId: [paymentSourceDeduction.SourceDeductionTypeId],
      ToShow: [paymentSourceDeduction.ToShow]
    });
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupSourceDeductions: FormArray<IPaymentInfoDetails>): IWorkOrder {
    const sourceDeductions = formGroupSourceDeductions.value;
    sourceDeductions.forEach((paymentInfo: IPaymentInfoDetails) => {
      const paymentInfoIndex = workOrder.WorkOrderVersion.PaymentInfoes.findIndex(a => a.Id === paymentInfo.PaymentInfoId);
      workOrder.WorkOrderVersion.PaymentInfoes[paymentInfoIndex].PaymentSourceDeductions = paymentInfo.PaymentSourceDeductions;
    });
    return workOrder;
  }
}
