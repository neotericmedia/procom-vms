import { AccessAction } from '../../common/model/access-action';
import { PhxConstants, CustomFieldService } from '../../common/index';
import { HashModel } from '../../common/utility/hash-model';
import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';

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

export interface IWorkorderRouterState {
  Id: number;
  routerPath: PhxConstants.WorkorderNavigationName;
  roleType?: PhxConstants.WorkorderRoleType;
  roleId?: number;
  url: string;
}

export interface IVersion {
  Id: number;
  IsOriginal: boolean;
  WorkorderStatusId: PhxConstants.WorkOrderVersionStatus;
}

export interface IWorkorderValidationError {
  ValidationErrors: Array<string>;
}

export interface IRoot {
  Id: number;
  TabCore: ICoreTabRoot;
  TabParties: ITabPartiesandRates;
  TabTimeMaterialInvoice: ITabTimeMaterialInvoice;
  TabExpenseInvoice: ITabExpenseInvoice;
  TabTaxes: ITabTaxes;
  TabEarningsAndDeductions: ITabEarningsAndDeductions;
  PaymentContacts?: IPaymentContacts[];
  EffectiveDate: string;
}

export class IReadOnlyStorage {
  readonly IsEditable: boolean;
  readonly IsDebugMode: boolean;
  readonly AccessActions: Array<AccessAction>;
}

export interface IAssignmentDto {
  Id: number;
  IsDraft: boolean;
  StatusId: PhxConstants.AssignmentStatus;
  WorkOrders: Array<IWorkOrderDto>;
  UserProfileIdWorker: number;
  OrganizationIdInternal: number;
  StartDate?: string;
  OrganizationCode: string;
  AtsSourceId: number;
  AtsPlacementId: number;
  AccessActions: Array<AccessAction>;
  AccessLevelId: number;
  readonly ReadOnlyStorage: IReadOnlyStorage;
  WorkorderValidationErrors: Array<IWorkorderValidationError>;
  LastModifiedDateTime?: string;
  AvailableStateActions: Array<number>;
}

export interface IWorkOrderDto {
  Id: number;
  AssignmentId: number;
  WorkOrderCreationReasonId: number;
  StatusId: number;
  StartDate: string;
  EndDate: string;
  TerminationDate: number;
  IsDraft: boolean;
  WorkOrderPurchaseOrderLines: number;
  WorkOrderNumber: number;
  SourceId: number;
  TransactionHeaderCount: number;
  WorkOrderVersionActiveCount: number;
  WorkOrderVersions?: any;
  AvailableStateActions: Array<number>;
}

export interface IBillingRate {
  BillingInfoId?: number;
  Id?: number;
  IsDraft?: boolean;
  Rate?: string;
  RateTypeId?: number;
  RateUnitId?: number;
  SourceId?: number;
}

export interface IBillingRecipient {
  BillingInvoiceId: number;
  DeliveryMethodId?: number;
  Id: number;
  IsDraft: boolean;
  RecipientTypeId: number;
  SourceId?: number;
  UserProfileId?: number;
  DeliverToUserProfileId?: number;
  // BrokenRules: BrokenRules;
}

export interface IBillingInvoice {
  Id: number;
  BillingInfoId: number;
  IsDraft: boolean;
  SourceId?: number;
  BillingRecipients?: IBillingRecipient[];
  IsUsesAlternateBilling?: boolean; //
  OrganizatonClientRoleAlternateBillingId?: number;
  InvoiceTypeId?: number;
  BillingFrequencyId?: number;
  BillingInvoiceTemplateId?: number;
  BillingInvoiceTermsId?: number;
  BillingInvoicePresentationStyleId?: number;
  BillingConsolidationTypeId?: number;
  InvoiceNote1?: string;
  InvoiceNote2?: string;
  InvoiceNote3?: string;
  InvoiceNote4?: string;
  IsChargebleExpenseSalesTax?: boolean;
  IsSalesTaxAppliedOnVmsImport?: boolean;
  BillingTransactionGenerationMethodId?: number;
  ShowBillingInfoNote2?: boolean;
  ShowBillingInfoNote3?: boolean;
  ShowBillingInfoNote4?: boolean;
  // BrokenRules: BrokenRules;
}

export interface IBillingSalesTax {
  Id: number;
  SalesTaxId: number;
  IsApplied: boolean;
  ratePercentage: number;
  hasNumber: boolean;
}

export interface IContact {
  FullName: string;
  Id: number;
}

export interface IProfilesListForBillingOrganization {
  OrganizationId: number;
  ProfileTypeId: number;
  ContactId: number;
  ProfileStatusId: number;
  Id: number;
  Contact: IContact;
}

export interface IBillingInfo {
  BillingRates?: IBillingRate[];
  BillingInvoices?: IBillingInvoice[];
  BillingSalesTaxes?: IBillingSalesTax[];
  CurrencyId?: number;
  Hours?: number;
  Id?: number;
  IsDraft?: boolean;
  OrganizationIdClient?: number;
  OrganizationClientDisplayName?: string;
  OrganizationClientSalesTaxDefaultId?: number;
  RateUnitId?: number;
  SourceId?: number;
  UserProfileIdClient?: number;
  SubdivisionIdSalesTax?: number;
  WorkOrderVersionId?: number;
  // BrokenRules: BrokenRules;
  profilesListForBillingOrganization?: IProfilesListForBillingOrganization[];
  orgClientAB?: IOrgClientAB[];
}

export interface IOrgClientAB {
  id: number;
  text: string;
  name?: string;
}

export interface IPaymentRate {
  Id?: number;
  IsApplyDeductions?: boolean;
  IsApplyVacation?: boolean;
  IsApplyStatHoliday?: boolean;
  IsDraft?: boolean;
  PaymentInfoId?: number;
  Rate?: string;
  RateTypeId?: number;
  RateUnitId?: number;
  SourceId?: number;
}

export interface IPaymentInvoice {
  Id: number;
  IsDraft: boolean;
  PaymentInfoId: number;
  InvoiceTypeId: number;
  PaymentReleaseScheduleId?: number;
  PaymentFrequency?: null;
  PaymentInvoiceTemplateId?: number;
  PaymentInvoiceTermsId?: number;
  PaymentMethodId?: number;
  SourceId?: number;
  IsSalesTaxAppliedOnVmsImport?: boolean;
  // BrokenRules: BrokenRules;
}

export interface IPaymentSalesTax {
  Id: number;
  SalesTaxId: number;
  IsApplied: boolean;
  ratePercentage: number;
  hasNumber: boolean;
}

export interface IPaymentOtherEarning {
  Id: number;
  PaymentOtherEarningTypeId: number;
  IsApplied: boolean;
  IsAccrued?: boolean;
  RatePercentage?: number;
  SourceId: number;
  PaymentInfoId: number;
}

export interface IProfilesListForPaymentOrganization {
  OrganizationId: number;
  ProfileTypeId: number;
  ContactId: number;
  ProfileStatusId: number;
  Id: number;
  Contact: IContact;
}

export interface IPaymentContacts {
  PaymentInfoId: number;
  PaymentContacts: Array<IPaymentContact>;
}

export interface IPaymentInfo {
  CurrencyId?: number;
  Hours?: number;
  Id?: number;
  IsDraft?: boolean;
  OrganizationIdSupplier?: number;
  OrganizationSupplierDisplayName?: string;
  PaymentContacts?: IPaymentContact[];
  PaymentRates?: IPaymentRate[];
  PaymentInvoices?: IPaymentInvoice[];
  PaymentSalesTaxes?: IPaymentSalesTax[];
  PaymentSourceDeductions?: any[];
  PaymentOtherEarnings?: IPaymentOtherEarning[];
  RateUnitId?: number;
  SourceId?: number;
  UserProfileIdSupplier?: number;
  SubdivisionIdSourceDeduction?: number;
  IsUseUserProfileWorkerSourceDeduction?: boolean;
  SubdivisionIdSalesTax?: number;
  WorkOrderVersionId?: number;
  IsCommissionVacation?: boolean;
  ApplySalesTax?: boolean;
  profilesListForPaymentOrganization?: IProfilesListForPaymentOrganization[];
}

export interface IPaymentContact {
  Id: number;
  IsDraft: boolean;
  PaymentInfoId: number;
  SourceId?: number;
  UserProfileId: number;
}

export interface ITimeSheetApprover {
  Id: number;
  WorkOrderVersionId?: number;
  SourceId: number;
  UserProfileId: number;
  Sequence: number;
  MustApprove: boolean;
  IsDraft: boolean;
  WorkOrderVersion?: any;
}

export interface ICommissionRate {
  CommissionRateHeaderId: number;
  CommissionRateHeaderStatusId: number;
  Description: string;
}

export interface IWorkOrderVersionCommission {
  Id: number;
  UserProfileIdSales: number;
  CommissionRoleId: number;
  IsApplicable: boolean;
  CommissionRateHeaderId: number;
  FullName: string;
  Description: string;
  CommissionRates: Array<any>; // Array<CommissionRate>; // Partial<CommissionRate[]>;
}

export interface IJobOwner {
  Id: number;
  UserProfileIdSales: number;
  CommissionRoleId: number;
  IsApplicable: boolean;
  CommissionRateHeaderId: number;
  FullName: string;
  Description: string;
  CommissionRates: Partial<ICommissionRate[]>;
}

export interface IWorkOrderVersion {
  Id: number;
  WorkOrderId: number;
  VmsWorkOrderReference?: any;
  VersionNumber: number;
  EffectiveDate: string;
  WorkOrderStartDateState: string;
  WorkOrderEndDateState: string;
  WorkOrderCreationReasonId: number;
  StatusId: number;
  BillingInfoes: IBillingInfo[];
  PaymentInfoes: IPaymentInfo[];
  TimeSheetApprovers: ITimeSheetApprover[];
  ExpenseApprovers: any[];
  WorkOrderVersionCommissions: IWorkOrderVersionCommission[];
  SourceId: number;
  IsDraft: boolean;
  LineOfBusinessId: number;
  PositionTitleId: number;
  AssignedToUserProfileId: number;
  TimeSheetCycleId: number;
  TimeSheetDescription?: any;
  TimeSheetPreviousApprovalRequired: boolean;
  TimeSheetMethodologyId: number;
  TimeSheetApprovalFlowId: number;
  IsTimeSheetUsesProjects: boolean;
  IsDisplayEstimatedInvoiceAmount: boolean;
  IsDisplayEstimatedPaymentAmount: boolean;
  IsExpenseRequiresOriginal?: boolean;
  IsExpenseUsesProjects?: boolean;
  ExpenseMethodologyId: number;
  ExpenseDescription?: any;
  ExpenseThirdPartyWorkerReference?: any;
  ExpenseApprovalFlowId?: number;
  WorksiteId: number;
  InternalOrganizationDefinition1Id: number;
  InternalOrganizationDefinition2Id?: number;
  InternalOrganizationDefinition3Id?: number;
  InternalOrganizationDefinition4Id?: number;
  InternalOrganizationDefinition5Id?: number;
  WCBIsApplied: boolean;
  SalesPatternId?: number;
  JobOwnerUsesSupport: boolean;
  HasRebate: boolean;
  RebateHeaderId?: number;
  RebateTypeId?: number;
  RebateRate?: number;
  HasVmsFee: boolean;
  VmsFeeHeaderId?: number;
  VmsFeeTypeId?: number;
  VmsFeeRate?: number;
  IsEligibleForCommission: boolean;
  IsThirdPartyImport?: boolean;
  CommissionThirdPartyWorkerReference?: any;
  ApplyFlatStatPay?: boolean;
  Extended: boolean;
  IsDraftStatus: boolean;
  IsComplianceDraftStatus: boolean;
  ValidateComplianceDraft: boolean;
  JobOwner: IJobOwner;
  SupportingJobOwners: any[];
  Recruiters: any[];
  AllowTimeImport: boolean;
  BillingTransactionGenerationMethodId?: number;
  WorkOrderNumber: number;
  WorkerCompensationId: number;
  AccrueEmployerHealthTaxLiability: boolean;
  WorkOrderPurchaseOrderLines?: Array<IWorkOrderPurchaseOrderLines>;
  wovEndDate: string;
  ClientBasedEntityCustomFieldValue?: any;
}

export interface IWorkOrder {
  Id?: number;
  AssignmentId: number;
  WorkOrderId: number;
  UserProfileIdWorker: number;
  OrganizationIdInternal: number;
  AssignmentStartDate: string;
  StartDate: string;
  EndDate: string;
  AtsPlacementId: number;
  StatusId: number;
  IsDraftStatus: boolean;
  TerminationDate: string;
  WorkOrderVersion: IWorkOrderVersion;
  RootObject: Partial<IAssignmentDto>;
  readOnlyStorage?: IReadOnlyStorage;
  WorkorderValidationErrors: Array<IWorkorderValidationError>;
  workerProfileTypeId?: number;
  workerContactId?: number;
  TransactionHeaderCount?: number;
  WorkOrderVersionActiveCount?: number;
  TemplateId?: number;
  IsPaymentStopped?: boolean;
  AssignmentStatus?: boolean;
  combinedAvailableStateActions: Array<number>;
}
//////////////////////////////////////////

////////////////////////////////////////////////////
/*
                  Core Tab
                  --------
*/
///////////////////////////////////////////////////

export interface ICoreTabRoot {
  Id: number;
  Details: ITabCoreDetails;
  Commissions: ITabCoreCommissions;
  Collaborators: ITabCoreCollaborators;
}

export interface ITabCoreDetails {
  AtsPlacementId: number;
  StartDate: string;
  EndDate: string;
  LineOfBusinessId: number;
  InternalOrganizationDefinition1Id?: number;
  InternalOrganizationDefinition2Id?: number;
  InternalOrganizationDefinition3Id?: number;
  InternalOrganizationDefinition4Id?: number;
  InternalOrganizationDefinition5Id?: number;
  WorksiteId: number;
  OrganizationIdInternal: number;
  PositionTitleId: number;
  TerminationDate: string;
  WorkOrderStartDateState: string;
  WorkOrderCreationReasonId: number;
  WorkOrderEndDateState: string;
  wovEndDate: string;
}

export interface ITabCoreCommissions {
  SalesPatternId: number;
  JobOwnerUsesSupport: boolean;
  JobOwner: IJobOwner;
  SupportingJobOwners: Array<Partial<IJobOwner>>;
  Recruiters: Array<IJobOwner>;
  WorkOrderVersionCommissions: Array<IJobOwner>;
}

export interface ITabCoreCollaborators {
  AssignedToUserProfileId: number;
}

///////////////////////////////////////////////////////////
/*
                Parties And Rebates
                ------------------
*/
//////////////////////////////////////////////////////////

export interface ITabPartiesandRates {
  Id: number;
  TabPartyBillingInfoes?: IBillingPartyInfoes;
  IncentiveCompensation?: IIncentiveCompensation;
  TabPartyPaymentInfoes?: IPaymentPartyInfoes;
  UserProfileIdWorker?: number;
}

export interface IBillingPartyInfoes {
  PartiesRateDetails: Array<IPartiesRateDetail>;
}

export interface IPartiesRateDetail {
  Id?: number;
  UserProfileIdClient?: number;
  OrganizationIdClient?: number;
  Hours?: number;
  CurrencyId?: number;
  OrganizationClientDisplayName?: string;
  BillingRatesDetail?: IBillingRatesDetails;
  RebateAndVMSFee?: IRebateAndVMSFee;
}

export interface IBillingRatesDetails {
  BillingRates: Array<IBillingRate>;
  selectedRateType?: Array<IBillingRate>;
}

export interface IPaymentPartyInfoes {
  PaymentPartiesRateDetails: Array<IPaymentPartiesRateDetail>;
}

export interface IPaymentPartiesRateDetail {
  Id?: number;
  OrganizationIdSupplier?: number;
  CurrencyId?: number;
  Hours?: string;
  UserProfileIdSupplier?: number;
  ApplySalesTax?: boolean;
  PaymentRatesDetail?: IPaymentRatesDetail;
  OrganizationSupplierDisplayName?: string;
  UserProfileIdWorker?: number;
  IsCommissionVacation?: boolean;
  PaymentOtherEarnings?: IPaymentOtherEarning[];
  PaymentSourceDeductions?: IPaymentSourceDeductions[];
  PaymentContacts?: IPaymentContact[];
  PaymentInvoices?: IPaymentInvoice[];
  PaymentSalesTaxes?: IPaymentSalesTax[];
  IsUseUserProfileWorkerSourceDeduction?: boolean;
  IsDraft?: boolean;
  WorkOrderVersionId?: number;
  SubdivisionIdSalesTax?: string;
  SubdivisionIdSourceDeduction?: string;

}

export interface IPaymentRatesDetail {
  PaymentRates: Array<IPaymentRate>;
}

export interface IAvailableRebates {
  headerId: number;
  description: string;
  lineOfBusinessId: number;
  rate: number;
  rebateTypeId: number;
  type: string;
  versionId: number;
}

export interface IRebateAndVMSFee {
  HasRebate: boolean;
  HasVmsFee: boolean;
  RebateHeaderId: number;
  RebateTypeId: number;
  RebateRate: number;
  VmsFeeHeaderId: number;
  VmsFeeTypeId: number;
  VmsFeeRate: number;
}

export interface IIncentiveCompensation {
  IsEligibleForCommission: boolean;
  IsThirdPartyImport: boolean;
  CommissionThirdPartyWorkerReference: number;
  IsCommissionVacation?: boolean;
}

////////////////////////////////////////////////////
/*
      Time tab material and expense invoice
*/
///////////////////////////////////////////////////

export interface ITabTimeMaterialInvoice {
  TabTimeMaterialInvoiceBillingInfoes: IBillingInfoes;
  TabTimeMaterialInvoicePaymentInfoes: IPaymentInfoes;
  TabTimeMaterialInvoiceDetail: ITabTimeMaterialInvoiceDetail;
  IsContactValid: boolean;
}

export interface IPaymentInfoes {
  PaymentInfoes: Array<IPaymentInfo>;
}

export interface IBillingInfoes {
  BillingInfoes: Array<IBillingInfo>;
}

export interface ITabTimeMaterialInvoiceDetail {
  TimeSheetMethodologyId: number;
  TimeSheetCycleId: number;
  TimeSheetApprovers: ITimeSheetApprover[];
  TimeSheetApprovalFlowId: number;
  IsTimeSheetUsesProjects: boolean;
  VmsWorkOrderReference: string;
  IsDisplayEstimatedInvoiceAmount: boolean;
  IsDisplayEstimatedPaymentAmount: boolean;
  TimeSheetDescription: string;
  OrganizationIdClient?: number;
}

export interface IBillingInvoices {
  BillingInvoices: Array<IBillingInvoice>;
}

export interface IUserProfilePaymentMethod {
  IsPreferred: boolean;
  IsSelected: boolean;
  PaymentMethodTypeId: number;
}

export interface ITabExpenseInvoice {
  TabExpenseInvoiceDetail: ITabExpenseInvoiceDetail;
  TabExpenseInvoiceBillingInfoes: IBillingInfoes;
  TabExpenseInvoicePaymentInfoes: IPaymentInfoes;
  IsContactValid: boolean;
}

export interface ITabExpenseInvoiceDetail {
  ExpenseMethodologyId: number;
  ExpenseApprovers: Array<IExpenseApprover>;
  ExpenseApprovalFlowId?: number;
  IsExpenseUsesProjects: boolean;
  IsExpenseRequiresOriginal: boolean;
  ExpenseThirdPartyWorkerReference: string;
  ExpenseDescription: string;
  OrganizationIdInternal?: number;
  OrganizationIdSuppliers?: Array<ISupplierOrganization>;
  OrganizationIdClients?: Array<IClientOrganization>;
}

export interface ISupplierOrganization {
  OrganizationIdSupplier: number;
}

export interface ISupplierOrganizations {
  OrganizationIdSuppliers: Array<ISupplierOrganization>;
}

export interface IClientOrganization {
  OrganizationIdClient: number;
}

export interface IClientOrganizations {
  OrganizationIdClients: Array<IClientOrganization>;
}

export interface IExpenseApprover {
  Id: number;
  ApproverTypeId: number;
  WorkOrderVersionId?: number;
  SourceId?: number;
  UserProfileId: number;
  Sequence: number;
  MustApprove?: boolean;
  IsDraft?: boolean;
  WorkOrderVersion?: any;
}

////////////////////////////////////////////////////
/*
      Taxes tab
*/
///////////////////////////////////////////////////

export interface ITabTaxes {
  BillingInfoes: Array<IBillingInfo>;
  PaymentInfoes: Array<IPaymentInfo>;
  OrganizationIdInternal: number;
  StatusId: number;
  ValidateComplianceDraft: boolean;
}

///////////////////////////////////////////////////
/*
      Earnings and deductions tab.
*/
///////////////////////////////////////////////////

export interface ITabEarningsAndDeductions {
  OtherEarnings: IOtherEarning;
  WorkplaceSafetyInsurance: IWorkplaceSafetyInsurance;
  StatutoryHoliday: IStatutoryHoliday;
  PaymentInfoes: Array<IPaymentInfoDetails>;
  AccrueEmployerHealthTaxLiability: boolean;
  WorkerProfileTypeId: number;
  WorkerContactId: number;
}

export interface IOtherEarning {
  OtherEarning: IOtherEarnings[];
}

export interface IOtherEarnings {
  PaymentInfoId: number;
  OrganizationIdSupplier: number;
  PaymentOtherEarnings: IPaymentOtherEarning[];
}

export interface IWorkplaceSafetyInsurance {
  WorkerCompensationId: number;
  WCBIsApplied: boolean;
}

export interface IStatutoryHoliday {
  ApplyFlatStatPay: boolean;
}

export interface IPaymentInfoDetails {
  PaymentInfoId: number;
  SubdivisionIdSourceDeduction?: number;
  OrganizationIdSupplier: number;
  SourceDeductions: ISourceDeductions;
  PaymentSourceDeductions: Array<IPaymentSourceDeductions>;
}

export interface ISourceDeductions {
  SubdivisionIdSourceDeduction: number;
  IsUseUserProfileWorkerSourceDeduction: boolean;
}

export interface IPaymentSourceDeductions {
  IsApplied: boolean;
  RatePercentage: number;
  RateAmount: number;
  IsOverWritable: boolean;
  SourceDeductionTypeId: number;
  ToShow: boolean;
}

////////////////////////////////////////////////////
/*
      Purchase Order tab
*/
///////////////////////////////////////////////////

export interface IPurchaseOrder {
  Id: number;
  AmountReserved?: number;
  AmountSpent: number;
  AmountCommited: number;
  Amount: number;
  StatusId: boolean;
  PurchaseOrderLineId: number;
  PurchaseOrderLineNumber: number;
  PurchaseOrderNumber: number;
  PurchaseOrderId: number;
  PurchaseOrderLineEndDate: number;
  PurchaseOrderLineStartDate: Date;
  PurchaseOrderDepletionGroupId: number;
  PurchaseOrderLineStatusId: number;
  PurchaseOrderLineCurrencyId: number;
}

export interface IPurchaseOrderDetails {
  purchaseOrders: Array<IPurchaseOrder>;
}

export interface IWorkOrderPurchaseOrderLines {
  Id?: number;
  PurchaseOrderDepletionGroupId?: number;
  StartDate?: Date;
  EndDate?: Date;
  PurchaseOrderId?: number;
  PurchaseOrderLineId?: number;
  PurchaseOrderNumber?: number;
  PurchaseOrderLineNumber?: number;
  Amount?: number;
  AmountCommited?: number;
  AmountSpent?: number;
  AmountReserved?: number;
  StatusId?: number;

}

export interface IPurchaseOrderLineLists {
  Id: number;
  PurchaseOrderId: number;
  PurchaseOrderDepletionGroupId: number;
  PurchaseOrderNumber: number;
  PurchaseOrderLineNumber: number;
  Amount: number;
  AmountCommited: number;
  AmountSpent: number;
  CurrencyCode: string;
  StatusId: number;
  PurchaseOrderLineStatusName: string;
}

export interface POLineNew {
  Amount: number;
  CurrencyId: number;
  DepletionOptionId: number;
  DepletionGroupId: number;
  Description: string;
  EndDate: number;
  Id: number;
  IsDraft?: boolean;
  IsTaxIncluded: boolean;
  PurchaseOrderId?: number;
  PurchaseOrderNumber?: number;
  PurchaseOrderLineNumber: number;
  PurchaseOrderLineReference: number;
  PurchaseOrderTransactions?: number;
  StartDate: number;
  StatusId?: number;
  WorkOrderPurchaseOrderLines: Array<WOPOLines>;
  CreatedDatetime?: number;
  LastModifiedDatetime?: any;
  PurchaseOrderDepletionGroupId?: number;
  FundCommitted?: number;
  AllocNotes?: string;
}

export interface WOPOLines {
  Id?: number;
  WorkOrderId?: number;
  PurchaseOrderLineId?: number;
  PurchaseOrderLineCurrencyId?: number;
  PurchaseOrderLineStatusId?: number;
  Amount?: number;
  AmountCommited?: number;
  StatusId?: number;
  IsDraft?: boolean;
  AllocationNote?: string;
  LastModifiedByProfileId?: number;
  LastModifiedByContactName?: string;
  LastModifiedDatetime?: Date;
  CreatedByProfileId?: number;
  CreatedByContactName?: string;
  CreatedDatetime?: number;
  AssignmentId?: number;
  WorkOrderStartDate?: number;
  WorkOrderEndDate?: number;
  WorkOrderNumber?: number;
  WorkOrderFullNumber?: number;
  PurchaseOrderId?: number;
  PurchaseOrderDepletionGroupId?: number;
  PurchaseOrderDescription?: number;
  PurchaseOrderLineEndDate?: number;
  PurchaseOrderLineNumber?: number;
  PurchaseOrderLineStartDate?: null;
  PurchaseOrderNumber?: number;
  OrganizationId?: number;
  OrganizationLegalName?: string;
  AmountAllowed?: number;
  AmountReserved?: number;
  AmountSpent?: number;
  AmountTotal?: number;
  AmountRemaining?: number;
}

export interface IWorkorderSetup {
  LineOfBusinessId: number;
  AtsPlacementId: number;
  AtsSourceId: number;
}

export interface IWorkorderNew {
  AtsSourceId: number;
  AtsPlacementId: number;
  StartDate?: string;
  EndDate?: string;
  BillingRateUnitId?: number;
  PaymentRateUnitId?: number;
  BillingRates?: IBillingRateSetUp[];
  PaymentRates?: IPaymentRateSetUp[];
  AtsOrganizationIdClient?: number;
  AtsOrganizationClientDisplayName?: string;
  AtsUserProfileIdWorker?: number;
  AtsUserProfileWorkerName?: string;
  SuggestedOrganizationIdClient?: number;
  SuggestedOrganizationClientLegalName?: string;
  SuggestedUserProfileIdWorker?: number;
  SuggestedUserProfileWorkerName?: string;
  MappedOrganizationIdClient?: number;
  MappedUserProfileIdWorker?: number;
  TemplateId: number;
}
export interface IBillingRateSetUp {
  RateTypeId?: number;
  Rate?: number;
}

export interface IPaymentRateSetUp {
  RateTypeId?: number;
  Rate?: number;
  IsApplyDeductions?: boolean;
  IsApplyVacation?: boolean;
  IsApplyStatHoliday: boolean;
}

export interface IWOSaveTemplate {
  templateName: string;
  templateDescription: string;
}
