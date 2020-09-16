// angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
// common
import { FormGroup, FormArray, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, ValidationExtensions, CodeValueService, CommonService, LoadingSpinnerService } from '../../common';
import { CodeValue, AccessAction, CustomFieldErrorType, FunctionalRole } from '../../common/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ICommonListsItem } from '../../common/lists';
// organization
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import {
  IOrganizationClientRole,
  IOrganizationClientRoleAlternateBill,
  IOrganizationClientRoleNationalAccountManager,
  IOrganizationClientRoleLOB,
  ITabDetailsDetail,
  ITabRoles,
  IRoot,
  ITabDetails,
  IFormGroupSetup,
  IFormGroupOnNew,
  IOrganization
} from '../state/organization.interface';
import { AuthService } from '../../common/services/auth.service';
import { CustomValidators } from '../../common/validators/CustomValidators';

@Component({
  selector: 'app-organization-role-client',
  templateUrl: './organization-role-client.component.html',
  styleUrls: ['./organization-role-client.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationRoleClientComponent extends OrganizationBaseComponentPresentational<IOrganizationClientRole> {
  roleType: PhxConstants.OrganizationRoleType = PhxConstants.OrganizationRoleType.Client;

  @Input() rootModel: IOrganization;

  html: {
    hasOrganizationClientRoleLOB: boolean;
    roleDisplayName: string;
    functionalRoles: FunctionalRole[];
    codeValueLists: {
      listCountry: Array<CodeValue>;
      listTaxSubdivision: Array<CodeValue>;
      listClientSalesTaxDefault: Array<CodeValue>;
      listLineOfBusiness: Array<CodeValue>;
      listOrganizationRoleStatusType: Array<CodeValue>;
    };
    commonLists: {
      listUserProfileInternal: Array<ICommonListsItem>;
    };
    access: {
      organizationClientRoleEditNationalAccountManager: boolean;
      organizationClientRoleEditAlternateBill: boolean;
      billSalesTaxAppliedOnExpenseImport: boolean;
      paySalesTaxAppliedOnExpenseImport: boolean;
      complianceFieldsEditable: boolean;
      areComplianceFieldsRequired: boolean;
    };
  } = {
      hasOrganizationClientRoleLOB: false,
      roleDisplayName: null,
      functionalRoles: [],
      codeValueLists: {
        listCountry: null,
        listTaxSubdivision: null,
        listClientSalesTaxDefault: null,
        listLineOfBusiness: null,
        listOrganizationRoleStatusType: null
      },
      commonLists: {
        listUserProfileInternal: null
      },
      access: {
        organizationClientRoleEditNationalAccountManager: false,
        organizationClientRoleEditAlternateBill: false,
        billSalesTaxAppliedOnExpenseImport: false,
        paySalesTaxAppliedOnExpenseImport: false,
        complianceFieldsEditable: false,
        areComplianceFieldsRequired: false
      }
    };

  constructor(private authService: AuthService, private loader: LoadingSpinnerService, private chRef: ChangeDetectorRef) {
    super('OrganizationRoleClientComponent');
    this.html.roleDisplayName = this.codeValueService.getCodeValueText(this.roleType, this.commonService.CodeValueGroups.OrganizationRoleType);
    this.getCodeValuelistsStatic();
  }

  public get selectedNationalAccountManagers() {
    return this.inputFormGroup.value.OrganizationClientRoleNationalAccountManagers;
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<IOrganizationClientRole> = null;
    const formArrayOrganizationClientRole: FormArray<IOrganizationClientRole> = <FormArray<IOrganizationClientRole>>this.inputFormGroup.parent;
    const formGroupTabRoles: FormGroup<ITabRoles> = <FormGroup<ITabRoles>>formArrayOrganizationClientRole.parent;
    const formGroupRoot: FormGroup<IRoot> = <FormGroup<IRoot>>formGroupTabRoles.parent;

    switch (obj.name) {
      // case 'OrganizationClientRoleAlternateBills':
      //   value = { [obj.name]: obj.val };
      //   if (this.html.codeValueLists.listClientSalesTaxDefault.find(x => x.id === obj.val)) {
      //     const name = this.html.codeValueLists.listClientSalesTaxDefault.find(x => x.id === obj.val).description;
      //     const formGroupTabDetail: FormGroup<ITabDetails> = <FormGroup<ITabDetails>>formGroupRoot.controls.TabDetails;
      //     const formGroupDetails: FormGroup<ITabDetailsDetail> = <FormGroup<ITabDetailsDetail>>formGroupTabDetail.controls.TabDetailsDetail;
      //     this.patchValue(formGroupDetails, { DisplayName: name });
      //   }
      //   break;
      case 'UsesThirdPartyImport':
        if (obj.val === true) {
          value = { UsesThirdPartyImport: obj.val };
        } else {
          value = { UsesThirdPartyImport: obj.val, IsBillSalesTaxAppliedOnExpenseImport: null, IsPaySalesTaxAppliedOnExpenseImport: null };
        }
        break;
      default:
        value = { [obj.name]: obj.val };
        break;
    }
    this.patchValue(this.inputFormGroup, value);
  }

  onNameAltBillNameChange(index) {
    const formArray = this.inputFormGroup.controls.OrganizationClientRoleAlternateBills as FormArray<IOrganizationClientRoleAlternateBill>;
    const formGroup = formArray.at(index) as FormGroup<IOrganizationClientRoleAlternateBill>;
    let code = formGroup.controls.AlternateBillLegalName.value;
    if (code) {
      code = this.constructOrganizationCode(code);
    }

    const value = {
      AlternateBillCode: code ? code.toUpperCase() : null
    };

    formGroup.patchValue(value);
  }

  constructOrganizationCode(legalName: string) {
    let result = '';
    if (legalName) {
      legalName = legalName.trim();
      legalName = legalName.toUpperCase();
      let words: Array<string> = legalName.split(' ');
      words.forEach((word, index) => {
        words[index] = word.trim();
        words[index] = word.replace(/[^A-Z0-9]/gi, '');
      });
      words.forEach((word, index) => {
        if (word === 'THE' || word === 'AND') {
          words[index] = '';
        }
      });
      words = words.filter(word => word.length > 0);

      let totalLength = 0;
      words.forEach(word => {
        totalLength += word.length;
      });

      if (totalLength <= 6 || words.length === 1) {
        words.forEach(word => {
          result += word;
        });
      } else {
        words.forEach((word, index) => {
          if (index > 0) {
            //  not first word
            const lengthOfWord = word.length >= 3 ? 3 : word.length;
            result += word.substring(0, lengthOfWord);
          }
        });
        if (words[0].length >= 3) {
          result = words[0].substring(0, 3) + result;
        } else {
          result = words[0] + result;
        }
      }
      result = result.substring(0, 6);
    }
    return result;
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCountry = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Country, true);
    this.html.codeValueLists.listClientSalesTaxDefault = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.ClientSalesTaxDefault, true);
    this.html.codeValueLists.listLineOfBusiness = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.LineOfBusiness, true);
    this.html.codeValueLists.listOrganizationRoleStatusType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.OrganizationRoleStatusType, true);
    this.commonListsObservableService.listUserProfileInternal$().subscribe(list => {
      this.html.commonLists.listUserProfileInternal = list;
    });

    this.authService
      .getCurrentProfile()
      .takeUntil(this.isDestroyed$)
      .subscribe(data => {
        this.html.functionalRoles = data.FunctionalRoles;
        this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
      });
  }

  recalcLocalProperties(roleFormGroup: FormGroup<IOrganizationClientRole>) {
    const getListTaxSubdivision = (countryId: number) => {
      if (countryId > 0) {
        return this.codeValueService.getRelatedCodeValues(this.commonService.CodeValueGroups.Subdivision, countryId, this.commonService.CodeValueGroups.Country).sort((a, b) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        });
      } else {
        return [];
      }
    };

    if (roleFormGroup.value && roleFormGroup.controls.SalesTaxCountryId.value > 0) {
      this.html.codeValueLists.listTaxSubdivision = getListTaxSubdivision(roleFormGroup.controls.SalesTaxCountryId.value);
    }

    this.html.hasOrganizationClientRoleLOB = false;
    if (roleFormGroup.value && roleFormGroup.controls.OrganizationClientRoleLOBs.value && roleFormGroup.controls.OrganizationClientRoleLOBs.value.length > 0) {
      this.html.hasOrganizationClientRoleLOB = roleFormGroup.controls.OrganizationClientRoleLOBs.value.some(lob => lob.IsSelected === true);
    }
    this.html.access.billSalesTaxAppliedOnExpenseImport = !roleFormGroup.controls.UsesThirdPartyImport.value;
    this.html.access.paySalesTaxAppliedOnExpenseImport = !roleFormGroup.controls.UsesThirdPartyImport.value;

    if (!roleFormGroup.controls.UsesThirdPartyImport.value) {
      roleFormGroup.controls.IsBillSalesTaxAppliedOnExpenseImport.setValidators([ValidationExtensions.required(this.customFieldService.formatErrorMessage('IsBillSalesTaxAppliedOnExpenseImport', CustomFieldErrorType.required))]);
      roleFormGroup.controls.IsPaySalesTaxAppliedOnExpenseImport.setValidators([ValidationExtensions.required(this.customFieldService.formatErrorMessage('IsPaySalesTaxAppliedOnExpenseImport', CustomFieldErrorType.required))]);
    } else {
      this.inputFormGroup.controls.IsBillSalesTaxAppliedOnExpenseImport.clearValidators();
      this.inputFormGroup.controls.IsPaySalesTaxAppliedOnExpenseImport.clearValidators();
    }

    this.inputFormGroup.updateValueAndValidity();
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
    this.html.access.organizationClientRoleEditNationalAccountManager = isEditable && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.OrganizationClientRoleEditNationalAccountManager);
    this.html.access.organizationClientRoleEditAlternateBill = isEditable && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.OrganizationClientRoleEditAlternateBill);
    this.html.access.complianceFieldsEditable = isEditable && this.rootModel.ReadOnlyStorage.IsComplianceDraftStatus;
    this.html.access.areComplianceFieldsRequired = isEditable && this.rootModel.ReadOnlyStorage.IsComplianceDraftStatus;
    this.chRef.detectChanges();
  }

  trackByFn(index: number) {
    return index;
  }

  onClickDeleteOrganizationRole() {
    const formArrayOfCurrentRole: FormArray<IOrganizationClientRole> = <FormArray<IOrganizationClientRole>>this.inputFormGroup.parent;
    formArrayOfCurrentRole.removeAt(0);
    this.outputEvent.emit();
  }

  onThirdPartyImportValueChance() {
    this.html.access.paySalesTaxAppliedOnExpenseImport = this.inputFormGroup.controls.UsesThirdPartyImport.value;
  }

  onClickAddOrganizationClientRoleNationalAccountManager() {
    const newFormGroupControl = this.formBuilder.group<IOrganizationClientRoleNationalAccountManager>({
      Id: [0],
      OrganizationClientRoleId: [this.inputFormGroup.controls.Id.value],
      UserProfileInternalId: [null, [ValidationExtensions.required(this.customFieldService.formatErrorMessage('UserProfileInternalId', CustomFieldErrorType.required))]],
      ContactFullName: ''
    });

    const formArray = <FormArray<IOrganizationClientRoleNationalAccountManager>>this.inputFormGroup.controls.OrganizationClientRoleNationalAccountManagers;
    formArray.push(newFormGroupControl);
  }

  onClickDeleteOrganizationClientRoleNationalAccountManager(entityIndex: number) {
    const formArray = <FormArray<IOrganizationClientRoleNationalAccountManager>>this.inputFormGroup.controls.OrganizationClientRoleNationalAccountManagers;
    formArray.removeAt(entityIndex);
  }

  onClickAddOrganizationClientRoleAlternateBill() {
    const newFormGroupControl = this.formBuilder.group<IOrganizationClientRoleAlternateBill>({
      Id: [0],
      OrganizationClientRoleId: [this.inputFormGroup.controls.Id.value],
      OrganizationClientRoleAlternateBillStatusId: [
        PhxConstants.OrganizationClientRoleAlternateBillStatus.Draft,
        [ValidationExtensions.required(this.customFieldService.formatErrorMessage('OrganizationClientRoleAlternateBillStatusId', CustomFieldErrorType.required))]
      ],
      AlternateBillLegalName: [null, [ValidationExtensions.required(this.customFieldService.formatErrorMessage('AlternateBillLegalName', CustomFieldErrorType.required))]],
      AlternateBillCode: [null, [ValidationExtensions.required(this.customFieldService.formatErrorMessage('AlternateBillCode', CustomFieldErrorType.required))]],
      IsActive: [false, [ValidationExtensions.required(this.customFieldService.formatErrorMessage('IsActive', CustomFieldErrorType.required))]],
      IsSelected: [false, [ValidationExtensions.required(this.customFieldService.formatErrorMessage('IsSelected', CustomFieldErrorType.required))]]
    });

    const formArray = <FormArray<IOrganizationClientRoleAlternateBill>>this.inputFormGroup.controls.OrganizationClientRoleAlternateBills;
    formArray.push(newFormGroupControl);
  }

  onClickDeleteOrganizationClientRoleAlternateBill(entityIndex: number) {
    const formArray = <FormArray<IOrganizationClientRoleAlternateBill>>this.inputFormGroup.controls.OrganizationClientRoleAlternateBills;
    formArray.removeAt(entityIndex);
  }

  private static isIsAccrueMaxedOutFieldsRequired(statusId, entity) {
    return entity.IsDraftStatus && !(statusId === PhxConstants.OrganizationStatus.ComplianceDraft || statusId === PhxConstants.OrganizationStatus.RecalledCompliance);
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, roles: Array<IOrganizationClientRole>, codeValueService: CodeValueService, commonService: CommonService): FormGroup<IOrganizationClientRole> {
    return formGroupOnNew.formBuilder.group<IOrganizationClientRole>({
      Id: [0],
      IdOriginal: [0],
      OrganizationRoleTypeId: PhxConstants.OrganizationRoleType.Client,
      OrganizationRoleStatusId: [PhxConstants.OrganizationRoleStatusType.Inactive, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
      OrganizationClientRoleLOBs: formGroupOnNew.formBuilder.array<IOrganizationClientRoleLOB>(
        codeValueService.getCodeValues(commonService.CodeValueGroups.LineOfBusiness, true).map(lob =>
          formGroupOnNew.formBuilder.group<IOrganizationClientRoleLOB>({
            Id: [0],
            OrganizationClientRoleId: [0],
            LineOfBusinessId: [lob.id, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('LineOfBusinessId', CustomFieldErrorType.required))]],
            IsSelected: [false]
          })
        ),
        CustomValidators.requiredAtLeastOne('IsSelected', formGroupOnNew.customFieldService.formatErrorMessage('OrganizationClientRoleLOBs', CustomFieldErrorType.required))
      ),
      IsAccrueMaxedOutCanadaPensionPlanForSP: [true],
      IsAccrueMaxedOutCanadaPensionPlanForTemp: [true],
      IsAccrueMaxedOutEmploymentInsuranceForSP: [true],
      IsAccrueMaxedOutEmploymentInsuranceForTemp: [true],
      IsAccrueMaxedOutQuebecParentalInsurancePlanForSP: [true],
      IsAccrueMaxedOutQuebecParentalInsurancePlanForTemp: [true],
      IsAccrueMaxedOutQuebecPensionPlanForSP: [true],
      IsAccrueMaxedOutQuebecPensionPlanForTemp: [true],
      OrganizationClientRoleNationalAccountManagers: formGroupOnNew.formBuilder.array([]),
      StartDate: [null],
      ExpiryDate: [null],
      IsChargeSalesTax: [true, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('IsChargeSalesTax', CustomFieldErrorType.required))]],
      IsChargeableExpenseSalesTax: [false, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('IsChargeableExpenseSalesTax', CustomFieldErrorType.required))]],
      ClientSalesTaxDefaultId: [null],
      IsBypassZeroUnitTimeSheetApproval: [true],
      IsSuppressZeroAmountInvoiceRelease: [false],

      OrganizationClientRoleAlternateBills: formGroupOnNew.formBuilder.array([]),
      UsesThirdPartyImport: [false],
      IsBillSalesTaxAppliedOnExpenseImport: [false, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('IsBillSalesTaxAppliedOnExpenseImport', CustomFieldErrorType.required))]],
      IsPaySalesTaxAppliedOnExpenseImport: [false, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('IsPaySalesTaxAppliedOnExpenseImport', CustomFieldErrorType.required))]],
      SalesTaxCountryId: [null],
      SalesTaxSubdivisionId: [null]
    });
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, role: IOrganizationClientRole, index: number): FormGroup<IOrganizationClientRole> {
    return formGroupSetup.hashModel.getFormGroup<IOrganizationClientRole>(formGroupSetup.toUseHashCode, 'IOrganizationClientRole', role, index, () =>
      formGroupSetup.formBuilder.group<IOrganizationClientRole>({
        Id: [role.Id],
        IdOriginal: [role.IdOriginal],
        OrganizationRoleTypeId: [role.OrganizationRoleTypeId],
        OrganizationRoleStatusId: [role.OrganizationRoleStatusId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
        OrganizationClientRoleLOBs: formGroupSetup.formBuilder.array<IOrganizationClientRoleLOB>(
          role.OrganizationClientRoleLOBs.map(entity2 =>
            formGroupSetup.formBuilder.group<IOrganizationClientRoleLOB>({
              Id: [entity2.Id],
              OrganizationClientRoleId: [entity2.OrganizationClientRoleId],
              LineOfBusinessId: [entity2.LineOfBusinessId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('LineOfBusinessId', CustomFieldErrorType.required))]],
              IsSelected: [entity2.IsSelected]
            })
          ),
          CustomValidators.requiredAtLeastOne('IsSelected', formGroupSetup.customFieldService.formatErrorMessage('OrganizationClientRoleLOBs', CustomFieldErrorType.required))
        ),
        IsAccrueMaxedOutCanadaPensionPlanForSP: [role.IsAccrueMaxedOutCanadaPensionPlanForSP],
        IsAccrueMaxedOutCanadaPensionPlanForTemp: [role.IsAccrueMaxedOutCanadaPensionPlanForTemp],
        IsAccrueMaxedOutEmploymentInsuranceForSP: [role.IsAccrueMaxedOutEmploymentInsuranceForSP],
        IsAccrueMaxedOutEmploymentInsuranceForTemp: [role.IsAccrueMaxedOutEmploymentInsuranceForTemp],
        IsAccrueMaxedOutQuebecParentalInsurancePlanForSP: [role.IsAccrueMaxedOutQuebecParentalInsurancePlanForSP],
        IsAccrueMaxedOutQuebecParentalInsurancePlanForTemp: [role.IsAccrueMaxedOutQuebecParentalInsurancePlanForTemp],
        IsAccrueMaxedOutQuebecPensionPlanForSP: [true],
        IsAccrueMaxedOutQuebecPensionPlanForTemp: [true],
        OrganizationClientRoleNationalAccountManagers: formGroupSetup.formBuilder.array<IOrganizationClientRoleNationalAccountManager>(
          role.OrganizationClientRoleNationalAccountManagers.map(entity2 =>
            formGroupSetup.formBuilder.group<IOrganizationClientRoleNationalAccountManager>({
              Id: [entity2.Id],
              OrganizationClientRoleId: [entity2.OrganizationClientRoleId],
              UserProfileInternalId: [entity2.UserProfileInternalId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileInternalId', CustomFieldErrorType.required))]],
              ContactFullName: [entity2.ContactFullName]
            })
          )
        ),
        StartDate: [role.StartDate],
        ExpiryDate: [role.ExpiryDate],
        IsChargeSalesTax: [role.IsChargeSalesTax, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsChargeSalesTax', CustomFieldErrorType.required))]],
        IsChargeableExpenseSalesTax: [role.IsChargeableExpenseSalesTax, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsChargeableExpenseSalesTax', CustomFieldErrorType.required))]],
        ClientSalesTaxDefaultId: [role.ClientSalesTaxDefaultId],
        IsBypassZeroUnitTimeSheetApproval: [role.IsBypassZeroUnitTimeSheetApproval],
        IsSuppressZeroAmountInvoiceRelease: [role.IsSuppressZeroAmountInvoiceRelease],
        OrganizationClientRoleAlternateBills: formGroupSetup.formBuilder.array<IOrganizationClientRoleAlternateBill>(
          role.OrganizationClientRoleAlternateBills.map(entity2 =>
            formGroupSetup.formBuilder.group<IOrganizationClientRoleAlternateBill>({
              Id: [entity2.Id],
              OrganizationClientRoleId: [entity2.OrganizationClientRoleId],
              OrganizationClientRoleAlternateBillStatusId: [
                entity2.OrganizationClientRoleAlternateBillStatusId,
                [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationClientRoleAlternateBillStatusId', CustomFieldErrorType.required))]
              ],
              AlternateBillLegalName: [entity2.AlternateBillLegalName, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AlternateBillLegalName', CustomFieldErrorType.required))]],
              AlternateBillCode: [entity2.AlternateBillCode, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AlternateBillCode', CustomFieldErrorType.required))]],
              IsActive: [entity2.IsActive, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsActive', CustomFieldErrorType.required))]],
              IsSelected: [entity2.IsSelected, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsSelected', CustomFieldErrorType.required))]]
            })
          )
        ),
        UsesThirdPartyImport: [role.UsesThirdPartyImport],
        IsBillSalesTaxAppliedOnExpenseImport: [role.IsBillSalesTaxAppliedOnExpenseImport],
        IsPaySalesTaxAppliedOnExpenseImport: [role.IsPaySalesTaxAppliedOnExpenseImport],
        SalesTaxCountryId: [role.SalesTaxCountryId],
        SalesTaxSubdivisionId: [role.SalesTaxSubdivisionId]
      })
    );
  }

  public static formGroupToPartial(formGroupTabRoles: FormGroup<ITabRoles>): Partial<IOrganization> {
    const organizationClientRoles: Array<IOrganizationClientRole> = <Array<IOrganizationClientRole>>formGroupTabRoles.controls.OrganizationClientRoles.value;

    if (organizationClientRoles[0]) {
      organizationClientRoles[0].OrganizationRoleStatusId = organizationClientRoles[0].Id === 0 ? PhxConstants.OrganizationRoleStatusType.Active : organizationClientRoles[0].OrganizationRoleStatusId;
    }

    return { OrganizationClientRoles: organizationClientRoles };
  }

  formArrayOrganizationClientRoleLOBs(obj: AbstractControl<IOrganizationClientRoleLOB[]>): FormArray<IOrganizationClientRoleLOB> {
    return <FormArray<IOrganizationClientRoleLOB>>obj;
  }

  formArrayOrganizationClientRoleNationalAccountManagers(obj: AbstractControl<IOrganizationClientRoleNationalAccountManager[]>): FormArray<IOrganizationClientRoleNationalAccountManager> {
    return <FormArray<IOrganizationClientRoleNationalAccountManager>>obj;
  }

  formGroupOrganizationClientRoleNationalAccountManager(obj: AbstractControl<IOrganizationClientRoleNationalAccountManager>): FormGroup<IOrganizationClientRoleNationalAccountManager> {
    return <FormGroup<IOrganizationClientRoleNationalAccountManager>>obj;
  }

  formArrayOrganizationClientRoleAlternateBills(obj: AbstractControl<IOrganizationClientRoleAlternateBill[]>): FormArray<IOrganizationClientRoleAlternateBill> {
    return <FormArray<IOrganizationClientRoleAlternateBill>>obj;
  }

  formGroupOrganizationClientRoleAlternateBill(obj: AbstractControl<IOrganizationClientRoleAlternateBill>): FormGroup<IOrganizationClientRoleAlternateBill> {
    return <FormGroup<IOrganizationClientRoleAlternateBill>>obj;
  }

  asFormGroup<U>(obj: AbstractControl<U>): FormGroup<U> {
    return <FormGroup<U>>obj;
  }
}
