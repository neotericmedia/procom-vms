import { Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IPayrollSetup, IUserProfileWorkerSourceDeduction, IFormGroupSetup, IProfile, IUserProfileWorkerOtherEarning } from '../state/profile.interface';
import { CodeValue, PhxConstants, PhxFormControlLayoutType, CustomFieldErrorType } from '../../common/model';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { ProfileObservableService } from '../state/profile.observable.service';
import { orderBy } from 'lodash';
import { HashModel } from '../../common/utility/hash-model';
import { ValidationExtensions } from '../../common';

const PaymentOtherEarningType = PhxConstants.PaymentOtherEarningType;

@Component({
  selector: 'app-contact-payroll-setup',
  templateUrl: './contact-payroll-setup.component.html',
  styleUrls: ['./contact-payroll-setup.component.less']
})
export class ContactPayrollSetupComponent extends ContactBaseComponentPresentational<IPayrollSetup> implements OnInit {
  @Input() currentProfile: IProfile;
  @Input() isComplianceFieldEditable: boolean = false;
  layoutType: typeof PhxFormControlLayoutType;
  formGroupSetup: IFormGroupSetup;
  html: {
    codeValueGroups: any;
    phxConstants: any;
    codeValueLists: {
      sourceDeductionTypeList: Array<CodeValue>;
      subdivisions: Array<CodeValue>;
      paymentOtherEarningTypeList: Array<CodeValue>;
    };
  } = {
    codeValueGroups: null,
    phxConstants: PhxConstants,
    codeValueLists: {
      sourceDeductionTypeList: [],
      subdivisions: [],
      paymentOtherEarningTypeList: []
    }
  };
  taxExempt: boolean;
  fullTaxExempt: boolean;
  ProfileTypeId: number;
  isProfileW2OrTempOrSP: boolean;
  isProfileW2OrTemp: boolean;
  isProfileTempOrSP: boolean;
  isProfileSP: boolean;
  defaultWorkerSourceDeductions: Array<IUserProfileWorkerSourceDeduction> = [];
  defaultWorkerOtherEarnings: Array<IUserProfileWorkerOtherEarning> = [];
  constructor(private profileObservableService: ProfileObservableService, private formbuilder: FormBuilder) {
    super('ContactPayrollSetupComponent');
    this.getCodeValuelistsStatic();
    this.layoutType = PhxFormControlLayoutType;
    this.formGroupSetup = {
      hashModel: new HashModel(),
      toUseHashCode: true,
      formBuilder: this.formBuilder,
      customFieldService: this.customFieldService
    };
  }

  ngOnInit() {
    this.profileObservableService.profileOnRouteChange$(this, true)
      .takeUntil(this.isDestroyed$)
      .subscribe(profile => {
        if (!profile) {
          return;
        }

        switch (profile.ProfileTypeId) {
          case this.phxConstants.UserProfileType.Organizational:
            this.taxExempt = false;
            this.fullTaxExempt = false;
            break;

          case this.phxConstants.UserProfileType.Internal:
            this.taxExempt = false;
            this.fullTaxExempt = false;
            break;

          case this.phxConstants.UserProfileType.WorkerTemp:
            this.taxExempt = true;
            this.fullTaxExempt = true;
            break;

          case this.phxConstants.UserProfileType.WorkerUnitedStatesW2:
            this.taxExempt = true;
            this.fullTaxExempt = true;
            break;

          case this.phxConstants.UserProfileType.WorkerCanadianInc:
            this.taxExempt = false;
            this.fullTaxExempt = false;
            break;

          case this.phxConstants.UserProfileType.WorkerUnitedStatesLLC:
            this.taxExempt = false;
            this.fullTaxExempt = false;
            break;

          case this.phxConstants.UserProfileType.WorkerSubVendor:
            this.taxExempt = false;
            this.fullTaxExempt = false;
            break;

          case this.phxConstants.UserProfileType.WorkerCanadianSp:
            this.taxExempt = true;
            this.fullTaxExempt = false;
            break;
          default:
            break;
        }
        this.setProfileTypeFlags(profile.ProfileTypeId);
        if (this.taxExempt) {
          this.defaultWorkerSourceDeductions = this.getWorkerSourceDeductionsCommon();
          if (this.inputFormGroup.controls.UserProfileWorkerSourceDeductions.value.length === 0) {
            this.inputFormGroup.setControl('UserProfileWorkerSourceDeductions', ContactPayrollSetupComponent.formBuilderGroupSetupforSourceDeductions(this.formGroupSetup, this.defaultWorkerSourceDeductions));
          }
        }
        if (this.taxExempt && this.fullTaxExempt) {
          if (this.hasSourceDeductionsFromDB(profile)) {
            this.inputFormGroup.setControl('UserProfileWorkerSourceDeductions', ContactPayrollSetupComponent.formBuilderGroupSetupforSourceDeductions(this.formGroupSetup, profile.UserProfileWorkerSourceDeductions));
          } else {
            this.defaultWorkerSourceDeductions = this.defaultWorkerSourceDeductions.concat(this.getWorkerTempSourceDeductions());
            this.inputFormGroup.setControl('UserProfileWorkerSourceDeductions', ContactPayrollSetupComponent.formBuilderGroupSetupforSourceDeductions(this.formGroupSetup, this.defaultWorkerSourceDeductions));
          }

          if (this.hasOtherEarningsFromDB(profile)) {
            this.inputFormGroup.setControl('UserProfileWorkerOtherEarnings', ContactPayrollSetupComponent.formBuilderGroupSetupforOtherEarnings(this.formGroupSetup, profile.UserProfileWorkerOtherEarnings, this.isComplianceFieldEditable));
          } else {
            this.defaultWorkerOtherEarnings = this.getWorkerTempOtherEarnings();
            this.inputFormGroup.setControl('UserProfileWorkerOtherEarnings', ContactPayrollSetupComponent.formBuilderGroupSetupforOtherEarnings(this.formGroupSetup, this.defaultWorkerOtherEarnings, this.isComplianceFieldEditable));
          }
        }
      });
  }

  hasSourceDeductionsFromDB(profile: IProfile) {
    const sourceDeductions = profile.UserProfileWorkerSourceDeductions;
    return sourceDeductions && sourceDeductions.some(x => x.Id !== 0);
  }

  hasOtherEarningsFromDB(profile: IProfile) {
    const otherEarnings = profile.UserProfileWorkerOtherEarnings;
    return otherEarnings && otherEarnings.some(x => x.Id !== 0);
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.sourceDeductionTypeList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.SourceDeductionType, true);
    this.html.codeValueLists.subdivisions = this.codeValueService.getRelatedCodeValues(this.commonService.CodeValueGroups.Subdivision, this.phxConstants.CountryCanada, this.commonService.CodeValueGroups.Country);
    this.html.codeValueLists.paymentOtherEarningTypeList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.PaymentOtherEarningType, true);
  }

  businessRules(obj: any) {
  }

  formControlSourceDeduction(i: number) {
    if (this.inputFormGroup === null) {
      return;
    }
    if (!this.inputFormGroup.controls.UserProfileWorkerSourceDeductions) {
      return;
    }
    const formArraySourceDeductions = this.inputFormGroup.controls.UserProfileWorkerSourceDeductions as FormArray<IUserProfileWorkerSourceDeduction>;
    const sourceDeduction = formArraySourceDeductions.at(i);
    return <FormGroup<IUserProfileWorkerSourceDeduction>>sourceDeduction;
  }

  formArrayOtherEarnings() {
    if (this.inputFormGroup === null) {
      return;
    }
    return this.inputFormGroup.controls.UserProfileWorkerOtherEarnings as FormArray<IUserProfileWorkerOtherEarning>;
  }

  restoreIsBasicSetup() {
    this.inputFormGroup.controls.FederalTD1.setValue(null);
    this.inputFormGroup.controls.ProvincialTD1.setValue(null);
    this.inputFormGroup.controls.TD1XTotalRemuneration.setValue(null);
    this.inputFormGroup.controls.TD1XCommissionExpenses.setValue(null);
  }

  restoreAdditionalTaxAmount(index: number) {
    const formArraySourceDeductions = this.inputFormGroup.controls.UserProfileWorkerSourceDeductions as FormArray<IUserProfileWorkerSourceDeduction>;
    const sourceDeduction = formArraySourceDeductions
      .at(index)
      .get('RateAmount')
      .setValue(null);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile, isComplianceFieldEditable: boolean): FormGroup<IPayrollSetup> {
    let isBasicSetup: boolean;
    if (model.ProfileTypeId === PhxConstants.UserProfileType.WorkerTemp) {
      if (model.IsBasicSetup === null) {
        isBasicSetup = true;
      } else {
        isBasicSetup = model.IsBasicSetup;
      }
    }
    const form = formGroupSetup.formBuilder.group<IPayrollSetup>({
      IsBasicSetup: [isBasicSetup],
      FederalTD1: [model.FederalTD1],
      ProvincialTD1: [model.ProvincialTD1],
      TD1XCommissionExpenses: [model.TD1XCommissionExpenses],
      TD1XTotalRemuneration: [model.TD1XTotalRemuneration],
      TaxSubdivisionId: [model.TaxSubdivisionId, model.IsDraft && model.isProfileTempOrSP ? [Validators.required] : null],
      UserProfileWorkerSourceDeductions: ContactPayrollSetupComponent.formBuilderGroupSetupforSourceDeductions(formGroupSetup, model.UserProfileWorkerSourceDeductions),
      UserProfileWorkerOtherEarnings: ContactPayrollSetupComponent.formBuilderGroupSetupforOtherEarnings(formGroupSetup, model.UserProfileWorkerOtherEarnings, isComplianceFieldEditable)
    });
    return form;
  }

  trackByFn(index) {
    return index;
  }

  public static formBuilderGroupSetupforSourceDeductions(formGroupSetup: IFormGroupSetup, userProfileWorkerSourceDeductions: Array<IUserProfileWorkerSourceDeduction>): FormArray<IUserProfileWorkerSourceDeduction> {
    if (!userProfileWorkerSourceDeductions) {
      return;
    }
    userProfileWorkerSourceDeductions = orderBy(userProfileWorkerSourceDeductions, [i => i.Id], ['asc']);
    const formArray = formGroupSetup.formBuilder.array<IUserProfileWorkerSourceDeduction>(
      userProfileWorkerSourceDeductions.map((userProfile: IUserProfileWorkerSourceDeduction, index) => {
        return formGroupSetup.hashModel.getFormGroup<IUserProfileWorkerSourceDeduction>(formGroupSetup.toUseHashCode, 'IUserProfileWorkerSourceDeduction', userProfile, index, () =>
          formGroupSetup.formBuilder.group<IUserProfileWorkerSourceDeduction>({
            Id: [userProfile.Id ? userProfile.Id : 0],
            UserProfileWorkerId: [userProfile.UserProfileWorkerId],
            SourceId: [userProfile.SourceId ? userProfile.SourceId : 0],
            SourceDeductionTypeId: [userProfile.SourceDeductionTypeId],
            IsApplied: [userProfile.IsApplied],
            RatePercentage: [userProfile.RatePercentage],
            RateAmount: [userProfile.RateAmount, index === 6 && userProfile.IsApplied && userProfile.RateAmount ? [Validators.required] : null]
          })
        );
      })
    );
    return formArray;
  }

  public static formBuilderGroupSetupforOtherEarnings(formGroupSetup: IFormGroupSetup, userProfileWorkerOtherEarnings: Array<IUserProfileWorkerOtherEarning>, isComplianceFieldEditable: boolean): FormArray<IUserProfileWorkerOtherEarning> {
    if (!userProfileWorkerOtherEarnings) {
      return;
    }
    const formArray = formGroupSetup.formBuilder.array<IUserProfileWorkerOtherEarning>(
      userProfileWorkerOtherEarnings.map((earning: IUserProfileWorkerOtherEarning, index) => {
        return formGroupSetup.hashModel.getFormGroup<IUserProfileWorkerOtherEarning>(formGroupSetup.toUseHashCode, 'IUserProfileWorkerOtherEarning', earning, index, () =>
          formGroupSetup.formBuilder.group<IUserProfileWorkerOtherEarning>({
            Id: [earning.Id ? earning.Id : 0],
            UserProfileWorkerId: [earning.UserProfileWorkerId ? earning.UserProfileWorkerId : 0],
            PaymentOtherEarningTypeId: [earning.PaymentOtherEarningTypeId],
            IsApplied: [earning.IsApplied, isComplianceFieldEditable ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsApplied', CustomFieldErrorType.required))] : []],
            IsAccrued: [
              earning.IsAccrued,
              earning.PaymentOtherEarningTypeId === PaymentOtherEarningType.VacationPay && isComplianceFieldEditable
                ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsAccrued', CustomFieldErrorType.required))]
                : []
            ],
            RatePercentage: [
              earning.RatePercentage,
              earning.IsApplied && isComplianceFieldEditable ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RatePercentage', CustomFieldErrorType.required))] : []
            ],
            SourceId: [earning.SourceId]
          })
        );
      })
    );
    return formArray;
  }


  public static formGroupToPartial(formGroupPayrollSetup: FormGroup<IPayrollSetup>) {
    const payrollDetails: IPayrollSetup = formGroupPayrollSetup.value;
    const sourceDeduction: Array<IUserProfileWorkerSourceDeduction> = formGroupPayrollSetup.controls.UserProfileWorkerSourceDeductions.value;
    const otherEarnings: Array<IUserProfileWorkerSourceDeduction> = formGroupPayrollSetup.controls.UserProfileWorkerSourceDeductions.value;
    return {
      isBasicSetup: payrollDetails.IsBasicSetup,
      FederalTD1: payrollDetails.FederalTD1,
      ProvincialTD1: payrollDetails.ProvincialTD1,
      TD1XTotalRemuneration: payrollDetails.TD1XTotalRemuneration,
      TD1XCommissionExpenses: payrollDetails.TD1XCommissionExpenses,
      TaxSubdivisionId: payrollDetails.TaxSubdivisionId,
      UserProfileWorkerSourceDeductions: sourceDeduction,
      UserProfileWorkerOtherEarnings: otherEarnings
    };
  }

  getWorkerSourceDeductionsCommon() {
    return [
      { SourceDeductionTypeId: 1, IsApplied: true, RatePercentage: null, RateAmount: null },
      { SourceDeductionTypeId: 2, IsApplied: true, RatePercentage: null, RateAmount: null },
      { SourceDeductionTypeId: 3, IsApplied: true, RatePercentage: null, RateAmount: null },
      { SourceDeductionTypeId: 8, IsApplied: true, RatePercentage: null, RateAmount: null }
    ];
  }

  getWorkerTempSourceDeductions() {
    return [
      { SourceDeductionTypeId: 6, IsApplied: true, RatePercentage: null, RateAmount: null },
      { SourceDeductionTypeId: 7, IsApplied: true, RatePercentage: null, RateAmount: null },
      { SourceDeductionTypeId: 10, IsApplied: false, RatePercentage: null, RateAmount: null },
      { SourceDeductionTypeId: 15, IsApplied: true, RatePercentage: null, RateAmount: null }
    ];
  }
  getWorkerTempOtherEarnings() {
    return [{ PaymentOtherEarningTypeId: 1, IsApplied: true, RatePercentage: 4.0, IsAccrued: false }];
  }

  setProfileTypeFlags(ProfileTypeId: number) {
    this.isProfileW2OrTempOrSP =
      ProfileTypeId === this.phxConstants.UserProfileType.WorkerUnitedStatesW2 || ProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp || ProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp;
    this.isProfileW2OrTemp = ProfileTypeId === this.phxConstants.UserProfileType.WorkerUnitedStatesW2 || ProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp;
    this.isProfileTempOrSP = ProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp || ProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp;
    this.isProfileSP = ProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp;
  }

  validateTD1X() {
    let totalRemuneration: number;
    let commissionExpenses: number;
    if (!this.inputFormGroup.controls.TD1XTotalRemuneration.value || this.inputFormGroup.controls.TD1XTotalRemuneration.value == null) {
      totalRemuneration = 0;
    } else {
      totalRemuneration = parseFloat(String(this.inputFormGroup.controls.TD1XTotalRemuneration.value));
    }
    if (!this.inputFormGroup.controls.TD1XCommissionExpenses.value || this.inputFormGroup.controls.TD1XCommissionExpenses.value == null) {
      commissionExpenses = 0;
    } else {
      commissionExpenses = parseFloat(String(this.inputFormGroup.controls.TD1XCommissionExpenses.value));
    }
    if (totalRemuneration === 0 && commissionExpenses > 0) {
      this.commonService.logWarning('Please ensure the Total Remuneration is greater than zero when Commission Expenses are greater than zero');
    } else if (totalRemuneration > 0 && commissionExpenses === 0) {
      this.commonService.logWarning('Please ensure the Commission Expenses are greater than zero');
    } else if (totalRemuneration < commissionExpenses) {
      this.commonService.logWarning('Total Remuneration is less than the Commission Expenses');
    }
    return false;
  }

  static taxSubdivisionChanged(inputFormGroup) {
    if (inputFormGroup.controls.TaxSubdivisionId.value === 602) {
      ContactPayrollSetupComponent.changeTaxes(inputFormGroup, false);
    } else {
      ContactPayrollSetupComponent.changeTaxes(inputFormGroup);
    }
  }

  private static changeTaxes(inputFormGroup: any, defaultValue: boolean = true) {
    const arraySourceDeduction = inputFormGroup.controls.UserProfileWorkerSourceDeductions as FormArray<IUserProfileWorkerSourceDeduction>;
    if (arraySourceDeduction.at(0)) {
      arraySourceDeduction.at(0).get('IsApplied').setValue(defaultValue); // CPPExempt true || Quebeck false
    }
    if (arraySourceDeduction.at(3)) {
      arraySourceDeduction.at(3).get('IsApplied').setValue(!defaultValue); // QPPExempt false || Quebeck true
    }
    if (arraySourceDeduction.at(2)) {
      arraySourceDeduction.at(2).get('IsApplied').setValue(!defaultValue); // PIPExempt false || Quebeck true
    }
    if (arraySourceDeduction.at(7)) {
      arraySourceDeduction.at(7).get('IsApplied').setValue(!defaultValue); // QuebecTrainingFee false || Quebeck true
    }
    if (inputFormGroup.controls.UserProfileWorkerOtherEarnings.value && inputFormGroup.controls.UserProfileWorkerOtherEarnings) {
      const arrayOtherEarning = inputFormGroup.controls.UserProfileWorkerOtherEarnings as FormArray<IUserProfileWorkerOtherEarning>;
      if (arrayOtherEarning.at(0)) {
        arrayOtherEarning.at(0).get('IsAccrued').setValue(!defaultValue); // false || Quebeck true
      }
    }
  }
}
