import { WorkflowAction } from '../../common/model/workflow-action';
import { AccessAction } from '../../common/model/access-action';
import { PhxConstants, CustomFieldService } from '../../common/index';
import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { HashModel } from '../../common/utility/hash-model';
import { StateAction } from '../../common/model/state-action';

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
    contactId: number;
    routerPath: PhxConstants.ContactNavigationName;
    roleType?: PhxConstants.OrganizationRoleType;
    roleId?: number;
    url: string;
}

export interface IProfileValidationError {
    ValidationErrors: Array<string>;
}

export interface IAccessAction {
    AccessAction: number;
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

export interface IAccessAction {
    AccessAction: number;
}

export interface IReadOnlyStorage {
    readonly IsEditable: boolean;
    readonly IsDebugMode: boolean;
    readonly AccessActions: Array<AccessAction>;
}

export interface IRoot {
    // ContactId: number;
    ProfileId: number;
    TabContact: ITabContact;
}

export interface ITabProfiles {
    OrganizationalProfile?: IOrganizationalProfile;
    InternalProfile?: IInternalProfile;
    TempProfile?: ITempProfile;
    CanadianIncProfile?: ICanadianIncProfile;
    CanadianEngagementSubVendorProfile?: ICanadianEngagementSubVendorProfile;
    W2WorkerProfile?: IW2WorkerProfile;
    LLCWorkerProfile?: ILLCWorkerProfile;
    CanadianSPProfile?: ICanadianSPProfile;
}

export interface ITabContact {
    TabContactDetail: ITabContactDetail;
    TabProfiles?: ITabProfiles;
}

export interface ITabContactDetail {
    PersonTitleId: number;
    PreferredPersonTitleId: number;
    FirstName: string;
    PreferredFirstName: string;
    LastName: string;
    PreferredLastName: string;
    CultureId: number;
    CreatedByName: string;
    AssignedToUserProfileId: number;
    LoginUserId?: number;
}

export interface IContact {
    Id: number;
    LoginUserId?: number;
    SourceId?: number;
    FirstName: string;
    LastName: string;
    CultureId: number;
    UserStatusId: number;
    PersonTitleId: number;
    PreferredPersonTitleId: number;
    PreferredFirstName: string;
    PreferredLastName: string;
    IsDraft: boolean;
    AssignedToUserProfileId: number;
    CreatedByName: string;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
    ModifiedBy?: number;
    UserProfiles: any[];
    FullName: string;
    AccessActions?: any;
    InvitationSent?: any;
    IsDraftStatus: boolean;
    EditorUserProfileName: string;
}

export interface IProfileHeader {
    Id: number;
    ContactId: number;
    IsPrimary: boolean;
    LastModifiedObjDatetime: Date;
    OrganizationId: number;
    OrganizationLegalName?: any;
    ProfileEmail: string;
    ProfileGroupId: number;
    ProfileGroupName: string;
    ProfileIcon: string;
    ProfileTitle: string;
    ProfileTypeCode: string;
    ProfileTypeId: number;
    ProfileTypeName: string;
}

export interface IOrganizationBase {
    Id: number;
    IsTest: boolean;
    Code?: any;
    DisplayName: string;
}

export interface IOrganization extends IOrganizationBase {
    WorkflowPendingTaskId?: number;
    AccessActions?: Array<IAccessAction>;
    WorkflowAvailableActions?: Array<IWorkflowAvailableAction>;
    SourceId?: any;
    IdOriginal: number;
    OrganizationStatusId: number;
    IsPendingReview: boolean;
    IsOriginal: boolean;
    IsOriginalAndStatusIsAtiveOrPendingChange: boolean;
    LegalName: string;
    IsDraft: boolean;
    ModifiedBy?: any;
    ParentOrganizationId: number;
    IndustryTypeId?: number;
    SectorTypeId?: number;
    CountryId: number;
    DefaultTaxSubdivisionId?: number;
    IsOrganizationClientRole: boolean;
    IsOrganizationInternalRole: boolean;
    IsOrganizationIndependentContractorRole: boolean;
    IsOrganizationLimitedLiabilityCompanyRole: boolean;
    IsOrganizationSubVendorRole: boolean;
    ActiveAdvancesCount: number;
    ActiveGarnisheesCount: number;
    AssignedToUserProfileId?: number;
    CreatedByName?: string;
    IsWorkflowRunning: boolean;
    Title: string;
    ParentOrganization?: any;
    Versions?: any;
    OrganizationAddresses?: any;
    OrganizationTaxNumbers?: any;
    OrganizationClientRoles?: any;
    OrganizationInternalRoles?: any;
    OrganizationIndependentContractorRoles?: any;
    OrganizationLimitedLiabilityCompanyRoles?: any;
    OrganizationSubVendorRoles?: any;
}

export interface IUserProfilePhone {
    Id: number;
    SourceId?: any;
    UserProfileId: number;
    ProfilePhoneTypeId: number;
    Phone: string;
    Extension: string;
    IsDraft: boolean;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
}

export interface IUserProfileFunctionalRole {
    Id: number;
    SourceId?: any;
    UserProfileId: number;
    FunctionalRoleId: number;
    IsDraft: boolean;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
}

export interface IProfileBasicDetails {
    PrimaryEmail?: string;
    ProfileTypeId?: number;
    IsPrimary?: boolean;
}

export interface IContactInfo {
    UserProfileAddresses?: IUserProfileAddress[];
    UserProfilePhones?: IUserProfilePhone[];
}

export interface IOrganizationInfo {
    OrganizationId?: number;
    Department?: string;
    ReportsToProfileId?: number;
    InternalOrganizationDefinition1Id?: number;
    UserProfileIdOrgRep?: any;
}

// tslint:disable-next-line:no-empty-interface
export interface IOrganizationalProfile extends IProfileBasicDetails, IContactInfo, IOrganizationInfo {

}

export interface IInternalProfile extends IProfileBasicDetails, IContactInfo, IOrganizationInfo, IInternalCommission {
    UserProfileFunctionalRoles: IUserProfileFunctionalRole[];
}

export interface IInternalCommission extends ISalesTaxNumber {
    IsCommissionEligible: boolean;
    IsIncorporated: boolean;
    PayeeName?: string;
    CommissionStructureTypeId?: number;
}

export interface IWorkerEligibility {
    WorkerEligibilityId?: number;
    TemporaryForeignPermitTypeId?: number;
    IsWorkerOnImpliedStatus?: boolean;
    ImpliedStatusEffectiveDate?: Date;
    EligibilityForWorkPermitId?: number;
    WorkPermitNumber?: number;
    WorkPermitTypeId?: number;
    WorkPermitRestrictions?: string;
    WorkPermitExpiryDate?: Date;
    IECCategoryStudentTypeId?: number;
    ClosedWorkPermitCompany?: string;
}

export interface IPayrollSetup {
    IsBasicSetup?: boolean;
    FederalTD1?: number;
    ProvincialTD1?: number;
    TD1XTotalRemuneration?: number;
    TD1XCommissionExpenses?: number;
    TaxSubdivisionId?: number;
    UserProfileWorkerSourceDeductions?: IUserProfileWorkerSourceDeduction[];
    UserProfileWorkerOtherEarnings?: IUserProfileWorkerOtherEarning[];
}

export interface IPaymentMethod {
    UserProfilePaymentMethods?: IUserProfilePaymentMethod[];
    PayeeName?: string;
    PaymentPreference?: number;
}

export interface IBenefitSetup {
    UserProfileWorkerBenefits?: IUserProfileWorkerBenefit[];
    IsApplyBenefit?: boolean;
}

export interface ITempProfile extends IProfileBasicDetails, IContactInfo,
    IWorkerEligibility, IPayrollSetup, IPaymentMethod, IBenefitSetup {
    DateOfBirth?: Date;
    SIN?: string;
}

export interface ICanadianSPProfile extends IProfileBasicDetails, IContactInfo,
    IWorkerEligibility, IPayrollSetup, ISalesTaxNumber, IPaymentMethod {
    CorporationName: string;
    BusinessNumber: number;
    SIN: string;
    DateOfBirth?: Date;
    IsApplyWorkerSPGovernmentRuling?: boolean;
    UserProfileWorkerSPGovernmentRulings?: IUserProfileWorkerSPGovernmentRuling[];
}

export interface IUserProfileWorkerSPGovernmentRuling {
    Id: number;
    OrganizationIdClient?: number;
    RulingNumber?: string;
    EffectiveYear?: number;
    EffectiveYearDate?: Date;
}

export interface ICanadianIncProfile extends IProfileBasicDetails, IContactInfo, IWorkerEligibility, IOrganizationInfo {
}

export interface ICanadianEngagementSubVendorProfile extends IProfileBasicDetails, IContactInfo, IWorkerEligibility
    , IOrganizationInfo {
}

export interface ISalesTaxNumber {
    UserProfileWorkerSPTaxNumbers?: IUserProfileWorkerSPTaxNumber[];
    UserProfileInternalTaxNumbers?: IUserProfileWorkerSPTaxNumber[];
    SelectedType?: IUserProfileWorkerSPTaxNumber[];
}

export interface IW2WorkerProfile extends IProfileBasicDetails, IContactInfo, IPaymentMethod, IBenefitSetup, IWorkerEligibility {
    SSN: string;
    DateOfBirth: Date;
}

export interface ILLCWorkerProfile extends IProfileBasicDetails, IContactInfo, IWorkerEligibility
    , IOrganizationInfo {
}

export interface IUserProfileWorkerSPTaxNumber {
    Id?: number;
    UserProfileId?: number;
    SourceId?: number;
    SalesTaxId?: number;
    SalesTaxNumber?: string;
    ProfileTypeId?: number;
    IsDraft?: boolean;
    CreatedByProfileId?: number;
    CreatedDatetime?: Date;
    LastModifiedByProfileId?: number;
    LastModifiedDatetime?: Date;
}

export interface IWorkerDocument {
    Id: number;
    PublicId: string;
    PdfDocumentPublicId: string;
    Name: string;
    Extension: string;
    Size: number;
    Description: string;
    EntityTypeId: number;
    EntityId: number;
    DocumentTypeId: number;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    UploadedByProfileId: number;
    UploadedDatetime: Date;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
    UploadedByContactFirstName: string;
    UploadedByContactLastName: string;
    UploadedByFullName: string;
    ESignedStatusId: number;
}

export interface IUserProfileAddress {
    Id?: number;
    SourceId?: any;
    UserProfileId?: number;
    ProfileAddressTypeId?: number;
    CountryId?: number;
    CityName?: string;
    AddressLine1?: string;
    AddressLine2?: string;
    SubdivisionId?: number;
    PostalCode?: string;
    IsDraft?: boolean;
    CreatedByProfileId?: number;
    CreatedDatetime?: Date;
    LastModifiedByProfileId?: number;
    LastModifiedDatetime?: Date;
}

export interface IUserProfileWorkerSourceDeduction {
    Id?: number;
    UserProfileWorkerId?: number;
    SourceId?: number;
    SourceDeductionTypeId?: number;
    IsApplied?: boolean;
    RatePercentage?: any;
    RateAmount?: number;
}

export interface IUserProfileWorkerOtherEarning {
    Id?: number;
    UserProfileWorkerId?: number;
    PaymentOtherEarningTypeId?: number;
    IsApplied?: boolean;
    IsAccrued?: boolean;
    RatePercentage?: number;
    SourceId?: number;
}

export interface IUserProfileWorkerBenefit {
    UId?: string;
    Id: number;
    UserProfileWorkerId: number;
    SourceId: number;
    BenefitTypeId: number;
    OrganizationIdInternal: number;
    IsActive: boolean;
    EmployerAmount: number;
    EmployeeAmount: number;
    EffectiveDate: Date;
    IsNew: boolean;
}

export interface IProfile {
    BranchId?: number;
    AvailableStateActions: StateAction [];

    AccessActions: AccessAction[];
    readonly ReadOnlyStorage: IReadOnlyStorage;
    ContactValidationErrors: Array<IProfileValidationError>;
    Id: number;
    IdOriginal: number;
    ContactId: number;
    SourceId?: any;
    SourceContactId?: any;
    ChildId?: any;
    ChildContactId?: any;
    PrimaryEmail?: string;
    ProfileTypeId: number;
    ProfileStatusId: number;
    ChildProfileStatusId?: any;
    IsPrimary?: boolean;
    OrganizationId?: number;
    IsDraft: boolean;
    ActiveAdvancesCount: number;
    ActiveGarnisheesCount: number;
    CreatedByProfileId?: number;
    CreatedDatetime?: Date;
    LastModifiedByProfileId?: number;
    LastModifiedDatetime?: Date;
    Contact?: IContact;
    Organization?: IOrganization;
    PaymentPreference?: number;
    UserProfileAddresses?: IUserProfileAddress[];
    UserProfilePhones?: IUserProfilePhone[];
    UserProfileFunctionalRoles: IUserProfileFunctionalRole[];
    Department?: any;
    ReportsToProfileId?: any;
    ContactProfileTypes: number[];
    IsDraftStatus: boolean;
    ValidateComplianceDraft: boolean;
    AreComplianceFieldsEditable: boolean;
    isProfileW2OrTempOrSP: boolean;
    isProfileW2OrTemp: boolean;
    isProfileTempOrSP: boolean;
    isProfileSP: boolean;
    ProfileTypeCode: string;
    UserProfilePaymentMethods?: IUserProfilePaymentMethod[];
    UserProfileWorkerSourceDeductions: IUserProfileWorkerSourceDeduction[];
    UserProfileWorkerOtherEarnings: IUserProfileWorkerOtherEarning[];
    InternalOrganizationDefinition1Id?: number;
    SelectedType?: IUserProfileWorkerSPTaxNumber[];
    UserProfileInternalTaxNumbers?: IUserProfileWorkerSPTaxNumber[];
    UserProfileWorkerSPTaxNumbers?: IUserProfileWorkerSPTaxNumber[];
    IsApplyWorkerSPGovernmentRuling?: boolean;
    UserProfileWorkerSPGovernmentRulings?: IUserProfileWorkerSPGovernmentRuling[];
    UserProfileId: number;
    CommandName: string;
    CommandId: string;
    isReload?: boolean;
    DateOfBirth: Date;
    IsCommissionEligible: boolean;
    IsIncorporated: boolean;
    PayeeName?: string;
    CommissionStructureTypeId?: number;
    SIN: string;
    SSN: string;
    FederalTD1: any;
    ProvincialTD1: any;
    TD1XTotalRemuneration: number;
    TD1XCommissionExpenses: number;
    CorporationName: any;
    TaxSubdivisionId: number;
    UserProfileIdOrgRep: string;
    UserProfileOrgRep: any;
    IsBasicSetup: boolean;
    IsApplyBenefit: boolean;
    UserProfileWorkerBenefits: IUserProfileWorkerBenefit[];
    BusinessNumber: number;
    WorkerEligibilityId?: number;
    TemporaryForeignPermitTypeId?: number;
    IsWorkerOnImpliedStatus: boolean;
    ImpliedStatusEffectiveDate?: Date;
    IECCategoryStudentTypeId: number;
    EligibilityForWorkPermitId: number;
    WorkPermitNumber: number;
    WorkPermitTypeId: number;
    ClosedWorkPermitCompany: string;
    WorkPermitRestrictions: any;
    WorkPermitExpiryDate: Date;
    PaymentMethodId: number;
    BankCode: string;
    BankBranchCode: string;
    BankAccountNumber: string;
}

export interface IUserProfilePaymentMethod {
    Id: number;
    UserProfileWorkerId: number;
    SourceId?: number;
    PaymentMethodTypeId: number;
    BankCode?: any;
    BankBranchCode?: string;
    BankAccountNumber?: string;
    ProfileNameBeneficiary?: any;
    NameBeneficiary?: any;
    AccountNumberBeneficiary?: string;
    Address1Beneficiary?: any;
    Address2Beneficiary?: any;
    CityBeneficiary?: any;
    ProvinceOrStateBeneficiary?: any;
    CountryCodeBeneficiary?: any;
    PostalorZipBeneficiary?: any;
    PayCurrencyBeneficiary?: any;
    WireTransferBankTypeIdBeneficiary?: any;
    BankIDBeneficiary?: any;
    ABANoBeneficiary?: any;
    WireTransferBankTypeIdIntemediary?: any;
    BankNameIntemediary?: any;
    BankIdIntemediary?: any;
    Address1Intemediary?: any;
    Address2Intemediary?: any;
    CityIntemediary?: any;
    ProvinceOrStateIntemediary?: any;
    CountryCodeIntemediary?: any;
    PostalOrZipIntemediary?: any;
    WireTransferBankTypeIdReceivers?: any;
    BankNameReceivers?: any;
    BankIdReceivers?: any;
    Address1Receivers?: any;
    Address2Receivers?: any;
    CityReceivers?: any;
    ProvinceOrStateReceivers?: any;
    CountryCodeReceivers?: any;
    PostalOrZipReceivers?: any;
    PaymentDetailNotes?: any;
    EmployeeId?: any;
    IsSelected: boolean;
    IsPreferred: boolean;
}


export interface IGarnisheeRepaymentTransactions {
    PaymentTransactionNumber: string;
    Amount: number;
    ReleaseDate?: string;
    PaymentNumber: string;
    PaymentMethodId?: number;
}

export interface IGarnisheeEdit {
    Id: number;
    IssueDate: string;
    GarnisheeStatusId: number;
    OrganizationIdInternal: number;
    OrganizationInternalLegalName: string;
    GarnisheeOrganizationIdSupplier?: any;
    GarnisheeUserProfileWorkerId: number;
    Description: string;
    ReferenceNumber: string;
    CurrencyId: number;
    PayTypeIsAmount: boolean;
    PayAmountIsMaximum: boolean;
    PayAmount: number;
    PayPercentage?: number;
    PayAmountMaximum: number;
    LastModifiedDatetime: Date;
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
    GarnisheeRepaymentTransactions: Array<IGarnisheeRepaymentTransactions>;
    ProfileTypeId: number;
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
    GarnisheeUserProfileWorkerId: number;
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

export interface IAdvance {
    WorkflowPendingTaskId?: number;
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

export interface IRepaymentTransactions {
    PaymentTransactionNumber: number;
    Amount: number;
    ReleaseDate: number;
    PaymentNumber: string;
    PaymentMethodId: number;
}

export interface IContactWizard {
    PrimaryEmail: string;
    ProfileTypeId?: number;
    OrganizationId?: number;
}
export interface IProfileDetails {
    organization?: any;
    organizationId?: number;
    primaryEmail?: string;
    contactId?: number;
    profiles: any[];
    profileTypeId?: number;
    profileType?: string;
}

export interface ITransactionAdjustment {
    Description?: string;
    WorkOrderId?: number;
    AdjustmentId?: number;
    ReleaseType?: boolean;
    Amount?: Array<ITransactionAdjustmentAmount>;
}

export interface ITransactionAdjustmentAmount {
    EmployeeAmount?: number;
    EmployerAmount?: number;
    ClientAmount?: number;
    ApplicableAdjustmentTypeId?: number;
    EmployeeYtdDeduction?: number;
    EmployerYtdDeduction?: number;
    EntityId?: number;
    EntityName?: string;
    IsApplicableToClient?: boolean;
    IsApplicableToEmployee?: boolean;
    IsApplicableToEmployer?: boolean;
    Name?: string;
    SalesTaxTypeId?: number;
    SourceDeductionTypeId?: number;
    isApplied?: boolean;

    NewYTDWorkerDeduction?: number;
    NewYTDEmployerDeduction?: number;
}

