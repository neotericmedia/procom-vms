import { WorkorderPaymentRateComponent } from './../workorder-payment-rate/workorder-payment-rate.component';
import { WorkorderBillingRateComponent } from './../workorder-billing-rate/workorder-billing-rate.component';
import { CustomFieldService } from './../../common/services/custom-field.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import {
  ITabPartiesandRates,
  IFormGroupSetup,
  IIncentiveCompensation,
  IRebateAndVMSFee,
  IReadOnlyStorage,
  IPartiesRateDetail,
  IBillingPartyInfoes,
  IBillingRate,
  IPaymentPartyInfoes,
  IPaymentPartiesRateDetail,
  IWorkOrder,
  IRoot,
  IBillingRatesDetails,
  IFormGroupOnNew,
  IPaymentRate
} from './../state/index';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkorderIncentiveCompensationComponent } from './../workorder-incentive-compensation/workorder-incentive-compensation.component';
import { WorkorderBillingPartyComponent } from '../workorder-billing-party/workorder-billing-party.component';
import { WorkorderPaymentPartyComponent } from '../workorder-payment-party/workorder-payment-party.component';
@Component({
  selector: 'app-workorder-tab-parties',
  templateUrl: './workorder-tab-parties.component.html'
})
export class WorkorderTabPartiesComponent implements OnInit {
  @Input() inputFormGroup: FormGroup<ITabPartiesandRates>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter<any>();
  constructor(private formBuilder: FormBuilder, private customFieldService: CustomFieldService) {}

  ngOnInit() {}
  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: any, workorderObservableService: WorkorderObservableService): FormGroup<ITabPartiesandRates> {
    const incentiveCompensation: IIncentiveCompensation = {
      IsEligibleForCommission: workorder.WorkOrderVersion.IsEligibleForCommission,
      IsThirdPartyImport: workorder.WorkOrderVersion.IsThirdPartyImport,
      CommissionThirdPartyWorkerReference: workorder.WorkOrderVersion.CommissionThirdPartyWorkerReference,
      IsCommissionVacation: workorder.WorkOrderVersion.PaymentInfoes[0].IsCommissionVacation
    };
    const rebateAndVMSFee: IRebateAndVMSFee = {
      HasRebate: workorder.WorkOrderVersion.HasRebate,
      HasVmsFee: workorder.WorkOrderVersion.HasVmsFee,
      RebateHeaderId: workorder.WorkOrderVersion.RebateHeaderId,
      RebateTypeId: workorder.WorkOrderVersion.RebateTypeId,
      RebateRate: workorder.WorkOrderVersion.RebateRate,
      VmsFeeHeaderId: workorder.WorkOrderVersion.VmsFeeHeaderId,
      VmsFeeTypeId: workorder.WorkOrderVersion.VmsFeeTypeId,
      VmsFeeRate: workorder.WorkOrderVersion.VmsFeeRate
    };

    const billingPartiesDeatails: Array<IPartiesRateDetail> = [];
    const paymentPartiesDeatails: Array<IPaymentPartiesRateDetail> = [];
    const billingHour = workorder.WorkOrderVersion.BillingInfoes[0].Hours;
    workorder.WorkOrderVersion.BillingInfoes.forEach(element => {
      const billingPartiesRates: IPartiesRateDetail = {
        Id: element.Id,
        Hours: element.Hours,
        CurrencyId: element.CurrencyId,
        UserProfileIdClient: element.UserProfileIdClient,
        OrganizationIdClient: element.OrganizationIdClient,
        OrganizationClientDisplayName: element.OrganizationClientDisplayName,
        BillingRatesDetail: {
          BillingRates: element.BillingRates
        },
        RebateAndVMSFee: rebateAndVMSFee
      };
      billingPartiesDeatails.push(billingPartiesRates);
    });

    workorder.WorkOrderVersion.PaymentInfoes.forEach(element => {
      const paymentPartiesRates: IPaymentPartiesRateDetail = {
        Id: element.Id,
        Hours: billingHour,
        CurrencyId: element.CurrencyId,
        OrganizationSupplierDisplayName: element.OrganizationSupplierDisplayName,
        OrganizationIdSupplier: element.OrganizationIdSupplier,
        UserProfileIdSupplier: element.UserProfileIdSupplier,
        IsCommissionVacation: element.IsCommissionVacation,
        UserProfileIdWorker: workorder.UserProfileIdWorker,
        PaymentOtherEarnings: element.PaymentOtherEarnings,
        PaymentSourceDeductions: element.PaymentSourceDeductions,
        PaymentContacts: element.PaymentContacts,
        PaymentSalesTaxes: element.PaymentSalesTaxes,
        PaymentInvoices: element.PaymentInvoices,
        IsUseUserProfileWorkerSourceDeduction: element.IsUseUserProfileWorkerSourceDeduction,
        ApplySalesTax: element.ApplySalesTax,
        WorkOrderVersionId: element.WorkOrderVersionId,
        SubdivisionIdSalesTax: element.SubdivisionIdSalesTax,
        SubdivisionIdSourceDeduction: element.SubdivisionIdSourceDeduction,
        PaymentRatesDetail: {
          PaymentRates: element.PaymentRates
        }
      };
      paymentPartiesDeatails.push(paymentPartiesRates);
    });

    const formGroup: FormGroup<ITabPartiesandRates> = formGroupSetup.formBuilder.group<ITabPartiesandRates>({
      Id: workorder.Id,
      TabPartyBillingInfoes: formGroupSetup.formBuilder.group<IBillingPartyInfoes>({
        PartiesRateDetails: WorkorderBillingPartyComponent.formBuilderGroupSetup(formGroupSetup, billingPartiesDeatails)
      }),
      TabPartyPaymentInfoes: formGroupSetup.formBuilder.group<IPaymentPartyInfoes>({
        PaymentPartiesRateDetails: WorkorderPaymentPartyComponent.formBuilderGroupSetup(formGroupSetup, paymentPartiesDeatails)
      }),
      IncentiveCompensation: WorkorderIncentiveCompensationComponent.formBuilderGroupSetup(formGroupSetup, incentiveCompensation, workorderObservableService),
      UserProfileIdWorker: workorder.WorkOrderVersion.UserProfileIdWorker
    });
    return formGroup;
  }

  onOutputEvent(isTabParties = false) {
    this.outputEvent.emit(isTabParties);
  }

  onAddBillingPartyRate() {
    const BillingRates = this.getBillingRatesFormArray();
    const formGroupOnNew: IFormGroupOnNew = {
      formBuilder: this.formBuilder,
      customFieldService: this.customFieldService
    };
    BillingRates.push(WorkorderBillingRateComponent.formBuilderGroupAddNewRate(formGroupOnNew));
  }

  onAddPaymentPartyRate(rateTypeId) {
    const paymentRatesFormArrays = this.getPaymentRatesFormArrays();
    const formGroupOnNew: IFormGroupOnNew = {
      formBuilder: this.formBuilder,
      customFieldService: this.customFieldService
    };
    if (paymentRatesFormArrays && paymentRatesFormArrays.length) {
      paymentRatesFormArrays.forEach((PaymentRates) => {
        PaymentRates.push(WorkorderPaymentRateComponent.formBuilderGroupAddNewRate(formGroupOnNew, <IPaymentRate>{
          RateTypeId: rateTypeId
        }));
      });
    }
  }

  onRemoveBillingPartyRate(rateIndex) {
    const BillingRatesFormArray = this.getBillingRatesFormArray();
    if (BillingRatesFormArray) {
      const BillingRate = BillingRatesFormArray.at(rateIndex);
      const RateTypeId = BillingRate ? BillingRate.get('RateTypeId') : null;
      const rateTypeIdValue = RateTypeId ? RateTypeId.value : null;
      this.removePaymentPartyRate(rateTypeIdValue);
      BillingRatesFormArray.removeAt(rateIndex);
    }
    this.outputEvent.emit();
  }

  private removePaymentPartyRate(rateTypeId) {
    const paymentRatesFormArrays = this.getPaymentRatesFormArrays();
    if (paymentRatesFormArrays && paymentRatesFormArrays.length) {
      paymentRatesFormArrays.forEach((PaymentRates) => {
        const maxLength = PaymentRates ? PaymentRates.length : 0;
        for(let i = maxLength - 1; i >= 0; i--) {
          const PaymentRate = PaymentRates.at(i);
          const RateTypeId = PaymentRate ? PaymentRate.get('RateTypeId') : null;
          const rateTypeIdValue = RateTypeId ? RateTypeId.value : null;
          if (rateTypeIdValue !== null && rateTypeIdValue === rateTypeId) {
            PaymentRates.removeAt(i);
          }
        }
      });
    }
  }

  private getBillingRatesFormArray(): FormArray<IBillingRate> {
    const TabPartyBillingInfoes = this.inputFormGroup ? this.inputFormGroup.get('TabPartyBillingInfoes') : null;
    const PartiesRateDetails = TabPartyBillingInfoes ? <FormArray<IPartiesRateDetail>>TabPartyBillingInfoes.get('PartiesRateDetails') : null;
    const PartiesRateDetail = PartiesRateDetails ? PartiesRateDetails.at(0) : null;
    const BillingRatesDetail = PartiesRateDetail ? PartiesRateDetail.get('BillingRatesDetail') : null;
    const BillingRates = BillingRatesDetail ? <FormArray<IBillingRate>>BillingRatesDetail.get('BillingRates') : null;
    return BillingRates;
  }

  private getPaymentRatesFormArrays(): Array<FormArray<IBillingRate>> {
    const paymentRatesFormArrays: Array<FormArray<IBillingRate>> = [];
    const TabPartyPaymentInfoes = this.inputFormGroup ? this.inputFormGroup.get('TabPartyPaymentInfoes') : null;
    const PaymentPartiesRateDetails = TabPartyPaymentInfoes ? <FormArray<IPaymentPartiesRateDetail>>TabPartyPaymentInfoes.get('PaymentPartiesRateDetails') : null;
    if (PaymentPartiesRateDetails && PaymentPartiesRateDetails.length) {
      for (let i = 0; i < PaymentPartiesRateDetails.length; i++) {
        const PaymentPartiesRateDetail = PaymentPartiesRateDetails.at(i);
        const PaymentRatesDetail = PaymentPartiesRateDetail ? PaymentPartiesRateDetail.get('PaymentRatesDetail') : null;
        const PaymentRates = PaymentRatesDetail ? <FormArray<IBillingRate>>PaymentRatesDetail.get('PaymentRates') : null;
        if (PaymentRates) {
          paymentRatesFormArrays.push(PaymentRates);
        }
      }
    }
    return paymentRatesFormArrays;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupRoot: FormGroup<IRoot>): IWorkOrder {
    let billingHour: number;
    const formGroupTabParties: FormGroup<ITabPartiesandRates> = <FormGroup<ITabPartiesandRates>>formGroupRoot.controls.TabParties;
    workOrder = WorkorderBillingPartyComponent.formGroupToPartial(workOrder, <FormGroup<any>>formGroupTabParties.controls.TabPartyBillingInfoes);
    billingHour = workOrder.WorkOrderVersion.BillingInfoes[0].Hours;
    // workOrder = WorkorderPaymentPartyComponent.formGroupToPartial(workOrder, <FormGroup<any>>formGroupTabParties.controls.TabPartyPaymentInfoes, billingHour);
    workOrder = WorkorderIncentiveCompensationComponent.formGroupToPartial(workOrder, <FormGroup<IIncentiveCompensation>>formGroupTabParties.controls.IncentiveCompensation);
    return workOrder;
  }
}
