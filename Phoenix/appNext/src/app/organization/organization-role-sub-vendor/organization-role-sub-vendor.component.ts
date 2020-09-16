// angular
import { Component, ChangeDetectionStrategy, OnDestroy, Input, OnInit } from '@angular/core';
// common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CodeValueService, ValidationExtensions } from '../../common/index';
import { AccessAction } from './../../common/model/access-action';
import { CustomFieldErrorType, FunctionalRole } from '../../common/model/index';
import { CodeValue } from './../../common/model/code-value';
import { IFormGroupValue } from '../../common/utility/form-group';
import { filter } from 'lodash';
import { AuthService } from '../../common/services/auth.service';

// organization
import {
  IOrganizationSubVendorRole,
  IPaymentMethod,
  IOrganizationSubVendorRoleRestriction,
  IFormGroupSetup,
  IFormGroupOnNew,
  IOrganization,
  ITabRoles,
  IRoot,
  IRoleWithPaymentMethod,
  IOrganizationTaxNumber,
  IOrganizationTaxNumbers
} from './../state/organization.interface';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { Validators } from '../../../../node_modules/@angular/forms';
import { OrganizationRoleSubVendorRoleDetailsComponent } from '../organization-role-sub-vendor-role-details/organization-role-sub-vendor-role-details.component';
import { OrganizationRolePaymentMethodsComponent } from '../organization-role-payment-methods/organization-role-payment-methods.component';
import { OrganizationSalesTaxComponent } from '../organization-sales-tax/organization-sales-tax.component';

@Component({
  selector: 'app-organization-role-sub-vendor',
  templateUrl: './organization-role-sub-vendor.component.html',
  styleUrls: ['./organization-role-sub-vendor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationRoleSubVendorComponent extends OrganizationBaseComponentPresentational<IOrganizationSubVendorRole> implements OnDestroy, OnInit {
  roleType: PhxConstants.OrganizationRoleType = PhxConstants.OrganizationRoleType.SubVendor;

  @Input() rootModel: IOrganization;
  @Input() salesTaxInputFormGroup: FormGroup<IOrganizationTaxNumbers>;
  @Input() currentUserRole: PhxConstants.OrganizationRoleType = null;
  showPayeeNameField: boolean = false;

  html: {
    codeValueGroups: any;
    phxConstants: any;
    roleDisplayName: string;
    hasOrganizationSubVendorRolePaymentMethod: boolean;
    hasOrganizationSubVendorRolePaymentReference: boolean;
    subscriptionRestrictionsGroups: Array<PhxConstants.OrganizationSubVendorRoleRestrictionType>;
    hasOrganizationIndependentContractorRolePaymentMethod: boolean;
    hasOrganizationRolePaymentReference: boolean;
    allComplianceDocumentsAreValidForSubmission: boolean;
    parentEntityHasNoApplicableComplianceDocuments: boolean;
    functionalRoles: FunctionalRole[];
    canEditPaymentMethods: boolean;
    codeValueLists: {
      listCountry: Array<CodeValue>;
      listTaxSubdivision: Array<CodeValue>;
      listOrganizationRoleStatusType: Array<CodeValue>;
    };
    commonLists: {};
    access: {};
  } = {
      codeValueGroups: null,
      phxConstants: null,
      roleDisplayName: null,
      hasOrganizationSubVendorRolePaymentMethod: false,
      hasOrganizationSubVendorRolePaymentReference: false,
      subscriptionRestrictionsGroups: null,
      hasOrganizationIndependentContractorRolePaymentMethod: false,
      hasOrganizationRolePaymentReference: false,
      allComplianceDocumentsAreValidForSubmission: false,
      parentEntityHasNoApplicableComplianceDocuments: false,
      canEditPaymentMethods: false,
      functionalRoles: [],
      codeValueLists: {
        listCountry: [],
        listTaxSubdivision: [],
        listOrganizationRoleStatusType: []
      },
      commonLists: {},
      access: {}
    };

  constructor(private authService: AuthService) {
    super('OrganizationRoleSubVendorComponent');
    this.html.roleDisplayName = this.codeValueService.getCodeValueText(this.roleType, this.commonService.CodeValueGroups.OrganizationRoleType);
    this.getCodeValuelistsStatic();
  }

  private get salesTaxFormArray() {
    return (this.inputFormGroup.parent.parent.controls['OrganizationTaxNumbers'] as FormGroup<IOrganizationTaxNumbers>).controls.SalesTax as FormArray<IOrganizationTaxNumber>;
  }

  ngOnInit() {
    if (this.inputFormGroup.controls.Id.value === 0) {
      if (this.salesTaxFormArray.length === 0) {
        const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
        this.salesTaxFormArray.push(OrganizationSalesTaxComponent.formBuilderGroupAddNew(formGroupOnNew, []));
        this.outputEvent.emit();
      }
    }

    this.showPayeeNameField = !!this.inputFormGroup.get('UseADifferentPayeeName').value;
  }

  private get parentFormGroup() {
    return this.inputFormGroup.parent.parent.parent as FormGroup<IRoot>;
  }

  public get legalName() {
    return this.parentFormGroup ? this.parentFormGroup.controls.TabDetails.get('TabDetailsDetail').get('LegalName').value : null;
  }

  currentProfileUnderComplianceRole() {
    return (
      filter(this.html.functionalRoles, function (item) {
        return (
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOffice ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Finance ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.SystemAdministrator ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Controller ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOfficeARAP ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.AccountsReceivable
        );
      }).length > 0
    );
  }

  isComplianceDraftStatus(statusId) {
    return statusId === PhxConstants.OrganizationStatus.ComplianceDraft || statusId === PhxConstants.OrganizationStatus.RecalledCompliance;
  }

  complianceFieldsEditable() {
    return this.currentProfileUnderComplianceRole() && this.isComplianceDraftStatus(this.rootModel.OrganizationStatusId);
  }

  public get documentsRefLink() {
    if (!this.parentFormGroup) {
      return null;
    }

    const orgId = this.parentFormGroup.controls.OrganizationId.value;
    return `#/org/${orgId}/roles/subvendor/${this.inputFormGroup.controls.Id.value}`;
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCountry = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Country, true);
    this.html.codeValueLists.listOrganizationRoleStatusType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.OrganizationRoleStatusType, true);
    this.authService.getCurrentProfile().subscribe(data => {
      this.html.functionalRoles = data.FunctionalRoles;
      this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
    });
  }

  businessRules(obj: IFormGroupValue): void {
    if (obj.name === 'UseADifferentPayeeName') {
      this.setValidatorForPayeeName(obj.val);
    }
  }

  recalcLocalProperties(role: FormGroup<IOrganizationSubVendorRole>) { }

  recalcAccessActions(isEditable: boolean, FaccessActions: Array<AccessAction>) {
    this.html.canEditPaymentMethods = this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.OrganizationSubVendorRoleEditPaymentMethodDirectDeposit) && this.complianceFieldsEditable();
  }

  private static getPreferedPaymentMethod(role: IRoleWithPaymentMethod): number {
    if (role.PaymentMethods.find(x => x.IsPreferred)) {
      return role.PaymentMethods.find(x => x.IsPreferred).PaymentMethodTypeId;
    } else {
      return null;
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, role: IOrganizationSubVendorRole, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<IOrganizationSubVendorRole> {
    return formGroupSetup.formBuilder.group<IOrganizationSubVendorRole>({
      Id: [role.Id],
      IdOriginal: [role.IdOriginal],
      OrganizationRoleTypeId: [role.OrganizationRoleTypeId],
      OrganizationRoleStatusId: [role.OrganizationRoleStatusId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
      ...OrganizationRoleSubVendorRoleDetailsComponent.formBuilderGroupSetupEmailsOnly(formGroupSetup, role)['controls'],
      IsNonResident: [role.IsNonResident, [Validators.required]],
      BusinessNumber: [role.BusinessNumber, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BusinessNumber', CustomFieldErrorType.required))]],
      UseADifferentPayeeName: [role.UseADifferentPayeeName],
      PayeeName: [role.PayeeName, OrganizationRoleSubVendorComponent.
        getValidatorForPayeeName(role.UseADifferentPayeeName, formGroupSetup)],
      PaymentPreference: [role.PaymentMethods.length ? OrganizationRoleSubVendorComponent.getPreferedPaymentMethod(role) : null, [Validators.required]],
      PaymentMethods: OrganizationRolePaymentMethodsComponent.paymentMethodsFormGroupSetup(formGroupSetup, role, codeValueService, codeValueGroups),
      OrganizationSubVendorRoleRestrictions: formGroupSetup.formBuilder.array<IOrganizationSubVendorRoleRestriction>(
        role.OrganizationSubVendorRoleRestrictions.map(entity2 =>
          formGroupSetup.formBuilder.group<IOrganizationSubVendorRoleRestriction>({
            Id: [entity2.Id],
            OrganizationSubVendorRoleId: [entity2.OrganizationSubVendorRoleId],
            OrganizationSubVendorRoleRestrictionTypeId: [entity2.OrganizationSubVendorRoleRestrictionTypeId],
            OrganizationIdClient: [entity2.OrganizationIdClient],
            OrganizationIdInternal: [entity2.OrganizationIdInternal],
            Name: [entity2.Name]
          })
        )
      )
    });
  }

  ngOnDestroy() {
    if (this.inputFormGroup.value.NotificationEmails && this.inputFormGroup.value.NotificationEmails.length > 0) {
      this.inputFormGroup.controls.NotificationEmail.setValue(this.inputFormGroup.value.NotificationEmails.map(x => x.Email).join(';'));
    }
    this.outputEvent.emit();
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, roles: Array<IOrganizationSubVendorRole>, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<IOrganizationSubVendorRole> {
    return formGroupOnNew.formBuilder.group<IOrganizationSubVendorRole>({
      Id: [0],
      IdOriginal: [0],
      OrganizationRoleTypeId: PhxConstants.OrganizationRoleType.SubVendor,
      OrganizationRoleStatusId: [PhxConstants.OrganizationRoleStatusType.Inactive, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
      NotificationEmails: [[{ Email: '' }]],
      NotificationEmail: [null],
      IsNonResident: [null],
      BusinessNumber: [null],
      UseADifferentPayeeName: [false],
      PayeeName: [null],
      PaymentPreference: [PhxConstants.PaymentMethodType.Cheque],
      PaymentMethods: OrganizationRolePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupOnNew, codeValueService, codeValueGroups),
      OrganizationSubVendorRoleRestrictions: formGroupOnNew.formBuilder.array([])
    });
  }

  public static formGroupToPartial(formGroupTabRoles: FormGroup<ITabRoles>): Partial<IOrganization> {
    const organizationSubVendorRoles: Array<IOrganizationSubVendorRole> = <Array<IOrganizationSubVendorRole>>formGroupTabRoles.controls.OrganizationSubVendorRoles.value;

    if (organizationSubVendorRoles[0]) {
      organizationSubVendorRoles[0].OrganizationRoleStatusId = organizationSubVendorRoles[0].Id === 0 ? PhxConstants.OrganizationRoleStatusType.Active : organizationSubVendorRoles[0].OrganizationRoleStatusId;
    }

    if (formGroupTabRoles.controls.OrganizationSubVendorRoles.value.length) {
      const roleFromGroup = (<FormArray<IOrganizationSubVendorRole>>formGroupTabRoles.controls.OrganizationSubVendorRoles).at(0) as FormGroup<IOrganizationSubVendorRole>;
      if (roleFromGroup.value.NotificationEmails) {
        roleFromGroup.controls.NotificationEmail.setValue(roleFromGroup.value.NotificationEmails.map(x => x.Email).join(';'));
      }
    }

    return { OrganizationSubVendorRoles: organizationSubVendorRoles };
  }

  calcHasOrganizationSubVendorRolePaymentMethod(role: IOrganizationSubVendorRole) {
    this.html.hasOrganizationSubVendorRolePaymentMethod = role.PaymentMethods.some(lob => lob.IsSelected === true);
  }

  onChangePaymentMethod(role: IOrganizationSubVendorRole, paymentMethod: IPaymentMethod) {
    if (paymentMethod && !paymentMethod.IsSelected) {
      if (paymentMethod.IsPreferred) {
        paymentMethod.IsPreferred = false;
      }
      if (paymentMethod.PaymentMethodTypeId === PhxConstants.PaymentMethodType.WireTransfer) {
        paymentMethod.ProfileNameBeneficiary = null;
        paymentMethod.NameBeneficiary = null;
        paymentMethod.AccountNumberBeneficiary = null;
        paymentMethod.Address1Beneficiary = null;
        paymentMethod.Address2Beneficiary = null;
        paymentMethod.CityBeneficiary = null;
        paymentMethod.ProvinceOrStateBeneficiary = null;
        paymentMethod.CountryCodeBeneficiary = null;
        paymentMethod.PostalorZipBeneficiary = null;
        paymentMethod.PayCurrencyBeneficiary = null;
        paymentMethod.WireTransferBankTypeIdBeneficiary = null;
        paymentMethod.BankIDBeneficiary = null;
        paymentMethod.ABANoBeneficiary = null;

        paymentMethod.WireTransferBankTypeIdIntemediary = null;
        paymentMethod.BankNameIntemediary = null;
        paymentMethod.BankIdIntemediary = null;
        paymentMethod.Address1Intemediary = null;
        paymentMethod.Address2Intemediary = null;
        paymentMethod.CityIntemediary = null;
        paymentMethod.ProvinceOrStateIntemediary = null;
        paymentMethod.CountryCodeIntemediary = null;
        paymentMethod.PostalOrZipIntemediary = null;

        paymentMethod.WireTransferBankTypeIdReceivers = null;
        paymentMethod.BankNameReceivers = null;
        paymentMethod.BankIdReceivers = null;
        paymentMethod.Address1Receivers = null;
        paymentMethod.Address2Receivers = null;
        paymentMethod.CityReceivers = null;
        paymentMethod.ProvinceOrStateReceivers = null;
        paymentMethod.CountryCodeReceivers = null;
        paymentMethod.PostalOrZipReceivers = null;

        paymentMethod.PaymentDetailNotes = null;
      }
      if (paymentMethod.PaymentMethodTypeId === PhxConstants.PaymentMethodType.DirectDeposit) {
        paymentMethod.BankCode = null;
        paymentMethod.BankBranchCode = null;
        paymentMethod.BankAccountNumber = null;
      }
      if (paymentMethod.PaymentMethodTypeId === PhxConstants.PaymentMethodType.ADP) {
        paymentMethod.EmployeeId = null;
      }
    }
    this.calcHasOrganizationSubVendorRolePaymentMethod(role);
    this.calcHasOrganizationSubVendorRolePaymentReference(role);
  }

  calcHasOrganizationSubVendorRolePaymentReference(role: IOrganizationSubVendorRole) {
    this.html.hasOrganizationSubVendorRolePaymentReference = role.PaymentMethods.some(lob => lob.IsPreferred === true);
  }

  onChangePaymentPreference(role: IOrganizationSubVendorRole, method: IPaymentMethod) {
    const IsPreferred = method.IsPreferred;
    role.PaymentMethods.forEach(paymentMethod => {
      paymentMethod.IsPreferred = false;
    });

    if (method.IsSelected && IsPreferred) {
      method.IsPreferred = IsPreferred;
    }
    this.calcHasOrganizationSubVendorRolePaymentReference(role);
  }

  subscriptionRestrictionsGrouped(role: IOrganizationSubVendorRole) {
    this.html.subscriptionRestrictionsGroups = new Array<PhxConstants.OrganizationSubVendorRoleRestrictionType>();
    return role.OrganizationSubVendorRoleRestrictions;
  }

  filterGroupByOrganizationSubVendorRoleRestrictionTypeId(restriction: IOrganizationSubVendorRoleRestriction) {
    const isNew = this.html.subscriptionRestrictionsGroups.indexOf(restriction.OrganizationSubVendorRoleRestrictionTypeId) === -1;
    if (isNew) {
      this.html.subscriptionRestrictionsGroups.push(restriction.OrganizationSubVendorRoleRestrictionTypeId);
    }
    return isNew;
  }

  onClickDeleteOrganizationRole() {
    const formArrayOfCurrentRole: FormArray<IOrganizationSubVendorRole> = <FormArray<IOrganizationSubVendorRole>>this.inputFormGroup.parent;

    if (this.inputFormGroup.controls.Id.value === 0) {
      if (this.salesTaxFormArray.length) {
        const len = this.salesTaxFormArray.length;
        for (let index = 0; index < len; index++) {
          this.salesTaxFormArray.removeAt(index);
        }
      }
    }

    formArrayOfCurrentRole.removeAt(0);
    this.outputEvent.emit();
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onComplianceDocumentOutput($event) {
    this.html.allComplianceDocumentsAreValidForSubmission = $event.AllComplianceDocumentsAreValidForSubmission;
    this.html.parentEntityHasNoApplicableComplianceDocuments = $event.ParentEntityHasNoApplicableComplianceDocuments;
  }

  setValidatorForPayeeName(set: boolean) {
    const payeeNameControl = this.inputFormGroup.get('PayeeName');
    if (set) {
      if (!payeeNameControl.validator) {
        payeeNameControl.setValidators([
          ValidationExtensions.maxLength(128),
          ValidationExtensions.required(this.customFieldService.formatErrorMessage('PayeeName', CustomFieldErrorType.required))
        ]);
      }
    } else {
      payeeNameControl.clearValidators();
    }

    payeeNameControl.updateValueAndValidity();
    this.showPayeeNameField = set;
  }

  private static getValidatorForPayeeName(set: boolean, fgs: IFormGroupSetup) {
    return set ? [
      ValidationExtensions.maxLength(128),
      ValidationExtensions.required(fgs.customFieldService.formatErrorMessage('PayeeName', CustomFieldErrorType.required))
    ] : [];
  }
}
