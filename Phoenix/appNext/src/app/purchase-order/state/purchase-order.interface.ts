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

export interface IPurchaseOrderRouterState {
  purchaseOrderId: number;
  routerPath: PhxConstants.OrganizationNavigationName;
  roleType?: PhxConstants.OrganizationRoleType;
  roleId?: number;
  url: string;
}

export interface IPurchaseOrderValidationError {
  ValidationErrors: Array<string>;
}

export interface IRoot {
  PurchaseOrderId: number;
  TabDetails: ITabDetails;
}

export interface ITabDetails {
  PurchaseOrderId: number;
  TabDetailsDetail: ITabDetailsDetail;
  // TabDetailsAddresses: ITabDetailsAddresses;
}
export interface ITabDetailsAddresses {
  OrganizationAddresses: Array<IOrganizationAddress>;
  OrganizationId: number;
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

export interface IPurchaseOrderDto {
  Id: number;
  AssignmentId: number;
  WorkOrderCreationReasonId: number;
  StatusId: number;
  StartDate: number;
  EndDate: number;
  TerminationDate: number;
  IsDraft: boolean;
  WorkOrderPurchaseOrderLines: number;
  WorkOrderNumber: number;
  SourceId: number;
  TransactionHeaderCount: number;
  WorkOrderVersionActiveCount: number;
  // WorkOrderVersions: Array<WorkOrderVersionDto>;
  _IsWorkflowRunning: boolean;
  IsWorkflowRunning: boolean;
}

export interface IPurchaseOrder {
  AccessActions?: Array<AccessAction>;
  readonly ReadOnlyStorage?: IReadOnlyStorage;
  Id?: number;
  StatusId?: number;
  PurchaseOrderId?: number;
  PurchaseOrderLineNumber?: number;
  PurchaseOrderLineReference?: number;
  StartDate?: string;
  EndDate?: string;
  Amount?: number;
  CurrencyId?: number;
  IsTaxIncluded?: number;
  DepletionOptionId?: number;
  DepletionGroupId?: number;
  Description?: string;
  IsDraft?: boolean;
  WorkOrderPurchaseOrderLines?: number;
  LastModifiedDatetime?: Date;
  PurchaseOrderLines?: Array<POLines>;
  Versions?: Array<IVersion>;
  RootObject?: IAssignmentDto;
  // added by Eldhose
  OrganizationId?: number;
  DepletedActionId?: number;
  PurchaseOrderNumber?: number;
  InvoiceRestrictionId?: number;
  deletedPurchaseOrderLines?: Array<any>;
  TotalFund?: number;
  FundCommitted?: number;
  FundSpent?: number;
}

export interface IAssignmentDto {
  Id: number;
  IsDraft: boolean;
  StatusId: PhxConstants.AssignmentStatus;
  WorkOrders: Array<IPurchaseOrderDto>;
  UserProfileIdWorker: number;
  OrganizationIdInternal: number;
  OrganizationCode: string;
  AtsSourceId: number;
  AtsPlacementId: number;
  _IsWorkflowRunning: boolean;
  IsWorkflowRunning: boolean;
  WorkflowAvailableActions: Array<WorkflowAction>;
  AccessActions: Array<AccessAction>;
  AccessLevelId: number;
  readonly ReadOnlyStorage: IReadOnlyStorage;
  // added
  PurchaseOrderValidationErrors: Array<IPurchaseOrderValidationError>;
  // check and remove
  WorkflowPendingTaskId?: number;


}

export interface POLines {
  Amount?: number;
  CurrencyId?: number;
  DepletionOptionId?: number;
  DepletionGroupId?: number;
  Description?: string;
  EndDate?: string;
  Id?: number;
  IsDraft?: boolean;
  IsTaxIncluded?: boolean;
  PurchaseOrderId?: number;
  PurchaseOrderNumber?: number;
  PurchaseOrderLineNumber?: number;
  PurchaseOrderLineReference?: string;
  PurchaseOrderTransactions?: number;
  StartDate?: string;
  StatusId?: number;
  WorkOrderPurchaseOrderLines?: Array<WOPOLines>;
  CreatedDatetime?: string;
  LastModifiedDatetime?: any;
  PurchaseOrderDepletionGroupId?: number;
}

export interface WOPOLines {
  Id: number;
  WorkOrderId: number;
  PurchaseOrderLineId: number;
  PurchaseOrderLineCurrencyId: number;
  PurchaseOrderLineStatusId: number;
  Amount: number;
  AmountCommited: number;
  StatusId: number;
  IsDraft: boolean;
  AllocationNote: string;
  LastModifiedByProfileId: number;
  LastModifiedByContactName: string;
  LastModifiedDatetime: Date;
  CreatedByProfileId: number;
  CreatedByContactName: string;
  CreatedDatetime: number;
  AssignmentId: number;
  WorkOrderStartDate: number;
  WorkOrderEndDate: number;
  WorkOrderNumber: number;
  WorkOrderFullNumber: number;
  PurchaseOrderId: number;
  PurchaseOrderDepletionGroupId: number;
  PurchaseOrderDescription: number;
  PurchaseOrderLineEndDate: number;
  PurchaseOrderLineNumber: number;
  PurchaseOrderLineStartDate: null;
  PurchaseOrderNumber: number;
  OrganizationId: number;
  OrganizationLegalName: string;
  AmountAllowed: number;
  AmountReserved: number;
  AmountSpent: number;
  AmountTotal: number;
  AmountRemaining: number;
  IsWorkflowRunning: boolean;
}




////////////////////////////////////////////////////
/*
                  Details Tab
                  ---------
*/
///////////////////////////////////////////////////

export interface IDetailsTabRoot {
  PurchaseOrderId: number;
  Details: ITabDetailsDetail;
}
export interface ITabDetailsDetail {
  Id?: number;
  StatusId?: number;
  PurchaseOrderId?: number;
  PurchaseOrderLineNumber?: number;
  PurchaseOrderLineReference?: number;
  StartDate?: string;
  EndDate?: string;
  Amount?: number;
  CurrencyId?: number;
  IsTaxIncluded?: number;
  DepletionOptionId?: number;
  DepletionGroupId?: number;
  Description?: string;
  IsDraft?: boolean;
  WorkOrderPurchaseOrderLines?: number;
  LastModifiedDatetime?: Date;
  PurchaseOrderLines?: Array<POLines>;
  // added by Eldhose
  OrganizationId?: number;
  DepletedActionId?: number;
  PurchaseOrderNumber?: number;
  InvoiceRestrictionId?: number;
  deletedPurchaseOrderLines?: Array<any>;
  TotalFund?: number;
  FundCommitted?: number;
  FundSpent?: number;
}

export interface POLineNew {
  Amount: number;
  CurrencyId: number;
  DepletionOptionId: number;
  DepletionGroupId: number;
  Description: string;
  EndDate: string;
  Id: number;
  IsDraft?: boolean;
  IsTaxIncluded: boolean;
  PurchaseOrderId?: number;
  PurchaseOrderNumber?: number;
  PurchaseOrderLineNumber: number;
  PurchaseOrderLineReference: string;
  PurchaseOrderTransactions?: number;
  StartDate: string;
  StatusId?: number;
  WorkOrderPurchaseOrderLines: Array<WOPOLines>;
  CreatedDatetime?: string;
  LastModifiedDatetime?: any;
  PurchaseOrderDepletionGroupId?: number;
  FundCommitted?: number;
  AllocNotes?: string;
}



export interface IReadOnlyStorage {
  readonly IsEditable: boolean;
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

export interface IPurchaseOrderAddress {
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

export interface IPurchaseOrderTaxNumber {
  Id: number;
  SalesTaxId: number;
  SalesTaxNumber: string;
  // IsDraft: boolean;
  OrganizationId: number;
}

export interface IPurchaseOrderClientRoleLOB {
  Id: number;
  OrganizationClientRoleId: number;
  LineOfBusinessId: PhxConstants.LineOfBusiness;
  IsSelected: boolean;
  // IsDraft: boolean;
}


export interface ITabRoles {
  OrganizationTaxNumbers: number;
  OrganizationClientRoles: number;
  OrganizationInternalRoles: number;
  OrganizationIndependentContractorRoles: number;
  OrganizationLimitedLiabilityCompanyRoles: number;
  OrganizationSubVendorRoles: number;
}

export interface IWorkflowButton {
  save: boolean;
  submit: boolean;
  edit: boolean;
  discard: boolean;
  cancel: boolean;
  showAddLine: boolean;
  showDeleteLine: boolean;
}
