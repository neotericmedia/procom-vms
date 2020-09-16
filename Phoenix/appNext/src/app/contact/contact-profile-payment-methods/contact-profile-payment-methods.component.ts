import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { IPaymentMethod, IReadOnlyStorage, IFormGroupOnNew, IFormGroupSetup, IUserProfilePaymentMethod, IProfile } from '../state';
import { FormGroup, FormBuilder, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CodeValueService, CommonService, ValidationExtensions } from '../../common';
import { CodeValue, CustomFieldErrorType } from '../../common/model';
import { CustomValidators } from '../../common/validators/CustomValidators';
import { PhxSelectBoxComponent } from '../../common/components/phx-select-box/phx-select-box.component';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ProfileObservableService } from '../state/profile.observable.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contact-profile-payment-methods',
  templateUrl: './contact-profile-payment-methods.component.html',
  styleUrls: ['./contact-profile-payment-methods.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ContactProfilePaymentMethodsComponent extends ContactBaseComponentPresentational<IPaymentMethod> implements OnInit {

  public getCodeValuelistsStatic() {

  }

  public businessRules(obj: IFormGroupValue): void {

  }

  @Input() isEditable: boolean = false;
  @ViewChild('paymentPreferenceSelectBox') paymentPreferenceSelectBox: PhxSelectBoxComponent;
  @Input() validateComplianceDraft: boolean;
  @Input() isProfileW2OrTempOrSP: boolean;

  currentProfile: IProfile;

  html: {
    phxConstants: typeof PhxConstants,
    paymentPreference: number,
    hasDirectDeposit: boolean,
    hasCheque: boolean,
    hasWireTransfer: boolean,
    hasADP: boolean,
    paymentMethodList: Array<CodeValue>,
    codeValueGroups: any,
  };

  private static ERROR_MESSAGE = 'The field is required';

  constructor(
    private activatedRoute: ActivatedRoute,
    private $profileObservableService: ProfileObservableService) {
    super('ContactProfilePaymentMethodsComponent');
  }

  public get paymentMethodFormGroups() {
    return (this.inputFormGroup.controls.UserProfilePaymentMethods as FormArray<IUserProfilePaymentMethod>)
      .controls as Array<FormGroup<IUserProfilePaymentMethod>>;
  }

  public get isPaymentPreferenceRequired() {
    if (this.inputFormGroup.value.UserProfilePaymentMethods.length) {
      return this.inputFormGroup.value.UserProfilePaymentMethods.some(x => x.IsPreferred);
    } else {
      return false;
    }
  }

  public get isPaymentMethodRequired() {
    if (this.inputFormGroup.value.UserProfilePaymentMethods.length) {
      return !this.inputFormGroup.value.UserProfilePaymentMethods.some(x => x.IsSelected);
    } else {
      return true;
    }
  }

  private static createBlankPaymentMethodFormGroup(formGroupSetup: IFormGroupSetup, paymentMethodType: CodeValue, model: IProfile) {

    const enableValidation = model.ValidateComplianceDraft && model.isProfileW2OrTempOrSP;

    const paymentMethod = model.UserProfilePaymentMethods.find(x => x.PaymentMethodTypeId === paymentMethodType.id);
    const hasDirectDeposit = paymentMethod && paymentMethod.PaymentMethodTypeId === PhxConstants.PaymentMethodType.DirectDeposit && paymentMethod.IsSelected;
    const hasWireTransfer = paymentMethod && paymentMethod.PaymentMethodTypeId === PhxConstants.PaymentMethodType.WireTransfer && paymentMethod.IsSelected;
    const hasADP = paymentMethod && paymentMethod.PaymentMethodTypeId === PhxConstants.PaymentMethodType.ADP && paymentMethod.IsSelected;

    return formGroupSetup.formBuilder.group<IUserProfilePaymentMethod>({
      UserProfileWorkerId: [0],
      Id: [0],
      IsSelected: [paymentMethodType.id === PhxConstants.PaymentMethodType.Cheque, []],
      IsPreferred: [paymentMethodType.id === PhxConstants.PaymentMethodType.Cheque, []],
      BankCode: ['', enableValidation && hasDirectDeposit ? [
        ValidationExtensions.minLength(3),
        ValidationExtensions.maxLength(30),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankCode', CustomFieldErrorType.required))
      ] : []],
      BankBranchCode: ['', enableValidation && hasDirectDeposit ? [
        ValidationExtensions.maxLength(30),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankBranchCode', CustomFieldErrorType.required))
      ] : []],
      BankAccountNumber: ['', enableValidation && hasDirectDeposit ? [
        ValidationExtensions.minLength(3),
        ValidationExtensions.maxLength(30),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankAccountNumber', CustomFieldErrorType.required))
      ] : []],
      ProfileNameBeneficiary: ['', enableValidation && hasWireTransfer ? [
        ValidationExtensions.maxLength(35),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ProfileNameBeneficiary', CustomFieldErrorType.required))
      ] : []],
      NameBeneficiary: ['', enableValidation && hasWireTransfer ? [
        ValidationExtensions.maxLength(35),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('NameBeneficiary', CustomFieldErrorType.required))
      ] : []],
      AccountNumberBeneficiary: ['', enableValidation && hasWireTransfer ? [
        ValidationExtensions.maxLength(35),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AccountNumberBeneficiary', CustomFieldErrorType.required))
      ] : []],
      Address1Beneficiary: ['', enableValidation && hasWireTransfer ? [
        ValidationExtensions.maxLength(35),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Address1Beneficiary', CustomFieldErrorType.required))
      ] : []],
      Address2Beneficiary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      CityBeneficiary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      ProvinceOrStateBeneficiary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      CountryCodeBeneficiary: [null, enableValidation && hasWireTransfer ? [
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CountryCodeBeneficiary', CustomFieldErrorType.required))
      ] : []],
      PostalorZipBeneficiary: [''],
      PayCurrencyBeneficiary: [null, enableValidation && hasWireTransfer ? [
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PayCurrencyBeneficiary', CustomFieldErrorType.required))
      ] : []],
      WireTransferBankTypeIdBeneficiary: [null, enableValidation && hasWireTransfer ? [
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankIDBeneficiary', CustomFieldErrorType.required)),
        ValidationExtensions.maxLength(35),
      ] : []],
      BankIDBeneficiary: [''],
      ABANoBeneficiary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      WireTransferBankTypeIdIntemediary: [null, []],
      BankNameIntemediary: ['', [
        ValidationExtensions.maxLength(18)
      ]],
      BankIdIntemediary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      Address1Intemediary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      Address2Intemediary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      CityIntemediary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      ProvinceOrStateIntemediary: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      CountryCodeIntemediary: [null, [
        ValidationExtensions.maxLength(18)
      ]],
      PostalOrZipIntemediary: [null, [
        ValidationExtensions.maxLength(35)
      ]],
      WireTransferBankTypeIdReceivers: [null, []],
      BankNameReceivers: ['', [
        ValidationExtensions.maxLength(18)
      ]],
      BankIdReceivers: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      Address1Receivers: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      Address2Receivers: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      CityReceivers: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      ProvinceOrStateReceivers: ['', [
        ValidationExtensions.maxLength(35)
      ]],
      CountryCodeReceivers: [null, [
        ValidationExtensions.maxLength(35)
      ]],
      PostalOrZipReceivers: [null, [
        ValidationExtensions.maxLength(35)
      ]],
      PaymentDetailNotes: [null, [
        ValidationExtensions.maxLength(2000)
      ]],
      PaymentMethodTypeId: [paymentMethodType.id, []],
      EmployeeId: ['', enableValidation && hasADP ? [
        ValidationExtensions.maxLength(30),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EmployeeId', CustomFieldErrorType.required))
      ] : []]
    });
  }

  public static paymentMethodsFormGroupsNew(formGroupSetup: IFormGroupSetup, codeValueService: CodeValueService, codeValueGroups: any, model: IProfile) {
    const paymentMethodFormGroups = formGroupSetup.formBuilder.array<IUserProfilePaymentMethod>([]);
    codeValueService.getCodeValues(codeValueGroups.PaymentMethodType, null).map((element, index) => {
      if (element.id === 4) { return; }
      paymentMethodFormGroups.push(
        ContactProfilePaymentMethodsComponent.createBlankPaymentMethodFormGroup(formGroupSetup, element, model));
    });

    paymentMethodFormGroups.setValidators(CustomValidators.requiredAtLeastOne('IsSelected',
      formGroupSetup.customFieldService.formatErrorMessage('paymentMethod', CustomFieldErrorType.required)));

    return formGroupSetup.formBuilder.group<IPaymentMethod>({
      PayeeName: model.PayeeName,
      UserProfilePaymentMethods: paymentMethodFormGroups,
      PaymentPreference: [PhxConstants.PaymentMethodType.Cheque]
    });
  }

  public static paymentMethodsFormGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile, codeValueService: CodeValueService, codeValueGroups: any) {
    const paymentMethodFormGroups = formGroupSetup.formBuilder.array<IUserProfilePaymentMethod>([]);
    const isPaymentPreferenceRequired = () => {
      if (model.UserProfilePaymentMethods.length) {
        return model.UserProfilePaymentMethods.some(x => x.IsPreferred);
      } else {
        return false;
      }
    };

    codeValueService.getCodeValues(codeValueGroups.PaymentMethodType, null).forEach((element, index) => {
      if (element.id === 4) { return; }
      if (!model.UserProfilePaymentMethods) { return; }
      if (model.UserProfilePaymentMethods.length === 0) { return; }
      const pmtype: IUserProfilePaymentMethod = model.UserProfilePaymentMethods.find(x => x.PaymentMethodTypeId === element.id);

      const isRequired = (ptype: IUserProfilePaymentMethod, type: PhxConstants.PaymentMethodType) => {
        return ptype.PaymentMethodTypeId === type;
      };

      if (pmtype === undefined || pmtype === null) {
        paymentMethodFormGroups.push(
          ContactProfilePaymentMethodsComponent.createBlankPaymentMethodFormGroup(formGroupSetup, element, model));
        return;
      }

      const enableValidation = model.ValidateComplianceDraft && model.isProfileW2OrTempOrSP;

      const hasDirectDeposit =  pmtype.PaymentMethodTypeId === PhxConstants.PaymentMethodType.DirectDeposit && pmtype.IsSelected;
      const hasWireTransfer = pmtype.PaymentMethodTypeId === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected;
      const hasADP = pmtype.PaymentMethodTypeId === PhxConstants.PaymentMethodType.ADP && pmtype.IsSelected;

      paymentMethodFormGroups.push(formGroupSetup.formBuilder.group<IUserProfilePaymentMethod>({
        UserProfileWorkerId: [pmtype.UserProfileWorkerId],
        Id: [pmtype.Id],
        IsSelected: [pmtype.IsSelected],
        IsPreferred: [pmtype.IsPreferred],
        BankCode: [pmtype.BankCode, enableValidation && hasDirectDeposit ? [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(30),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankCode', CustomFieldErrorType.required))
        ] : []],
        BankBranchCode: [pmtype.BankBranchCode, enableValidation && hasDirectDeposit ? [
          ValidationExtensions.maxLength(30),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankBranchCode', CustomFieldErrorType.required))
        ] : []],
        BankAccountNumber: [pmtype.BankAccountNumber, enableValidation && hasDirectDeposit ? [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(30),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankAccountNumber', CustomFieldErrorType.required))
        ] : []],
        ProfileNameBeneficiary: [pmtype.ProfileNameBeneficiary, enableValidation && hasWireTransfer ? [
          ValidationExtensions.maxLength(35),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ProfileNameBeneficiary', CustomFieldErrorType.required))
        ] : []],
        NameBeneficiary: [pmtype.NameBeneficiary, enableValidation && hasWireTransfer ? [
          ValidationExtensions.maxLength(35),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('NameBeneficiary', CustomFieldErrorType.required))
        ] : []],
        AccountNumberBeneficiary: [pmtype.AccountNumberBeneficiary, enableValidation && hasWireTransfer ? [
          ValidationExtensions.maxLength(35),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AccountNumberBeneficiary', CustomFieldErrorType.required))
        ] : []],
        Address1Beneficiary: [pmtype.Address1Beneficiary, enableValidation && hasWireTransfer ? [
          ValidationExtensions.maxLength(35),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Address1Beneficiary', CustomFieldErrorType.required))
        ] : []],
        Address2Beneficiary: [pmtype.Address2Beneficiary, [
          ValidationExtensions.maxLength(35)
        ]],
        CityBeneficiary: [pmtype.CityBeneficiary, [
          ValidationExtensions.maxLength(35)
        ]],
        ProvinceOrStateBeneficiary: [pmtype.ProvinceOrStateBeneficiary, [
          ValidationExtensions.maxLength(35)
        ]],
        CountryCodeBeneficiary: [pmtype.CountryCodeBeneficiary, enableValidation && hasWireTransfer ? [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CountryCodeBeneficiary', CustomFieldErrorType.required))
        ] : []],
        PostalorZipBeneficiary: [pmtype.PostalorZipBeneficiary],
        PayCurrencyBeneficiary: [pmtype.PayCurrencyBeneficiary, enableValidation && hasWireTransfer ? [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PayCurrencyBeneficiary', CustomFieldErrorType.required))
        ] : []],
        WireTransferBankTypeIdBeneficiary: [pmtype.WireTransferBankTypeIdBeneficiary, enableValidation && hasWireTransfer ? [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('WireTransferBankTypeIdBeneficiary', CustomFieldErrorType.required))
        ] : []],
        BankIDBeneficiary: [pmtype.BankIDBeneficiary, enableValidation && hasWireTransfer ? [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankIDBeneficiary', CustomFieldErrorType.required)),
          ValidationExtensions.maxLength(35),
        ] : []],
        ABANoBeneficiary: [pmtype.ABANoBeneficiary, [
          ValidationExtensions.maxLength(35)
        ]],
        WireTransferBankTypeIdIntemediary: [pmtype.WireTransferBankTypeIdIntemediary, []],
        BankNameIntemediary: [pmtype.BankNameIntemediary, [
          ValidationExtensions.maxLength(18)
        ]],
        BankIdIntemediary: [pmtype.BankIdIntemediary, [
          ValidationExtensions.maxLength(35)
        ]],
        Address1Intemediary: [pmtype.Address1Intemediary, [
          ValidationExtensions.maxLength(35)
        ]],
        Address2Intemediary: [pmtype.Address2Intemediary, [
          ValidationExtensions.maxLength(35)
        ]],
        CityIntemediary: [pmtype.CityIntemediary, [
          ValidationExtensions.maxLength(35)
        ]],
        ProvinceOrStateIntemediary: [pmtype.ProvinceOrStateIntemediary, [
          ValidationExtensions.maxLength(35)
        ]],
        CountryCodeIntemediary: [pmtype.CountryCodeIntemediary, []],
        PostalOrZipIntemediary: [pmtype.PostalOrZipIntemediary, []],
        WireTransferBankTypeIdReceivers: [pmtype.WireTransferBankTypeIdReceivers, []],
        BankNameReceivers: [pmtype.BankNameReceivers, [
          ValidationExtensions.maxLength(18)
        ]],
        BankIdReceivers: [pmtype.BankIdReceivers, [
          ValidationExtensions.maxLength(35)
        ]],
        Address1Receivers: [pmtype.Address1Receivers, [
          ValidationExtensions.maxLength(35)
        ]],
        Address2Receivers: [pmtype.Address2Receivers, [
          ValidationExtensions.maxLength(35)
        ]],
        CityReceivers: [pmtype.CityReceivers, [
          ValidationExtensions.maxLength(35)
        ]],
        ProvinceOrStateReceivers: [pmtype.ProvinceOrStateReceivers, [
          ValidationExtensions.maxLength(35)
        ]],
        CountryCodeReceivers: [pmtype.CountryCodeReceivers, [
          ValidationExtensions.maxLength(35)
        ]],
        PostalOrZipReceivers: [pmtype.PostalOrZipReceivers, [
          ValidationExtensions.maxLength(35)
        ]],
        PaymentDetailNotes: [pmtype.PaymentDetailNotes, [
          ValidationExtensions.maxLength(2000)
        ]],
        PaymentMethodTypeId: [pmtype.PaymentMethodTypeId, []],
        EmployeeId: [pmtype.EmployeeId, enableValidation && hasADP ? [
          ValidationExtensions.maxLength(30),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EmployeeId', CustomFieldErrorType.required))
        ] : []]
      }));
    });

    return formGroupSetup.formBuilder.group<IPaymentMethod>({
      PayeeName: [model.PayeeName,
        model.ValidateComplianceDraft && model.isProfileW2OrTempOrSP && model.AreComplianceFieldsEditable ? [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(64),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PayeeName', CustomFieldErrorType.required))
        ] : []
      ],
      UserProfilePaymentMethods: paymentMethodFormGroups,
      PaymentPreference: [ this.getPreferredPaymentMethodTypeId(model),
      (model.ValidateComplianceDraft && model.isProfileW2OrTempOrSP) ? [
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaymentPreference', CustomFieldErrorType.required))
      ] : []]
    });
  }

  public static getPreferredPaymentMethodTypeId(profile: IProfile) {
    if (profile.UserProfilePaymentMethods && profile.UserProfilePaymentMethods.length > 0) {
      const pm = profile.UserProfilePaymentMethods.find(x => x.IsPreferred);
      return pm ? pm.PaymentMethodTypeId : null;
    } else {
      return null;
    }
  }

  ngOnInit() {
    this.html = {
      phxConstants: PhxConstants,
      paymentPreference: PhxConstants.PaymentMethodType.Cheque,
      hasADP: false,
      hasCheque: false,
      hasDirectDeposit: false,
      hasWireTransfer: false,
      paymentMethodList: [],
      codeValueGroups: this.commonService.CodeValueGroups
    };

    this.updatePaymentMethodSelectionField();
    this.refreshPaymentPreferenceList();

    this.$profileObservableService.profileOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: IProfile) => {
        if (response) {
          this.currentProfile = response;
        }
      });
  }

  refreshPaymentPreferenceList() {
    this.html.paymentMethodList = this.codeValueService.getCodeValues(this.html.codeValueGroups.PaymentMethodType, null)
      .filter(x => this.inputFormGroup.value.UserProfilePaymentMethods.find(k => k.PaymentMethodTypeId === x.id && k.IsSelected));
  }

  trackByFn(index: number) {
    return index;
  }

  onPaymentMethodSelect($event, paymentMethodCtrl: FormGroup<IPaymentMethod>) {
    this.updatePaymentMethodSelectionField();
    this.outputEvent.emit();
  }

  private getFormGroupIndex(paymentMethod: number) {
    if (this.inputFormGroup === null) { return 0; }
    return this.inputFormGroup.value.UserProfilePaymentMethods.findIndex(x => x.PaymentMethodTypeId === paymentMethod);
  }

  getFormGroupName(paymentMethod: PhxConstants.PaymentMethodType) {
    if (this.inputFormGroup === null) { return; }
    return this.inputFormGroup.value.UserProfilePaymentMethods.findIndex(x => x.PaymentMethodTypeId === paymentMethod).toString();
  }

  onPaymentPreferenceChange($event) {
    const pIndex = this.inputFormGroup.value.UserProfilePaymentMethods
      .findIndex(x => x.PaymentMethodTypeId === this.inputFormGroup.controls.PaymentPreference.value);
    (this.inputFormGroup.controls.UserProfilePaymentMethods as FormArray<IUserProfilePaymentMethod>).controls.forEach((pm, i) => {
      if (i !== pIndex) {
        pm.get('IsPreferred').setValue(false);
      } else {
        pm.get('IsPreferred').setValue(true);
      }
    });
  }

  findCtrlByPaymentMethod(control: string, payementMethod: number) {
    if (this.inputFormGroup === null) { return; }
    const pIndex = this.getFormGroupIndex(payementMethod);
    return ((this.inputFormGroup.controls.UserProfilePaymentMethods as FormArray<IUserProfilePaymentMethod>)
      .at(pIndex) as FormGroup<IUserProfilePaymentMethod>)
      .controls[control];
  }

  private updatePaymentMethodSelectionField() {
    if (!this.inputFormGroup) { return; }
    this.html.hasADP = this.inputFormGroup.value.UserProfilePaymentMethods
      .find(x => x.PaymentMethodTypeId === PhxConstants.PaymentMethodType.ADP && x.IsSelected) !== undefined;
    this.html.hasCheque = this.inputFormGroup.value.UserProfilePaymentMethods
      .find(x => x.PaymentMethodTypeId === PhxConstants.PaymentMethodType.Cheque && x.IsSelected) !== undefined;
    this.html.hasDirectDeposit = this.inputFormGroup.value.UserProfilePaymentMethods
      .find(x => x.PaymentMethodTypeId === PhxConstants.PaymentMethodType.DirectDeposit && x.IsSelected) !== undefined;
    this.html.hasWireTransfer = this.inputFormGroup.value.UserProfilePaymentMethods
      .find(x => x.PaymentMethodTypeId === PhxConstants.PaymentMethodType.WireTransfer && x.IsSelected) !== undefined;
    this.refreshPaymentPreferenceList();
    if (this.paymentPreferenceSelectBox) {
      if (this.paymentPreferenceSelectBox.value) {
        if (!this.inputFormGroup.value.UserProfilePaymentMethods
          .find(x => x.PaymentMethodTypeId === this.paymentPreferenceSelectBox.value && x.IsSelected)) {
          this.inputFormGroup.patchValue({
            PaymentPreference: null
          });
        }
      }
    }
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }
}
