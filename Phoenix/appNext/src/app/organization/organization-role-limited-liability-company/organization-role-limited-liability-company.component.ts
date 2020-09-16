// angular
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
// common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, ValidationExtensions, CodeValueService } from '../../common/index';
import { AccessAction } from './../../common/model/access-action';
import { CustomFieldErrorType, FunctionalRole } from '../../common/model/index';
import { CodeValue } from './../../common/model/code-value';
import { IFormGroupValue } from '../../common/utility/form-group';
import { AuthService } from '../../common/services/auth.service';
import { filter } from 'lodash';
// organization
import {
  IOrganizationLimitedLiabilityCompanyRole,
  IPaymentMethod,
  ITabRoles,
  IFormGroupSetup,
  IFormGroupOnNew,
  IRoot,
  IOrganization,
  IRoleWithPaymentMethod,
  IOrganizationTaxNumber,
  IOrganizationTaxNumbers
} from './../state/organization.interface';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { OrganizationLlcRoleComponent } from '../organization-llc-role/organization-llc-role.component';
import { Validators } from '../../../../node_modules/@angular/forms';
import { OrganizationRolePaymentMethodsComponent } from '../organization-role-payment-methods/organization-role-payment-methods.component';
import { OrganizationSalesTaxComponent } from '../organization-sales-tax/organization-sales-tax.component';
import { CustomValidators } from '../../common/validators/CustomValidators';

@Component({
  selector: 'app-organization-role-limited-liability-company',
  templateUrl: './organization-role-limited-liability-company.component.html',
  styleUrls: ['./organization-role-limited-liability-company.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationRoleLimitedLiabilityCompanyComponent extends OrganizationBaseComponentPresentational<IOrganizationLimitedLiabilityCompanyRole> implements OnInit {
  roleType: PhxConstants.OrganizationRoleType = PhxConstants.OrganizationRoleType.LimitedLiabilityCompany;

  @Input() rootModel: IOrganization;

  html: {
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    roleDisplayName: string;
    hasOrganizationLimitedLiabilityCompanyRolePaymentMethod: boolean;
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
      functionalRoles: [],
      canEditPaymentMethods: false,
      hasOrganizationLimitedLiabilityCompanyRolePaymentMethod: false,
      hasOrganizationRolePaymentReference: false,
      allComplianceDocumentsAreValidForSubmission: false,
      parentEntityHasNoApplicableComplianceDocuments: false,
      codeValueLists: {
        listCountry: [],
        listTaxSubdivision: [],
        listOrganizationRoleStatusType: []
      },
      commonLists: {},
      access: {}
    };

  constructor(private authService: AuthService) {
    super('OrganizationRoleLimitedLiabilityCompanyComponent');
    this.html.roleDisplayName = this.codeValueService.getCodeValueText(this.roleType, this.commonService.CodeValueGroups.OrganizationRoleType);
    this.getCodeValuelistsStatic();
  }

  ngOnInit() {
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCountry = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Country, true);
    this.html.codeValueLists.listOrganizationRoleStatusType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.OrganizationRoleStatusType, true);
    this.authService.getCurrentProfile().subscribe(data => {
      this.html.functionalRoles = data.FunctionalRoles;
      this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
    });
  }

  businessRules(obj: IFormGroupValue): void { }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  recalcLocalProperties(role: FormGroup<IOrganizationLimitedLiabilityCompanyRole>) { }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
    this.html.canEditPaymentMethods =
      this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer) && this.complianceFieldsEditable();
  }

  private static getPreferedPaymentMethod(role: IRoleWithPaymentMethod): number {
    if (role.PaymentMethods.find(x => x.IsPreferred)) {
      return role.PaymentMethods.find(x => x.IsPreferred).PaymentMethodTypeId;
    } else {
      return null;
    }
  }

  public static formBuilderGroupSetup(
    formGroupSetup: IFormGroupSetup,
    role: IOrganizationLimitedLiabilityCompanyRole,
    index: number,
    codeValueService: CodeValueService,
    codeValueGroups: any
  ): FormGroup<IOrganizationLimitedLiabilityCompanyRole> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IOrganizationLimitedLiabilityCompanyRole>(formGroupSetup.toUseHashCode, 'IOrganizationLimitedLiabilityCompanyRole', role, index, () =>
      formGroupSetup.formBuilder.group<IOrganizationLimitedLiabilityCompanyRole>({
        Id: [role.Id],
        IdOriginal: [role.IdOriginal],
        OrganizationRoleTypeId: [role.OrganizationRoleTypeId],
        OrganizationRoleStatusId: [role.OrganizationRoleStatusId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
        ...OrganizationLlcRoleComponent.formBuilderGroupSetupEmailsOnly(formGroupSetup, role)['controls'],
        IsNonResident: [role.IsNonResident, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsNonResident', CustomFieldErrorType.required))]],
        EmployerIdentificationNumber: [role.EmployerIdentificationNumber, [ValidationExtensions.maxLength(32)]],
        PaymentPreference: [role.PaymentMethods.length ? OrganizationRoleLimitedLiabilityCompanyComponent.getPreferedPaymentMethod(role) : null, [Validators.required]],
        PaymentMethods: OrganizationRolePaymentMethodsComponent.paymentMethodsFormGroupSetup(formGroupSetup, role, codeValueService, codeValueGroups)
      })
    );

    return formGroup;
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, roles: Array<IOrganizationLimitedLiabilityCompanyRole>, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<IOrganizationLimitedLiabilityCompanyRole> {
    return formGroupOnNew.formBuilder.group<IOrganizationLimitedLiabilityCompanyRole>({
      Id: [0],
      IdOriginal: [0],
      OrganizationRoleTypeId: PhxConstants.OrganizationRoleType.IndependentContractor,
      OrganizationRoleStatusId: [PhxConstants.OrganizationRoleStatusType.Inactive, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
      NotificationEmails: [[{ Email: '' }]],
      NotificationEmail: [null],
      IsNonResident: [null],
      EmployerIdentificationNumber: [null],
      PaymentPreference: [null, [Validators.required]],
      PaymentMethods: OrganizationRolePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupOnNew, codeValueService, codeValueGroups)
    });
  }

  complianceFieldsEditable() {
    return this.rootModel.ReadOnlyStorage.IsComplianceDraftStatus;
  }

  private get parentFormGroup() {
    return this.inputFormGroup.parent.parent.parent as FormGroup<IRoot>;
  }

  public get legalName() {
    return this.parentFormGroup ? this.parentFormGroup.controls.TabDetails.get('TabDetailsDetail').get('LegalName').value : null;
  }

  public get documentsRefLink() {
    const orgId = this.parentFormGroup.controls.OrganizationId.value;
    return `#/org/${orgId}/roles/limitedliabilitycompany/${this.inputFormGroup.controls.Id.value}`;
  }

  onComplianceDocumentOutput($event) {
    this.html.allComplianceDocumentsAreValidForSubmission = $event.AllComplianceDocumentsAreValidForSubmission;
    this.html.parentEntityHasNoApplicableComplianceDocuments = $event.ParentEntityHasNoApplicableComplianceDocuments;
  }

  public static formGroupToPartial(formGroupTabRoles: FormGroup<ITabRoles>): Partial<IOrganization> {
    const organizationLimitedLiabilityCompanyRoles: Array<IOrganizationLimitedLiabilityCompanyRole> = <Array<IOrganizationLimitedLiabilityCompanyRole>>formGroupTabRoles.controls.OrganizationLimitedLiabilityCompanyRoles.value;

    if (organizationLimitedLiabilityCompanyRoles[0]) {
      organizationLimitedLiabilityCompanyRoles[0].OrganizationRoleStatusId =
        organizationLimitedLiabilityCompanyRoles[0].Id === 0 ? PhxConstants.OrganizationRoleStatusType.Active : organizationLimitedLiabilityCompanyRoles[0].OrganizationRoleStatusId;
    }

    if (formGroupTabRoles.controls.OrganizationLimitedLiabilityCompanyRoles.value.length) {
      const roleFromGroup = (<FormArray<IOrganizationLimitedLiabilityCompanyRole>>formGroupTabRoles.controls.OrganizationLimitedLiabilityCompanyRoles).at(0) as FormGroup<IOrganizationLimitedLiabilityCompanyRole>;
      if (roleFromGroup.value.NotificationEmails) {
        roleFromGroup.controls.NotificationEmail.setValue(roleFromGroup.value.NotificationEmails.map(x => x.Email).join(';'));
      }
    }

    return { OrganizationLimitedLiabilityCompanyRoles: organizationLimitedLiabilityCompanyRoles };
  }

  calcHasOrganizationRolePaymentMethod(role: IOrganizationLimitedLiabilityCompanyRole) {
    this.html.hasOrganizationLimitedLiabilityCompanyRolePaymentMethod = role.PaymentMethods.some(lob => lob.IsSelected === true);
  }

  onChangePaymentMethod(role: IOrganizationLimitedLiabilityCompanyRole, paymentMethod) {
    if (paymentMethod && !paymentMethod.IsSelected) {
      if (paymentMethod.IsPreferred) {
        paymentMethod.IsPreferred = false;
        paymentMethod.hasPreference = false;
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
    this.calcHasOrganizationRolePaymentMethod(role);
    this.calcHasOrganizationRolePaymentReference(role);
  }

  calcHasOrganizationRolePaymentReference(role: IOrganizationLimitedLiabilityCompanyRole) {
    this.html.hasOrganizationRolePaymentReference = role.PaymentMethods.some(lob => lob.IsPreferred === true);
  }

  onChangePaymentPreference(role: IOrganizationLimitedLiabilityCompanyRole, paymentMethod) {
    const isPreferred = paymentMethod.IsPreferred;
    role.PaymentMethods.forEach(method => {
      method.IsPreferred = false;
    });

    if (paymentMethod.IsSelected && isPreferred) {
      paymentMethod.IsPreferred = isPreferred;
    }
  }

  onClickDeleteOrganizationRole() {
    const formArrayOfCurrentRole: FormArray<IOrganizationLimitedLiabilityCompanyRole> = <FormArray<IOrganizationLimitedLiabilityCompanyRole>>this.inputFormGroup.parent;

    // if (this.inputFormGroup.controls.Id.value === 0) {
    //   if (this.salesTaxFormArray) {
    //     const len = this.salesTaxFormArray.length;
    //     for (let index = 0; index < len; index++) {
    //       this.salesTaxFormArray.removeAt(index);
    //     }
    //   }
    // }

    formArrayOfCurrentRole.removeAt(0);
    this.outputEvent.emit();
  }
}
