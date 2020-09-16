import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormControl, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { IBankAccount, IFormGroupSetup, IFormGroupOnNew, IRoleBankAccounts, IOrganizationInternalRole } from '../state';
import { ValidationExtensions, PhxConstants } from '../../common';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { CodeValue, AccessAction, CustomFieldErrorType, FunctionalRole } from '../../common/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { filter } from 'lodash';
import { OrganizationObservableService } from '../state/organization.observable.service';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-organization-role-bank-account',
  templateUrl: './organization-role-bank-account.component.html',
  styleUrls: ['./organization-role-bank-account.component.less']
})
export class OrganizationRoleBankAccountComponent extends OrganizationBaseComponentPresentational<IBankAccount> implements OnInit {
  @Input() accountIndex: number;
  @Input() isEditable = false;
  @Input() canPrimaryAccountButtonEnabled = false;

  html: {
    codeValueGroups: any;
    codeValueLists: {
      listCurrency: Array<CodeValue>;
      listAccountStatus: Array<CodeValue>;
      AccountSignature: Array<CodeValue>;
    };
    commonLists: {};
  } = {
    codeValueGroups: null,
    codeValueLists: {
      listCurrency: [],
      listAccountStatus: [],
      AccountSignature: []
    },
    commonLists: {}
  };

  constructor(private chRef: ChangeDetectorRef, private authService: AuthService, private orgObservableService: OrganizationObservableService) {
    super('OrganizationAddressComponent');
    this.getCodeValuelistsStatic();
  }

  ngOnInit(): void {
    this.orgObservableService
      .organizationOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(organization => {
        if (organization) {
          this.enableValidationDynamically();
        }
      });
  }

  enableValidationDynamically() {
    if (this.isEditable) {
      this.inputFormGroup.controls.BankName.setValidators([
        ValidationExtensions.minLength(3),
        ValidationExtensions.maxLength(200),
        ValidationExtensions.required(this.customFieldService.formatErrorMessage('BankName', CustomFieldErrorType.required))
      ]);

      this.inputFormGroup.controls.IsPrimary.setValidators([ValidationExtensions.required(this.customFieldService.formatErrorMessage('IsPrimary', CustomFieldErrorType.required))]);

      this.inputFormGroup.controls.GLAccount.setValidators([
        ValidationExtensions.minLength(1),
        ValidationExtensions.maxLength(100),
        ValidationExtensions.required(this.customFieldService.formatErrorMessage('GLAccount', CustomFieldErrorType.required))
      ]);

      this.inputFormGroup.controls.CurrencyId.setValidators([ValidationExtensions.required(this.customFieldService.formatErrorMessage('CurrencyId', CustomFieldErrorType.required))]);

      this.inputFormGroup.controls.Transit.setValidators([
        ValidationExtensions.minLength(1),
        ValidationExtensions.maxLength(50),
        ValidationExtensions.required(this.customFieldService.formatErrorMessage('Transit', CustomFieldErrorType.required))
      ]);

      this.inputFormGroup.controls.AccountNo.setValidators([
        ValidationExtensions.minLength(1),
        ValidationExtensions.maxLength(50),
        ValidationExtensions.required(this.customFieldService.formatErrorMessage('AccountNo', CustomFieldErrorType.required))
      ]);

      this.inputFormGroup.controls.OrganizationBankStatusId.setValidators([ValidationExtensions.required(this.customFieldService.formatErrorMessage('OrganizationBankStatusId', CustomFieldErrorType.required))]);
    } else {
      this.inputFormGroup.controls.BankName.clearValidators();
      this.inputFormGroup.controls.IsPrimary.clearValidators();
      this.inputFormGroup.controls.GLAccount.clearValidators();
      this.inputFormGroup.controls.CurrencyId.clearValidators();
      this.inputFormGroup.controls.Transit.clearValidators();
      this.inputFormGroup.controls.AccountNo.clearValidators();
      this.inputFormGroup.controls.OrganizationBankStatusId.clearValidators();
    }
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  businessRules(obj: IFormGroupValue): void {
    switch (obj.name) {
      case 'CountryId':
        break;
      default:
        break;
    }
  }

  public get isPrimaryBankAccount(): boolean {
    // this.inputFormGroup.updateValueAndValidity();
    return this.inputFormGroup.value.IsPrimary;
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true);
    this.html.codeValueLists.listAccountStatus = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.OrganizationBankStatus, true);
    this.html.codeValueLists.AccountSignature = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.OrganizationBankSignature, true);
  }

  recalcLocalProperties(bankAccountFormGroup: FormGroup<IBankAccount>) {
    const formArrayBankAccounts: FormArray<IBankAccount> = <FormArray<IBankAccount>>bankAccountFormGroup.parent;
    for (let index = 0; index < formArrayBankAccounts.length; index++) {
      if (index !== this.accountIndex) {
        formArrayBankAccounts
          .at(index)
          .get('IsPrimary')
          .setValue(false, {
            emitEvent: true,
            emitModelToViewChange: true
          });
      } else {
        formArrayBankAccounts
          .at(index)
          .get('IsPrimary')
          .setValue(true, {
            emitEvent: true,
            emitModelToViewChange: true
          });
      }
    }
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {}

  onClickDeleteAccount() {
    const formArrayBankAccounts: FormArray<IBankAccount> = <FormArray<IBankAccount>>this.inputFormGroup.parent;
    formArrayBankAccounts.removeAt(this.accountIndex);

    if (formArrayBankAccounts.length === 1) {
      formArrayBankAccounts
        .at(0)
        .get('IsPrimary')
        .setValue(true, {
          emitEvent: true,
          emitModelToViewChange: true
        });
    } else if (!formArrayBankAccounts.value.some(x => x.IsPrimary)) {
      formArrayBankAccounts
        .at(0)
        .get('IsPrimary')
        .setValue(true, {
          emitEvent: true,
          emitModelToViewChange: true
        });
    }

    this.outputEvent.emit();
  }

  onClickMakePrimaryAccount() {
    const formArrayBankAccounts: FormArray<IBankAccount> = <FormArray<IBankAccount>>this.inputFormGroup.parent;
    for (let index = 0; index < formArrayBankAccounts.length; index++) {
      if (index !== this.accountIndex) {
        formArrayBankAccounts
          .at(index)
          .get('IsPrimary')
          .setValue(false, {
            emitEvent: true,
            emitModelToViewChange: true
          });
      } else {
        formArrayBankAccounts
          .at(index)
          .get('IsPrimary')
          .setValue(true, {
            emitEvent: true,
            emitModelToViewChange: true
          });
      }

      formArrayBankAccounts.at(index).updateValueAndValidity();
    }

    this.chRef.detectChanges();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, organizationBankAccounts: Array<IBankAccount>, enableValidation: boolean = true): FormArray<IBankAccount> {
    function defaultValidationFn<T>() {
      return (control: AbstractControl<T>): { [key: string]: any } => {
        return null;
      };
    }

    const formGroups = formGroupSetup.formBuilder.array<IBankAccount>(
      organizationBankAccounts.map((account: IBankAccount, index) =>
        formGroupSetup.hashModel.getFormGroup<IBankAccount>(!formGroupSetup.toUseHashCode, 'IBankAccount', account, index, () =>
          formGroupSetup.formBuilder.group<IBankAccount>({
            Id: [account.Id],
            OrganizationInternalRoleId: [account.OrganizationInternalRoleId],
            BankName: [
              account.BankName,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(200),
                enableValidation ? ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BankName', CustomFieldErrorType.required)) : defaultValidationFn
              ]
            ],
            Description: [account.Description, [ValidationExtensions.minLength(0), ValidationExtensions.maxLength(200)]],
            IsPrimary: [account.IsPrimary, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsPrimary', CustomFieldErrorType.required))]],
            GLAccount: [
              account.GLAccount,
              [
                ValidationExtensions.minLength(1),
                ValidationExtensions.maxLength(100),
                enableValidation ? ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('GLAccount', CustomFieldErrorType.required)) : defaultValidationFn
              ]
            ],
            CurrencyId: [account.CurrencyId, enableValidation ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CurrencyId', CustomFieldErrorType.required))] : []],
            Transit: [
              account.Transit,
              [
                ValidationExtensions.minLength(1),
                ValidationExtensions.maxLength(50),
                enableValidation ? ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Transit', CustomFieldErrorType.required)) : defaultValidationFn
              ]
            ],
            AccountNo: [
              account.AccountNo,
              [
                ValidationExtensions.minLength(1),
                ValidationExtensions.maxLength(50),
                enableValidation ? ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AccountNo', CustomFieldErrorType.required)) : defaultValidationFn
              ]
            ],
            OrganizationBankStatusId: [
              account.OrganizationBankStatusId,
              enableValidation ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationBankStatusId', CustomFieldErrorType.required))] : []
            ],
            NextChequeNumber: [account.NextChequeNumber],
            NextDirectDepositBatchNumber: [account.NextDirectDepositBatchNumber],
            NextWireTransferBatchNumber: [account.NextWireTransferBatchNumber],
            AccountId: [account.AccountId],
            OrganizationBankSignatureId: [account.OrganizationBankSignatureId]
          })
        )
      )
    );
    return formGroups;
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, account: Array<IBankAccount>): FormGroup<IBankAccount> {
    return formGroupOnNew.formBuilder.group<IBankAccount>({
      Id: [0],
      OrganizationInternalRoleId: [0],
      BankName: [null, [ValidationExtensions.minLength(3), ValidationExtensions.maxLength(200), ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('BankName', CustomFieldErrorType.required))]],
      Description: [null, [ValidationExtensions.minLength(0), ValidationExtensions.maxLength(200)]],
      IsPrimary: [false, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('IsPrimary', CustomFieldErrorType.required))]],
      GLAccount: [null, [ValidationExtensions.minLength(1), ValidationExtensions.maxLength(100), ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('GLAccount', CustomFieldErrorType.required))]],
      CurrencyId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('CurrencyId', CustomFieldErrorType.required))]],
      Transit: [null, [ValidationExtensions.minLength(1), ValidationExtensions.maxLength(50), ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('Transit', CustomFieldErrorType.required))]],
      AccountNo: [null, [ValidationExtensions.minLength(1), ValidationExtensions.maxLength(50), ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('AccountNo', CustomFieldErrorType.required))]],
      OrganizationBankStatusId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('OrganizationBankStatusId', CustomFieldErrorType.required))]],
      NextChequeNumber: [null],
      NextDirectDepositBatchNumber: [null],
      NextWireTransferBatchNumber: [null],
      AccountId: [null],
      OrganizationBankSignatureId: [null]
    });
  }

  public static formGroupToPartial(formGroupBankAccounts: FormGroup<IRoleBankAccounts>): Partial<IOrganizationInternalRole> {
    const bankAccounts: Array<IBankAccount> = (<FormArray<IBankAccount>>formGroupBankAccounts.controls.BankAccounts).value;
    return { BankAccounts: bankAccounts };
  }
}
