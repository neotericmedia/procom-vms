import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { IPaymentMethod, IReadOnlyStorage, IRoleWithPaymentMethod, IFormGroupOnNew, IFormGroupSetup } from '../state';
import { FormGroup, FormBuilder, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CodeValueService, CommonService, ValidationExtensions } from '../../common';
import { CodeValue, CustomFieldErrorType } from '../../common/model';
import { CustomValidators } from '../../common/validators/CustomValidators';
import { PhxSelectBoxComponent } from '../../common/components/phx-select-box/phx-select-box.component';

@Component({
  selector: 'app-organization-role-payment-methods',
  templateUrl: './organization-role-payment-methods.component.html',
  styleUrls: ['./organization-role-payment-methods.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class OrganizationRolePaymentMethodsComponent implements OnInit {

  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<IRoleWithPaymentMethod>;
  @Output() outputEvent = new EventEmitter();
  @Input() isEditable: boolean = false;
  @ViewChild('paymentPreferenceSelectBox') paymentPreferenceSelectBox: PhxSelectBoxComponent;

  html: {
    phxConstants: typeof PhxConstants,
    paymentPreference: number,
    hasDirectDeposit: boolean,
    hasCheque: boolean,
    hasWireTransfer: boolean,
    hasADP: boolean,
    paymentMethodList: Array<CodeValue>,
    codeValueGroups: any
  };

  private static ERROR_MESSAGE = 'The field is required';

  internalForm: FormGroup<InternalForm>;

  constructor(private fb: FormBuilder, private codeValueService: CodeValueService, public commonService: CommonService) { }

  public get paymentMethodFormGroups() {
    const ex = ((this.inputFormGroup.controls.PaymentMethods as FormArray<IPaymentMethod>).controls as Array<FormGroup<IPaymentMethod>>);
    return ex;
  }

  public get isPaymentPreferenceRequired() {
    if (this.inputFormGroup.value.PaymentMethods.length) {
      return this.inputFormGroup.value.PaymentMethods.some(x => x.IsPreferred);
    } else {
      return false;
    }
  }

  public get isPaymentMethodRequired() {
    if (this.inputFormGroup.value.PaymentMethods.length) {
      return !this.inputFormGroup.value.PaymentMethods.some(x => x.IsSelected);
    } else {
      return true;
    }
  }

  private static createBlankPaymentMethodFormGroup(formBuilder: FormBuilder, element: CodeValue) {
    return formBuilder.group<IPaymentMethod>({
      OrganizationIndependentContractorRoleId: [0],
      Id: [0],
      IsSelected: [element.id === PhxConstants.PaymentMethodType.Cheque, []],
      IsPreferred: [element.id === PhxConstants.PaymentMethodType.Cheque, []],
      BankCode: ['', element.id === PhxConstants.PaymentMethodType.DirectDeposit ? [
        ValidationExtensions.required()] : []],
      BankBranchCode: ['', element.id === PhxConstants.PaymentMethodType.DirectDeposit ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      BankAccountNumber: ['', element.id === PhxConstants.PaymentMethodType.DirectDeposit ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      ProfileNameBeneficiary: ['', element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      NameBeneficiary: ['', element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      AccountNumberBeneficiary: ['', element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      Address1Beneficiary: ['', element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      Address2Beneficiary: [''],
      CityBeneficiary: ['', element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      ProvinceOrStateBeneficiary: ['', element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      CountryCodeBeneficiary: [null, element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      PostalorZipBeneficiary: ['', element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      PayCurrencyBeneficiary: [null, element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      WireTransferBankTypeIdBeneficiary: [null, element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      BankIDBeneficiary: ['', element.id === PhxConstants.PaymentMethodType.WireTransfer ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
      ABANoBeneficiary: [''],
      WireTransferBankTypeIdIntemediary: [null, []],
      BankNameIntemediary: ['', []],
      BankIdIntemediary: ['', []],
      Address1Intemediary: ['', []],
      Address2Intemediary: ['', []],
      CityIntemediary: ['', []],
      ProvinceOrStateIntemediary: ['', []],
      CountryCodeIntemediary: [null, []],
      PostalOrZipIntemediary: [null, []],
      WireTransferBankTypeIdReceivers: [null, []],
      BankNameReceivers: ['', []],
      BankIdReceivers: ['', []],
      Address1Receivers: ['', []],
      Address2Receivers: ['', []],
      CityReceivers: ['', []],
      ProvinceOrStateReceivers: ['', []],
      CountryCodeReceivers: [null, []],
      PostalOrZipReceivers: [null, []],
      PaymentDetailNotes: [null, []],
      PaymentMethodTypeId: [element.id, []],
      EmployeeId: ['', element.id === PhxConstants.PaymentMethodType.ADP ? [
        ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []]
    });
  }

  public static paymentMethodsFormGroupsNew(formGroupOnNew: IFormGroupOnNew, codeValueService: CodeValueService, codeValueGroups: any) {
    const paymentMethodFormGroups = formGroupOnNew.formBuilder.array<IPaymentMethod>([]);
    codeValueService.getCodeValues(codeValueGroups.PaymentMethodType, null).map((element, index) => {
      if (element.id === 4) { return; }
      paymentMethodFormGroups.push(
        OrganizationRolePaymentMethodsComponent.createBlankPaymentMethodFormGroup(formGroupOnNew.formBuilder, element));
    });

    paymentMethodFormGroups.setValidators(CustomValidators.requiredAtLeastOne('IsSelected',
      formGroupOnNew.customFieldService.formatErrorMessage('paymentMethod', CustomFieldErrorType.required)));

    return paymentMethodFormGroups;
  }

  public static paymentMethodsFormGroupSetup(formGroupSetup: IFormGroupSetup, role: IRoleWithPaymentMethod, codeValueService: CodeValueService, codeValueGroups: any) {
    const paymentMethodFormGroups = formGroupSetup.formBuilder.array<IPaymentMethod>([]);
    codeValueService.getCodeValues(codeValueGroups.PaymentMethodType, null).forEach((element, index) => {
      if (element.id === 4) { return; }
      const pmtype = role.PaymentMethods.find(x => x.PaymentMethodTypeId === element.id);

      const isRequired = (ptype: IPaymentMethod, type: PhxConstants.PaymentMethodType) => {
        return ptype.PaymentMethodTypeId === type;
      };

      if (pmtype === undefined || pmtype === null) {
        paymentMethodFormGroups.push(
          OrganizationRolePaymentMethodsComponent.createBlankPaymentMethodFormGroup(formGroupSetup.formBuilder, element));
        return;
      }

      paymentMethodFormGroups.push(formGroupSetup.formBuilder.group<IPaymentMethod>({
        OrganizationIndependentContractorRoleId: [pmtype.OrganizationIndependentContractorRoleId],
        Id: [pmtype.Id],
        IsSelected: [pmtype.IsSelected],
        IsPreferred: [pmtype.IsPreferred],
        BankCode: [pmtype.BankCode, element.id === PhxConstants.PaymentMethodType.DirectDeposit && pmtype.IsSelected ? [
          ValidationExtensions.required()] : []],
        BankBranchCode: [pmtype.BankBranchCode, element.id === PhxConstants.PaymentMethodType.DirectDeposit && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        BankAccountNumber: [pmtype.BankAccountNumber, element.id === PhxConstants.PaymentMethodType.DirectDeposit && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        ProfileNameBeneficiary: [pmtype.ProfileNameBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        NameBeneficiary: [pmtype.NameBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        AccountNumberBeneficiary: [pmtype.AccountNumberBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        Address1Beneficiary: [pmtype.Address1Beneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        Address2Beneficiary: [pmtype.Address2Beneficiary],
        CityBeneficiary: [pmtype.CityBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        ProvinceOrStateBeneficiary: [pmtype.ProvinceOrStateBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        CountryCodeBeneficiary: [pmtype.CountryCodeBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        PostalorZipBeneficiary: [pmtype.PostalorZipBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        PayCurrencyBeneficiary: [pmtype.PayCurrencyBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        WireTransferBankTypeIdBeneficiary: [pmtype.WireTransferBankTypeIdBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        BankIDBeneficiary: [pmtype.BankIDBeneficiary, element.id === PhxConstants.PaymentMethodType.WireTransfer && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []],
        ABANoBeneficiary: [pmtype.ABANoBeneficiary],
        WireTransferBankTypeIdIntemediary: [pmtype.WireTransferBankTypeIdIntemediary, []],
        BankNameIntemediary: [pmtype.BankNameIntemediary, []],
        BankIdIntemediary: [pmtype.BankIdIntemediary, []],
        Address1Intemediary: [pmtype.Address1Intemediary, []],
        Address2Intemediary: [pmtype.Address2Intemediary, []],
        CityIntemediary: [pmtype.CityIntemediary, []],
        ProvinceOrStateIntemediary: [pmtype.ProvinceOrStateIntemediary, []],
        CountryCodeIntemediary: [pmtype.CountryCodeIntemediary, []],
        PostalOrZipIntemediary: [pmtype.PostalOrZipIntemediary, []],
        WireTransferBankTypeIdReceivers: [pmtype.WireTransferBankTypeIdReceivers, []],
        BankNameReceivers: [pmtype.BankNameReceivers, []],
        BankIdReceivers: [pmtype.BankIdReceivers, []],
        Address1Receivers: [pmtype.Address1Receivers, []],
        Address2Receivers: [pmtype.Address2Receivers, []],
        CityReceivers: [pmtype.CityReceivers, []],
        ProvinceOrStateReceivers: [pmtype.ProvinceOrStateReceivers, []],
        CountryCodeReceivers: [pmtype.CountryCodeReceivers, []],
        PostalOrZipReceivers: [pmtype.PostalOrZipReceivers, []],
        PaymentDetailNotes: [pmtype.PaymentDetailNotes, []],
        PaymentMethodTypeId: [pmtype.PaymentMethodTypeId, []],
        EmployeeId: [pmtype.EmployeeId, element.id === PhxConstants.PaymentMethodType.ADP && pmtype.IsSelected ? [
          ValidationExtensions.required(OrganizationRolePaymentMethodsComponent.ERROR_MESSAGE)] : []]
      }));
    });

    // paymentMethodFormGroups.setValidators(CustomValidators.requiredAtLeastOne('IsSelected',
    // formGroupSetup.customFieldService.formatErrorMessage('Payment Method', CustomFieldErrorType.required)));

    return paymentMethodFormGroups;
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
  }

  refreshPaymentPreferenceList() {
    this.html.paymentMethodList = this.codeValueService.getCodeValues(this.html.codeValueGroups.PaymentMethodType, null)
      .filter(x => this.inputFormGroup.value.PaymentMethods.find(k => k.PaymentMethodTypeId === x.id && k.IsSelected));
  }

  trackByFn(index: number) {
    return index;
  }

  onPaymentMethodSelect($event, paymentMethodCtrl: FormGroup<IPaymentMethod>) {
    this.updatePaymentMethodSelectionField();
  }

  private getFormGroupIndex(paymentMethod: number) {
    if (this.inputFormGroup === null) { return 0; }
    return this.inputFormGroup.value.PaymentMethods.findIndex(x => x.PaymentMethodTypeId === paymentMethod);
  }

  getFormGroupName(paymentMethod: PhxConstants.PaymentMethodType) {
    if (this.inputFormGroup === null) { return; }
    return this.inputFormGroup.value.PaymentMethods.findIndex(x => x.PaymentMethodTypeId === paymentMethod).toString();
  }

  onPaymentPreferenceChange($event) {
    const pIndex = this.inputFormGroup.value.PaymentMethods.findIndex(x => x.PaymentMethodTypeId === this.inputFormGroup.controls.PaymentPreference.value);
    (this.inputFormGroup.controls.PaymentMethods as FormArray<IPaymentMethod>).controls.forEach((pm, i) => {
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
    return ((this.inputFormGroup.controls.PaymentMethods as FormArray<IPaymentMethod>).at(pIndex) as FormGroup<IPaymentMethod>).controls[control];
  }

  private updatePaymentMethodSelectionField() {
    if (!this.inputFormGroup) { return; }
    this.html.hasADP = this.inputFormGroup.value.PaymentMethods.find(x => x.PaymentMethodTypeId === PhxConstants.PaymentMethodType.ADP && x.IsSelected) !== undefined;
    this.html.hasCheque = this.inputFormGroup.value.PaymentMethods.find(x => x.PaymentMethodTypeId === PhxConstants.PaymentMethodType.Cheque && x.IsSelected) !== undefined;
    this.html.hasDirectDeposit = this.inputFormGroup.value.PaymentMethods.find(x => x.PaymentMethodTypeId === PhxConstants.PaymentMethodType.DirectDeposit && x.IsSelected) !== undefined;
    this.html.hasWireTransfer = this.inputFormGroup.value.PaymentMethods.find(x => x.PaymentMethodTypeId === PhxConstants.PaymentMethodType.WireTransfer && x.IsSelected) !== undefined;
    this.refreshPaymentPreferenceList();

    if (this.paymentPreferenceSelectBox.value) {
      if (!this.inputFormGroup.value.PaymentMethods
        .find(x => x.PaymentMethodTypeId === this.paymentPreferenceSelectBox.value && x.IsSelected)) {
        this.inputFormGroup.patchValue({
          PaymentPreference: null
        });
      }
    }
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }
}

interface InternalForm {
  paymentPreference?: number;
  cheque: boolean;
  directDeposit: boolean;
  wireTransfer: boolean;
  aDP: boolean;
}
