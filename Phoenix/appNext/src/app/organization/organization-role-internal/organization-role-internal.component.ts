// angular
import { Component, ViewEncapsulation, Input, ChangeDetectorRef, OnInit } from '@angular/core';
// common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, ValidationExtensions, DialogService } from '../../common/index';
import { AccessAction, EntityAccessActionExists } from './../../common/model/access-action';
import { CustomFieldErrorType, FunctionalRole } from '../../common/model/index';
import { CodeValue } from './../../common/model/code-value';
import { IFormGroupValue } from '../../common/utility/form-group';
// organization
import { IOrganizationInternalRole, IBankAccount, ITabRoles, IFormGroupSetup, IFormGroupOnNew, IOrganization, IOrganizationTaxNumber, IOrganizationTaxNumbers } from './../state/organization.interface';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { OrganizationRoleBankAccountComponent } from '../organization-role-bank-account/organization-role-bank-account.component';
import { OrganizationApiService } from '../organization.api.service';
import * as moment from 'moment';
import { OrganizationRoleInternalOrgImagesComponent } from '../organization-role-internal-org-images/organization-role-internal-org-images.component';
import { AuthService } from '../../common/services/auth.service';


@Component({
  selector: 'app-organization-role-internal',
  templateUrl: './organization-role-internal.component.html',
  styleUrls: ['./organization-role-internal.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class OrganizationRoleInternalComponent extends OrganizationBaseComponentPresentational<IOrganizationInternalRole> implements OnInit {
  roleType: PhxConstants.OrganizationRoleType = PhxConstants.OrganizationRoleType.Internal;

  @Input() rootModel: IOrganization;
  @Input() salesTaxInputFormGroup: FormGroup<IOrganizationTaxNumbers>;
  @Input() currentUserRole: PhxConstants.OrganizationRoleType = null;

  html: {
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    roleDisplayName: string;
    hasOrganizationInternalRolePaymentMethod: boolean;
    hasOrganizationRolePaymentReference: boolean;
    modifyBankAccount: boolean;
    modifyInternalRoleDetails: boolean;
    functionalRoles: FunctionalRole[];
    codeValueLists: {
      listCountry: Array<CodeValue>;
      listTaxSubdivision: Array<CodeValue>;
      listOrganizationRoleStatusType: Array<CodeValue>;
    };
    commonLists: {};
    access: {
      canRollover: boolean;
    };
  } = {
      codeValueGroups: null,
      phxConstants: null,
      roleDisplayName: null,
      functionalRoles: [],
      hasOrganizationInternalRolePaymentMethod: false,
      hasOrganizationRolePaymentReference: false,
      modifyBankAccount: false,
      modifyInternalRoleDetails: false,
      codeValueLists: {
        listCountry: [],
        listTaxSubdivision: [],
        listOrganizationRoleStatusType: []
      },
      commonLists: {},
      access: {
        canRollover: false
      }
    };

  constructor(private orgService: OrganizationApiService, private dialog: DialogService, private chRef: ChangeDetectorRef, private authService: AuthService) {
    super('OrganizationRoleInternalComponent');
    this.html.roleDisplayName = this.codeValueService.getCodeValueText(this.roleType, this.commonService.CodeValueGroups.OrganizationRoleType);
    this.getCodeValuelistsStatic();
  }

  private get salesTaxFormArray() {
    return (this.inputFormGroup.parent.parent.controls['OrganizationTaxNumbers'] as FormGroup<IOrganizationTaxNumbers>).controls.SalesTax as FormArray<IOrganizationTaxNumber>;
  }

  ngOnInit() {
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCountry = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Country, true);
    this.html.codeValueLists.listOrganizationRoleStatusType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.OrganizationRoleStatusType, true);

    this.authService.getCurrentProfile().takeUntil(this.isDestroyed$).subscribe(data => {
      this.html.functionalRoles = data.FunctionalRoles;
      // Only Controller, Finance and System admin is allowed to edit internal role
      const authorizedRolesForInternalRoleEdit = [
        PhxConstants.FunctionalRole.Controller,
        PhxConstants.FunctionalRole.Finance,
        PhxConstants.FunctionalRole.SystemAdministrator
      ];
      this.html.modifyInternalRoleDetails = this.readOnlyStorage.IsEditable && this.html.functionalRoles ? this.html.functionalRoles.some(r => authorizedRolesForInternalRoleEdit.includes(r.FunctionalRoleId)) : false;
      this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
      this.chRef.detectChanges();
    });
  }

  businessRules(obj: IFormGroupValue): void { }

  recalcLocalProperties(role: FormGroup<IOrganizationInternalRole>) { }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
    this.html.access.canRollover =
      this.rootModel.OrganizationStatusId === PhxConstants.OrganizationStatus.Active && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationInternalRoleRollOver)
    this.html.modifyBankAccount = isEditable && this.rootModel.OrganizationStatusId !== PhxConstants.OrganizationStatus.Draft && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationInternalRoleAddBankAccount);
  }

  onRollover() {
    const dialogHeader = 'Confirm';
    const dialogMessage = 'Are you sure you want to rollover Application Date to the next month?';
    const that = this;
    this.dialog.confirm(dialogHeader, dialogMessage).then(function (btn) {
      that.orgService.organizationInternalRoleDateRollOver(that.inputFormGroup.value).then(
        function (responseSuccess) {
          if (responseSuccess.TaskResultId === PhxConstants.TaskResult.Complete) {
            that.inputFormGroup.controls.ApplicationDate.setValue(
              moment(that.inputFormGroup.value.ApplicationDate)
                .add(1, 'months')
                .endOf('month')
                .toDate()
            );
            that.chRef.detectChanges();
            that.outputEvent.emit();
            that.commonService.logSuccess('Application Date Rolled Over');
          }
        },
        function (responseError) {
          const validationMessages = that.commonService.parseResponseError(responseError);
          if (validationMessages && validationMessages.length > 0) {
            validationMessages.forEach(function (validationMessage) {
              that.commonService.logError(validationMessage.Message);
            });
          }
        }
      );
    });
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, role: IOrganizationInternalRole, index: number, modifyInternalRoleBankAccount: boolean): FormGroup<IOrganizationInternalRole> {
    return formGroupSetup.hashModel.getFormGroup<IOrganizationInternalRole>(formGroupSetup.toUseHashCode, 'IOrganizationInternalRole', role, index, () =>
      formGroupSetup.formBuilder.group<IOrganizationInternalRole>({
        Id: [role.Id],
        IdOriginal: [role.IdOriginal],
        OrganizationRoleTypeId: [role.OrganizationRoleTypeId],
        OrganizationRoleStatusId: [role.OrganizationRoleStatusId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
        BankAccounts: OrganizationRoleBankAccountComponent.formBuilderGroupSetup(formGroupSetup, role.BankAccounts, modifyInternalRoleBankAccount),
        ApplicationDate: [role.ApplicationDate],
        IsAccrueEmployerHealthTaxLiability: [role.IsAccrueEmployerHealthTaxLiability],
        ...OrganizationRoleInternalOrgImagesComponent.formGroupSetupPartial(role)
      })
    );
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, roles: Array<IOrganizationInternalRole>): FormGroup<IOrganizationInternalRole> {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return formGroupOnNew.formBuilder.group<IOrganizationInternalRole>({
      Id: [0],
      IdOriginal: [0],
      OrganizationRoleTypeId: PhxConstants.OrganizationRoleType.SubVendor,
      OrganizationRoleStatusId: [PhxConstants.OrganizationRoleStatusType.Inactive, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('OrganizationRoleStatusId', CustomFieldErrorType.required))]],
      IsAccrueEmployerHealthTaxLiability: [true],
      ApplicationDate: [lastDayOfMonth],
      BankAccounts: formGroupOnNew.formBuilder.array([]),
      ...OrganizationRoleInternalOrgImagesComponent.formGroupSetupPartialNew(roles[0])
    });
  }

  public static formGroupToPartial(formGroupTabRoles: FormGroup<ITabRoles>): Partial<IOrganization> {
    const organizationInternalRoles: Array<IOrganizationInternalRole> = <Array<IOrganizationInternalRole>>formGroupTabRoles.controls.OrganizationInternalRoles.value;

    if (organizationInternalRoles[0]) {
      organizationInternalRoles[0].OrganizationRoleStatusId = organizationInternalRoles[0].Id === 0 ? PhxConstants.OrganizationRoleStatusType.Active : organizationInternalRoles[0].OrganizationRoleStatusId;
    }

    return { OrganizationInternalRoles: organizationInternalRoles };
  }

  bankAccountAdd(role: IOrganizationInternalRole) {
    if (!role.BankAccounts) {
      role.BankAccounts = Array<IBankAccount>();
    }
    const newBankAccount: IBankAccount = {
      Id: 0,
      OrganizationInternalRoleId: role.Id,
      BankName: '',
      Description: '',
      GLAccount: '',
      Transit: '',
      AccountNo: '',
      AccountId: null,
      CurrencyId: null,
      OrganizationBankSignatureId: null,
      OrganizationBankStatusId: null,
      IsPrimary: role.BankAccounts.length === 0,
      NextChequeNumber: null,
      NextDirectDepositBatchNumber: null,
      NextWireTransferBatchNumber: null
    };
    role.BankAccounts.push(newBankAccount);
    this.outputEvent.emit();
  }

  bankAccountRemove(role: IOrganizationInternalRole, bankAccount: IBankAccount) {
    const index = role.BankAccounts.indexOf(bankAccount);
    if (index >= 0) {
      role.BankAccounts.splice(index, 1);
    }

    const isPrimaryExists = role.BankAccounts.some(bankAccountLoop => bankAccountLoop.IsPrimary === true);

    if (!isPrimaryExists) {
      if (role.BankAccounts.length > 0) {
        role.BankAccounts[0].IsPrimary = true;
      }
    }

    this.outputEvent.emit();
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onClickDeleteOrganizationRole() {
    const formArrayOfCurrentRole: FormArray<IOrganizationInternalRole> = <FormArray<IOrganizationInternalRole>>this.inputFormGroup.parent;

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
