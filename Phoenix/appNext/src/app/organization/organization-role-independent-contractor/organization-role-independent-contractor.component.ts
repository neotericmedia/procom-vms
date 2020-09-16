// angular
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input } from '@angular/core';
// common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, ValidationExtensions, CodeValueService } from '../../common/index';
import { AccessAction } from './../../common/model/access-action';
import { CustomFieldErrorType, FunctionalRole } from '../../common/model/index';
import { CodeValue } from './../../common/model/code-value';

import { IFormGroupValue } from '../../common/utility/form-group';
// organization
import {
  IOrganizationIndependentContractorRole,
  IPaymentMethod,
  IFormGroupSetup,
  IFormGroupOnNew,
  IRoot,
  IOrganization,
  ITabRoles,
  IOrganizationTaxNumber,
  IRoleWithPaymentMethod,
  IOrganizationTaxNumbers
} from './../state/organization.interface';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { Validators } from '../../../../node_modules/@angular/forms';
import { OrganizationRoleDetailComponent } from '../organization-role-detail/organization-role-detail.component';
import { filter } from 'lodash';
import { AuthService } from '../../common/services/auth.service';
import { OrganizationRolePaymentMethodsComponent } from '../organization-role-payment-methods/organization-role-payment-methods.component';
import { OrganizationSalesTaxComponent } from '../organization-sales-tax/organization-sales-tax.component';

@Component({
  selector: 'app-organization-role-independent-contractor',
  templateUrl: './organization-role-independent-contractor.component.html',
  styleUrls: ['./organization-role-independent-contractor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationRoleIndependentContractorComponent extends OrganizationBaseComponentPresentational<IOrganizationIndependentContractorRole> implements OnInit, OnDestroy {
  roleType: PhxConstants.OrganizationRoleType = PhxConstants.OrganizationRoleType.IndependentContractor;

  @Input() rootModel: IOrganization;
  @Input() salesTaxInputFormGroup: FormGroup<IOrganizationTaxNumbers>;
  @Input() currentUserRole: PhxConstants.OrganizationRoleType = null;

  html: {
    codeValueGroups: any;
    phxConstants: any;
    roleDisplayName: string;
    functionalRoles: FunctionalRole[];
    hasOrganizationIndependentContractorRolePaymentMethod: boolean;
    hasOrganizationRolePaymentReference: boolean;
    organizationTaxNumbersFormGroup: FormArray<IOrganizationTaxNumber>;
    allComplianceDocumentsAreValidForSubmission: boolean;
    parentEntityHasNoApplicableComplianceDocuments: boolean;
    canEditPaymentMethods: boolean;
    codeValueLists: {
      listCountry: Array<CodeValue>;
      listTaxSubdivision: Array<CodeValue>;
      listOrganizationRoleStatusType: Array<CodeValue>;
    };
    commonLists: {};
    access: {};
  } = {
    organizationTaxNumbersFormGroup: null,
    codeValueGroups: null,
    phxConstants: null,
    roleDisplayName: null,
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
    super('OrganizationRoleIndependentContractorComponent');
    this.html.roleDisplayName = this.codeValueService.getCodeValueText(this.roleType, this.commonService.CodeValueGroups.OrganizationRoleType);
    this.getCodeValuelistsStatic();
  }

  private get parentFormGroup() {
    return this.inputFormGroup.parent.parent.parent as FormGroup<IRoot>;
  }

  public get legalName() {
    return this.parentFormGroup ? this.parentFormGroup.controls.TabDetails.get('TabDetailsDetail').get('LegalName').value : null;
  }

  public get documentsRefLink() {
    const orgId = this.parentFormGroup.controls.OrganizationId.value;
    return `#/org/${orgId}/roles/independentcontractor/${this.inputFormGroup.controls.Id.value}`;
  }

  onComplianceDocumentOutput($event) {
    this.html.allComplianceDocumentsAreValidForSubmission = $event.AllComplianceDocumentsAreValidForSubmission;
    this.html.parentEntityHasNoApplicableComplianceDocuments = $event.ParentEntityHasNoApplicableComplianceDocuments;
  }

  private get salesTaxFormArray() {
    return (this.inputFormGroup.parent.parent.controls['OrganizationTaxNumbers'] as FormGroup<IOrganizationTaxNumbers>).controls.SalesTax as FormArray<IOrganizationTaxNumber>;
  }

  ngOnInit() {
    this.html.organizationTaxNumbersFormGroup = <FormArray<IOrganizationTaxNumber>>(this.inputFormGroup.parent as FormGroup<IOrganization>).controls.OrganizationTaxNumbers;
    if (this.inputFormGroup.controls.Id.value === 0) {
      if (this.salesTaxFormArray.length === 0) {
        const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
        this.salesTaxFormArray.push(OrganizationSalesTaxComponent.formBuilderGroupAddNew(formGroupOnNew, []));
        this.outputEvent.emit();
      }
    }
  }

  ngOnDestroy() {
    if (this.inputFormGroup.value.NotificationEmails && this.inputFormGroup.value.NotificationEmails.length > 0) {
      this.inputFormGroup.controls.NotificationEmail.setValue(this.inputFormGroup.value.NotificationEmails.map(x => x.Email).join(';'));
    }
    this.outputEvent.emit();
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCountry = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Country, true);
    this.html.codeValueLists.listOrganizationRoleStatusType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.OrganizationRoleStatusType, true);
    this.authService.getCurrentProfile().subscribe(data => {
      this.html.functionalRoles = data.FunctionalRoles;
      this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
    });
  }

  businessRules(obj: IFormGroupValue): void {}

  onOutputEvent() {
    this.outputEvent.emit();
  }

  recalcLocalProperties(role: FormGroup<IOrganizationIndependentContractorRole>) {}

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
    this.html.canEditPaymentMethods =
      this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer) && this.complianceFieldsEditable();
  }

  complianceFieldsEditable() {
    return this.rootModel.ReadOnlyStorage.IsComplianceDraftStatus && this.rootModel.ReadOnlyStorage.IsEditable;
  }

  private static getPreferedPaymentMethod(role: IRoleWithPaymentMethod): number {
    if (role.PaymentMethods.find(x => x.IsPreferred)) {
      return role.PaymentMethods.find(x => x.IsPreferred).PaymentMethodTypeId;
    } else {
      return null;
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, role: IOrganizationIndependentContractorRole, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<IOrganizationIndependentContractorRole> {
    return formGroupSetup.formBuilder.group<IOrganizationIndependentContractorRole>({
      Id: [role.Id],
      IdOriginal: [role.IdOriginal],
      OrganizationRoleTypeId: [role.OrganizationRoleTypeId],
      OrganizationRoleStatusId: [role.OrganizationRoleStatusId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
      IsNonResident: [role.IsNonResident, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsNonResident', CustomFieldErrorType.required))]],
      BusinessNumber: [role.BusinessNumber, [ValidationExtensions.maxLength(32), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BusinessNumber', CustomFieldErrorType.required))]],
      ...OrganizationRoleDetailComponent.formBuilderGroupSetupEmailsOnly(formGroupSetup, role)['controls'],
      PaymentPreference: [role.PaymentMethods.length ? OrganizationRoleIndependentContractorComponent.getPreferedPaymentMethod(role) : null, [Validators.required]],
      PaymentMethods: OrganizationRolePaymentMethodsComponent.paymentMethodsFormGroupSetup(formGroupSetup, role, codeValueService, codeValueGroups)
    });
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, roles: Array<IOrganizationIndependentContractorRole>, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<IOrganizationIndependentContractorRole> {
    return formGroupOnNew.formBuilder.group<IOrganizationIndependentContractorRole>({
      Id: [0],
      IdOriginal: [0],
      OrganizationRoleTypeId: PhxConstants.OrganizationRoleType.IndependentContractor,
      OrganizationRoleStatusId: [PhxConstants.OrganizationRoleStatusType.Inactive, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
      NotificationEmails: [[{ Email: '' }]],
      NotificationEmail: [null],
      IsNonResident: [null],
      BusinessNumber: [null],
      PaymentPreference: [PhxConstants.PaymentMethodType.Cheque],
      PaymentMethods: OrganizationRolePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupOnNew, codeValueService, codeValueGroups)
    });
  }

  public static formGroupToPartial(formGroupTabRoles: FormGroup<ITabRoles>): Partial<IOrganization> {
    const organizationIndependentContractorRoles: Array<IOrganizationIndependentContractorRole> = <Array<IOrganizationIndependentContractorRole>>formGroupTabRoles.controls.OrganizationIndependentContractorRoles.value;

    if (formGroupTabRoles.controls.OrganizationIndependentContractorRoles.value.length) {
      const roleFromGroup = (<FormArray<IOrganizationIndependentContractorRole>>formGroupTabRoles.controls.OrganizationIndependentContractorRoles).at(0) as FormGroup<IOrganizationIndependentContractorRole>;
      if (roleFromGroup.value.NotificationEmails) {
        roleFromGroup.controls.NotificationEmail.setValue(roleFromGroup.value.NotificationEmails.map(x => x.Email).join(';'));
      }
    }

    if (organizationIndependentContractorRoles[0]) {
      organizationIndependentContractorRoles[0].OrganizationRoleStatusId =
        organizationIndependentContractorRoles[0].Id === 0 ? PhxConstants.OrganizationRoleStatusType.Active : organizationIndependentContractorRoles[0].OrganizationRoleStatusId;
      organizationIndependentContractorRoles[0].PaymentPreference = OrganizationRoleIndependentContractorComponent.getPreferedPaymentMethod(organizationIndependentContractorRoles[0]);
    }

    return { OrganizationIndependentContractorRoles: organizationIndependentContractorRoles };
  }

  calcHasOrganizationRolePaymentMethod(role: FormGroup<IOrganizationIndependentContractorRole>) {
    this.html.hasOrganizationIndependentContractorRolePaymentMethod = role.value.PaymentMethods.some(lob => lob.IsSelected === true);
  }

  onChangePaymentMethod(role: FormGroup<IOrganizationIndependentContractorRole>, paymentMethod: IPaymentMethod) {
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
    this.calcHasOrganizationRolePaymentMethod(role);
    this.calcHasOrganizationRolePaymentReference(role);
  }

  calcHasOrganizationRolePaymentReference(role: FormGroup<IOrganizationIndependentContractorRole>) {
    this.html.hasOrganizationRolePaymentReference = role.value.PaymentMethods.some(lob => {
      return lob.IsPreferred === true;
    });
  }

  onChangePaymentPreference(role: FormGroup<IOrganizationIndependentContractorRole>, paymentMethod: IPaymentMethod) {
    const isPreferred = paymentMethod.IsPreferred;
    role.value.PaymentMethods.forEach(method => {
      method.IsPreferred = false;
    });

    if (paymentMethod.IsSelected && isPreferred) {
      paymentMethod.IsPreferred = isPreferred;
    }
    this.calcHasOrganizationRolePaymentReference(role);
  }

  onClickDeleteOrganizationRole() {
    const formArrayOfCurrentRole: FormArray<IOrganizationIndependentContractorRole> = <FormArray<IOrganizationIndependentContractorRole>>this.inputFormGroup.parent;

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
}
