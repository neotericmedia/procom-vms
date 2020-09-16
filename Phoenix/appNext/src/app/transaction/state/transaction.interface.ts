import { AccessAction } from '../../common/model/access-action';
import { CustomFieldService } from '../../common/index';
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

export interface IRouterState {
    Id: number;
    RouterPath: string;
    Url: string;
}

export interface IRoot {
  Id: number;
  Header: IHeader;
  Details: IDetails;
  IsDebounce: boolean;
}

export interface IHeader {
  TransactionCategoryId: number;
  StartDate: string;
  EndDate: string;
}
export interface IDetails {
  Notes: Array<ITransactionDetailsNotes>;
  StatHoliday: Array<IPaymentTransactions>;
  TransactionLines: Array<ITransactionLines>;
  // GrossProfit: IGrossProfit;
}

export interface ITransactionDetailsNotes {
  InvoiceNote1: string;
  InvoiceNote2: string;
  InvoiceNote3: string;
  InvoiceNote4: string;
  IsInternalTransaction: boolean;
}
export interface ITransactionDetailsNotes {
  InvoiceNote1: string;
  InvoiceNote2: string;
  InvoiceNote3: string;
  InvoiceNote4: string;
  IsInternalTransaction: boolean;
}

export interface IPaymentTransactions {
  Id: number;
  PaymentTransactionLines: Array<IPaymentTransactionLines>;
}

export interface IPaymentTransactionLines {
  Id: number;
  Description: string;
  Date: string;
  Units: number;
  UnitsOverwrite: number;
  Rate: number;
  Total: number;
  RateUnitId: number;
  RateTypeId: number;
}

export interface ITransactionLines {
  LineNumber: number;
  RateTypeId: number;
  Billings: Array<any>;
  Payments: Array<any>;
  RateTypeList: Array<any>;
}

export interface IBilling {
  Id: number;
  TransactionLine: any;
  Hours: number;
  OrganizationIdClient: number;
  OrganizationClientDisplayName: string;
  OrganizationIdInternal: number;
  OrganizationInternalLegalName: string;
  VersionRates: any;
  SubdivisionId: number;
  CurrencyId: number;
  PreTaxTotal: number;
  SalesTaxTotal: number;
  Total: number;
  BillingTransactionLineSalesTaxes: any;
}

export interface IPayments {
  Id: number;
  TransactionLine: any;
  Hours: number;
  RateTypeId: number;
  PayeeName: string;
  PayeeOrganizationIdSupplier: number;
  PayeeUserProfileWorkerId: number;
  VersionRates: any;
  SubdivisionId: number;
  CurrencyId: number;
  PreTaxTotal: number;
  SalesTaxTotal: number;
  Total: number;
  PaymentTransactionLineSalesTaxes: any;
}

export interface AccessAction {
  AccessAction: number;
}

export interface IVmsProcessedRecordWorkOrderVersionAllocation {
  Id: number;
  VmsProcessedRecordId: number;
  WorkOrderVersionId: number;
  LastModifiedByProfileId: number;
  LastModifiedDatetime?: any;
  CreatedByProfileId: number;
  CreatedDatetime?: any;
  TransactionStartDate: string;
  TransactionEndDate: string;
  V1RateTypeId: number;
  V1BillRate: number;
  V1BillUnits: number;
  V2RateTypeId?: any;
  V2BillRate?: any;
  V2BillUnits: number;
  WorkOrderVersionNumber: string;
  WOVFirstName: string;
  WOVLastName: string;
}

export interface IVmsProcessedRecord {
  Id: number;
  OrganizationIdInternal: number;
  OrganizationIdClient: number;
  WorkOrderReference: string;
  FirstName: string;
  LastName: string;
  UserNotes?: any;
  V1RateTypeId: number;
  V1BillRate: number;
  V1BillUnits: number;
  V2RateTypeId?: any;
  V2BillRate?: any;
  V2BillUnits: number;
  StartDate: string;
  EndDate: string;
  TimeSheetStatusId: number;
  InvoiceReference: string;
  ValidationMessages: string;
  ImportDate: Date;
  LastModifiedByProfileId: number;
  LastModifiedDatetime: Date;
  CreatedByProfileId: number;
  CreatedDatetime: Date;
  VmsImportedRecordTypeId: number;
  SharedBenefitSourceDeductionList?: any;
  VmsProcessedRecordWorkOrderVersionAllocations: IVmsProcessedRecordWorkOrderVersionAllocation[];
}

export interface IVersionRate {
  RateTypeId: number;
  Rate: number;
  RateUnitId: number;
}

export interface ISalesTaxVersionRate {
  Id: number;
  SalesTaxId: number;
  EffectiveDate: string;
  SubdivisionId: number;
  IsApplied: boolean;
  RatePercentage: number;
  CalculationLevel: number;
  DefaultLevel: number;
  HasNumberAssigned: boolean;
  TaxVersionStatusId: number;
}

export interface IBillingTransactionLineSalesTax {
  Amount: number;
  BillingTransactionLineId: number;
  Id: number;
  Rate: number;
  SalesTaxVersionRateId: number;
  TaxNumber: string;
  SalesTaxVersionRate: ISalesTaxVersionRate;
}

export interface IBillingTransactionLine {
  Id: number;
  BillingInfoId: number;
  BillingTransactionId: number;
  LineNumber: number;
  Description: string;
  RateUnitId: number;
  Units: number;
  Hours: number;
  RateTypeId: number;
  Rate: number;
  Amount: number;
  SubdivisionId: number;
  VersionRates: IVersionRate[];
  ReversedBillingTransactionLineId?: any;
  BillingTransactionLineNumber: string;
  BillingTransactionLineSalesTaxes: IBillingTransactionLineSalesTax[];
}

export interface BillingTransaction {
  Id: number;
  WorkOrderId: number;
  TransactionHeaderId: number;
  DetailNumber: number;
  CurrencyId: number;
  BillingDate: string;
  StartDate: string;
  EndDate: string;
  BillingTransactionNumber: string;
  ReversedBillingTransactionId?: any;
  OrganizationIdClient: number;
  OrganizationClientDisplayName: string;
  PartyName: string;
  OrganizationIdInternal: number;
  OrganizationInternalLegalName: string;
  PurchaseOrderLineId?: any;
  InvoiceNote1: string;
  InvoiceNote2: string;
  InvoiceNote3: string;
  InvoiceNote4: string;
  IsInternalTransaction: boolean;
  BillingTransactionPaymentStatus: number;
  TotalAmount: number;
  VmsDiscountProcessedRecordId?: any;
  PurchaseOrderLine?: any;
  BillingTransactionLines: IBillingTransactionLine[];
  BillingTransactionARPayment: any[];
  BillingTransactionARPaymentAmount: number;
  CurrencyCode?: string;
}

export interface IVersionRate2 {
  IsApplyDeductions: boolean;
  IsApplyVacation: boolean;
  RateTypeId: number;
  Rate: number;
  RateUnitId: number;
}

export interface ISalesTaxVersionRate2 {
  Id: number;
  SalesTaxId: number;
  EffectiveDate: string;
  SubdivisionId: number;
  IsApplied: boolean;
  RatePercentage: number;
  CalculationLevel: number;
  DefaultLevel: number;
  HasNumberAssigned: boolean;
  TaxVersionStatusId: number;
}

export interface IPaymentTransactionLineSalesTax {
  Amount: number;
  Id: number;
  PaymentTransactionLineId: number;
  Rate: number;
  SalesTaxVersionRateId: number;
  TaxNumber: string;
  SalesTaxVersionRate: ISalesTaxVersionRate2;
}

export interface IPaymentTransactionLine {
  Id: number;
  PaymentInfoId: number;
  RateUnitId: number;
  Hours: number;
  PaymentTransactionId: number;
  LineNumber: number;
  Description: string;
  Units: number;
  RateTypeId: number;
  Rate: number;
  Date?: any;
  UnitsOverwrite?: any;
  PaidHolidayId?: any;
  IsApplyDeductions: boolean;
  IsApplyVacation: boolean;
  Amount: number;
  ReversedPaymentTransactionLineId?: any;
  PaymentTransactionLineNumber: string;
  SubdivisionId: number;
  VersionRates: IVersionRate2[];
  PaymentTransactionLineSalesTaxes: IPaymentTransactionLineSalesTax[];
  PaymentTransactionLineStatHolidayDetails: any[];
}

export interface PaymentTransaction {
  Id: number;
  WorkOrderId: number;
  TransactionHeaderId: number;
  DetailNumber: number;
  IsPaymentStopped?: any;
  CurrencyId: number;
  PaymentDate: string;
  PlannedReleaseDate: string;
  StartDate: string;
  EndDate: string;
  PaymentTransactionNumber: string;
  ReversedPaymentTransactionId?: any;
  PayeeName: string;
  PayeeOrganizationIdSupplier: number;
  PayeeUserProfileWorkerId?: any;
  PurchaseOrderLineId?: any;
  VmsUnitedStatesSourceDeductionProcessedRecordId?: any;
  AdvanceTotal: number;
  GarnisheeTotal: number;
  SourceDeductionTotal: number;
  OtherEarningTotal: number;
  TotalAmount: number;
  EmployerCPPAmountAfterMaxDeduction: number;
  EmployerEIAmountAfterMaxDeduction: number;
  EmployerQPIPAmountAfterMaxDeduction?: any;
  EmployerQPPAmountAfterMaxDeduction?: any;
  EmployerHealthTaxLiabilityAmount?: any;
  CreatedDatetime: string;
  PurchaseOrderLine?: any;
  PaymentTransactionLines: IPaymentTransactionLine[];
  CurrencyCode?: string;
}

export interface IWorkflowAvailableAction {
  WorkflowPendingTaskId: number;
  PendingCommandName: string;
  IsActionButton: boolean;
  TaskResultId: number;
  TaskRoutingDialogTypeId: number;
  Id: number;
  Name: string;
  CommandName: string;
  DisplayButtonOrder: number;
  DisplayHistoryEventName: string;
}

export interface ITransactionHeader {
  AccessActions: AccessAction[];
  Id: number;
  TransactionTypeId: number;
  TransactionCategoryId?: any;
  TransactionHeaderStatusId: number;
  TimeSheetId: number;
  OrganizationIdInternal: number;
  OrganizationInternalCode: string;
  IsDraft: boolean;
  TransactionReference: string;
  TransactionNumber: string;
  TransactionDate: string;
  StartDate: string;
  EndDate: string;
  FromDate: string;
  ToDate: string;
  Subtotal: number;
  Tax: number;
  Total: number;
  PaymentSubtotal: number;
  PaymentTax: number;
  PaymentDeductions: number;
  PaymentTotal: number;
  PONumber?: any;
  LineOfBusinessId: number;
  AssignmentId: number;
  WorkOrderId: number;
  WorkOrderNumber: number;
  WorkOrderVersionId: number;
  WorkOrderFullNumber: string;
  WorkerUserProfileId: number;
  WorkerName: string;
  PayeeName: string;
  ClientCompany: string;
  IsTest: boolean;
  AlternateBillingClient?: any;
  InvoiceNote1: string;
  VmsProcessedRecord: IVmsProcessedRecord;
  VmsExpenseProcessedRecord?: any;
  VmsCommissionProcessedRecord?: any;
  VmsFixedPriceProcessedRecord?: any;
  BillingTransactions: BillingTransaction[];
  PaymentTransactions: PaymentTransaction[];
  ExcludedBillSalesTaxes: any[];
  ExcludedPaySalesTaxes: any[];
  ExcludedEarningAndSourceDeductions: any[];
  WorkflowAvailableActions: IWorkflowAvailableAction[];
  isTransactionCalculation: boolean;
  CurrencyCode: string;
  TransactionCalculation?: any;
  GroupedTransactionLinesByLineNumber?: any;
  IsDebounce: boolean;
  TransactionType?: string;
  IsPaymentStopped?: boolean;
}
