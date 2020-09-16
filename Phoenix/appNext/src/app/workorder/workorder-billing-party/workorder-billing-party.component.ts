import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { IFormGroupSetup, IBillingPartyInfoes, IPartiesRateDetail, IBillingRatesDetails, IWorkOrder, IPaymentPartiesRateDetail, IPaymentRate, ITabPartiesandRates, IReadOnlyStorage, IPaymentPartyInfoes } from '../state/workorder.interface';
import { FormArray, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions, PhxConstants } from '../../common';
import { CustomFieldErrorType, CodeValue } from '../../common/model';
import { WorkorderBillingRateComponent } from '../workorder-billing-rate/workorder-billing-rate.component';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { WorkorderService } from '../workorder.service';
import { WorkorderRebateVmsfeeComponent } from '../workorder-rebate-vmsfee/workorder-rebate-vmsfee.component';
import { IFormGroupValue } from '../../common/utility/form-group';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { HashModel } from '../../common/utility/hash-model';
import { cloneDeep, find, remove, uniq, isArray, slice, indexOf } from 'lodash';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';
import { CommonListsObservableService } from '../../common/lists/lists.observable.service';

@Component({
  selector: 'app-workorder-billing-party',
  templateUrl: './workorder-billing-party.component.html',
  styleUrls: ['./workorder-billing-party.component.less']
})
export class WorkorderBillingPartyComponent extends WorkOrderBaseComponentPresentational<IPartiesRateDetail> implements OnInit {
  @Input() billingInfoIndex: number;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() addBillingPartyRate = new EventEmitter();
  @Output() removeBillingPartyRate = new EventEmitter<number>();
  @Output() addPaymentPartyRate = new EventEmitter<number>();
  paymentInfo: Array<IPaymentPartiesRateDetail>;
  static phxConstantsList: any;
  static hashModels: any;
  oldBillingInfo: any;
  AtsPlacementId: number;
  TransactionHeaderCount: number;
  WorkOrderVersionActiveCount: number;
  setCurrency: boolean = false;
  isDraftStatus: boolean;
  html: {
    parentOrganizationNameFromList: boolean;
    codeValueLists: {
      listCurrency: Array<CodeValue>;
      profileTypeList: Array<CodeValue>;
    };
    commonLists: {
      listOrganizationClient: Array<any>;
      ProfilesListForBillingOrganization: Array<any>;
    };
  } = {
    parentOrganizationNameFromList: false,
    codeValueLists: {
      listCurrency: [],
      profileTypeList: []
    },
    commonLists: {
      listOrganizationClient: [],
      ProfilesListForBillingOrganization: []
    }
  };

  constructor(private workorderService: WorkorderService, private workorderObservableService: WorkorderObservableService, private changeRef: ChangeDetectorRef, private listObservableService: CommonListsObservableService) {
    super('WorkorderBillingPartyComponent');
    this.getCodeValuelistsStatic();
    WorkorderBillingPartyComponent.phxConstantsList = this.phxConstants;
    WorkorderBillingPartyComponent.hashModels = new HashModel();
    this.getLists();
  }

  ngOnInit() {
    this.workorderObservableService
      .workorderOnRouteChange$(this, true)
      .takeUntil(this.isDestroyed$)
      .subscribe(workorder => {
        if (workorder) {
          this.oldBillingInfo = cloneDeep(workorder.WorkOrderVersion.BillingInfoes);
          this.AtsPlacementId = workorder.AtsPlacementId;
          this.TransactionHeaderCount = workorder.TransactionHeaderCount;
          this.WorkOrderVersionActiveCount = workorder.WorkOrderVersionActiveCount;
          this.isDraftStatus = workorder.WorkOrderVersion.IsDraftStatus;
          this.getClientManagers();
        }
      });
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  businessRules(obj: IFormGroupValue): void {
    if (obj.name === 'CurrencyId') {
      if (!this.setCurrency) {
        const formGroupParent: any = this.getRootFormGroup(this.inputFormGroup);
        const formGroupBilling = (<any>formGroupParent.controls.TabParties.controls.TabPartyPaymentInfoes) as FormGroup<IPaymentPartyInfoes>;
        const formArrayBilling = formGroupBilling.controls.PaymentPartiesRateDetails as FormArray<IPaymentPartiesRateDetail>;
        const currencyElement = formArrayBilling.at(0) as FormGroup<IPaymentPartiesRateDetail>;
        currencyElement.get('CurrencyId').patchValue(obj.val, { emitEvent: false });
        this.setCurrency = true;
      }
    }
  }

  onChangeOrganizationIdClient() {
    if (this.inputFormGroup.controls.OrganizationIdClient.value && this.inputFormGroup.controls.OrganizationIdClient.value > 0) {
      this.getClientManagers();
      const organizationClient = find(this.html.commonLists.listOrganizationClient, (organization: any) => {
        return organization.Id === Number(this.inputFormGroup.controls.OrganizationIdClient.value);
      });
      if (organizationClient) {
        this.inputFormGroup.controls.OrganizationClientDisplayName.patchValue(organizationClient.DisplayName);
      }
    }
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCurrency = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true);
    this.html.codeValueLists.profileTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.ProfileType, true);
  }

  recalcAccessActions() {}

  recalcLocalProperties() {}

  getClientManagers() {
    if (this.inputFormGroup && this.inputFormGroup.controls.OrganizationIdClient.value > 0) {
      this.workorderService.getProfilesListOrganizational(this.inputFormGroup.controls.OrganizationIdClient.value, null).subscribe((response: any) => {
        this.html.commonLists.ProfilesListForBillingOrganization = response.Items;
        if (response.Items) {
          this.html.commonLists.ProfilesListForBillingOrganization.forEach(i => {
            i.DisplayValue = i.Contact.FullName + ' - ' + i.ContactId;
          });
          this.removeInactiveProfileWithConfig(null, this.html.commonLists.ProfilesListForBillingOrganization, this.inputFormGroup.controls.UserProfileIdClient.value);
        }
      });
    } else {
      this.html.commonLists.ProfilesListForBillingOrganization = [];
    }
  }

  removeInactiveProfileWithConfig(config = null, profiles: any, exceptionIds: any) {
    const inactiveProfileStatusIds = [2, 9, 10];
    const settings = Object.assign({}, { profileStatusId: 'ProfileStatusId', id: 'Id' }, config);
    const exceptionProfileIds = uniq(isArray(exceptionIds) ? exceptionIds : slice(arguments, 2));
    remove(profiles, function(profile) {
      return indexOf(inactiveProfileStatusIds, profile[settings.profileStatusId]) > -1 && indexOf(exceptionProfileIds, profile[settings.id]) < 0;
    });
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, billingInfoes: Array<IPartiesRateDetail>): FormArray<IPartiesRateDetail> {
    const frormBilling = formGroupSetup.formBuilder.array<IPartiesRateDetail>(
      billingInfoes.map((info: IPartiesRateDetail, index) =>
        formGroupSetup.formBuilder.group<IPartiesRateDetail>({
          Id: [info.Id],
          OrganizationIdClient: [info.OrganizationIdClient],
          UserProfileIdClient: [
            info.UserProfileIdClient,
            PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes', 'UserProfileIdClient', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileIdClient', CustomFieldErrorType.required))
            ])
          ],
          Hours: [
            info.Hours,
            PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes', 'Hours', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Hours', CustomFieldErrorType.required))
            ])
          ],
          CurrencyId: [
            info.CurrencyId,
            PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes', 'CurrencyId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CurrencyId', CustomFieldErrorType.required))
            ])
          ],
          OrganizationClientDisplayName: [info.OrganizationClientDisplayName],
          BillingRatesDetail: formGroupSetup.formBuilder.group<IBillingRatesDetails>({
            BillingRates: WorkorderBillingRateComponent.formBuilderGroupSetup(formGroupSetup, info.BillingRatesDetail.BillingRates),
            selectedRateType: [info.BillingRatesDetail.BillingRates]
          }),
          RebateAndVMSFee: WorkorderRebateVmsfeeComponent.formBuilderGroupSetup(formGroupSetup, info.RebateAndVMSFee)
        })
      )
    );
    return frormBilling;
  }

  getLists() {
    this.listObservableService
      .listOrganizations$()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        if (response) {
          this.html.commonLists.listOrganizationClient = response;
        }
      });
  }

  floatApplyTwoDecimalPlaces(value: string) {
    if (isNaN(Number(value)) || value === null) {
      return null;
    }
    const key = parseFloat(value).toFixed(2);
    return key;
  }

  removeBillingInfo() {
    this.inputFormGroup.controls.BillingRatesDetail['BillingRates'].splice(this.billingInfoIndex, 1);
    this.onOutputEvent();
  }

  eraseBillingInfo() {
    const oldBillingInfo = cloneDeep(this.oldBillingInfo[this.billingInfoIndex]);
    this.inputFormGroup.controls.OrganizationIdClient.setValue(0);
    this.inputFormGroup.controls.Hours.setValue(oldBillingInfo.Hours);
    this.inputFormGroup.controls.CurrencyId.setValue(oldBillingInfo.CurrencyId);
    this.inputFormGroup.controls.BillingRatesDetail.get('BillingRates').setValue(oldBillingInfo.BillingRates);
    this.resetRebateAndVmsFee();
  }

  resetRebateAndVmsFee() {
    this.resetRebate();
    this.resetVmsFee();
  }

  resetRebate() {
    this.inputFormGroup.controls.RebateAndVMSFee.get('RebateHeaderId').setValue(null);
    this.inputFormGroup.controls.RebateAndVMSFee.get('RebateTypeId').setValue(null);
    this.inputFormGroup.controls.RebateAndVMSFee.get('RebateRate').setValue(null);
  }
  resetVmsFee() {
    this.inputFormGroup.controls.RebateAndVMSFee.get('VmsFeeHeaderId').setValue(null);
    this.inputFormGroup.controls.RebateAndVMSFee.get('VmsFeeTypeId').setValue(null);
    this.inputFormGroup.controls.RebateAndVMSFee.get('VmsFeeRate').setValue(null);
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formGroupToPartial(workorder: IWorkOrder, formGroupBillingPartyInfoes: FormGroup<IBillingPartyInfoes>): IWorkOrder {
    const formGroupBillingInfoes: FormGroup<IBillingPartyInfoes> = formGroupBillingPartyInfoes;
    const formGroup: FormGroup<ITabPartiesandRates> = <FormGroup<ITabPartiesandRates>>formGroupBillingPartyInfoes.parent;
    const formArray: any = formGroupBillingInfoes.controls.PartiesRateDetails;
    const formRebate: any = formArray.at(0).controls.RebateAndVMSFee;
    const billingInfoes: any = formGroupBillingInfoes.value;
    let oldhash,
      newhash = '';
    if (this.hashModels) {
      oldhash = this.hashModels.md5(JSON.stringify(workorder.WorkOrderVersion.BillingInfoes[0].BillingRates));
      newhash = this.hashModels.md5(JSON.stringify(billingInfoes.PartiesRateDetails[0].BillingRatesDetail.BillingRates));
    }
    const currentBillingInfo = cloneDeep(workorder.WorkOrderVersion.BillingInfoes);
    billingInfoes.PartiesRateDetails.forEach((billingInfo, j) => {
      const index = workorder.WorkOrderVersion.BillingInfoes.findIndex(a => a.Id === billingInfo.Id);
      workorder.WorkOrderVersion.BillingInfoes[index] = {
        ...workorder.WorkOrderVersion.BillingInfoes[index],
        CurrencyId: billingInfo.CurrencyId,
        UserProfileIdClient: billingInfo.UserProfileIdClient,
        Hours: billingInfo.Hours,
        OrganizationIdClient: billingInfo.OrganizationIdClient,
        BillingRates: billingInfo.BillingRatesDetail.BillingRates
      };
    });
    const formPayArrayPartyDetails: FormArray<IPaymentPartiesRateDetail> = <FormArray<IPaymentPartiesRateDetail>>formGroup.controls.TabPartyPaymentInfoes.get('PaymentPartiesRateDetails');
    if (oldhash === newhash) {
      const newPaymentInfo: any = [];
      formPayArrayPartyDetails.value.forEach(paymentInfo => {
        if (paymentInfo.Id > 0 && workorder.WorkOrderVersion.PaymentInfoes.findIndex(a => a.Id === paymentInfo.Id) !== -1) {
          let paymentInfoFromWorkOrder: any = workorder.WorkOrderVersion.PaymentInfoes.find(a => a.Id === paymentInfo.Id);
          const updatedPaymentInfo = { ...paymentInfo };
          const updatedPaymentRates: any = updatedPaymentInfo.PaymentRatesDetail;
          updatedPaymentRates.PaymentRates.map(a => {
            a.Rate = a.Rate ? Number(a.Rate) : a.Rate;
            return a;
          });
          delete updatedPaymentInfo.PaymentRatesDetail;
          paymentInfoFromWorkOrder = { ...paymentInfoFromWorkOrder, ...updatedPaymentInfo, PaymentRates: updatedPaymentRates.PaymentRates };
          newPaymentInfo.push(paymentInfoFromWorkOrder);
        } else {
          const updatedPaymentInfo = { ...paymentInfo };
          const updatedPaymentRates = updatedPaymentInfo.PaymentRatesDetail;
          delete updatedPaymentInfo.PaymentRatesDetail;
          const data = { ...updatedPaymentInfo, PaymentRates: updatedPaymentRates.PaymentRates };
          newPaymentInfo.push(data);
        }
      });
      workorder.WorkOrderVersion.PaymentInfoes = newPaymentInfo;
      workorder.WorkOrderVersion.PaymentInfoes.forEach((paymentInfo, index) => {
        if (index > 0) {
          const paymentRates = cloneDeep(workorder.WorkOrderVersion.PaymentInfoes[0].PaymentRates);
          paymentRates.forEach((rate, j) => {
            const ind = paymentInfo.PaymentRates.findIndex(a => a.RateTypeId === rate.RateTypeId);
            if (ind !== -1) {
              paymentRates[ind].Rate = paymentInfo.PaymentRates.find(a => a.RateTypeId === rate.RateTypeId).Rate;
              paymentRates[ind].IsApplyStatHoliday = paymentInfo.PaymentRates.find(a => a.RateTypeId === rate.RateTypeId).IsApplyStatHoliday || false;
              paymentRates[ind].IsApplyDeductions = paymentInfo.PaymentRates.find(a => a.RateTypeId === rate.RateTypeId).IsApplyDeductions || false;
              paymentRates[ind].IsApplyVacation = paymentInfo.PaymentRates.find(a => a.RateTypeId === rate.RateTypeId).IsApplyVacation || false;
            }
          });
          paymentInfo.PaymentRates = paymentRates;
        }
      });
      const paymentInfoPaymentRate = workorder.WorkOrderVersion.PaymentInfoes[0].PaymentRates;
      workorder.WorkOrderVersion.BillingInfoes.forEach(billingInfo => {
        billingInfo.BillingRates.forEach(billingRate => {
          const paymentRate = paymentInfoPaymentRate.find(a => a.RateTypeId === billingRate.RateTypeId);
          if (paymentRate) {
            if (paymentRate.RateUnitId === PhxConstants.RateUnit.Monthly || paymentRate.RateUnitId === PhxConstants.RateUnit.Words || (paymentRate.RateUnitId === PhxConstants.RateUnit.Shift && paymentRate.RateUnitId)) {
              billingRate.RateUnitId = paymentRate.RateUnitId;
            }
          }
        });
      });
    } else {
      const paymentInfo = workorder.WorkOrderVersion.PaymentInfoes[0];
      const paymentInfoFromFormGroup = formPayArrayPartyDetails.value[0];
      const paymentRates: any = [];
      workorder.WorkOrderVersion.BillingInfoes[0].BillingRates.forEach(billingRate => {
        const previousRate = currentBillingInfo[0].BillingRates.find(a => a.RateTypeId === billingRate.RateTypeId);
        if (paymentInfo.PaymentRates.findIndex(a => a.RateTypeId === billingRate.RateTypeId) !== -1) {
          const paymentRate: IPaymentRate = paymentInfoFromFormGroup.PaymentRatesDetail.PaymentRates.find(a => a.RateTypeId === billingRate.RateTypeId);
          if (
            (billingRate.RateUnitId === PhxConstants.RateUnit.Monthly || billingRate.RateUnitId === PhxConstants.RateUnit.Words || billingRate.RateUnitId === PhxConstants.RateUnit.Shift) &&
            Number(previousRate.RateUnitId) !== Number(billingRate.RateUnitId)
          ) {
            paymentRate.RateUnitId = billingRate.RateUnitId;
          }
          paymentRates.push(paymentRate);
        } else {
          const paymentRate: IPaymentRate = {
            Id: 0,
            IsApplyDeductions: true,
            IsApplyVacation: true,
            IsApplyStatHoliday: false,
            IsDraft: true,
            PaymentInfoId: 0,
            Rate: null,
            RateTypeId: billingRate.RateTypeId,
            RateUnitId: null
          };
          if (billingRate.RateTypeId) {
            paymentRates.push(paymentRate);
          }
        }
      });
      paymentInfo.PaymentRates = paymentRates;
      workorder.WorkOrderVersion.PaymentInfoes[0] = paymentInfo;
      workorder.WorkOrderVersion.PaymentInfoes.forEach((info, index) => {
        if (index > 0) {
          const rates = cloneDeep(workorder.WorkOrderVersion.PaymentInfoes[0].PaymentRates);
          rates.forEach((rate, j) => {
            const ind = info.PaymentRates.findIndex(a => a.RateTypeId === rate.RateTypeId);
            if (ind !== -1) {
              rates[ind].Rate = info.PaymentRates.find(a => a.RateTypeId === rate.RateTypeId).Rate;
            }
          });
          info.PaymentRates = rates;
        }
      });
    }
    WorkorderRebateVmsfeeComponent.formGroupToPartial(workorder, formRebate);
    return workorder;
  }

  onAddBillingPartyRate() {
    this.addBillingPartyRate.emit();
  }

  onRemoveBillingPartyRate(rateIndex) {
    this.removeBillingPartyRate.emit(rateIndex);
  }

  onAddPaymentPartyRate(rateTypeId) {
    this.addPaymentPartyRate.emit(rateTypeId);
  }
}
