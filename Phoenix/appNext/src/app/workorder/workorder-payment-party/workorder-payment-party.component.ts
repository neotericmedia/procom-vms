import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import {
  IFormGroupSetup,
  IPaymentPartiesRateDetail,
  IPaymentRatesDetail,
  ITabPartiesandRates,
  IWorkOrder,
  IPaymentPartyInfoes,
  IPaymentRate,
  IReadOnlyStorage,
  IBillingPartyInfoes,
  IPartiesRateDetail,
  IFormGroupOnNew
} from '../state/workorder.interface';
import { FormArray, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions, PhxConstants } from '../../common';
import { CustomFieldErrorType, CodeValue } from '../../common/model';
import { WorkorderPaymentRateComponent } from '../workorder-payment-rate/workorder-payment-rate.component';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { WorkorderService } from '../workorder.service';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { HashModel } from '../../common/utility/hash-model';
import { cloneDeep, each, uniq, isArray, slice, remove, indexOf, filter } from 'lodash';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';
import { IFormGroupValue } from '../../common/utility/form-group';

@Component({
  selector: 'app-workorder-payment-party',
  templateUrl: './workorder-payment-party.component.html',
  styleUrls: ['./workorder-payment-party.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkorderPaymentPartyComponent extends WorkOrderBaseComponentPresentational<IPaymentPartiesRateDetail> implements OnInit {
  @Input() paymentInfoIndex: number;
  @Input() readOnlyStorage: IReadOnlyStorage;
  UserProfileIdWorkerForm: FormGroup<ITabPartiesandRates>;
  static phxConstantsList: any;
  static hashModels: any;
  oldPaymentInfoes: any;
  AtsPlacementId: number;
  workerProfileTypeId: number;
  setCurrency: boolean = false;
  isDraftStatus: boolean;
  isProduction: boolean;
  currentWorkOrderVersionId: number;
  workorderDetails: any;
  worker: any;
  html: {
    codeValueLists: {
      listCurrency: Array<CodeValue>;
      listProfileTypeList: Array<CodeValue>;
    };
    commonLists: {
      listProfilesListForPaymentOrganization: Array<any>;
      listOrganizationSupplier: Array<any>;
      listUserProfileWorker: Array<any>;
      listavailableVmsFees: Array<any>;
    };
    lists: {
      t4PrintableYears: Array<any>;
      phxConstants: any;
    };
  } = {
    codeValueLists: {
      listCurrency: [],
      listProfileTypeList: []
    },
    commonLists: {
      listProfilesListForPaymentOrganization: [],
      listOrganizationSupplier: [],
      listUserProfileWorker: [],
      listavailableVmsFees: []
    },
    lists: {
      t4PrintableYears: [2018, 2019],
      phxConstants: {}
    }
  };

  constructor(private workorderService: WorkorderService, private workorderObservableService: WorkorderObservableService, private changeRef: ChangeDetectorRef) {
    super('WorkorderPaymentPartyComponent');
    this.getCodeValuelistsStatic();
    WorkorderPaymentPartyComponent.phxConstantsList = PhxConstants;
    WorkorderPaymentPartyComponent.hashModels = new HashModel();
    this.isProduction = (<any>window).isProduction;
    this.html.lists.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.workorderObservableService
      .workorderOnRouteChange$(this, true)
      .takeUntil(this.isDestroyed$)
      .subscribe(workorder => {
        if (workorder) {
          this.workorderDetails = workorder;
          this.oldPaymentInfoes = cloneDeep(workorder.WorkOrderVersion.PaymentInfoes);
          this.AtsPlacementId = workorder.AtsPlacementId;
          this.workerProfileTypeId = workorder.workerProfileTypeId;
          this.isDraftStatus = workorder.WorkOrderVersion.IsDraftStatus;
          this.currentWorkOrderVersionId = workorder.WorkOrderVersion.Id;
          if (this.inputFormGroup.controls.Id.value === 0 && !this.inputFormGroup.controls.OrganizationIdSupplier.value) {
            this.html.commonLists.listProfilesListForPaymentOrganization = [];
          }
          this.setHoursBasedOnBillingInfoes(workorder);
          this.getLists();
          this.getListUserProfile();
        }
      });
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  businessRules(obj: IFormGroupValue): void {
    switch (obj.name) {
      case 'CurrencyId': {
        if (!this.setCurrency) {
          const formGroupParent: any = this.getRootFormGroup(this.inputFormGroup);
          const formGroupBilling = (<any>formGroupParent.controls.TabParties.controls.TabPartyBillingInfoes) as FormGroup<IBillingPartyInfoes>;
          const formArrayBilling = formGroupBilling.controls.PartiesRateDetails as FormArray<IPartiesRateDetail>;
          const currencyElement = formArrayBilling.at(0) as FormGroup<IPartiesRateDetail>;
          currencyElement.get('CurrencyId').patchValue(obj.val, { emitEvent: false });
          this.setCurrency = true;
        }
        break;
      }
      case 'OrganizationIdSupplier':
        {
          this.onChangeOrganizationIdSupplier();
        }
        break;
      default: {
      }
    }
  }

  recalcLocalProperties() {}

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCurrency = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true);
    this.html.codeValueLists.listProfileTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.ProfileType, true);
  }

  onChangeOrganizationIdSupplier() {
    if (this.inputFormGroup.controls.OrganizationIdSupplier.value && this.inputFormGroup.controls.OrganizationIdSupplier.value > 0) {
      each(this.html.commonLists.listOrganizationSupplier, i => {
        if (i.Id === this.inputFormGroup.controls.OrganizationIdSupplier.value) {
          this.inputFormGroup.controls.OrganizationSupplierDisplayName.patchValue(i.DisplayName);
        }
      });
      this.getPrimaryContact(this.inputFormGroup.controls.OrganizationIdSupplier.value);
    }
  }

  downloadT4(workOrderVersionId: any, year: any) {
    return this.workorderService.downloadT4(workOrderVersionId, year);
  }

  downloadT4A(workOrderVersionId: any, year: any) {
    return this.workorderService.downloadT4A(workOrderVersionId, year);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, paymentInfoes: Array<IPaymentPartiesRateDetail>): FormArray<IPaymentPartiesRateDetail> {
    const form = formGroupSetup.formBuilder.array<IPaymentPartiesRateDetail>(
      paymentInfoes.map((info: IPaymentPartiesRateDetail, index) =>
        formGroupSetup.formBuilder.group<IPaymentPartiesRateDetail>({
          Id: [info.Id],
          Hours: [info.Hours, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Hours', CustomFieldErrorType.required))]],
          CurrencyId: [
            info.CurrencyId,
            PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes', 'CurrencyId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CurrencyId', CustomFieldErrorType.required))
            ])
          ],
          OrganizationIdSupplier: [info.OrganizationIdSupplier, index > 0 ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationIdSupplier', CustomFieldErrorType.required))] : null],
          OrganizationSupplierDisplayName: [info.OrganizationSupplierDisplayName],
          UserProfileIdSupplier: [
            info.UserProfileIdSupplier,
            PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes', 'UserProfileIdSupplier', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileIdSupplier', CustomFieldErrorType.required))
            ])
          ],
          UserProfileIdWorker: [info.UserProfileIdWorker],
          PaymentRatesDetail: formGroupSetup.formBuilder.group<IPaymentRatesDetail>({
            PaymentRates: WorkorderPaymentRateComponent.formBuilderGroupSetup(formGroupSetup, info.PaymentRatesDetail.PaymentRates)
          }),
          PaymentOtherEarnings: [info.PaymentOtherEarnings],
          PaymentSourceDeductions: [info.PaymentSourceDeductions],
          PaymentContacts: [info.PaymentContacts],
          PaymentSalesTaxes: [info.PaymentSalesTaxes],
          PaymentInvoices: [info.PaymentInvoices],
          ApplySalesTax: [info.ApplySalesTax],
          SubdivisionIdSalesTax: [info.SubdivisionIdSalesTax],
          SubdivisionIdSourceDeduction: [info.SubdivisionIdSourceDeduction],
          IsUseUserProfileWorkerSourceDeduction: [info.IsUseUserProfileWorkerSourceDeduction],
          WorkOrderVersionId: [info.WorkOrderVersionId]
        })
      )
    );
    return form;
  }

  public static formBuilderGroupAddNewPaymentRatesDetail(formGroupOnNew: IFormGroupOnNew, formPaymentRates: IPaymentRatesDetail): FormGroup<IPaymentRatesDetail> {
    const newForm = formGroupOnNew.formBuilder.group<IPaymentRatesDetail>({
      PaymentRates: WorkorderPaymentRateComponent.formBuilderNewPaymentRates(formGroupOnNew, formPaymentRates.PaymentRates)
    });
    return newForm;
  }

  getListProfilesListByOrganizationId() {
    this.workorderService
      .getProfilesListByOrganizationId(this.inputFormGroup.controls.OrganizationIdSupplier.value, null)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.html.commonLists.listProfilesListForPaymentOrganization = response.Items;
        this.removeInactiveProfileWithConfig(null, this.html.commonLists.listProfilesListForPaymentOrganization, this.inputFormGroup.controls.UserProfileIdSupplier.value);
        this.html.commonLists.listProfilesListForPaymentOrganization = this.html.commonLists.listProfilesListForPaymentOrganization.filter(e => e.ProfileTypeId !== this.phxConstants.UserProfileType.WorkerSubVendor);
        this.html.commonLists.listProfilesListForPaymentOrganization.forEach((val: any) => {
          val.DisplayValue = val.Contact.FullName + ' - ' + val.Contact.Id;
        });
        this.changeRef.detectChanges();
      });
  }

  getLists() {
    this.commonListsObservableService
      .listOrganizationSuppliers$()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        if (response) {
          this.html.commonLists.listOrganizationSupplier = response.map(orgSupplier => {
            orgSupplier.DisplayValue = (orgSupplier.DisplayName ? orgSupplier.DisplayName : '') + ' - ' + orgSupplier.Id;
            return orgSupplier;
          });
        }
      });
  }

  removeInactiveProfileWithConfig(config = null, profiles: any, exceptionIds: any) {
    const inactiveProfileStatusIds = [2, 9, 10];
    const settings = Object.assign({}, { profileStatusId: 'ProfileStatusId', id: 'Id' }, config);
    const exceptionProfileIds = uniq(isArray(exceptionIds) ? exceptionIds : slice(arguments, 2));
    remove(profiles, function(profile) {
      return indexOf(inactiveProfileStatusIds, profile[settings.profileStatusId]) > -1 && indexOf(exceptionProfileIds, profile[settings.id]) < 0;
    });
  }

  onChangeWorkerId() {}

  onOutputEvent(e) {
    this.outputEvent.emit();
  }

  public static formGroupToPartial(workorder: IWorkOrder, formGroupPaymentPartyInfoes: FormGroup<IPaymentPartyInfoes>, billingHour: number): IWorkOrder {
    return workorder;
  }

  public static formGroupToPartialRate(BaseRates: any, CurrentRates: any, workorder: IWorkOrder) {
    if (BaseRates.length !== CurrentRates.length) {
      const newPayment: IPaymentRate = {
        Id: 0,
        IsApplyDeductions: true,
        IsApplyVacation: true,
        IsApplyStatHoliday: false,
        IsDraft: true,
        PaymentInfoId: 0,
        Rate: null,
        RateTypeId: BaseRates[BaseRates.length - 1].RateTypeId,
        RateUnitId: null,
        SourceId: null
      };
      CurrentRates.push(newPayment);
    }
    BaseRates.map((value, index) => {
      CurrentRates[index].RateUnitId = value.RateUnitId;
      if (
        (CurrentRates[index].RateTypeId && this.phxConstantsList.RateUnit.Words === CurrentRates[index].RateUnitId) ||
        this.phxConstantsList.RateUnit.Monthly === CurrentRates[index].RateUnitId ||
        this.phxConstantsList.RateUnit.Shift === CurrentRates[index].RateUnitId
      ) {
        workorder.WorkOrderVersion.BillingInfoes.forEach(billingInfo => {
          billingInfo.BillingRates.forEach(billingRate => {
            if (billingRate.RateTypeId === CurrentRates[index].RateTypeId && billingRate.RateUnitId) {
              billingRate.RateUnitId = CurrentRates[index].RateUnitId;
            }
          });
        });
      }
    });
    return CurrentRates;
  }

  public static setPaymentRates(paymentrates: Array<IPaymentRate>) {
    const newPaymentRates: Array<IPaymentRate> = [];
    paymentrates.forEach(rate => {
      const newPayment: IPaymentRate = {
        Id: 0,
        IsApplyDeductions: true,
        IsApplyVacation: true,
        IsApplyStatHoliday: false,
        IsDraft: true,
        PaymentInfoId: 0,
        Rate: null,
        RateTypeId: rate.RateTypeId,
        RateUnitId: rate.RateUnitId,
        SourceId: null
      };
      newPaymentRates.push(newPayment);
    });

    return newPaymentRates;
  }

  erasePaymentInfo() {
    const oldPaymentInfo = cloneDeep(this.oldPaymentInfoes[this.paymentInfoIndex]);
    if (this.paymentInfoIndex === 0) {
      this.inputFormGroup.controls.OrganizationSupplierDisplayName.setValue(null);
    }
    this.inputFormGroup.controls.OrganizationIdSupplier.setValue(0);
    this.inputFormGroup.controls.Hours.setValue(oldPaymentInfo.Hours);
    this.inputFormGroup.controls.CurrencyId.setValue(oldPaymentInfo.CurrencyId);
    this.inputFormGroup.controls.PaymentRatesDetail.get('PaymentRates').setValue(oldPaymentInfo.PaymentRates);
  }

  getListUserProfile() {
    this.commonListsObservableService
      .listUserProfileWorkers$()
      .takeUntil(this.isDestroyed$)
      .subscribe((listUserProfileWorker: any) => {
        if (listUserProfileWorker) {
          this.html.commonLists.listUserProfileWorker = listUserProfileWorker;
          this.html.commonLists.listUserProfileWorker.forEach(value => {
            const profileName = this.html.codeValueLists.listProfileTypeList.find(f => f.id === value.ProfileTypeId).text;
            value.DisplayValue = value.Contact.FullName + ' - ' + value.Contact.Id + ' - ' + profileName + (value.Id ? ' - Profile: ' + value.Id : '');
          });
          this.html.commonLists.listUserProfileWorker = this.filterGetListUserProfileWorker(this.html.commonLists.listUserProfileWorker);
          this.changeRef.detectChanges();
          this.worker = this.workorderService.getWorker(this.workorderDetails, this.html.commonLists.listUserProfileWorker);
          this.getPrimaryContact(this.inputFormGroup ? this.inputFormGroup.controls.OrganizationIdSupplier.value : null); /// hit here after view init
        }
        if (this.inputFormGroup && this.inputFormGroup.controls.Id.value === 0 && !this.inputFormGroup.controls.OrganizationIdSupplier.value) {
          this.html.commonLists.listProfilesListForPaymentOrganization = [];
        }
      });
  }

  filterGetListUserProfileWorker(profilesListWorker: any) {
    const workers = filter(profilesListWorker, (item: any) => {
      return item.ProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianInc || item.ProfileTypeId === PhxConstants.UserProfileType.WorkerSubVendor || item.ProfileTypeId === PhxConstants.UserProfileType.WorkerUnitedStatesLLC
        ? item.OrganizationId != null
        : true;
    });
    return workers;
  }

  getPrimaryContact(orgIdSupplier: number = 0) {
    if (this.inputFormGroup && orgIdSupplier > 0) {
      this.getListProfilesListByOrganizationId();
    } else if (this.worker && this.worker.OrganizationId == null && (this.workerProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp || this.workerProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp)) {
      this.html.commonLists.listProfilesListForPaymentOrganization = [this.worker];
      this.html.commonLists.listProfilesListForPaymentOrganization = this.html.commonLists.listProfilesListForPaymentOrganization.filter(e => e.ProfileTypeId !== this.phxConstants.UserProfileType.WorkerSubVendor);
      this.html.commonLists.listProfilesListForPaymentOrganization.forEach((val: any) => {
        val.DisplayValue = val.Contact.FullName + ' - ' + val.Contact.Id;
      });
      this.changeRef.detectChanges();
    } else if (this.worker && this.worker.OrganizationId == null && this.workerProfileTypeId === this.phxConstants.UserProfileType.WorkerUnitedStatesW2) {
      this.html.commonLists.listProfilesListForPaymentOrganization = [this.worker];
      this.html.commonLists.listProfilesListForPaymentOrganization = this.html.commonLists.listProfilesListForPaymentOrganization.filter(e => e.ProfileTypeId !== this.phxConstants.UserProfileType.WorkerSubVendor);
      this.html.commonLists.listProfilesListForPaymentOrganization.forEach((val: any) => {
        val.DisplayValue = val.Contact.FullName + ' - ' + val.Contact.Id;
      });
      this.changeRef.detectChanges();
    } else {
      this.html.commonLists.listProfilesListForPaymentOrganization = [];
      this.changeRef.detectChanges();
    }
  }

  private setHoursBasedOnBillingInfoes(workorder: IWorkOrder) {
    const hours = workorder.WorkOrderVersion.BillingInfoes[0].Hours ? workorder.WorkOrderVersion.BillingInfoes[0].Hours.toString() : '';
    this.inputFormGroup.controls.Hours.setValue(hours);
  }
}
