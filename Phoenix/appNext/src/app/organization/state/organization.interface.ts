import { WorkflowAction } from './../../common/model/workflow-action';
import { AccessAction } from '../../common/model/access-action';
// import { IEntityIdAndGuid } from '../../common/model/entity-guid-interface';
import { PhxConstants, CustomFieldService } from '../../common/index';
import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { HashModel } from '../../common/utility/hash-model';

export interface IFormGroupSetup {
  hashModel: HashModel;
  toUseHashCode: boolean;
  formBuilder: FormBuilder;
  customFieldService: CustomFieldService;
}

export interface IFormGroupOnNew {
  formBuilder: FormBuilder;
  customFieldService: CustomFieldService;
}

export interface IOrganizationRouterState {
  organizationId: number;
  routerPath: PhxConstants.OrganizationNavigationName;
  roleType?: PhxConstants.OrganizationRoleType;
  roleId?: number;
  url: string;
}

export interface IOrganizationValidationError {
  ValidationErrors: Array<string>;
}

export interface IRoot {
  OrganizationId: number;
  TabDetails: ITabDetails;
  TabRoles: ITabRoles;
  TabCollaborators: IOrganizationCollaborators;
}

export interface IOrganizationCollaborators {
  EditorUserProfileName?: string;
  AssignedToUserProfileId?: number;
  CreatedByName: string;
  SourceId?: number;
}

export interface ITabDetails {
  OrganizationId: number;
  TabDetailsDetail: ITabDetailsDetail;
  TabDetailsAddresses: ITabDetailsAddresses;
}
export interface ITabDetailsAddresses {
  OrganizationAddresses: Array<IOrganizationAddress>;
  // OrganizationId: number;
}

export interface IOrganizationTaxNumbers {
  SalesTax: Array<IOrganizationTaxNumber>;
  SelectedType?: Array<IOrganizationTaxNumber>;
}

export interface ITabRoles {
  OrganizationTaxNumbers: IOrganizationTaxNumbers;
  OrganizationClientRoles: Array<IOrganizationClientRole>;
  OrganizationInternalRoles: Array<IOrganizationInternalRole>;
  OrganizationIndependentContractorRoles: Array<IOrganizationIndependentContractorRole>;
  OrganizationLimitedLiabilityCompanyRoles: Array<IOrganizationLimitedLiabilityCompanyRole>;
  OrganizationSubVendorRoles: Array<IOrganizationSubVendorRole>;
}

export interface ITabDetailsDetail {
  OrganizationId: number;
  Code: string;
  LegalName: string;
  DisplayName: string;
  IndustryTypeId: number;
  SectorTypeId: number;
  CountryId: number;
  DefaultTaxSubdivisionId: number;
  ParentOrganizationId: number;
  ParentOrganization: IParentOrganization;
  parentOrganizationName?: string;
  isFromParentOrgList: boolean;
}

export interface IRoleWithPaymentMethod {
  PaymentMethods: Array<IPaymentMethod>;
  PaymentPreference?: number;
}

export interface IOrganization {
  AccessActions: Array<AccessAction>;
  WorkflowAvailableActions: Array<WorkflowAction>;
  WorkflowPendingTaskId: number;
  // https://basarat.gitbooks.io/typescript/docs/types/readonly.html
  readonly ReadOnlyStorage: IReadOnlyStorage;
  Id: number;
  SourceId?: number;
  AvailableStateActions: number[];
  IsOriginal: boolean;
  IsOriginalAndStatusIsAtiveOrPendingChange: boolean;
  IsOrganizationInternalRole: boolean;
  IsOrganizationSubVendorRole: boolean;
  IsOrganizationClientRole: boolean;
  IsOrganizationIndependentContractorRole: boolean;
  IsOrganizationLimitedLiabilityCompanyRole: boolean;
  ActiveAdvancesCount: number;
  ActiveGarnisheesCount: number;

  OrganizationStatusId: PhxConstants.OrganizationStatus;
  Code: string;
  LegalName: string;
  DisplayName: string;
  IndustryTypeId: number;
  SectorTypeId: number;
  CountryId: number;
  DefaultTaxSubdivisionId: number;
  ModifiedBy: string;

  ParentOrganizationId: number;
  ParentOrganization: IParentOrganization;

  AssignedToUserProfileId?: number;
  CreatedByName: string;

  Versions: Array<IVersion>;
  OrganizationAddresses: Array<IOrganizationAddress>;
  OrganizationTaxNumbers: Array<IOrganizationTaxNumber>;

  OrganizationClientRoles: Array<IOrganizationClientRole>;
  OrganizationInternalRoles: Array<IOrganizationInternalRole>;
  OrganizationIndependentContractorRoles: Array<IOrganizationIndependentContractorRole>;
  OrganizationLimitedLiabilityCompanyRoles: Array<IOrganizationLimitedLiabilityCompanyRole>;
  OrganizationSubVendorRoles: Array<IOrganizationSubVendorRole>;

  OrganizationValidationErrors: Array<IOrganizationValidationError>;
  parentOrganizationName?: string;
  EditorUserProfileName?: string;
}

export interface IReadOnlyStorage {
  readonly IsEditable: boolean;
  readonly IsComplianceDraftStatus: boolean;
  readonly IsDebugMode: boolean;
  readonly AccessActions: Array<AccessAction>;
}

export interface IVersion {
  Id: number;
  IsOriginal: boolean;
  OrganizationStatusId: PhxConstants.OrganizationStatus;
}

export interface IParentOrganization {
  Id: number;
  Name: string;
  // IsDraft: boolean;
  // LastModifiedDatetime: Date;
}

export interface IOrganizationAddress {
  Id: number;
  // OrganizationId: number;
  AddressDescription: string;
  IsPrimary: boolean;
  CountryId: number;
  CityName: string;
  AddressLine1: string;
  AddressLine2: string;
  SubdivisionId: number;
  PostalCode: string;
  // AddressTypeId',
  // // IsDraft: boolean;
}

export interface IOrganizationTaxNumber {
  Id: number;
  SalesTaxId: number;
  SalesTaxNumber: string;
  // IsDraft: boolean;
  OrganizationId: number;
}

export interface IOrganizationClientRole {
  Id: number;
  IdOriginal: number;
  OrganizationRoleTypeId: PhxConstants.OrganizationRoleType;
  OrganizationRoleStatusId: PhxConstants.OrganizationRoleStatusType;
  IsChargeSalesTax: boolean;
  IsChargeableExpenseSalesTax: boolean;
  IsBypassZeroUnitTimeSheetApproval: boolean;
  IsSuppressZeroAmountInvoiceRelease: boolean;
  UsesThirdPartyImport: boolean;
  IsBillSalesTaxAppliedOnExpenseImport: boolean;
  IsPaySalesTaxAppliedOnExpenseImport: boolean;
  ClientSalesTaxDefaultId: number;
  SalesTaxCountryId: number;
  SalesTaxSubdivisionId: number;
  StartDate: Date;
  ExpiryDate: Date;
  IsAccrueMaxedOutCanadaPensionPlanForSP: boolean;
  IsAccrueMaxedOutCanadaPensionPlanForTemp: boolean;
  IsAccrueMaxedOutEmploymentInsuranceForSP: boolean;
  IsAccrueMaxedOutEmploymentInsuranceForTemp: boolean;
  IsAccrueMaxedOutQuebecParentalInsurancePlanForSP: boolean;
  IsAccrueMaxedOutQuebecParentalInsurancePlanForTemp: boolean;
  IsAccrueMaxedOutQuebecPensionPlanForSP: boolean;
  IsAccrueMaxedOutQuebecPensionPlanForTemp: boolean;
  OrganizationClientRoleLOBs: Array<IOrganizationClientRoleLOB>;
  OrganizationClientRoleAlternateBills: Array<IOrganizationClientRoleAlternateBill>;
  OrganizationClientRoleNationalAccountManagers: Array<IOrganizationClientRoleNationalAccountManager>;
}

export interface IOrganizationClientRoleLOB {
  Id: number;
  OrganizationClientRoleId: number;
  LineOfBusinessId: PhxConstants.LineOfBusiness;
  IsSelected: boolean;
  // IsDraft: boolean;
}

export interface IOrganizationClientRoleAlternateBill {
  Id: number;
  OrganizationClientRoleId: number;
  OrganizationClientRoleAlternateBillStatusId: PhxConstants.OrganizationClientRoleAlternateBillStatus;
  AlternateBillLegalName: string;
  AlternateBillCode: string;
  IsActive: boolean;
  IsSelected: boolean;
  // IsDraft: boolean;
}

export interface IOrganizationClientRoleNationalAccountManager {
  Id: number;
  OrganizationClientRoleId: number;
  UserProfileInternalId: number;
  ContactFullName: string;
}

export interface IOrganizationInternalRole {
  Id: number;
  IdOriginal?: number;
  OrganizationRoleTypeId?: PhxConstants.OrganizationRoleType;
  OrganizationRoleStatusId?: PhxConstants.OrganizationRoleStatusType;
  ApplicationDate?: Date;
  DocumentIdHeader?: number;
  DocumentHeaderName?: string;
  DocumentHeaderPublicId?: string;
  DocumentIdFooter?: number;
  DocumentFooterName?: string;
  DocumentFooterPublicId?: string;
  DocumentIdLandscapeHeader?: number;
  DocumentLandscapeHeaderName?: string;
  DocumentLandscapeHeaderPublicId?: string;
  DocumentIdLandscapeFooter?: number;
  DocumentLandscapeFooterName?: string;
  DocumentLandscapeFooterPublicId?: string;
  IsAccrueEmployerHealthTaxLiability?: boolean;
  BankAccounts?: Array<IBankAccount>;
}

export interface INotificationEmail {
  Email: string;
}

export interface IRoleWithNotificationEmail {
  NotificationEmail: string;
  NotificationEmails: Array<INotificationEmail>;
}

export interface IRoleBankAccounts {
  BankAccounts: Array<IBankAccount>;
}

export interface IOrganizationIndependentContractorRole extends IRoleWithPaymentMethod, IRoleWithNotificationEmail {
  Id: number;
  IdOriginal: number;
  OrganizationRoleTypeId: PhxConstants.OrganizationRoleType;
  OrganizationRoleStatusId: PhxConstants.OrganizationRoleStatusType;
  IsNonResident: boolean;
  BusinessNumber: string;
}

export interface IOrganizationLimitedLiabilityCompanyRole extends IRoleWithPaymentMethod, IRoleWithNotificationEmail {
  Id: number;
  IdOriginal: number;
  OrganizationRoleTypeId: PhxConstants.OrganizationRoleType;
  OrganizationRoleStatusId: PhxConstants.OrganizationRoleStatusType;
  IsNonResident: boolean;
  EmployerIdentificationNumber: string;
}
export interface IOrganizationSubVendorRole extends IRoleWithPaymentMethod, IRoleWithNotificationEmail {
  Id: number;
  IdOriginal: number;
  OrganizationRoleTypeId: PhxConstants.OrganizationRoleType;
  OrganizationRoleStatusId: PhxConstants.OrganizationRoleStatusType;
  IsNonResident: boolean;
  BusinessNumber: string;
  UseADifferentPayeeName: boolean;
  PayeeName: string;
  OrganizationSubVendorRoleRestrictions: Array<IOrganizationSubVendorRoleRestriction>;
}
export interface IOrganizationSubVendorRoleRestriction {
  Id: number;
  OrganizationSubVendorRoleId: number;
  OrganizationSubVendorRoleRestrictionTypeId: PhxConstants.OrganizationSubVendorRoleRestrictionType;
  OrganizationIdClient: number;
  OrganizationIdInternal: number;
  Name: string;
}
export interface IPaymentMethod {
  Id: number;
  OrganizationIndependentContractorRoleId: number;
  PaymentMethodTypeId: PhxConstants.PaymentMethodType;
  IsSelected: boolean;
  IsPreferred: boolean;
  BankCode: string;
  BankBranchCode: string;
  BankAccountNumber: string;
  ProfileNameBeneficiary: string;
  NameBeneficiary: string;
  AccountNumberBeneficiary: string;
  Address1Beneficiary: string;
  Address2Beneficiary: string;
  CityBeneficiary: string;
  ProvinceOrStateBeneficiary: string;
  CountryCodeBeneficiary: number;
  PostalorZipBeneficiary: string;
  PayCurrencyBeneficiary: number;
  WireTransferBankTypeIdBeneficiary: number;
  BankIDBeneficiary: string;
  ABANoBeneficiary: string;
  WireTransferBankTypeIdIntemediary: number;
  BankNameIntemediary: string;
  BankIdIntemediary: string;
  Address1Intemediary: string;
  Address2Intemediary: string;
  CityIntemediary: string;
  ProvinceOrStateIntemediary: string;
  CountryCodeIntemediary: number;
  PostalOrZipIntemediary: string;
  WireTransferBankTypeIdReceivers: number;
  BankNameReceivers: string;
  BankIdReceivers: string;
  Address1Receivers: string;
  Address2Receivers: string;
  CityReceivers: string;
  ProvinceOrStateReceivers: string;
  CountryCodeReceivers: number;
  PostalOrZipReceivers: string;
  PaymentDetailNotes: string;
  EmployeeId: string;
}
export interface IBankAccount {
  Id: number;
  OrganizationInternalRoleId: number;
  BankName: string;
  Description: string;
  GLAccount: string;
  Transit: string;
  AccountNo: string;
  AccountId: number;
  CurrencyId: number;
  OrganizationBankSignatureId: number;
  OrganizationBankStatusId: number;
  IsPrimary: boolean;
  NextChequeNumber: number;
  NextDirectDepositBatchNumber: number;
  NextWireTransferBatchNumber: number;
  // IsDraft: boolean;
}
export interface IPrimaryContact {
  ContactId: number;
  Email: string;
  PersonTitleId: number;
  FirstName: string;
  LastName: string;
  PhoneTypeId: number;
  PhoneNumber: string;
  PhoneExtension: string;
}

export interface INotificationEmail {
  Email: string;
}

export interface IQuickAddOrgRoot {
  OrgDetails: ITabDetailsDetail;
  OrganizationAddressesDetails: ITabDetailsAddresses;
  OrganizationContact: IPrimaryContact;
  OrganizationCollaborators: IOrganizationCollaborators;
  OrganizationRole: IOrganizationIndependentContractorRole;
  OrganizationTaxNumbers: IOrganizationTaxNumbers;
}

export interface IQuickAddOrganization {
  Id: number;
  OrganizationStatusId: number;
  Code: string;
  LegalName: string;
  DisplayName: string;
  IndustryTypeId: number;
  SectorTypeId: number;
  CountryId: number;
  DefaultTaxSubdivisionId: number;
  ParentOrganizationId: number;
  ParentOrganization: IParentOrganization;
  CreatedByName: string;
  AssignedToUserProfileId: number;
  OrganizationAddresses: Array<IOrganizationAddress>;
  OrganizationIndependentContractorRoles: Array<IOrganizationIndependentContractorRole>;
  OrganizationTaxNumbers: Array<IOrganizationTaxNumber>;
  Contact: IPrimaryContact;
  IsDraftStatus: boolean;
  AreComplianceFieldsEditable: boolean;
  AreComplianceFieldsRequired: boolean;
  SubvendorPaymentMethodTypeId: number;
  OrganizationIndependentContractorPaymentMethodTypeId: number;
  OrganizationLimitedLiabilityPaymentMethodTypeId: number;
  OrganizationInternalRoles: Array<IOrganizationInternalRole>;
  OrganizationClientRoles: Array<IOrganizationClientRole>;
  SourceId?: number;
  EditorUserProfileName?: string;
}

export interface IOrganizationTaxNumbers {
  SalesTax: Array<IOrganizationTaxNumber>;
  SelectedType?: Array<IOrganizationTaxNumber>;
}

export interface BranchManager {
  Id: number;
  UserProfileInternalId: number;
}
export interface BranchPhone {
  Id: number;
  PhoneType: number;
  Phone: string;
  Extension: string;
}
export interface BranchAddress {
  Id: number;
  AddressType: number;
  CountryId: number;
  CityName: string;
  AddressLine1: string;
  AddressLine2: string;
  SubdivisionId: number;
  PostalCode: string;
  Description: string;
  IsPrimary: boolean;
}
export interface Branch {
  AccessActions: Array<AccessAction>;
  Id: number;
  Code: string;
  Name: string;
  Description: string;
  BranchManagers: Array<BranchManager>;
  BranchPhones: Array<BranchPhone>;
  BranchAddresses: Array<BranchAddress>;
  LastModifiedDatetime: Date;
}
export interface TableFilterConfiguration {
  filterList: {
    list: Array<any>;
    displayText: string;
    valueField: string;
  };
  filterType: string;
  selectedValue: {
    inputText?: string;
    selectedValue?: any;
    selectedValues?: Array<any>;
  };
}
export interface IAdvance {
  EntityIds?: [number];
  OrganizationIdInternal: number;
  IssueDate: string;
  AmountInitial: number;
  PaybackType: boolean;
  PaybackAmount: number;
  PaybackPercentage: number;
  Description: string;
  PayeeName: string;
  AddressLine1: string;
  AddressLine2: string;
  CityName: string;
  CountryId: number;
  SubdivisionId: number;
  PostalCode: string;
  PaymentMethodId: number;
  CurrencyId: number;
  PayeeOrganizationIdSupplier: number;
  AccessLevelId?: number;
  Id?: number;
  AdvanceStatusId?: number;
  OrganizationInternalLegalName?: string;
  PayeeUserProfileWorkerId?: string;
  PaybackRemainder?: number;
  LastModifiedDatetime?: number;
  PaidAmount: number;
  AdvanceInitialTransaction?: IAdvanceInitialTransaction;
  AdvanceRepaymentTransactions?: Array<IRepaymentTransactions>;
}

export interface IAdvanceInitialTransaction {
  TransactionHeaderId: number;
  PaymentTransactionNumber: number;
  Amount: number;
  ReleaseDate: number;
  PaymentNumber: string;
}

export interface IPayeeDetails {
  PayToType: string;
  PayToName: string;
  CountryId: number;
  SubdivisionId: number;
  CityName: string;
  AddressLine1: string;
  AddressLine2: string;
  PostalCode: string;
}
export interface IPayee {
  PayToId: number;
  PayToDetails: IPayeeDetails;
  PayeeDetails?: IPayeeDetails;
}
export interface IGarnisheeNew {
  WorkflowPendingTaskId: number;
  Payee: IPayee;
  GarnisheeOrganizationIdSupplier: number;
  PayTypeIsAmount: boolean;
  PayAmountIsMaximum: boolean;
  OrganizationIdInternal: number;
  IssueDate: string;
  CurrencyId: number;
  PayAmount: string;
  PayPercentage: string;
  PayAmountMaximum: string;
  Description: string;
  ReferenceNumber: string;
}

export interface IGarnisheeEdit {
  AccessLevelId: number;
  Id: number;
  IssueDate: string;
  GarnisheeStatusId: number;
  OrganizationIdInternal: number;
  OrganizationInternalLegalName: string;
  GarnisheeOrganizationIdSupplier: number;
  GarnisheeUserProfileWorkerId?: number;
  Description: string;
  ReferenceNumber: string;
  CurrencyId: number;
  PayTypeIsAmount: boolean;
  PayAmountIsMaximum: boolean;
  PayAmount: number;
  PayPercentage?: number;
  PayAmountMaximum: number;
  LastModifiedDatetime?: Date;
  PaidAmount: number;
  PaybackRemainder: number;
  PayToId: number;
  PayToName: string;
  PayToType: string;
  CountryId: number;
  SubdivisionId: number;
  CityName: string;
  AddressLine1: string;
  AddressLine2?: string;
  PostalCode: string;
  GarnisheeRepaymentTransactions: Array<IRepaymentTransactions>;
  ProfileTypeId?: number;
}

export interface IRepaymentTransactions {
  PaymentTransactionNumber: number;
  Amount: number;
  ReleaseDate: number;
  PaymentNumber: string;
  PaymentMethodId: number;
}

export class TFConstants {
  static view = 0;
  static edit = 1;
  static hideElement = 2;
  static hideFormGroup = 3;
}

export interface IRebateFee {
  Id: number;
  Description: string;
  LineOfBusinessId: number;
  RebateTypeId: number;
  Rate: number;
  EffectiveDate: number;
  OrganizationId: number;
}
export interface IVmsFee {
  Id: number;
  Description: string;
  LineOfBusinessId: number;
  RebateTypeId: number;
  Rate: number;
  EffectiveDate: number;
  OrganizationId: number;
}
