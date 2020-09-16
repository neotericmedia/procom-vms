import { Injectable } from '@angular/core';
import { Action } from 'redux';
import { dispatch } from '@angular-redux/store';
// tslint:disable-next-line:max-line-length
import {
  IOrganization,
  // IOrganizationAddress,
  // IOrganizationClientRole,
  // IOrganizationClientRoleLOB,
  // IOrganizationClientRoleNationalAccountManager,
  // IOrganizationClientRoleAlternateBill,
  // IOrganizationInternalRole,
  // IBankAccount,
  // IOrganizationIndependentContractorRole,
  // IPaymentMethod,
  // IOrganizationLimitedLiabilityCompanyRole,
  // IOrganizationSubVendorRole,
  // IOrganizationSubVendorRoleRestriction,
  IOrganizationValidationError
} from './organization.interface';

export namespace OrganizationAction {
  export enum type {
    // need to use <any> because of implements Action: export interface Action { type: any; }
    OrganizationLoad = <any>'@phoenix/OrganizationLoad',
    OrganizationLoadError = <any>'@phoenix/OrganizationLoadError',
    OrganizationLoadStarted = <any>'@phoenix/OrganizationLoadStarted',
    // Organization
    OrganizationAdd = <any>'@phoenix/OrganizationAdd',
    OrganizationDelete = <any>'@phoenix/OrganizationDelete',
    OrganizationUpdate = <any>'@phoenix/OrganizationUpdate',
    // OrganizationValidationError
    OrganizationValidationErrorAdd = <any>'@phoenix/htmlOnClickOrganizationValidationErrorAdd',
    OrganizationValidationErrorDelete = <any>'@phoenix/OrganizationValidationErrorDelete'

    // OrganizationUpdateProperty = <any>'@phoenix/OrganizationUpdateProperty',
    // // OrganizationParent
    // OrganizationParentUpdateProperty = <any>'@phoenix/OrganizationParentUpdateProperty',
    // // OrganizationAddress
    // OrganizationAddressAdd = <any>'@phoenix/OrganizationAddressAdd',
    // OrganizationAddressDelete = <any>'@phoenix/OrganizationAddressDelete',
    // OrganizationAddressUpdate = <any>'@phoenix/OrganizationAddressUpdate',
    // OrganizationAddressUpdateProperty = <any>'@phoenix/OrganizationAddressUpdateProperty',
    // OrganizationClientRole
    // OrganizationClientRoleAdd = <any>'@phoenix/OrganizationClientRoleAdd',
    // OrganizationClientRoleDelete = <any>'@phoenix/OrganizationClientRoleDelete',
    // OrganizationClientRoleUpdate = <any>'@phoenix/OrganizationClientRoleUpdate',
    // OrganizationClientRoleUpdateProperty = <any>'@phoenix/OrganizationClientRoleUpdateProperty',
    // // OrganizationClientRoleLOB
    // OrganizationClientRoleLOBUpdateProperty = <any>'@phoenix/OrganizationClientRoleLOBUpdateProperty',
    // // OrganizationClientRoleNationalAccountManager
    // OrganizationClientRoleNationalAccountManagerAdd = <any>'@phoenix/htmlOnClickOrganizationClientRoleNationalAccountManagerAdd',
    // OrganizationClientRoleNationalAccountManagerDelete = <any>'@phoenix/OrganizationClientRoleNationalAccountManagerDelete',
    // OrganizationClientRoleNationalAccountManagerUpdate = <any>'@phoenix/OrganizationClientRoleNationalAccountManagerUpdate',
    // OrganizationClientRoleNationalAccountManagerUpdateProperty = <any>'@phoenix/OrganizationClientRoleNationalAccountManagerUpdateProperty',
    // // OrganizationClientRoleAlternateBill
    // OrganizationClientRoleAlternateBillAdd = <any>'@phoenix/OrganizationClientRoleAlternateBillAdd',
    // OrganizationClientRoleAlternateBillDelete = <any>'@phoenix/OrganizationClientRoleAlternateBillDelete',
    // OrganizationClientRoleAlternateBillUpdate = <any>'@phoenix/OrganizationClientRoleAlternateBillUpdate',
    // OrganizationClientRoleAlternateBillUpdateProperty = <any>'@phoenix/OrganizationClientRoleAlternateBillUpdateProperty',
    // OrganizationInternalRole
    // OrganizationInternalRoleAdd = <any>'@phoenix/OrganizationInternalRoleAdd',
    // OrganizationInternalRoleDelete = <any>'@phoenix/OrganizationInternalRoleDelete',
    // OrganizationInternalRoleUpdate = <any>'@phoenix/OrganizationInternalRoleUpdate',
    // OrganizationInternalRoleUpdateProperty = <any>'@phoenix/OrganizationInternalRoleUpdateProperty',
    // // OrganizationInternalRoleBankAccount
    // OrganizationInternalRoleBankAccountAdd = <any>'@phoenix/htmlOnClickOrganizationInternalBankAccountAdd',
    // OrganizationInternalRoleBankAccountDelete = <any>'@phoenix/OrganizationInternalBankAccountDelete',
    // OrganizationInternalRoleBankAccountUpdate = <any>'@phoenix/OrganizationInternalBankAccountUpdate',
    // OrganizationInternalRoleBankAccountUpdateProperty = <any>'@phoenix/OrganizationInternalBankAccountUpdateProperty',
    // // OrganizationIndependentContractorRole
    // OrganizationIndependentContractorRoleAdd = <any>'@phoenix/OrganizationIndependentContractorRoleAdd',
    // OrganizationIndependentContractorRoleDelete = <any>'@phoenix/OrganizationIndependentContractorRoleDelete',
    // OrganizationIndependentContractorRoleUpdate = <any>'@phoenix/OrganizationIndependentContractorRoleUpdate',
    // OrganizationIndependentContractorRoleUpdateProperty = <any>'@phoenix/OrganizationIndependentContractorRoleUpdateProperty',
    // // OrganizationIndependentContractorRolePaymentMethod
    // OrganizationIndependentContractorRolePaymentMethodAdd = <any>'@phoenix/htmlOnClickOrganizationIndependentContractorRolePaymentMethodAdd',
    // OrganizationIndependentContractorRolePaymentMethodDelete = <any>'@phoenix/OrganizationIndependentContractorRolePaymentMethodDelete',
    // OrganizationIndependentContractorRolePaymentMethodUpdate = <any>'@phoenix/OrganizationIndependentContractorRolePaymentMethodUpdate',
    // OrganizationIndependentContractorRolePaymentMethodUpdateProperty = <any>'@phoenix/OrganizationIndependentContractorRolePaymentMethodUpdateProperty',
    // // OrganizationLimitedLiabilityCompanyRole
    // OrganizationLimitedLiabilityCompanyRoleAdd = <any>'@phoenix/OrganizationLimitedLiabilityCompanyRoleAdd',
    // OrganizationLimitedLiabilityCompanyRoleDelete = <any>'@phoenix/OrganizationLimitedLiabilityCompanyRoleDelete',
    // OrganizationLimitedLiabilityCompanyRoleUpdate = <any>'@phoenix/OrganizationLimitedLiabilityCompanyRoleUpdate',
    // OrganizationLimitedLiabilityCompanyRoleUpdateProperty = <any>'@phoenix/OrganizationLimitedLiabilityCompanyRoleUpdateProperty',
    // // OrganizationLimitedLiabilityCompanyRolePaymentMethod
    // OrganizationLimitedLiabilityCompanyRolePaymentMethodAdd = <any>'@phoenix/htmlOnClickOrganizationLimitedLiabilityCompanyRolePaymentMethodAdd',
    // OrganizationLimitedLiabilityCompanyRolePaymentMethodDelete = <any>'@phoenix/OrganizationLimitedLiabilityCompanyRolePaymentMethodDelete',
    // OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdate = <any>'@phoenix/OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdate',
    // OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdateProperty = <any>'@phoenix/OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdateProperty',
    // // OrganizationSubVendorRole
    // OrganizationSubVendorRoleAdd = <any>'@phoenix/OrganizationSubVendorRoleAdd',
    // OrganizationSubVendorRoleDelete = <any>'@phoenix/OrganizationSubVendorRoleDelete',
    // OrganizationSubVendorRoleUpdate = <any>'@phoenix/OrganizationSubVendorRoleUpdate',
    // OrganizationSubVendorRoleUpdateProperty = <any>'@phoenix/OrganizationSubVendorRoleUpdateProperty',
    // // OrganizationSubVendorRolePaymentMethod
    // OrganizationSubVendorRolePaymentMethodAdd = <any>'@phoenix/htmlOnClickOrganizationSubVendorRolePaymentMethodAdd',
    // OrganizationSubVendorRolePaymentMethodDelete = <any>'@phoenix/OrganizationSubVendorRolePaymentMethodDelete',
    // OrganizationSubVendorRolePaymentMethodUpdate = <any>'@phoenix/OrganizationSubVendorRolePaymentMethodUpdate',
    // OrganizationSubVendorRolePaymentMethodUpdateProperty = <any>'@phoenix/OrganizationSubVendorRolePaymentMethodUpdateProperty',
    // // OrganizationSubVendorRoleRestriction
    // OrganizationSubVendorRoleRestrictionAdd = <any>'@phoenix/htmlOnClickOrganizationSubVendorRoleRestrictionAdd',
    // OrganizationSubVendorRoleRestrictionDelete = <any>'@phoenix/OrganizationSubVendorRoleRestrictionDelete',
    // OrganizationSubVendorRoleRestrictionUpdate = <any>'@phoenix/OrganizationSubVendorRoleRestrictionUpdate',
    // OrganizationSubVendorRoleRestrictionUpdateProperty = <any>'@phoenix/OrganizationSubVendorRoleRestrictionUpdateProperty',
  }

  export type action =
    | OrganizationLoad
    | OrganizationLoadError
    | OrganizationLoadStarted
    // Organization
    | OrganizationAdd
    | OrganizationDelete
    | OrganizationUpdate

    // ValidationError
    | OrganizationValidationErrorAdd
    | OrganizationValidationErrorDelete;

  // | OrganizationUpdateProperty
  // | OrganizationParentUpdateProperty
  // // OrganizationAddress
  // | OrganizationAddressAdd
  // | OrganizationAddressDelete
  // | OrganizationAddressUpdate
  // | OrganizationAddressUpdateProperty
  // OrganizationClientRole
  // | OrganizationClientRoleAdd
  // | OrganizationClientRoleDelete
  // | OrganizationClientRoleUpdate
  // | OrganizationClientRoleUpdateProperty
  // // OrganizationClientRoleLOB
  // | OrganizationClientRoleLOBUpdateProperty
  // // OrganizationClientRoleNationalAccountManager
  // | OrganizationClientRoleNationalAccountManagerAdd
  // | OrganizationClientRoleNationalAccountManagerDelete
  // | OrganizationClientRoleNationalAccountManagerUpdate
  // | OrganizationClientRoleNationalAccountManagerUpdateProperty
  // // OrganizationClientRoleAlternateBill
  // | OrganizationClientRoleAlternateBillAdd
  // | OrganizationClientRoleAlternateBillDelete
  // | OrganizationClientRoleAlternateBillUpdate
  // | OrganizationClientRoleAlternateBillUpdateProperty
  // OrganizationInternalRole
  // | OrganizationInternalRoleAdd
  // | OrganizationInternalRoleDelete
  // | OrganizationInternalRoleUpdate
  // | OrganizationInternalRoleUpdateProperty
  // // OrganizationInternalRoleBankAccount
  // | OrganizationInternalRoleBankAccountAdd
  // | OrganizationInternalRoleBankAccountDelete
  // | OrganizationInternalRoleBankAccountUpdate
  // | OrganizationInternalRoleBankAccountUpdateProperty
  // // OrganizationIndependentContractorRole
  // | OrganizationIndependentContractorRoleAdd
  // | OrganizationIndependentContractorRoleDelete
  // | OrganizationIndependentContractorRoleUpdate
  // | OrganizationIndependentContractorRoleUpdateProperty
  // // OrganizationIndependentContractorRolePaymentMethod
  // | OrganizationIndependentContractorRolePaymentMethodAdd
  // | OrganizationIndependentContractorRolePaymentMethodDelete
  // | OrganizationIndependentContractorRolePaymentMethodUpdate
  // | OrganizationIndependentContractorRolePaymentMethodUpdateProperty
  // // OrganizationLimitedLiabilityCompanyRole
  // | OrganizationLimitedLiabilityCompanyRoleAdd
  // | OrganizationLimitedLiabilityCompanyRoleDelete
  // | OrganizationLimitedLiabilityCompanyRoleUpdate
  // | OrganizationLimitedLiabilityCompanyRoleUpdateProperty
  // // OrganizationLimitedLiabilityCompanyRolePaymentMethod
  // | OrganizationLimitedLiabilityCompanyRolePaymentMethodAdd
  // | OrganizationLimitedLiabilityCompanyRolePaymentMethodDelete
  // | OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdate
  // | OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdateProperty
  // // OrganizationSubVendorRole
  // | OrganizationSubVendorRoleAdd
  // | OrganizationSubVendorRoleDelete
  // | OrganizationSubVendorRoleUpdate
  // | OrganizationSubVendorRoleUpdateProperty
  // // OrganizationSubVendorRolePaymentMethod
  // | OrganizationSubVendorRolePaymentMethodAdd
  // | OrganizationSubVendorRolePaymentMethodDelete
  // | OrganizationSubVendorRolePaymentMethodUpdate
  // | OrganizationSubVendorRolePaymentMethodUpdateProperty
  // // OrganizationSubVendorRoleRestriction
  // | OrganizationSubVendorRoleRestrictionAdd
  // | OrganizationSubVendorRoleRestrictionDelete
  // | OrganizationSubVendorRoleRestrictionUpdate
  // | OrganizationSubVendorRoleRestrictionUpdateProperty
  export class OrganizationLoad implements Action {
    public readonly type = type.OrganizationLoad;
    // constructor(public organizationId: number, public isForceRefresh: boolean, public oDataParams?: any) { }
    constructor(public organizationId: number, public oDataParams?: any) {}
  }

  export class OrganizationLoadError implements Action {
    public readonly type = type.OrganizationLoadError;
    constructor(public organizationId: number, public organization: IOrganization, public error) {}
  }
  export class OrganizationLoadStarted implements Action {
    public readonly type = type.OrganizationAdd;
    constructor(public organizationId: number) {}
  }
  export class OrganizationAdd implements Action {
    public readonly type = type.OrganizationAdd;
    constructor(public organizationId: number, public organization: IOrganization) {}
  }
  export class OrganizationDelete implements Action {
    public readonly type = type.OrganizationDelete;
    constructor(public organizationId: number) {}
  }
  export class OrganizationUpdate implements Action {
    public readonly type = type.OrganizationUpdate;
    constructor(public organization: IOrganization) {}
  }

  export class OrganizationValidationErrorAdd implements Action {
    public readonly type = type.OrganizationValidationErrorAdd;
    constructor(public organizationId: number, public validationMessages: Array<IOrganizationValidationError>) {}
  }
  export class OrganizationValidationErrorDelete implements Action {
    public readonly type = type.OrganizationValidationErrorDelete;
    constructor(public organizationId: number) {}
  }

  // export class OrganizationUpdateProperty implements Action {
  //   public readonly type = type.OrganizationUpdateProperty;
  //   constructor(public organizationId: number, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationParentUpdateProperty implements Action {
  //   public readonly type = type.OrganizationParentUpdateProperty;
  //   constructor(public organizationId: number, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationAddressAdd implements Action {
  //   public readonly type = type.OrganizationAddressAdd;
  //   constructor(public organizationId: number, public organizationAddress: IOrganizationAddress) {}
  // }
  // export class OrganizationAddressDelete implements Action {
  //   public readonly type = type.OrganizationAddressDelete;
  //   constructor(public organizationId: number, public organizationAddress: IOrganizationAddress) {}
  // }
  // export class OrganizationAddressUpdate implements Action {
  //   public readonly type = type.OrganizationAddressUpdate;
  //   constructor(public organizationId: number, public organizationAddress: IOrganizationAddress) {}
  // }
  // export class OrganizationAddressUpdateProperty implements Action {
  //   public readonly type = type.OrganizationAddressUpdateProperty;
  //   constructor(public organizationId: number, public organizationAddress: IOrganizationAddress, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationClientRoleAdd implements Action {
  //   public readonly type = type.OrganizationClientRoleAdd;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole) {}
  // }
  // export class OrganizationClientRoleDelete implements Action {
  //   public readonly type = type.OrganizationClientRoleDelete;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole) {}
  // }
  // export class OrganizationClientRoleUpdate implements Action {
  //   public readonly type = type.OrganizationClientRoleUpdate;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole) {}
  // }
  // export class OrganizationClientRoleUpdateProperty implements Action {
  //   public readonly type = type.OrganizationClientRoleUpdateProperty;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationClientRoleLOBUpdateProperty implements Action {
  //   public readonly type = type.OrganizationClientRoleLOBUpdateProperty;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public organizationClientRoleLOB: IOrganizationClientRoleLOB, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationClientRoleNationalAccountManagerAdd implements Action {
  //   public readonly type = type.OrganizationClientRoleNationalAccountManagerAdd;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public organizationClientRoleNationalAccountManager: IOrganizationClientRoleNationalAccountManager) {}
  // }
  // export class OrganizationClientRoleNationalAccountManagerDelete implements Action {
  //   public readonly type = type.OrganizationClientRoleNationalAccountManagerDelete;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public organizationClientRoleNationalAccountManager: IOrganizationClientRoleNationalAccountManager) {}
  // }
  // export class OrganizationClientRoleNationalAccountManagerUpdate implements Action {
  //   public readonly type = type.OrganizationClientRoleNationalAccountManagerUpdate;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public organizationClientRoleNationalAccountManager: IOrganizationClientRoleNationalAccountManager) {}
  // }
  // export class OrganizationClientRoleNationalAccountManagerUpdateProperty implements Action {
  //   public readonly type = type.OrganizationClientRoleNationalAccountManagerUpdateProperty;
  //   constructor(
  //     public organizationId: number,
  //     public organizationClientRole: IOrganizationClientRole,
  //     public organizationClientRoleNationalAccountManager: IOrganizationClientRoleNationalAccountManager,
  //     public propertyName: string,
  //     public newValue: any
  //   ) {}
  // }
  // export class OrganizationClientRoleAlternateBillAdd implements Action {
  //   public readonly type = type.OrganizationClientRoleAlternateBillAdd;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public organizationClientRoleAlternateBill: IOrganizationClientRoleAlternateBill) {}
  // }
  // export class OrganizationClientRoleAlternateBillDelete implements Action {
  //   public readonly type = type.OrganizationClientRoleAlternateBillDelete;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public organizationClientRoleAlternateBill: IOrganizationClientRoleAlternateBill) {}
  // }
  // export class OrganizationClientRoleAlternateBillUpdate implements Action {
  //   public readonly type = type.OrganizationClientRoleAlternateBillUpdate;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public organizationClientRoleAlternateBill: IOrganizationClientRoleAlternateBill) {}
  // }
  // export class OrganizationClientRoleAlternateBillUpdateProperty implements Action {
  //   public readonly type = type.OrganizationClientRoleAlternateBillUpdateProperty;
  //   constructor(public organizationId: number, public organizationClientRole: IOrganizationClientRole, public organizationClientRoleAlternateBill: IOrganizationClientRoleAlternateBill, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationInternalRoleAdd implements Action {
  //   public readonly type = type.OrganizationInternalRoleAdd;
  //   constructor(public organizationId: number, public organizationInternalRole: IOrganizationInternalRole) {}
  // }
  // export class OrganizationInternalRoleDelete implements Action {
  //   public readonly type = type.OrganizationInternalRoleDelete;
  //   constructor(public organizationId: number, public organizationInternalRole: IOrganizationInternalRole) {}
  // }
  // export class OrganizationInternalRoleUpdate implements Action {
  //   public readonly type = type.OrganizationInternalRoleUpdate;
  //   constructor(public organizationId: number, public organizationInternalRole: IOrganizationInternalRole) {}
  // }
  // export class OrganizationInternalRoleUpdateProperty implements Action {
  //   public readonly type = type.OrganizationInternalRoleUpdateProperty;
  //   constructor(public organizationId: number, public organizationInternalRole: IOrganizationInternalRole, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationInternalRoleBankAccountAdd implements Action {
  //   public readonly type = type.OrganizationInternalRoleBankAccountAdd;
  //   constructor(public organizationId: number, public organizationInternalRole: IOrganizationInternalRole, public organizationInternalRoleBankAccount: IBankAccount) {}
  // }
  // export class OrganizationInternalRoleBankAccountDelete implements Action {
  //   public readonly type = type.OrganizationInternalRoleBankAccountDelete;
  //   constructor(public organizationId: number, public organizationInternalRole: IOrganizationInternalRole, public organizationInternalRoleBankAccount: IBankAccount) {}
  // }
  // export class OrganizationInternalRoleBankAccountUpdate implements Action {
  //   public readonly type = type.OrganizationInternalRoleBankAccountUpdate;
  //   constructor(public organizationId: number, public organizationInternalRole: IOrganizationInternalRole, public organizationInternalRoleBankAccount: IBankAccount) {}
  // }
  // export class OrganizationInternalRoleBankAccountUpdateProperty implements Action {
  //   public readonly type = type.OrganizationInternalRoleBankAccountUpdateProperty;
  //   constructor(public organizationId: number, public organizationInternalRole: IOrganizationInternalRole, public organizationInternalRoleBankAccount: IBankAccount, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationIndependentContractorRoleAdd implements Action {
  //   public readonly type = type.OrganizationIndependentContractorRoleAdd;
  //   constructor(public organizationId: number, public organizationIndependentContractorRole: IOrganizationIndependentContractorRole) {}
  // }
  // export class OrganizationIndependentContractorRoleDelete implements Action {
  //   public readonly type = type.OrganizationIndependentContractorRoleDelete;
  //   constructor(public organizationId: number, public organizationIndependentContractorRole: IOrganizationIndependentContractorRole) {}
  // }
  // export class OrganizationIndependentContractorRoleUpdate implements Action {
  //   public readonly type = type.OrganizationIndependentContractorRoleUpdate;
  //   constructor(public organizationId: number, public organizationIndependentContractorRole: IOrganizationIndependentContractorRole) {}
  // }
  // export class OrganizationIndependentContractorRoleUpdateProperty implements Action {
  //   public readonly type = type.OrganizationIndependentContractorRoleUpdateProperty;
  //   constructor(public organizationId: number, public organizationIndependentContractorRole: IOrganizationIndependentContractorRole, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationIndependentContractorRolePaymentMethodAdd implements Action {
  //   public readonly type = type.OrganizationIndependentContractorRolePaymentMethodAdd;
  //   constructor(public organizationId: number, public organizationIndependentContractorRole: IOrganizationIndependentContractorRole, public organizationIndependentContractorRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationIndependentContractorRolePaymentMethodDelete implements Action {
  //   public readonly type = type.OrganizationIndependentContractorRolePaymentMethodDelete;
  //   constructor(public organizationId: number, public organizationIndependentContractorRole: IOrganizationIndependentContractorRole, public organizationIndependentContractorRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationIndependentContractorRolePaymentMethodUpdate implements Action {
  //   public readonly type = type.OrganizationIndependentContractorRolePaymentMethodUpdate;
  //   constructor(public organizationId: number, public organizationIndependentContractorRole: IOrganizationIndependentContractorRole, public organizationIndependentContractorRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationIndependentContractorRolePaymentMethodUpdateProperty implements Action {
  //   public readonly type = type.OrganizationIndependentContractorRolePaymentMethodUpdateProperty;
  //   constructor(
  //     public organizationId: number,
  //     public organizationIndependentContractorRole: IOrganizationIndependentContractorRole,
  //     public organizationIndependentContractorRolePaymentMethod: IPaymentMethod,
  //     public propertyName: string,
  //     public newValue: any
  //   ) {}
  // }
  // export class OrganizationLimitedLiabilityCompanyRoleAdd implements Action {
  //   public readonly type = type.OrganizationLimitedLiabilityCompanyRoleAdd;
  //   constructor(public organizationId: number, public organizationLimitedLiabilityCompanyRole: IOrganizationLimitedLiabilityCompanyRole) {}
  // }
  // export class OrganizationLimitedLiabilityCompanyRoleDelete implements Action {
  //   public readonly type = type.OrganizationLimitedLiabilityCompanyRoleDelete;
  //   constructor(public organizationId: number, public organizationLimitedLiabilityCompanyRole: IOrganizationLimitedLiabilityCompanyRole) {}
  // }
  // export class OrganizationLimitedLiabilityCompanyRoleUpdate implements Action {
  //   public readonly type = type.OrganizationLimitedLiabilityCompanyRoleUpdate;
  //   constructor(public organizationId: number, public organizationLimitedLiabilityCompanyRole: IOrganizationLimitedLiabilityCompanyRole) {}
  // }
  // export class OrganizationLimitedLiabilityCompanyRoleUpdateProperty implements Action {
  //   public readonly type = type.OrganizationLimitedLiabilityCompanyRoleUpdateProperty;
  //   constructor(public organizationId: number, public organizationLimitedLiabilityCompanyRole: IOrganizationLimitedLiabilityCompanyRole, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationLimitedLiabilityCompanyRolePaymentMethodAdd implements Action {
  //   public readonly type = type.OrganizationLimitedLiabilityCompanyRolePaymentMethodAdd;
  //   constructor(public organizationId: number, public organizationLimitedLiabilityCompanyRole: IOrganizationLimitedLiabilityCompanyRole, public organizationLimitedLiabilityCompanyRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationLimitedLiabilityCompanyRolePaymentMethodDelete implements Action {
  //   public readonly type = type.OrganizationLimitedLiabilityCompanyRolePaymentMethodDelete;
  //   constructor(public organizationId: number, public organizationLimitedLiabilityCompanyRole: IOrganizationLimitedLiabilityCompanyRole, public organizationLimitedLiabilityCompanyRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdate implements Action {
  //   public readonly type = type.OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdate;
  //   constructor(public organizationId: number, public organizationLimitedLiabilityCompanyRole: IOrganizationLimitedLiabilityCompanyRole, public organizationLimitedLiabilityCompanyRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdateProperty implements Action {
  //   public readonly type = type.OrganizationLimitedLiabilityCompanyRolePaymentMethodUpdateProperty;
  //   constructor(
  //     public organizationId: number,
  //     public organizationLimitedLiabilityCompanyRole: IOrganizationLimitedLiabilityCompanyRole,
  //     public organizationLimitedLiabilityCompanyRolePaymentMethod: IPaymentMethod,
  //     public propertyName: string,
  //     public newValue: any
  //   ) {}
  // }
  // export class OrganizationSubVendorRoleAdd implements Action {
  //   public readonly type = type.OrganizationSubVendorRoleAdd;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole) {}
  // }
  // export class OrganizationSubVendorRoleDelete implements Action {
  //   public readonly type = type.OrganizationSubVendorRoleDelete;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole) {}
  // }
  // export class OrganizationSubVendorRoleUpdate implements Action {
  //   public readonly type = type.OrganizationSubVendorRoleUpdate;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole) {}
  // }
  // export class OrganizationSubVendorRoleUpdateProperty implements Action {
  //   public readonly type = type.OrganizationSubVendorRoleUpdateProperty;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationSubVendorRolePaymentMethodAdd implements Action {
  //   public readonly type = type.OrganizationSubVendorRolePaymentMethodAdd;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole, public organizationSubVendorRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationSubVendorRolePaymentMethodDelete implements Action {
  //   public readonly type = type.OrganizationSubVendorRolePaymentMethodDelete;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole, public organizationSubVendorRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationSubVendorRolePaymentMethodUpdate implements Action {
  //   public readonly type = type.OrganizationSubVendorRolePaymentMethodUpdate;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole, public organizationSubVendorRolePaymentMethod: IPaymentMethod) {}
  // }
  // export class OrganizationSubVendorRolePaymentMethodUpdateProperty implements Action {
  //   public readonly type = type.OrganizationSubVendorRolePaymentMethodUpdateProperty;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole, public organizationSubVendorRolePaymentMethod: IPaymentMethod, public propertyName: string, public newValue: any) {}
  // }
  // export class OrganizationSubVendorRoleRestrictionAdd implements Action {
  //   public readonly type = type.OrganizationSubVendorRoleRestrictionAdd;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole, public organizationSubVendorRoleRestriction: IOrganizationSubVendorRoleRestriction) {}
  // }
  // export class OrganizationSubVendorRoleRestrictionDelete implements Action {
  //   public readonly type = type.OrganizationSubVendorRoleRestrictionDelete;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole, public organizationSubVendorRoleRestriction: IOrganizationSubVendorRoleRestriction) {}
  // }
  // export class OrganizationSubVendorRoleRestrictionUpdate implements Action {
  //   public readonly type = type.OrganizationSubVendorRoleRestrictionUpdate;
  //   constructor(public organizationId: number, public organizationSubVendorRole: IOrganizationSubVendorRole, public organizationSubVendorRoleRestriction: IOrganizationSubVendorRoleRestriction) {}
  // }
  // export class OrganizationSubVendorRoleRestrictionUpdateProperty implements Action {
  //   public readonly type = type.OrganizationSubVendorRoleRestrictionUpdateProperty;
  //   constructor(
  //     public organizationId: number,
  //     public organizationSubVendorRole: IOrganizationSubVendorRole,
  //     public organizationSubVendorRoleRestriction: IOrganizationSubVendorRoleRestriction,
  //     public propertyName: string,
  //     public newValue: any
  //   ) {}
  // }
}
