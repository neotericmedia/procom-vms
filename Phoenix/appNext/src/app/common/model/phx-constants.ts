/*
declare @nl nvarchar(2); set @nl = CHAR(13)+CHAR(10);
--	https://palantir.github.io/tslint/rules/indent/

With enumName as
(
SELECT [TableName]
FROM [dim].[CodeValue]
group by [TableName]
)

SELECT tableName.[TableName]
,CHARINDEX ( '.Code' , tableName.[TableName] )
,'  export enum '
+SUBSTRING   ( tableName.[TableName] ,CHARINDEX ( '.Code' , tableName.[TableName] )+5 , len(tableName.[TableName])   )
+' {'
+REPLACE(contentResult.list,'&#x0D;','')
+@nl
+ '    }'
+@nl
FROM enumName tableName
cross apply (
   	SELECT
   	@nl
   	+ '    '
   	+tableContent.[Code]+' = '+ cast(tableContent.[Id] as varchar) +','
   	from [dim].[CodeValue] as tableContent where tableContent.[TableName] = tableName.[TableName]
   	order by tableContent.[Id]
   	FOR XML PATH('')
   	) as contentResult(list)
where tableName.[TableName] not in (
'app.CodeCulture'
,'compliance.UserDefinedCodeComplianceDocumentType'
,'workorder.CodeInternalOrganizationDefinition1'
,'timesheet.CodeTimeSheetCapsuleStyleShade'
,'geo.CodeSubdivision'
)
order by tableName.[TableName]

*/

export namespace PhxConstants {
  export const MOBILE_WIDTH: number = 600;
  // 	===================	SQL Script result BEGIN	===================================

  export enum AccessSubscriptionRestrictionType {
    InternalOrganization = 1,
    ClientOrganization = 2,
    LineOfBusiness = 3,
    InternalOrganizationDefinition1 = 4
  }

  export enum AccessSubscriptionStatus {
    New = 1,
    Draft = 2,
    PendingReview = 3,
    Active = 4,
    PendingChange = 5,
    Discard = 6,
    DuplicateActive = 7
  }

  export enum AccessSubscriptionType {
    Branch = 2,
    Client = 3
  }

  export enum EntityAccessAction {
    OrganizationView = 1000,
    TimeSheetView = 9000,
    TimeSheetSave = 9001,
    TimeSheetViewBackOffice = 9002,
    ContactView = 10000,
    PurchaseOrderView = 11000,
    TransactionHeaderView = 12000,
    WorkOrderVersionView = 17000,
    BillingTransactionView = 20000,
    PaymentTransactionView = 21000,
    InvoiceView = 22000,
    InvoiceEdit = 22001,
    PaymentView = 23000,
    PaymentReleaseBatchView = 24000,
    FederalTaxHeaderView = 26000,
    ProvincialTaxHeaderView = 27000,
    SalesTaxHeaderView = 30000,
    VmsImportedRecordView = 34000,
    PaymentTransactionGarnisheeView = 35000,
    CommissionRateHeaderView = 40000,
    CommissionTransactionView = 47000,
    CommissionAdjustmentHeaderView = 48000,
    CommissionSalesPatternView = 51000,
    FinancialTransactionView = 57000,
    WCBHeaderView = 65000,
    TemplateView = 66000,
    CommissionReportHeaderView = 73000,
    InternalTeam = 74000,
    AccessSubscriptionView = 75000,
    BranchView = 77000,
    ComplianceDocumentRuleView = 83000,
    UserDefinedCodeComplianceDocumentTypeView = 86000,
    ComplianceDocumentView = 87000,
    WorkerCompensationView = 92000,
    WCBSubdivisionHeaderView = 93000,
    WCBSubdivisionVersionView = 94000,
    ExpenseClaimView = 96000,
    ExpenseClaimSave = 96001,
    ProjectView = 99000,
    ProjectSave = 99001,
    ProjectDiscard = 99002,
    RemittanceTransactionView = 105000,
    ComplianceTemplateView = 116000,
    OrganizationAddContact = 1004,
    OrganizationAddClientRole = 1005,
    OrganizationAddIndependentContractorRole = 1006,
    OrganizationAddInternalRole = 1007,
    OrganizationSubmitClientRole = 1008,
    OrganizationSubmitIndependentContractorRole = 1009,
    OrganizationSubmitInternalRole = 1010,
    OrganizationDeleteClientRole = 1011,
    OrganizationDeleteIndependentContractorRole = 1012,
    OrganizationDeleteInternalRole = 1013,
    OrganizationViewClientRole = 1014,
    OrganizationViewIndependentContractorRole = 1015,
    OrganizationViewInternalRole = 1016,
    OrganizationInternalRoleAddBankAccount = 1017,
    OrganizationInternalRoleEditBankAccount = 1018,
    OrganizationIndependentContractorRoleAddTaxNumber = 1021,
    OrganizationIndependentContractorRoleEditTaxNumber = 1022,
    OrganizationIndependentContractorRoleAddPaymentMethodCheque = 1023,
    OrganizationIndependentContractorRoleEditPaymentMethodCheque = 1024,
    OrganizationIndependentContractorRoleAddPaymentMethodDirectDeposit = 1025,
    OrganizationIndependentContractorRoleEditPaymentMethodDirectDeposit = 1026,
    OrganizationIndependentContractorRoleAddPaymentMethodWireTransfer = 1027,
    OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer = 1028,
    OrganizationInternalRoleAddTaxNumber = 1029,
    OrganizationInternalRoleEditTaxNumber = 1030,
    OrganizationIndependentContractorRoleAdvanceView = 1031,
    OrganizationIndependentContractorRoleAdvanceNew = 1032,
    OrganizationIndependentContractorRoleAdvanceSubmit = 1033,
    OrganizationIndependentContractorRoleGarnisheeView = 1034,
    OrganizationIndependentContractorRoleGarnisheeNew = 1035,
    OrganizationIndependentContractorRoleGarnisheeSubmit = 1036,
    OrganizationSubvendorRoleAdvanceView = 1037,
    OrganizationSubvendorRoleAdvanceNew = 1038,
    OrganizationSubvendorRoleAdvanceSubmit = 1039,
    OrganizationRebateView = 1040,
    OrganizationRebateNew = 1041,
    OrganizationVmsFeeView = 1043,
    OrganizationVmsFeeNew = 1044,
    OrganizationClientRoleEditNationalAccountManager = 1046,
    OrganizationClientRoleEditAlternateBill = 1047,
    OrganizationAddSubVendorRole = 1048,
    OrganizationSubmitSubVendorRole = 1049,
    OrganizationDeleteSubVendorRole = 1050,
    OrganizationViewSubVendorRole = 1051,
    OrganizationSubVendorRoleAddTaxNumber = 1052,
    OrganizationSubVendorRoleEditTaxNumber = 1053,
    OrganizationSubVendorRoleAddPaymentMethodCheque = 1054,
    OrganizationSubVendorRoleEditPaymentMethodCheque = 1055,
    OrganizationSubVendorRoleAddPaymentMethodDirectDeposit = 1056,
    OrganizationSubVendorRoleEditPaymentMethodDirectDeposit = 1057,
    OrganizationSubVendorRoleAddPaymentMethodWireTransfer = 1058,
    OrganizationSubVendorRoleEditPaymentMethodWireTransfer = 1059,
    OrganizationSubVendorRoleEditUseADifferentPayeeName = 1060,
    OrganizationSubVendorRoleEditPayeeName = 1061,
    OrganizationViewLimitedLiabilityCompanyRole = 1070,
    OrganizationAddLimitedLiabilityCompanyRole = 1071,
    OrganizationSubmitLimitedLiabilityCompanyRole = 1072,
    OrganizationDeleteLimitedLiabilityCompanyRole = 1073,
    OrganizationIndependentContractorRoleAddPaymentMethodAdp = 1074,
    OrganizationIndependentContractorRoleEditPaymentMethodAdp = 1075,
    OrganizationSubVendorRoleAddPaymentMethodAdp = 1076,
    OrganizationSubVendorRoleEditPaymentMethodAdp = 1077,
    OrganizationInternalRoleRollOver = 1078,
    ContactEditProfileTypeOrganizational = 10006,
    ContactEditProfileTypeInternal = 10007,
    ContactEditProfileTypeWorkerTemp = 10008,
    ContactEditProfileTypeWorkerCanadianSP = 10009,
    ContactEditProfileTypeWorkerCanadianInc = 10010,
    ContactDiscardProfileTypeOrganizational = 10011,
    ContactDiscardProfileTypeInternal = 10012,
    ContactDiscardProfileTypeWorkerTemp = 10013,
    ContactDiscardProfileTypeWorkerCanadianSP = 10014,
    ContactDiscardProfileTypeWorkerCanadianInc = 10015,
    ContactDeleteProfileTypeOrganizational = 10016,
    ContactDeleteProfileTypeInternal = 10017,
    ContactDeleteProfileTypeWorkerTemp = 10018,
    ContactDeleteProfileTypeWorkerCanadianSP = 10019,
    ContactDeleteProfileTypeWorkerCanadianInc = 10020,
    ContactViewProfileTypeOrganizational = 10021,
    ContactViewProfileTypeInternal = 10022,
    ContactViewProfileTypeWorkerTemp = 10023,
    ContactViewProfileTypeWorkerCanadianSP = 10024,
    ContactViewProfileTypeWorkerCanadianInc = 10025,
    ContactInviteProfileTypeOrganizational = 10026,
    ContactInviteProfileTypeInternal = 10027,
    ContactInviteProfileTypeWorkerTemp = 10028,
    ContactInviteProfileTypeWorkerCanadianSP = 10029,
    ContactInviteProfileTypeWorkerCanadianInc = 10030,
    ContactProfileTypeWorkerTempAddPaymentMethodCheque = 10031,
    ContactProfileTypeWorkerTempAddPaymentMethodDirectDeposit = 10032,
    ContactProfileTypeWorkerTempAddPaymentMethodWireTransfer = 10033,
    ContactProfileTypeWorkerTempAddPaymentMethodPreferred = 10034,
    ContactProfileTypeWorkerCanadianSPAddPaymentMethodCheque = 10035,
    ContactProfileTypeWorkerCanadianSPAddPaymentMethodDirectDeposit = 10036,
    ContactProfileTypeWorkerCanadianSPAddPaymentMethodWireTransfer = 10037,
    ContactProfileTypeWorkerCanadianSPAddPaymentMethodPreferred = 10038,
    ContactProfileTypeWorkerTempEditPaymentMethodCheque = 10039,
    ContactProfileTypeWorkerTempEditPaymentMethodDirectDeposit = 10040,
    ContactProfileTypeWorkerTempEditPaymentMethodWireTransfer = 10041,
    ContactProfileTypeWorkerTempEditPaymentMethodPreferred = 10042,
    ContactProfileTypeWorkerCanadianSPEditPaymentMethodCheque = 10043,
    ContactProfileTypeWorkerCanadianSPEditPaymentMethodDirectDeposit = 10044,
    ContactProfileTypeWorkerCanadianSPEditPaymentMethodWireTransfer = 10045,
    ContactProfileTypeWorkerCanadianSPEditPaymentMethodPreferred = 10046,
    ContactViewProfileTypeWorkerAdvances = 10047,
    ContactNewProfileTypeWorkerAdvance = 10048,
    ContactSubmitProfileTypeWorkerAdvance = 10049,
    ContactViewProfileTypeWorkerGarnishees = 10050,
    ContactNewProfileTypeWorkerGarnishee = 10051,
    ContactSubmitProfileTypeWorkerGarnishee = 10052,
    ContactEditProfileTypeWorkerSubVendor = 10053,
    ContactDiscardProfileTypeWorkerSubVendor = 10054,
    ContactDeleteProfileTypeWorkerSubVendor = 10055,
    ContactViewProfileTypeWorkerSubVendor = 10056,
    ContactInviteProfileTypeWorkerSubVendor = 10057,
    ContactAddGovernmentAdjustment = 10058,
    ContactEditProfileTypeWorkerUnitedStatesW2 = 10060,
    ContactDiscardProfileTypeWorkerUnitedStatesW2 = 10061,
    ContactDeleteProfileTypeWorkerUnitedStatesW2 = 10062,
    ContactViewProfileTypeWorkerUnitedStatesW2 = 10063,
    ContactInviteProfileTypeWorkerUnitedStatesW2 = 10064,
    ContactEditProfileTypeWorkerUnitedStatesLLC = 10070,
    ContactDiscardProfileTypeWorkerUnitedStatesLLC = 10071,
    ContactDeleteProfileTypeWorkerUnitedStatesLLC = 10072,
    ContactViewProfileTypeWorkerUnitedStatesLLC = 10073,
    ContactInviteProfileTypeWorkerUnitedStatesLLC = 10074,
    WorkOrderVersionChangePaymentSourceDeduction = 17011,
    WorkOrderVersionChangePaymentRateIsApplyDeduction = 17012,
    WorkOrderVersionChangePaymentRateIsApplyVacation = 17013
  }

  export enum DocumentType {
    TaxDocs = 1,
    IncorpDocs = 2,
    ClientSide = 3,
    SupplierSide = 4,
    TimesheetSupportingDocument = 5,
    TaxDoc = 6,
    Profile = 7,
    PODocument = 8,
    ClientExtensionLetter = 9,
    ClientAgreement = 10,
    PurchaseOrderDocument = 11,
    WorkerContract = 12,
    WorkerExtensionLetter = 13,
    VoidCheque = 14,
    NDAIP = 15,
    DirectDepositLetter = 16,
    IncDocument = 17,
    TaxDocument = 18,
    ProjectNote = 19,
    TimesheetPrint = 20,
    TransactionBillingDocument = 21,
    VmsRecordsFormatted = 22,
    VmsRecordsOriginal = 23,
    InvoiceVersionDraft = 24,
    InvoiceVersionInternalView = 25,
    InvoiceVersionStandard = 26,
    InvoiceVersionCourtesyCopy = 27,
    PaymentVersionDraft = 28,
    PaymentVersionInternalView = 29,
    PaymentVersionStandard = 30,
    PaymentVersionCourtesyCopy = 31,
    CommissionDocument = 32,
    CommissionAdjustmentDocument = 33,
    WorkerProfileDocument = 34,
    VmsDiscountRecordsFormatted = 35,
    VmsDiscountRecordsOriginal = 36,
    VmsUnitedStatesSourceDeductionRecordsFormatted = 37,
    VmsUnitedStatesSourceDeductionRecordsOriginal = 38,
    MigratedDocument = 39,
    InternalOrganizationPortraitHeader = 60001,
    InternalOrganizationPortraitFooter = 60002,
    InternalOrganizationLandscapeHeader = 60003,
    InternalOrganizationLandscapeFooter = 60004,
    ComplianceDocumentRuleSample = 83001,
    ComplianceDocumentRuleTemplate = 83002,
    ComplianceDocumentMain = 87001,
    ComplianceDocumentExemption = 87002,
    ExpenseItemDocument = 95001,
    ExpenseClaimDocument = 96001,
    ComplianceTemplateTemplate = 116001,
    ComplianceTemplateSample = 116002,
    UserGuideDocument = 119001
  }

  export enum EntityType {
    Organization = 1,
    UserProfileOrganizational = 2,
    UserProfileInternal = 3,
    UserProfileWorkerCanadianInc = 4,
    UserProfileWorkerCanadianSP = 5,
    UserProfileWorkerTemp = 6,
    Assignment = 8,
    TimeSheet = 9,
    Contact = 10,
    PurchaseOrder = 11,
    TransactionHeader = 12,
    WorkOrder = 13,
    EntityChange = 14,
    WorkOrderPurchaseOrderLine = 15,
    Document = 16,
    WorkOrderVersion = 17,
    PurchaseOrderTransaction = 18,
    Task = 19,
    BillingTransaction = 20,
    PaymentTransaction = 21,
    Invoice = 22,
    Payment = 23,
    PaymentReleaseBatch = 24,
    FinancialTransactionBatch = 25,
    FederalTaxHeader = 26,
    ProvincialTaxHeader = 27,
    FederalTaxVersion = 28,
    ProvincialTaxVersion = 29,
    SalesTaxHeader = 30,
    SalesTaxVersion = 31,
    Advance = 32,
    Garnishee = 33,
    VmsImportedRecord = 34,
    PaymentTransactionGarnishee = 35,
    VmsProcessedRecord = 36,
    VmsProcessedRecordWorkOrderVersionAllocation = 37,
    PaymentVersion = 39,
    CommissionRateHeader = 40,
    CommissionRateVersion = 41,
    CommissionRateRestriction = 42,
    VmsFeeHeader = 43,
    VmsFeeVersion = 44,
    RebateHeader = 45,
    RebateVersion = 46,
    CommissionTransaction = 47,
    CommissionAdjustmentHeader = 48,
    PaymentReleaseScheduleDetail = 49,
    UserProfile = 50,
    CommissionSalesPattern = 51,
    GarnisheePayTo = 52,
    Note = 53,
    ClientHoliday = 54,
    SubdivisionHoliday = 55,
    InvoiceTransaction = 56,
    FinancialTransaction = 57,
    OrganizationClientRole = 58,
    OrganizationIndependentContractorRole = 59,
    OrganizationInternalRole = 60,
    ParentOrganization = 61,
    PrintQueue = 62,
    SalesTaxVersionRate = 63,
    PaymentTransactionPayment = 64,
    WCBHeader = 65,
    Template = 66,
    ProvincialTaxVersionTaxType = 67,
    ApplicableSourceDeduction = 68,
    ApplicableSalesTax = 69,
    OrganizationClientRoleLOB = 70,
    UserProfileWorkerSPTaxNumber = 71,
    OrganizationTaxNumber = 72,
    CommissionReportHeader = 73,
    InternalTeam = 74,
    AccessSubscription = 75,
    AccessSubscriptionRestriction = 76,
    Branch = 77,
    NoteReadReceipt = 78,
    UserProfileDashboardSetting = 79,
    UserProfileBookmark = 80,
    UserProfileSearchSetting = 81,
    PurchaseOrderLine = 82,
    ComplianceDocumentRule = 83,
    VmsDiscountImportedRecord = 84,
    VmsDiscountProcessedRecord = 85,
    UserDefinedCodeComplianceDocumentType = 86,
    ComplianceDocument = 87,
    ComplianceDocumentHeader = 88,
    VmsDocument = 89,
    OrganizationSubVendorRole = 90,
    UserProfileWorkerSubVendor = 91,
    WorkerCompensation = 92,
    WCBSubdivisionHeader = 93,
    WCBSubdivisionVersion = 94,
    ExpenseItem = 95,
    ExpenseClaim = 96,
    VmsExpenseImportedRecord = 97,
    VmsExpenseProcessedRecord = 98,
    Project = 99,
    TimeSheetDetail = 100,
    PrintUserProfileSetting = 101,
    TimeSheetCapsuleConfiguration = 102,
    PaymentSourceDeduction = 103,
    UserProfileWorkerSourceDeduction = 104,
    RemittanceTransaction = 105,
    RemittanceTransactionBatch = 106,
    Remittance = 107,
    ProjectVersion = 108,
    OrganizationLimitedLiabilityCompanyRole = 109,
    VmsCommissionImportedRecord = 110,
    VmsCommissionProcessedRecord = 111,
    UserProfileWorkerUnitedStatesW2 = 112,
    UserProfileWorkerUnitedStatesLLC = 113,
    VmsUnitedStatesSourceDeductionImportedRecord = 114,
    VmsUnitedStatesSourceDeductionProcessedRecord = 115,
    ComplianceTemplate = 116,
    InvoiceTransactionDocument = 117,
    BranchManager = 118,
    UserGuide = 119,
    VmsFixedPriceImportedRecord = 120,
    VmsFixedPriceProcessedRecord = 121
  }

  export enum FunctionalOperation {
    Dashboard = 10,
    ActivityCenter = 20,
    ContractManagement = 30,
    FinancialManagement = 40,
    Administration = 90,
    WorkflowTaskManagment = 100,
    WorkflowTaskSearch = 101,
    DraftsManagment = 102,
    OrganizationManage = 200,
    OrganizationSearch = 201,
    OrganizationCreate = 202,
    OrganizationRebate = 203,
    OrganizationNewOnQuickAdd = 204,
    OrganizationAddContact = 205,
    OrganizationAddClientRole = 206,
    OrganizationAddIndependentContractorRole = 207,
    OrganizationAddInternalRole = 208,
    OrganizationSubmitClientRole = 209,
    OrganizationSubmitIndependentContractorRole = 210,
    OrganizationSubmitInternalRole = 211,
    OrganizationDeleteClientRole = 212,
    OrganizationDeleteIndependentContractorRole = 213,
    OrganizationDeleteInternalRole = 214,
    OrganizationViewClientRole = 215,
    OrganizationViewIndependentContractorRole = 216,
    OrganizationViewInternalRole = 217,
    OrganizationInternalRoleAddBankAccount = 218,
    OrganizationInternalRoleEditBankAccount = 219,
    OrganizationIndependentContractorRoleAddTaxNumber = 220,
    OrganizationIndependentContractorRoleEditTaxNumber = 221,
    OrganizationIndependentContractorRoleAddPaymentMethodCheque = 222,
    OrganizationIndependentContractorRoleEditPaymentMethodCheque = 223,
    OrganizationIndependentContractorRoleAddPaymentMethodDirectDeposit = 224,
    OrganizationIndependentContractorRoleEditPaymentMethodDirectDeposit = 225,
    OrganizationIndependentContractorRoleAddPaymentMethodWireTransfer = 226,
    OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer = 227,
    OrganizationInternalRoleAddTaxNumber = 228,
    OrganizationInternalRoleEditTaxNumber = 229,
    OrganizationIndependentContractorRoleAdvanceView = 230,
    OrganizationIndependentContractorRoleAdvanceNew = 231,
    OrganizationIndependentContractorRoleAdvanceSubmit = 232,
    OrganizationIndependentContractorRoleGarnisheeView = 233,
    OrganizationIndependentContractorRoleGarnisheeNew = 234,
    OrganizationIndependentContractorRoleGarnisheeSubmit = 235,
    OrganizationSubvendorRoleAdvanceView = 236,
    OrganizationSubvendorRoleAdvanceNew = 237,
    OrganizationSubvendorRoleAdvanceSubmit = 238,
    OrganizationRebateView = 239,
    OrganizationRebateNew = 240,
    OrganizationVmsFeeView = 241,
    OrganizationVmsFeeNew = 242,
    OrganizationClientRoleEditNationalAccountManager = 243,
    OrganizationClientRoleEditAlternateBill = 244,
    OrganizationAddSubVendorRole = 245,
    OrganizationSubmitSubVendorRole = 246,
    OrganizationDeleteSubVendorRole = 247,
    OrganizationViewSubVendorRole = 248,
    OrganizationSubVendorRoleAddTaxNumber = 249,
    OrganizationSubVendorRoleEditTaxNumber = 250,
    OrganizationSubVendorRoleAddPaymentMethodCheque = 251,
    OrganizationSubVendorRoleEditPaymentMethodCheque = 252,
    OrganizationSubVendorRoleAddPaymentMethodDirectDeposit = 253,
    OrganizationSubVendorRoleEditPaymentMethodDirectDeposit = 254,
    OrganizationSubVendorRoleAddPaymentMethodWireTransfer = 255,
    OrganizationSubVendorRoleEditPaymentMethodWireTransfer = 256,
    OrganizationSubVendorRoleEditUseADifferentPayeeName = 257,
    OrganizationSubVendorRoleEditPayeeName = 258,
    OrganizationViewLimitedLiabilityCompanyRole = 259,
    OrganizationAddLimitedLiabilityCompanyRole = 260,
    OrganizationSubmitLimitedLiabilityCompanyRole = 261,
    OrganizationDeleteLimitedLiabilityCompanyRole = 262,
    OrganizationIndependentContractorRoleAddPaymentMethodAdp = 263,
    OrganizationIndependentContractorRoleEditPaymentMethodAdp = 264,
    OrganizationSubVendorRoleAddPaymentMethodAdp = 265,
    OrganizationSubVendorRoleEditPaymentMethodAdp = 266,
    OrganizationInternalRoleRollOver = 267,
    ContactManagment = 300,
    ContactSearch = 301,
    ContactCreateOrganizational = 302,
    ContactCreateInternal = 303,
    ContactCreateWorker = 304,
    ContactCreateProfileTypeInternal = 305,
    ContactCreateProfileTypeOrganizational = 306,
    ContactCreateProfileTypeWorkerTemp = 307,
    ContactCreateProfileTypeWorkerCanadianSP = 308,
    ContactCreateProfileTypeWorkerCanadianInc = 309,
    ContactCreateProfilePaymentMethodsChange = 310,
    ContactSearchInternalTeams = 311,
    ContactInternalTeamCreate = 312,
    ContactCreate = 313,
    CreateInternalTeam = 314,
    EditInternalTeam = 315,
    WorkOrderManagement = 400,
    WorkOrderSearch = 401,
    WorkOrderCreateSetup = 402,
    WorkOrderSavedTeplatesSearch = 403,
    WorkOrderCreate = 404,
    WorkOrderVersionChangePaymentSourceDeduction = 405,
    WorkOrderVersionChangePaymentRateIsApplyDeduction = 406,
    WorkOrderVersionChangePaymentRateIsApplyVacation = 407,
    PurchaseOrderManagement = 500,
    PurchaseOrderSearch = 501,
    PurchaseOrderCreate = 502,
    TransactionManagement = 600,
    TransactionSearch = 601,
    VMSManagement = 602,
    TransactionManualCreation = 603,
    VMSAccess = 604,
    ManageVMSBatches = 605,
    VMSImport = 606,
    VMSDiscardAllConflictRecords = 607,
    PaymentManagement = 800,
    PaymentSearch = 801,
    PaymentPending = 802,
    PaymentDirectDepositBatchSearch = 803,
    PaymentPaymentTransactionGarnisheeGrouped = 804,
    PaymentWireTransferBatchSearch = 805,
    ManageCheques = 806,
    PaymentAdpBatchSearchGroup = 807,
    YTDEarningsInfo = 808,
    PaymentPendingView = 809,
    JournalManagement = 900,
    JournalSearch = 901,
    JournalPending = 902,
    PayrollManagement = 1000,
    PayrollSearch = 1001,
    PayrollSalesTaxesSearch = 1002,
    TimesheetManagement = 1100,
    TimesheetEntry = 1101,
    TimesheetSearch = 1102,
    TimesheetExceptionsSearch = 1103,
    CommissionManagement = 1200,
    CommissionSearch = 1201,
    CommissionSearchTemplates = 1202,
    CommissionSearchSalesPatterns = 1203,
    CommissionSearchAdjustment = 1204,
    CommissionReport = 1205,
    CommissionReportPendingInterest = 1206,
    CommissionReportNotFinalized = 1207,
    CommissionReportAdministratorView = 1208,
    CommissionBranchSummary = 1209,
    CommissionReportFinalize = 1210,
    DashboardHomeView = 1301,
    BranchView = 1401,
    BranchEdit = 1402,
    BranchSave = 1403,
    AccessSubscriptionView = 1501,
    AccessSubscriptionCreate = 1502,
    BillingTransactionSingleToConsolidated = 2001,
    BillingTransactionConsolidatedToSingle = 2002,
    BillingTransactionCreateInvoice = 2003,
    BillingTransactionSuppress = 2004,
    BillingTransactionUnsuppress = 2005,
    InvoiceManagement = 2200,
    InvoiceSearch = 2201,
    InvoiceCreate = 2202,
    InvoicePending = 2203,
    PaymentReleaseBatchManagement = 2400,
    PaymentReleaseBatchSearch = 2401,
    PaymentReleaseBatchCreate = 2402,
    FederalTaxManagement = 2600,
    FederalTaxSearch = 2601,
    FederalTaxCreate = 2602,
    ProvincialTaxManagement = 2700,
    ProvincialTaxSearch = 2701,
    ProvincialTaxCreate = 2702,
    CommissionRateManagement = 4000,
    CommissionRateSearch = 4001,
    CommissionRateCreate = 4002,
    CommissionAdjustmentManagement = 4800,
    CommissionAdjustmentSearch = 4801,
    CommissionAdjustmentCreate = 4802,
    UserProfileManagement = 5000,
    UserProfileSearch = 5001,
    UserProfileCreate = 5002,
    UserProfileReassign = 5003,
    UserProfileEditTypeOrganizational = 5004,
    UserProfileEditTypeInternal = 5005,
    UserProfileEditTypeWorker = 5006,
    UserProfileEditWorkerPaymentMethod = 5007,
    UserProfileViewWorkerAdvance = 5008,
    UserProfileNewWorkerAdvance = 5009,
    UserProfileEditWorkerAdvance = 5010,
    UserProfileViewWorkerGarnishee = 5011,
    UserProfileNewWorkerGarnishee = 5012,
    UserProfileEditWorkerGarnishee = 5013,
    UserProfileAddGovernmentAdjustment = 5014,
    UserProfileInviteTypeOrganizational = 5015,
    UserProfileInviteTypeInternal = 5016,
    UserProfileInviteTypeWorker = 5017,
    Report = 6000,
    ComplianceDocumentManage = 8300,
    ComplianceDocumentRuleAreaTypeSearch = 8301,
    ComplianceDocumentRuleView = 8302,
    ComplianceDocumentRuleCreate = 8303,
    ComplianceDocumentRuleAddAccessSubscriptionRestriction = 8304,
    ComplianceDocumentRuleSubmitAccessSubscriptionRestriction = 8305,
    ComplianceDocumentRuleDeleteAccessSubscriptionRestriction = 8306,
    UserDefinedCodeComplianceDocumentTypeSearch = 8601,
    UserDefinedCodeComplianceDocumentTypeView = 8602,
    UserDefinedCodeComplianceDocumentTypeCreate = 8603,
    UserDefinedCodeComplianceDocumentTypeSave = 8604,
    UserDefinedCodeComplianceDocumentTypeSubmit = 8605,
    UserDefinedCodeComplianceDocumentTypeDiscard = 8606,
    UserDefinedCodeComplianceDocumentTypeActivate = 8607,
    UserDefinedCodeComplianceDocumentTypeInactivate = 8608,
    ComplianceDocumentSearch = 8701,
    ComplianceDocumentView = 8702,
    ComplianceDocumentCreate = 8703,
    WorkerCompensationSearch = 9201,
    WorkerCompensationCreate = 9202,
    WorkerCompensationSave = 9203,
    WCBSubdivisionSearch = 9301,
    WCBSubdivisionCreate = 9302,
    WCBSubdivisionHeaderSave = 9303,
    ExpenseItemSearch = 9501,
    ExpenseItemView = 9502,
    ExpenseItemCreate = 9503,
    ExpenseManagement = 9600,
    ExpenseClaimSearch = 9601,
    ExpenseClaimView = 9602,
    ExpenseClaimCreate = 9603,
    ExpenseClaimExceptions = 9604,
    ProjectSearch = 9901,
    ProjectView = 9902,
    ProjectCreate = 9903,
    TimeSheetDetailCreate = 10002,
    PayrollRemittance = 10501,
    UserGuideEdit = 10750
  }

  export enum FunctionalRole {
    OrganizationalRole = 1,
    Worker = 2,
    AccountsReceivable = 3,
    BackOffice = 4,
    Finance = 5,
    AccountManager = 6,
    Recruiter = 7,
    SystemAdministrator = 8,
    ClientServices = 9,
    Controller = 10,
    BackOfficeARAP = 11,
    RecruitmentLead = 12,
    ClientServicesLead = 13,
    BranchManager = 14,
    LegalLead = 15,
    Legal = 16,
    Executive = 17
  }

  export enum FunctionalService {
    SystemAdministration = 1,
    Home = 2,
    BillingDocuments = 3,
    WorkOrders = 4,
    InvoiceAndPayment = 5,
    Contacts = 6,
    Workflow = 7,
    Transactions = 8,
    JournalBatches = 9,
    Commissions = 10,
    Dashboard = 11,
    Access = 12
  }

  export enum RouteType {
    Angular = 1,
    MVC = 2
  }

  export enum SalesTax {
    GSTHST = 1,
    QST = 3,
    PST = 4
  }

  export enum AuditOperationChangeStatus {
    Delete = 1,
    Insert = 2,
    UpdateOldValues = 3,
    UpdateNewValues = 4
  }

  export enum ApprovalSequenceStatus {
    NotStarted = 1,
    InProgress = 2,
    Completed = 3
  }

  export enum ApprovalSequenceType {
    OneOfApprovers = 1,
    AllApprovers = 2
  }

  export enum ApprovalStatus {
    PendingApproval = 1,
    Approved = 2,
    ApprovalNotRequired = 3
  }

  export enum ApproversGroupType {
    Client = 1,
    Internal = 2,
    Supplier = 3
  }

  export enum BillingTransactionGenerationMethod {
    OneBillingTransactionPerBillingDocument = 1,
    OneBillingTransactionPerProject = 2
  }

  export enum CommissionAdjustmentDetailType {
    JobOwnerAllocation = 1,
    WorkorderAllocation = 2
  }

  export enum CommissionAdjustmentHeaderStatus {
    New = 1,
    Active = 2,
    InActive = 3
  }

  export enum CommissionAdjustmentHeaderType {
    ManualAdjustment = 1,
    BackgroundCheck = 2,
    VmsDiscount = 3,
    Interest = 4,
    VmsUnitedStatesSourceDeduction = 5
  }

  export enum CommissionRateHeaderStatus {
    New = 1,
    Active = 2,
    InActive = 3
  }

  export enum CommissionRateRestrictionType {
    InternalOrganization = 1,
    ClientOrganization = 2,
    LineOfBusiness = 3,
    InternalOrganizationDefinition1 = 4
  }

  export enum CommissionRateType {
    FixedPercentage = 1
  }

  export enum CommissionRateVersionStatus {
    New = 1,
    Active = 2,
    Replaced = 3
  }

  export enum CommissionRole {
    JobOwnerRoleNoSupport = 1,
    JobOwnerRoleWithSupport = 2,
    SupportingJobOwner = 3,
    RecruiterRole = 4,
    NationalAccountsRole = 5,
    BranchManagerRole = 6
  }

  export enum CommissionStructureType {
    BasePlusCommission = 1,
    OneHundredPercentCommission = 2
  }

  export enum CommissionTransactionStatus {
    Recognized = 1,
    Scheduled = 2,
    OnHold = 3,
    Paid = 4
  }

  export enum CommissionTransactionType {
    Transaction = 1,
    Adjustment = 2,
    ReverseTransaction = 3,
    RecurringAdjustment = 4,
    Interest = 5
  }

  export enum ScheduledChangeRateApplication {
    AllWorkOrders = 1,
    OnlyNewAssignmentsAndWorkOrderExtension = 2,
    OnlyNewAssignments = 3
  }

  export enum ComplianceDocumentRuleAreaType {
    OrganizationInternal = 1,
    OrganizationClient = 2,
    Assignment = 3
  }

  export enum ComplianceDocumentRuleEntityType {
    Worker = 1,
    Organization = 2,
    WorkOrder = 3
  }

  export enum ComplianceDocumentRuleExpiryType {
    UserDefinedMandatory = 1,
    UserDefinedOptional = 2,
    None = 3
  }

  export enum ComplianceDocumentRuleProfileVisibilityType {
    WorkerProfile = 1,
    SupplierProfiles = 2,
    ClientProfiles = 3
  }

  export enum ComplianceDocumentRuleRequiredSituationType {
    NewAssignment = 1,
    Extension = 2,
    Termination = 3
  }

  export enum ComplianceDocumentRuleRequiredType {
    MandatoryForSubmission = 1,
    Optional = 2
  }

  export enum ComplianceDocumentRuleRestrictionType {
    InternalOrganizationDefinition1 = 1,
    LineOfBusiness = 2,
    WorkerType = 3,
    OrganizationRoleType = 5,
    InternalOrganization = 6,
    Worksite = 7,
    ClientOrganization = 8,
    TaxSubdivision = 9,
    WorkerEligibility = 10
  }

  export enum ComplianceDocumentRuleStatus {
    New = 1,
    Draft = 2,
    PendingReview = 3,
    Active = 4,
    PendingChange = 5,
    Discard = 6,
    DuplicateActive = 7,
    Inactive = 8
  }

  export enum ComplianceDocumentStatus {
    New = 1,
    PendingUpload = 2,
    PendingSystem = 3,
    PendingExemptionRequest = 4,
    Exemption = 5,
    PendingReview = 6,
    Active = 7,
    Declined = 8,
    Deleted = 9,
    Archived = 10,
    Expired = 11,
    PendingSnoozeRequest = 12,
    Snooze = 13,
    NotApplicable = 14
  }

  export enum ComplianceTemplateRestrictionType {
    InternalOrganizationDefinition1 = 1,
    LineOfBusiness = 2,
    WorkerType = 3,
    OrganizationRoleType = 5,
    InternalOrganization = 6,
    Worksite = 7,
    ClientOrganization = 8,
    TaxSubdivision = 9,
    WorkerEligibility = 10
  }

  export enum ESignedStatus {
    NotSigned = 0,
    Signed = 1,
    SignedTempered = 2
  }

  export enum UserDefinedCodeComplianceDocumentTypeStatus {
    New = 1,
    Draft = 2,
    Active = 3,
    Inactive = 4
  }

  export enum AtsSource {
    ProcomBullhorn = 1
  }

  export enum VmsCommissionImportedRecordType {
    PendingTransactionCreation = 1,
    Conflict = 2,
    Discarded = 3,
    Error = 4,
    Completed = 5
  }

  export enum VmsFixedPriceImportedRecordType {
    PendingTransactionCreation = 1,
    Conflict = 2,
    Discarded = 3,
    Error = 4,
    Completed = 5
  }

  export enum VmsDiscountImportedRecordType {
    PendingTransactionCreation = 1,
    Conflict = 2,
    Discarded = 3,
    Error = 4,
    Completed = 5
  }

  export enum VmsDocumentStatus {
    PendingPreprocessing = 1,
    PendingProcessing = 2,
    Discarded = 3,
    Completed = 4,
    Uploaded = 5
  }

  export enum VmsExpenseImportedRecordType {
    PendingTransactionCreation = 1,
    Conflict = 2,
    Discarded = 3,
    Error = 4,
    Completed = 5
  }

  export enum VmsImportedRecordType {
    PendingTransactionCreation = 1,
    Conflict = 2,
    Discarded = 3,
    Error = 4,
    Completed = 5
  }

  export enum VmsUnitedStatesSourceDeductionImportedRecordType {
    PendingTransactionCreation = 1,
    Conflict = 2,
    Discarded = 3,
    Error = 4,
    Completed = 5
  }

  export enum ExpenseClaimStatus {
    New = 1,
    Draft = 2,
    Abandoned = 3,
    Approved = 4,
    ApprovedAndAccepted = 5,
    Declined = 6,
    Recalled = 7,
    PendingSupplierReview = 8,
    PendingInternalReview = 9,
    PendingClientReview = 10,
    PendingSupportingDocumentReview = 11,
    PendingSupportingDocumentUpload = 12,
    SupportingDocumentApproved = 13,
    SupplierApproved = 14,
    InternalApproved = 15,
    Unsubmitted = 16,
    PendingBackofficeReview = 18
  }

  export enum ExpenseCategoryFieldType {
    PerDiemNumberOfDays = 1,
    PerDiemDailyRate = 2,
    MilageRatePerUnit = 3,
    MilageNumberOfUnits = 4
  }

  export enum ExpenseCategory {
    Travel = 1,
    Mileage = 2,
    Fuel = 3,
    Parking = 4,
    MealAndEntertainment = 5,
    Accommodation = 6,
    PhoneAndInternet = 7,
    OfficeSupplies = 8,
    PerDiem = 9,
    Other = 10
  }

  // For Procom internal expense where ExpenseCategoryTemplateVersionId = 2
  export enum ExpenseCategoryInternal {
    Travel = 11,
    Mileage = 12,
    Fuel = 13,
    Parking = 14,
    MealAndEntertainment = 15,
    Accommodation = 16,
    PhoneAndInternet = 17,
    OfficeSupplies = 18,
    PerDiem = 19,
    Other = 20,
    Recruiting = 21,
    AdvertisingAndPromotion = 22,
    EmployeeRelations = 23,
    TrainingOrCourse = 24,
    SpecialEvents = 25
  }

  export enum Country {
    CA = 124,
    DE = 276,
    MX = 484,
    US = 840
  }

  export enum Currency {
    AED = 1,
    AFN = 2,
    ALL = 3,
    AMD = 4,
    ANG = 5,
    AOA = 6,
    ARS = 7,
    AUD = 8,
    AWG = 9,
    AZN = 10,
    BAM = 11,
    BBD = 12,
    BDT = 13,
    BGN = 14,
    BHD = 15,
    BIF = 16,
    BMD = 17,
    BND = 18,
    BOB = 19,
    BOV = 20,
    BRL = 21,
    BSD = 22,
    BTN = 23,
    BWP = 24,
    BYR = 25,
    BZD = 26,
    CAD = 27,
    CDF = 28,
    CHE = 29,
    CHF = 30,
    CHW = 31,
    CLF = 32,
    CLP = 33,
    CNY = 34,
    COP = 35,
    COU = 36,
    CRC = 37,
    CUC = 38,
    CUP = 39,
    CVE = 40,
    CZK = 41,
    DJF = 42,
    DKK = 43,
    DOP = 44,
    DZD = 45,
    EGP = 46,
    ERN = 47,
    ESA = 48,
    ESB = 49,
    ETB = 50,
    EUR = 51,
    FJD = 52,
    FKP = 53,
    GBP = 54,
    GEL = 55,
    GGP = 56,
    GHS = 57,
    GIP = 58,
    GMD = 59,
    GNF = 60,
    GTQ = 61,
    GYD = 62,
    HKD = 63,
    HNL = 64,
    HRK = 65,
    HTG = 66,
    HUF = 67,
    IDR = 68,
    ILS = 69,
    IMP = 70,
    INR = 71,
    IQD = 72,
    IRR = 73,
    ISK = 74,
    JEP = 75,
    JMD = 76,
    JOD = 77,
    JPY = 78,
    KES = 79,
    KGS = 80,
    KHR = 81,
    KMF = 82,
    KPW = 83,
    KRI = 84,
    KRW = 85,
    KWD = 86,
    KYD = 87,
    KZT = 88,
    LAK = 89,
    LBP = 90,
    LKR = 91,
    LRD = 92,
    LSL = 93,
    LTL = 94,
    LVL = 95,
    LYD = 96,
    MAD = 97,
    MDL = 98,
    MGA = 99,
    MKD = 100,
    MMK = 101,
    MNT = 102,
    MOP = 103,
    MRO = 104,
    MUR = 105,
    MVR = 106,
    MWK = 107,
    MXN = 108,
    MXV = 109,
    MYR = 110,
    MZN = 111,
    NAD = 112,
    NGN = 113,
    NIO = 114,
    NOK = 115,
    NPR = 116,
    NZD = 117,
    OMR = 118,
    PAB = 119,
    PEN = 120,
    PGK = 121,
    PHP = 122,
    PKR = 123,
    PLN = 124,
    PRB = 125,
    PYG = 126,
    QAR = 127,
    RON = 128,
    RSD = 129,
    RUB = 130,
    RWF = 131,
    SAR = 132,
    SBD = 133,
    SCR = 134,
    SDG = 135,
    SEK = 136,
    SGD = 137,
    SHP = 138,
    SLL = 139,
    SLS = 140,
    SOS = 141,
    SRD = 142,
    SSP = 143,
    STD = 144,
    SYP = 145,
    SZL = 146,
    THB = 147,
    TJS = 148,
    TMT = 149,
    TND = 150,
    TOP = 151,
    TRY = 152,
    TTD = 153,
    TVD = 154,
    TWD = 155,
    TZS = 156,
    UAH = 157,
    UGX = 158,
    USD = 159,
    USN = 160,
    USS = 161,
    UYI = 162,
    UYU = 163,
    UZS = 164,
    VEF = 165,
    VND = 166,
    VUV = 167,
    WST = 168,
    XAF = 169,
    XAG = 170,
    XAU = 171,
    XBA = 172,
    XBB = 173,
    XBC = 174,
    XBD = 175,
    XCD = 176,
    XDR = 177,
    XFU = 178,
    XOF = 179,
    XPD = 180,
    XPF = 181,
    XPT = 182,
    XTS = 183,
    XXX = 184,
    YER = 185,
    ZAR = 186,
    ZMW = 187
  }

  export enum FinancialTransactionType {
    WorkerCost = 1,
    CPPExpense = 2,
    EIExpense = 3,
    CPPPayableWorker = 4,
    CPPPayableEmployer = 5,
    EIPayableWorker = 6,
    EIPayableEmployer = 7,
    WorkerBenefitPayable = 8,
    QPIPExpense = 9,
    QPIPPayableWorker = 10,
    QPIPPayableEmployer = 11,
    FederalPayrollTaxes = 12,
    ProvincialPayrollTaxes = 13,
    WithholdingTaxes = 14,
    GSTHSTWorker = 15,
    QSTWorker = 16,
    Garnishee = 17,
    AdvanceRepayment = 18,
    Advances = 19,
    Donations = 20,
    AccruedVacationPay = 21,
    AccountsPayableNetPay = 22,
    Income = 23,
    GSTHSTBillable = 24,
    QSTBillable = 25,
    AccruedReceivableTransaction = 26,
    AccruedReceivableInvoice = 27,
    AccountsReceivableInvoice = 28,
    AccountsReceivablePayment = 29,
    VacationPayPayment = 30,
    AccountsPayablePayment = 31,
    BankDeposit = 32,
    BankPaymentTransaction = 33,
    WCBPayableEmployer = 34,
    WCBExpense = 35,
    HealthTaxPayableEmployer = 36,
    HealthTaxExpense = 37,
    QPPPayableWorker = 38,
    QPPPayableEmployer = 39,
    QPPExpense = 40,
    AdditionalPayrollTaxes = 41,
    AccrualEHT = 42,
    AccrualCPP = 43,
    AccrualEI = 44,
    EligibleTrainingExpenses = 45,
    AccrualTrainingLiabilities = 46,
    GarnisheePayment = 47,
    WorkerExpenses = 48,
    AccrualQPP = 52
  }

  export enum InvoiceRecipientType {
    To = 1,
    ClientCC = 2,
    InternalCC = 3
  }

  export enum InvoiceStatus {
    Draft = 1,
    Cancelled = 2,
    PendingClientPayment = 3,
    Paid = 4
  }

  export enum InvoiceTransactionDocumentStatus {
    Included = 1,
    Excluded = 2
  }

  export enum TransactionHeaderReversalReason {
    IncorrectHours = 1,
    IncorrectRate = 2,
    IncorrectTax = 3,
    IncorrectPO = 4,
    IncorrectPayrollBurden = 5,
    ClientRejectInvoice = 6,
    IncorrectTotalAmount = 7
  }

  export enum ClientSalesTaxDefault {
    HeadOffice = 1,
    WorkOrderWorksite = 2
  }

  export enum IndustryType {
    IndustryType101 = 1,
    IndustryType102 = 2,
    IndustryType103 = 3,
    IndustryType104 = 4,
    IndustryType105 = 5,
    IndustryType106 = 6,
    IndustryType201 = 7,
    IndustryType301 = 8,
    IndustryType302 = 9,
    IndustryType303 = 10,
    IndustryType304 = 11,
    IndustryType305 = 12,
    IndustryType401 = 13,
    IndustryType402 = 14,
    IndustryType403 = 15,
    IndustryType404 = 16,
    IndustryType405 = 17,
    IndustryType501 = 18,
    IndustryType502 = 19,
    IndustryType503 = 20,
    IndustryType504 = 21,
    IndustryType505 = 22,
    IndustryType601 = 23,
    IndustryType602 = 24,
    IndustryType603 = 25,
    IndustryType604 = 26,
    IndustryType605 = 27,
    IndustryType606 = 28,
    IndustryType701 = 29,
    IndustryType702 = 30,
    IndustryType703 = 31,
    IndustryType704 = 32,
    IndustryType705 = 33,
    IndustryType706 = 34,
    IndustryType707 = 35,
    IndustryType708 = 36,
    IndustryType709 = 37,
    IndustryType710 = 38,
    IndustryType711 = 39,
    IndustryType712 = 40,
    IndustryType713 = 41,
    IndustryType714 = 42,
    IndustryType715 = 43,
    IndustryType801 = 44,
    IndustryType802 = 45,
    IndustryType803 = 46,
    IndustryType804 = 47,
    IndustryType805 = 48,
    IndustryType806 = 49,
    IndustryType807 = 50,
    IndustryType808 = 51,
    IndustryType809 = 52,
    IndustryType901 = 53,
    IndustryType902 = 54,
    IndustryType903 = 55,
    IndustryType904 = 56,
    IndustryType1001 = 57,
    IndustryType1002 = 58,
    IndustryType1003 = 59
  }

  export enum LineOfBusiness {
    R = 1,
    P = 2,
    A = 3,
    SV = 4
  }

  export enum OrganizationBankSignature {
    Signature1 = 1,
    Signature2 = 2
  }

  export enum OrganizationBankStatus {
    Active = 1,
    InActive = 2
  }

  export enum OrganizationClientRoleAlternateBillStatus {
    New = 1,
    Draft = 2,
    PendingReview = 3,
    Active = 4
  }

  export enum OrganizationRoleStatusType {
    Active = 1,
    Inactive = 2
  }

  export enum OrganizationRoleType {
    Client = 1,
    IndependentContractor = 2,
    Internal = 3,
    SubVendor = 4,
    LimitedLiabilityCompany = 5
  }

  export enum WorkorderRoleType {
    Client = 1,
    IndependentContractor = 2,
    Internal = 3,
    SubVendor = 4,
    LimitedLiabilityCompany = 5
  }

  export enum OrganizationStatus {
    New = 1,
    Draft = 2,
    PendingReview = 3,
    Active = 4,
    PendingChange = 5,
    Discard = 6,
    DuplicateActive = 7,
    Declined = 8,
    Recalled = 9,
    ComplianceDraft = 10,
    RecalledCompliance = 11
  }

  export enum OrganizationSubVendorRoleRestrictionType {
    InternalOrganization = 1,
    ClientOrganization = 2
  }

  export enum RebateHeaderStatus {
    New = 1,
    Active = 2,
    InActive = 3
  }

  export enum RebateType {
    Amount = 1,
    Percentage = 2
  }

  export enum RebateVersionStatus {
    New = 1,
    Active = 2,
    Replaced = 3
  }

  export enum SectorType {
    SectorType1 = 1,
    SectorType2 = 2,
    SectorType3 = 3,
    SectorType4 = 4,
    SectorType5 = 5,
    SectorType6 = 6,
    SectorType7 = 7,
    SectorType8 = 8,
    SectorType9 = 9,
    SectorType10 = 10
  }

  export enum VmsFeeHeaderStatus {
    New = 1,
    Active = 2,
    InActive = 3
  }

  export enum VmsFeeVersionStatus {
    New = 1,
    Active = 2,
    Replaced = 3
  }

  export enum VMSType {
    ALEG = 1,
    FLEX = 2
  }

  export enum PayeeType {
    SupplierOrganization = 1,
    UserProfileWorker = 2,
    GarnisheePayTo = 3
  }

  export enum PaymentMethodType {
    Cheque = 1,
    DirectDeposit = 2,
    WireTransfer = 3,
    FromPayeeProfile = 4,
    ADP = 5
  }

  export enum PaymentReceiverType {
    To = 1,
    Cc = 2
  }

  export enum PaymentReleaseBatchStatus {
    Finalized = 1,
    Transferred = 2,
    Recalled = 3,
    CreationInProgress = 4,
    Draft = 5,
    DeletionInProgress = 6,
    Deleted = 7
  }

  export enum TransactionHeaderStatus {
    New = 1,
    Draft = 2,
    PendingReview = 3,
    Active = 4,
    Deleted = 5,
    Reversed = 6
  }

  export enum PaymentStatus {
    PendingRelease = 1,
    PendingBackofficeReview = 2,
    MarkedPaid = 3,
    SuppressRelease = 4,
    Released = 5,
    Recalled = 6,
    WaitingForPrint = 7,
    WaitingForClearance = 8,
    OnHold = 9,
    CancelledBeforePrinting = 11,
    CancelledAfterPrinting = 12,
    PaymentStopped = 13,
    NSF = 14,
    Cleared = 15
  }

  export enum WireTransferBankType {
    CndClearingCode = 1,
    CHIPS = 2,
    FED = 3,
    OTHER = 4,
    SWIFT = 5
  }

  export enum PaymentOtherEarningType {
    VacationPay = 1
  }

  export enum RemittanceStatus {
    Created = 1,
    Recalled = 2
  }

  export enum RemittanceTransactionBatchStatus {
    Created = 1,
    Recalled = 2
  }

  export enum RemittanceType {
    Payroll = 1,
    WorkerSafety = 2,
    HealthTax = 3
  }

  export enum SourceDeductionType {
    CPP = 1,
    EI = 2,
    PIP = 3,
    HealthCare = 4,
    WCB = 5,
    FederalTax = 6,
    Provincial = 7,
    QPP = 8,
    NonResident = 9,
    AdditionalTax = 10,
    Medicare = 11,
    SocialSecurity = 12,
    Fudi = 13,
    Sui = 14,
    QuebecTrainingFee = 15,
    Benefits = 16
  }

  export enum TaxVersionStatus {
    New = 1,
    Active = 2,
    Replaced = 3
  }

  export enum WorkerCompensationStatus {
    Active = 1,
    InActive = 2
  }

  export enum DepletedAction {
    StopFromSubmitting = 1
  }

  export enum DepletionGroup {
    AllBillingDocuments = 1,
    TimesheetOnly = 2,
    ExpenseOnly = 3
  }

  export enum DepletionOption {
    FundsReserved = 1
  }

  export enum InvoiceRestriction {
    NoRestrictions = 1
  }

  export enum PurchaseOrderStatus {
    New = 1,
    Active = 2,
    Draft = 3,
    Reserved = 4,
    Reversed = 5,
    Commited = 6
  }

  export enum WorkOrderPurchaseOrderLineStatus {
    New = 1,
    Active = 2,
    Draft = 3,
    Replaced = 4,
    PendingReview = 5,
    Cancelled = 6,
    Terminated = 7,
    Inactive = 8
  }

  export enum PrintQueueStatus {
    InQueue = 1,
    Printing = 2,
    Completed = 3,
    Cancelled = 4,
    Error = 5,
    OnHold = 6
  }

  export enum PrintQueueType {
    PaymentCheque = 1,
    PaymentStub = 2,
    GarnisheeCheque = 3,
    InvoiceRecipient = 4,
    InvoiceTransactionDocument = 5,
    T4 = 6,
    T4A = 7
  }

  export enum ReassignmentType {
    Collaborator = 1,
    Recruiter = 2
  }

  export enum RuleExpressionType {
    Static = 1,
    Dynamic = 2,
    Mono = 3
  }

  export enum RuleJoinOperator {
    AND = 1,
    OR = 2
  }

  export enum RuleOperator {
    Equals = 1,
    GreaterThan = 2,
    GreaterThanEquals = 3,
    LessThan = 4,
    LessThanEquals = 5
  }

  export enum TemplateStatus {
    Active = 1,
    InActive = 2
  }

  export enum TimeSheetReversalReason {
    Cancel = 1,
    Return = 2
  }

  export enum TimeSheetStatus {
    New = 1,
    Draft = 2,
    PendingClientReview = 3,
    Approved = 4,
    Declined = 5,
    PendingSupportingDocumentUpload = 6,
    Recalled = 7,
    PendingSupportingDocumentReview = 8,
    SupportingDocumentAccepted = 9,
    ApprovedAndAccepted = 10,
    Unsubmitted = 11,
    PendingBackofficeReview = 12
  }

  export enum TimeSheetType {
    Manual = 1,
    Imported = 2
  }

  export enum AdvanceStatus {
    Active = 1,
    Complete = 2,
    Cancelled = 3
  }

  export enum ARStatus {
    Unpaid = 1,
    MarkedAsPaidByAutomaticProcess = 2,
    MarkedAsPaidManually = 3,
    PaidAndRecordedThoughARCollection = 4
  }

  export enum EarningsAndDeductionsType {
    SourceDeductionCanadaPensionPlan = 1,
    SourceDeductionEmploymentInsurance = 2,
    SourceDeductionParentalInsurancePlan = 3,
    SourceDeductionHealthCare = 4,
    SourceDeductionWCB = 5,
    SourceDeductionFederalTax = 6,
    SourceDeductionProvincialTax = 7,
    SourceDeductionQuebecPensionPlan = 8,
    SourceDeductionNonResidentWithHolding = 9,
    SourceDeductionAdditionalTax = 10,
    PaymentOtherEarningVacationPay = 11,
    Advance = 12,
    Garnishee = 13,
    VmsFee = 14,
    Rebate = 15,
    SourceDeductionMedicare = 16,
    SourceDeductionSocialSecurity = 17,
    SourceDeductionFudi = 18,
    SourceDeductionSui = 19,
    SourceDeductionQuebecTrainingFee = 20,
    SourceDeductionBenefits = 21
  }

  export enum GarnisheeStatus {
    Active = 1,
    Complete = 2,
    Cancelled = 3
  }

  export class PaymentTransactionStatus {
    static New = 1;
    static PendingReleaseVirtual = {
      ReadyToRelease: 51,
      PlannedForRelease: 52,
      Stopped: 53
    };
    static Draft = 2;
    static PendingReview = 3;
    static PendingPaymentRelease = 4;
    static PendingPaymentProcessing = 5;
    static OnHold = 6;
    static Paid = 7;
    static Suppress = 8;
  }

  export enum RemittanceTransactionStatus {
    New = 1,
    Draft = 2,
    PendingRelease = 3,
    Released = 4,
    Recalled = 5,
    Suppressed = 6
  }

  export enum TransactionCategory {
    Bonus = 1,
    HoursAdjustment = 2,
    RateAdjustment = 3,
    StatHolidayPayAdjust = 4,
    VacationPay = 5
  }

  export enum TransactionType {
    Timesheet = 1,
    Manual = 2,
    Expense = 3,
    Advance = 4,
    VmsTimesheet = 5,
    Adjustment = 6,
    VacationPayment = 7,
    VmsCommission = 8,
    VmsExpense = 9,
    VmsFixedPrice = 10
  }

  export enum EligibilityForWorkPermit {
    NotReceived = 1,
    Received = 2,
    Refused = 3
  }

  export enum IECCategoryStudentType {
    WorkingHolidays = 1,
    YoungProfessionalsGraduates = 2,
    InternationalCoop = 3,
    SummerJob = 4
  }

  export enum InternalTeamRestrictionType {
    InternalOrganization = 1,
    ClientOrganization = 2,
    LineOfBusiness = 3,
    InternalOrganizationDefinition1 = 4
  }

  export enum InternalTeamStatus {
    Active = 1,
    New = 2
  }

  export enum PersonTitle {
    Mr = 1,
    Miss = 2,
    Dr = 3,
    Mrs = 4,
    Ms = 5
  }

  export enum ProfileAddressType {
    Home = 1,
    Business = 2
  }

  export enum ProfileGroup {
    Organizational = 1,
    Internal = 2,
    Worker = 3
  }

  export enum ProfilePhoneType {
    BZ = 1,
    CL = 2,
    HM = 3
  }

  export enum ProfilePrimaryStatus {
    No = 1,
    Yes = 2
  }

  export enum ProfileStatus {
    Active = 1,
    InActive = 2,
    Suspended = 3,
    Draft = 4,
    New = 5,
    PendingReview = 6,
    PendingChange = 7,
    Discard = 8,
    PendingInactive = 9,
    PendingActive = 10,
    Declined = 11,
    Recalled = 12,
    ComplianceDraft = 13,
    RecalledCompliance = 14
  }

  export enum ProfileType {
    Organizational = 1,
    Internal = 2,
    WorkerTemp = 3,
    WorkerCanadianSP = 4,
    WorkerCanadianInc = 5,
    WorkerSubVendor = 6,
    WorkerUnitedStatesW2 = 7,
    WorkerUnitedStatesLLC = 8,
    System = 99
  }

  export enum ProfileWorkerBenefitType {
    Benefit = 1
  }

  export enum TemporaryForeignPermitType {
    ForeignWorkerTwa = 1,
    StudentIec = 2,
    NAFTA = 3
  }

  export enum UserStatus {
    Active = 1,
    Inactive = 2,
    Locked = 3,
    InvitationPending = 4,
    Draft = 5,
    PendingReview = 6,
    PendingChange = 7,
    Declined = 8,
    Recalled = 9,
    ComplianceDraft = 10,
    RecalledCompliance = 11
  }

  export enum WorkerEligibility {
    CitizenOrPermanentResident = 1,
    ForeignWorker = 2,
    NA = 3
  }

  export enum WorkPermitType {
    OpenUnrestricted = 1,
    OpenRestricted = 2,
    Closed = 3,
    Other = 4
  }

  export enum AssigneeType {
    FunctionalRole = 1,
    UserContext = 2,
    System = 3
  }

  export enum TaskResult {
    Complete = 1,
    Yes = 2,
    No = 3,
    ApprovalNotRequired = 6,
    UnsubmitTimeSheet = 201,
    SendTimeSheetToBackOfficeReview = 202,
    InsufficientPurchaseOrderFunds = 232,
    WovActionDiscard = 305,
    WovActionCancel = 306,
    WovActionDelete = 310,
    WovActionOnline = 311,
    WovActionOffline = 312,
    WovIsDraft = 318,
    WovIsPendingReview = 319,
    WovIsTerminated = 324,
    WovActionAccessibilityAll = 334,
    WovActionAccessibilityCreateTransactionCancelExtendTerminate = 335,
    WovActionAccessibilityCreateTransactionCorrectTerminate = 336,
    WovActionAccessibilityCreateTransactionTerminate = 337,
    WovActionAccessibilityNone = 338,
    WovActionAccessibilityCreateTransactionExtend = 339,
    WovActionCreateTransactionManual = 341,
    WovActionCreateTransactionAdjustment = 342,
    WovActionCreateTransactionReleaseVacationPay = 343,
    WovExpire = 344,
    WovActionAccessibilityCreateTransactionExtendReactivate = 345,
    WovIsComplianceDraft = 346,
    TransactionHeaderWorkflowBeginOnActive = 441,
    TransactionHeaderWorkflowBeginOnDraftManual = 443,
    TransactionHeaderDraftManualActionSave = 446,
    TransactionHeaderDraftManualActionSubmit = 447,
    TransactionHeaderDraftManualActionDiscard = 448,
    TransactionHeaderDraftManualActionDelete = 449,
    TransactionHeaderDraftManualActionApprovalOnline = 450,
    TransactionHeaderDraftManualActionApprovalOffline = 451,
    TransactionHeaderDraftManualActionApprovalDecline = 452,
    TransactionHeaderDraftManualActionApprovalConfirm = 453,
    TransactionBillingInvoiceCreateDecisionIsConsolidation = 454,
    TransactionBillingInvoiceCreateDecisionIsOneToOne = 455,
    TransactionBillingInvoiceDecisionIsInternal = 456,
    TransactionBillingInvoiceDecisionIsNotInternal = 457,
    TransactionBillingInvoiceDecisionIsAutoRelease = 458,
    TransactionBillingInvoiceDecisionIsNotAutoRelease = 459,
    TransactionBillingInvoiceActionRelease = 460,
    TransactionHeaderIsActiveReversed = 461,
    TransactionHeaderContainTimesheet = 462,
    TransactionHeaderNotContainTimesheet = 463,
    TransactionHeaderActionReverse = 464,
    TransactionHeaderActionReverseTimeSheetUnsubmit = 465,
    TransactionHeaderActionReverseTimeSheetReturnToException = 466,
    TransactionBillingInvoiceActionCreateConsolidation = 467,
    TransactionHeaderSendNotificationOnReversed = 468,
    TransactionHeaderNotSendNotificationOnReversed = 469,
    TransactionHeaderIsActiveNotReversed = 470,
    TransactionPaymentActionApprovalOnline = 471,
    TransactionPaymentActionApprovalOffline = 472,
    TransactionPaymentReleaseApproved = 473,
    TransactionPaymentReleaseDeclined = 474,
    TransactionPaymentReleaseByDirectDeposit = 475,
    TransactionPaymentReleaseByCheque = 476,
    TransactionPaymentReleaseWithDateChange = 477,
    TransactionPaymentReleaseByChequeContinue = 478,
    TransactionPaymentReleaseByDirectDepositContinue = 479,
    TransactionPaymentReleaseToMarkPaid = 480,
    TransactionPaymentReleaseToOnHold = 481,
    TransactionHeaderManualAddLine = 482,
    TransactionHeaderManualRemoveLine = 483,
    TransactionBillingTransactionUpdateNotes = 484,
    TransactionBillingInvoiceActionSuppressRelease = 485,
    TransactionPaymentReleaseBatchActionRecall = 486,
    TransactionHeaderAdvanceDecisionIsNotAllowedToReverse = 488,
    TransactionHeaderAdvanceDecisionIsAllowedToReverse = 489,
    TransactionHeaderAdvanceActionReverse = 490,
    TransactionHeaderAdjustmentDecisionIsAllowedToReverse = 491,
    TransactionHeaderAdjustmentActionReverse = 492,
    TransactionPaymentSuppressRelease = 493,
    TransactionPaymentRelease = 494,
    TransactionPaymentReleaseByWireTransfer = 495,
    TransactionPaymentReleaseByWireTransferContinue = 496,
    TransactionPaymentReleaseByADP = 497,
    TransactionPaymentReleaseByADPContinue = 498,
    PaymentMethodChange = 499,
    PaymentReleaseBatchPaymentMethodDirectDeposit = 501,
    PaymentReleaseBatchPaymentMethodCheque = 502,
    PaymentReleaseBatchPaymentMethodWireTransfer = 503,
    PaymentReleaseBatchPaymentMethodADP = 504,
    PaymentMethodDirectDeposit = 601,
    PaymentMethodCheque = 602,
    PaymentMethodWireTransfer = 603,
    PaymentMethodADP = 604,
    PaymentReleaseSendEmail = 678,
    PaymentReleaseBatchActionRecall = 686,
    PaymentReleaseBatchActionTransferToBank = 687,
    FederalTaxVersionIsActive = 701,
    FederalTaxVersionIsReplaced = 702,
    FederalTaxVersionActionCorrect = 703,
    FederalTaxVersionActionScheduleChange = 704,
    ProvincialTaxVersionIsActive = 801,
    ProvincialTaxVersionIsReplaced = 802,
    ProvincialTaxVersionActionCorrect = 803,
    ProvincialTaxVersionActionScheduleChange = 804,
    SalesTaxVersionIsActive = 901,
    SalesTaxVersionIsReplaced = 902,
    SalesTaxVersionActionCorrect = 903,
    SalesTaxVersionActionScheduleChange = 904,
    VmsProcessedRecordHasTypeConflict = 1001,
    VmsProcessedRecordHasTypeToProcess = 1002,
    BatchThreadExecutionOnVmsProcessedRecordTransferInternally = 1003,
    VmsProcessedRecordDiscard = 1004,
    VmsProcessedRecordResolve = 1005,
    VmsProcessedRecordMarkAsConflicting = 1006,
    VmsProcessedRecordGenerateTransaction = 1007,
    PaymentTransactionGarnisheesBatchToPayments = 1101,
    CommissionRateVersionIsActive = 1201,
    CommissionRateVersionIsReplaced = 1202,
    CommissionRateVersionActionCorrect = 1203,
    CommissionRateVersionActionScheduleChange = 1204,
    CommissionRateDuplicateFound = 1205,
    VmsFeeVersionIsActive = 1301,
    VmsFeeVersionIsReplaced = 1302,
    VmsFeeVersionActionCorrect = 1303,
    VmsFeeVersionActionScheduleChange = 1304,
    RebateVersionIsActive = 1401,
    RebateVersionIsReplaced = 1402,
    RebateVersionActionCorrect = 1403,
    RebateVersionActionScheduleChange = 1404,
    CommissionTransactionToScheduled = 1501,
    CommissionTransactionToOnHold = 1502,
    CommissionTransactionUserActionPaid = 1503,
    OrganizationActionNew = 1701,
    OrganizationActionSave = 1702,
    OrganizationActionSubmit = 1704,
    OrganizationDecisionApprovalOnline = 1709,
    OrganizationDecisionApprovalOffline = 1710,
    OrganizationIsOriginal = 1711,
    OrganizationIsDuplicate = 1712,
    OrganizationIsSupplier = 1713,
    OrganizationIsInternalOrClient = 1714,
    UserProfileActionSave = 1802,
    UserProfileActionSubmit = 1803,
    UserProfileActionDiscard = 1804,
    UserProfileOnlineSubmission = 1805,
    UserProfileOfflineSubmission = 1806,
    UserProfileActionApprove = 1807,
    UserProfileIsOriginal = 1808,
    UserProfileIsDuplicate = 1809,
    UserProfileActionCorrect = 1810,
    UserProfileActionRecall = 1811,
    UserProfileActionDecline = 1812,
    AccessSubscriptionActionNew = 2001,
    AccessSubscriptionActionSave = 2002,
    AccessSubscriptionActionDiscard = 2003,
    AccessSubscriptionActionSubmit = 2004,
    AccessSubscriptionActionCorrect = 2005,
    AccessSubscriptionActionApprovalRecall = 2006,
    AccessSubscriptionActionApprovalDecline = 2007,
    AccessSubscriptionActionApprovalApprove = 2008,
    AccessSubscriptionDecisionApprovalOnline = 2009,
    AccessSubscriptionDecisionApprovalOffline = 2010,
    AccessSubscriptionIsOriginal = 2011,
    AccessSubscriptionIsDuplicate = 2012,
    VmsDiscountRecordIsTypeConflict = 2101,
    VmsDiscountRecordIsTypeToProcess = 2102,
    VmsDiscountRecordToChangeInternalOrg = 2103,
    VmsDiscountRecordToDiscard = 2104,
    VmsDiscountRecordToResolve = 2105,
    VmsDiscountRecordMarkAsConflicting = 2106,
    VmsDiscountRecordGenerateTransaction = 2107,
    VmsDocumentTimesheetImportRecords = 2201,
    VmsDocumentDiscountImportRecords = 2202,
    VmsDocumentExpenseImportRecords = 2203,
    VmsDocumentCommissionImportRecords = 2204,
    VmsUnitedStatesSourceDeductionImportedRecords = 2205,
    VmsDocumentFixedPriceImportRecords = 2206,
    VmsDocumentPreprocessFile = 2211,
    VmsDocumentTimesheetProcessRecords = 2212,
    VmsDocumentDiscountProcessRecords = 2213,
    VmsDocumentExpenseProcessRecords = 2214,
    VmsDocumentCommissionProcessRecords = 2215,
    VmsDocumentUnitedStatesSourceDeductionProcessRecords = 2216,
    VmsDocumentFixedPriceProcessRecords = 2217,
    VmsDocumentFileProcessed = 2230,
    VmsDocumentDiscardFile = 2240,
    ComplianceDocumentRuleDecisionApprovalOnline = 3011,
    ComplianceDocumentRuleDecisionApprovalOffline = 3012,
    ComplianceDocumentRuleIsOriginal = 3013,
    ComplianceDocumentRuleIsDuplicate = 3014,
    ComplianceDocumentDecisionApprovalOnline = 3111,
    ComplianceDocumentDecisionApprovalOffline = 3112,
    WCBSubdivisionVersionIsActive = 3201,
    WCBSubdivisionVersionIsReplaced = 3202,
    WCBSubdivisionVersionActionCorrect = 3203,
    WCBSubdivisionVersionActionScheduleChange = 3204,
    WCBSubdivisionVersionCancel = 3205,
    UnsumitExpenseClaim = 3401,
    SendExpenseClaimToBackOfficeReview = 3402,
    VmsExpenseRecordIsTypeConflict = 3501,
    VmsExpenseRecordIsTypeToProcess = 3502,
    VmsExpenseRecordToChangeInternalOrg = 3503,
    VmsExpenseRecordToDiscard = 3504,
    VmsExpenseRecordToResolve = 3505,
    VmsExpenseRecordMarkAsConflicting = 3506,
    VmsExpenseRecordGenerateTransaction = 3507,
    RemittanceTransactionNew = 3601,
    RemittanceTransactionSuppress = 3602,
    VmsCommissionRecordIsTypeConflict = 3901,
    VmsCommissionRecordIsTypeToProcess = 3902,
    VmsCommissionRecordToChangeInternalOrg = 3903,
    VmsCommissionRecordToDiscard = 3904,
    VmsCommissionRecordToResolve = 3905,
    VmsCommissionRecordMarkAsConflicting = 3906,
    VmsCommissionRecordGenerateTransaction = 3907,
    VmsUnitedStatesSourceDeductionRecordIsTypeConflict = 4001,
    VmsUnitedStatesSourceDeductionRecordIsTypeToProcess = 4002,
    VmsUnitedStatesSourceDeductionRecordToChangeInternalOrg = 4003,
    VmsUnitedStatesSourceDeductionRecordToDiscard = 4004,
    VmsUnitedStatesSourceDeductionRecordToResolve = 4005,
    VmsUnitedStatesSourceDeductionRecordMarkAsConflicting = 4006,
    VmsUnitedStatesSourceDeductionRecordGenerateTransaction = 4007,
    VmsFixedPriceRecordIsTypeConflict = 4201,
    VmsFixedPriceRecordIsTypeToProcess = 4202,
    VmsFixedPriceRecordToChangeInternalOrg = 4203,
    VmsFixedPriceRecordToDiscard = 4204,
    VmsFixedPriceRecordToResolve = 4205,
    VmsFixedPriceRecordMarkAsConflicting = 4206,
    VmsFixedPriceRecordGenerateTransaction = 4207
  }

  export enum TaskRoutingDialogType {
    None = 1,
    Decline = 2
  }

  export enum TaskStatus {
    Pending = 1,
    Completed = 2,
    Exception = 3,
    WorkflowMigrationTrigger = 4,
    PendingWaiting = 5
  }

  export enum ApproverType {
    ClientApprover = 1,
    InternalApprover = 2,
    SupplierApprover = 3
  }

  export enum BillingConsolidationType {
    ManualConsolidation = 1,
    OneInvoicePerBillingPeriod = 2
  }

  export enum BillingFrequency {
    Monthly = 1,
    SemiMonthly = 2,
    BiWeekly = 3,
    Weekly = 4
  }

  export enum BillingInvoicePresentationStyle {
    Consolidated = 1,
    OneInvoicePerTransactions = 2
  }

  export enum BillingInvoiceTemplate {
    Standard = 1,
    Detailed = 2
  }

  export enum BillingInvoiceTerms {
    Net30Days = 1
  }

  export enum CreationReason {
    New = 1,
    Extend = 2,
    ScheduleChange = 3,
    CorrectWorkOrderVersionEarliest = 4,
    CorrectWorkOrderVersionLatest = 5,
    CorrectWorkOrderVersionMiddle = 6,
    CorrectWorkOrderVersionUnique = 7
  }

  export enum DeliveryMethod {
    HardCopy = 1,
    SoftCopy = 2,
    Suppressed = 3,
    InternalProfile = 4
  }

  export enum ExpenseMethodology {
    OnlineApproval = 1,
    OfflineApproval = 2,
    ThirdPartyImport = 3,
    NoExpense = 4
  }

  export enum InvoiceType {
    TimeSheet = 1,
    Expense = 2
  }

  export enum PaymentInvoiceTemplate {
    PCGLStandardPaymentVoucher = 1,
    PCGLTempWorkerPaystub = 2
  }

  export enum PaymentInvoiceTerms {
    PayWhenPaid = 1,
    ScheduledTerms = 2,
    Immediate = 3,
    Term = 4
  }

  export enum PaymentReleaseSchedule {
    WeeklyWeekArrears1 = 1,
    WeeklyWeekArrears2 = 2,
    BiweeklyWeekArrears1MondayStart = 3,
    BiweeklyWeekArrears2SundayStart = 4,
    BiweeklyWeekArrears2MondayStart = 5,
    SemiMonthlyArrears = 6,
    BiWeeklyWeekArrears1SaturdayStart = 7,
    WeeklyWeekArrears2SundayStart = 8,
    MonthlyWeekArrears2 = 9
  }

  export enum PositionTitle {
    Unmapped = 0,
    Accountant = 1,
    AccountingAssociate = 2,
    Administrator = 3,
    APProcessingSupport = 4,
    ApplicationAnalyst = 5,
    ApplicationTechnicalArchitect = 6,
    BusinessAnalyst = 7,
    BusinessConsultant = 8,
    BusinessProcessAnalyst = 9,
    BusinessSystemsAnalyst = 10,
    CompensationConsultant = 11,
    ContentSpecialistManager = 12,
    ContractNegotiator = 13,
    CRMAnalyst = 14,
    DataAnalystModeler = 15,
    DatabaseAdministrator = 16,
    DatabaseArchitect = 17,
    DatabaseDeveloper = 18,
    DesktopTechnicalSupport = 19,
    DevelopmentManager = 20,
    DevelopmentTeamLead = 21,
    Director = 22,
    EducationSpecialist = 23,
    ERPAnalyst = 24,
    FinancialAnalyst = 25,
    GraphicDesigner = 26,
    HardwareDeveloper = 27,
    HRPayrollAccountingAnalyst = 28,
    ImplementationSpecialist = 29,
    InstructionalDesigner = 30,
    ITAuditor = 31,
    ITDirector = 32,
    ITManager = 33,
    ManagementConsultant = 34,
    MarketingCoordinator = 35,
    NetworkSystemsAdministrator = 36,
    NetworkArchitect = 37,
    NetworkInfrastructureManager = 38,
    NetworkInfrastructureSpecialist = 39,
    NonITTitleEngineering = 40,
    NonITTitleAccounting = 41,
    NonITTitleAdministrationSecretarial = 42,
    NonITTitleSalesMarketing = 43,
    Operator = 44,
    Other = 45,
    PeopleSoftAnalyst = 46,
    PrivacyConsultant = 47,
    ProcessImprovementConsultant = 48,
    ProcurementConsultant = 49,
    ProgramManager = 50,
    ProgrammerAnalystDeveloper = 51,
    ProjectControlOfficer = 52,
    ProjectCoordProjectController = 53,
    ProjectLeader = 54,
    ProjectManager = 55,
    QAAnalystTester = 56,
    QATeamLead = 57,
    QualityAssuranceManager = 58,
    RecruitmentConsultant = 59,
    SalesTechnical = 60,
    SAPConsultant = 61,
    SecurityAnalyst = 62,
    SoftwareDeveloper = 63,
    SystemAnalyst = 64,
    SystemsArchitect = 65,
    SystemsProgrammer = 66,
    TechnicalSupportManager = 67,
    TechnicalWriter = 68,
    TelecomTelephonyAnalyst = 69,
    TestingSpecialist = 70,
    Trainer = 71,
    UsabilityUserInterface = 72,
    VendorManagement = 73,
    ClientServerDeveloperSenior = 74,
    AnalystTechnicalClientSupportIntermediate = 75,
    OperationsSupportAnalyst = 76,
    TrainingConsultant = 77,
    SecurityConsultant = 78
  }

  export enum RateType {
    Primary = 1,
    Overtime = 2,
    OnCallWeekday = 3,
    Pager = 4,
    Other = 5,
    Stat = 6,
    DoubleTime = 7,
    TravelTime = 8,
    Session = 9,
    OnCallWeekend = 10
  }

  export enum RateUnit {
    Hour = 1,
    Day = 2,
    Fixed = 3,
    Words = 4,
    Monthly = 5,
    Shift = 6
  }

  export enum RecipientType {
    InvoiceRecipient = 1,
    CourtesyCopy = 2,
    InvoiceViewer = 3
  }

  export enum T4SlipType {
    T4 = 1,
    T4A = 2,
    T4ANR = 3
  }

  export enum TerminationReason {
    M00 = 1,
    E00 = 2,
    A00 = 3,
    K00 = 4,
    A01 = 5,
    B00 = 6,
    D00 = 7,
    E02 = 8,
    E03 = 9,
    E04 = 10,
    E05 = 11,
    E06 = 12,
    E09 = 13,
    E10 = 14,
    E11 = 15,
    F00 = 16,
    G00 = 17,
    G7 = 18,
    H00 = 19,
    J00 = 20,
    K12 = 21,
    K13 = 22,
    K14 = 23,
    K15 = 24,
    K16 = 25,
    K17 = 26,
    M08 = 27,
    N00 = 28,
    P00 = 29,
    Z00 = 30
  }

  export enum TimeSheetApprovalFlow {
    Alternate = 1,
    Sequential = 2,
    Parallel = 3
  }

  export enum TimeSheetCycle {
    SemiMonthly = 1,
    Monthly = 2,
    Weekly = 3,
    Biweekly = 4
  }

  export enum TimeSheetMethodology {
    OnlineApproval = 1,
    OfflineApproval = 2,
    ThirdPartyImport = 3,
    NoTimesheet = 4
  }

  export enum WorkOrderVersionStatus {
    // New = 1,
    Approved = 2,
    Draft = 3,
    Replaced = 4,
    PendingReview = 5,
    Cancelled = 6,
    // Terminated = 7,
    Deleted = 8,
    Declined = 9,
    Recalled = 10,
    // Expired = 11,
    ComplianceDraft = 12,
    RecalledCompliance = 13,
    PendingUnterminate = 14
  }

  export enum AssignmentStatus {
    Onboarding = 1,
    Engaged = 2,
    Complete = 3
    // Terminated = 4
  }

  export enum WorkOrderStatus {
    Processing = 1,
    Active = 2,
    Complete = 3,
    Terminated = 4,
    ChangeInProgress = 5,
    Cancelled = 6
  }

  export enum Worksite {
    Calgary = 1,
    Edmonton = 2,
    Gatineau = 3,
    London = 4,
    Montreal = 5,
    Ottawa = 6,
    Toronto = 7,
    Waterloo = 8,
    Winnipeg = 9,
    Vancouver = 10,
    Victoria = 11,
    Regina = 12,
    Halifax = 13,
    Newfoundland = 14,
    BritishColumbia = 15,
    NewBrunswick = 16,
    Manitoba = 17,
    Alberta = 18,
    NovaScotia = 19,
    Germany = 20,
    Quebec = 21,
    Texas = 22,
    CaymanIslands = 23,
    Arkansas = 24,
    Barbados = 25,
    California = 26,
    Colorado = 27,
    Florida = 28,
    Georgia = 29,
    Illinois = 30,
    Massachusetts = 31,
    Minnesota = 32,
    NewYork = 33,
    NorthCarolina = 34,
    SouthCarolina = 35,
    Wisconsin = 36,
    Washington = 37,
    PEI = 38,
    Nunavut = 39
  }

  export enum commissionCustomStatusType {
    ToCorrect = 1,
    ToScheduleChange = 2,
    ToManageRestrictions = 3,
    ToDeactivate = 4,
  }

  // 	===================	SQL Script result END	===================================

  export class CommandNamesSupportedByUi {
    static WorkflowBatchOperationOnTasksSelected = 'WorkflowBatchOperationOnTasksSelected';

    static UserDefinedCodeComplianceDocumentTypeNew = 'UserDefinedCodeComplianceDocumentTypeNew';
    static UserDefinedCodeComplianceDocumentTypeSave = 'UserDefinedCodeComplianceDocumentTypeSave';
    static UserDefinedCodeComplianceDocumentTypeSubmit = 'UserDefinedCodeComplianceDocumentTypeSubmit';
    static UserDefinedCodeComplianceDocumentTypeDiscard = 'UserDefinedCodeComplianceDocumentTypeDiscard';
    static UserDefinedCodeComplianceDocumentTypeActivate = 'UserDefinedCodeComplianceDocumentTypeActivate';
    static UserDefinedCodeComplianceDocumentTypeInactivate = 'UserDefinedCodeComplianceDocumentTypeInactivate';

    static BatchExecutionOnCreateZipOfDocumentsOfApplicableComplianceTemplate = 'BatchExecutionOnCreateZipOfDocumentsOfApplicableComplianceTemplate';
    static ComplianceDocumentUserActionViewDocumentSample = 'ComplianceDocumentUserActionViewDocumentSample';
    static ComplianceDocumentUserActionViewDocumentTemplate = 'ComplianceDocumentUserActionViewDocumentTemplate';
    static ComplianceDocumentUserActionViewDocument = 'ComplianceDocumentUserActionViewDocument';
    static ComplianceDocumentUserActionUploadDocumentMain = 'ComplianceDocumentUserActionUploadDocumentMain';
    static ComplianceDocumentUserActionSendToReview = 'ComplianceDocumentUserActionSendToReview';

    static ComplianceDocumentUserActionUploadDocumentExemption = 'ComplianceDocumentUserActionUploadDocumentExemption';
    static ComplianceDocumentUserActionRequestExemptionApprovalDecline = 'ComplianceDocumentUserActionRequestExemptionApprovalDecline';
    static ComplianceDocumentUserActionRequestExemptionApprovalApprove = 'ComplianceDocumentUserActionRequestExemptionApprovalApprove';

    static ComplianceDocumentUserActionRequestSnooze = 'ComplianceDocumentUserActionRequestSnooze';
    static ComplianceDocumentUserActionRequestSnoozeApprovalApprove = 'ComplianceDocumentUserActionRequestSnoozeApprovalApprove';
    static ComplianceDocumentUserActionRequestSnoozeApprovalDecline = 'ComplianceDocumentUserActionRequestSnoozeApprovalDecline';

    static ComplianceDocumentUserActionEditExpiryDate = 'ComplianceDocumentUserActionEditExpiryDate';
    static ComplianceDocumentUserActionPendingReviewApprovalApprove = 'ComplianceDocumentUserActionPendingReviewApprovalApprove';
    static ComplianceDocumentUserActionPendingReviewApprovalDecline = 'ComplianceDocumentUserActionPendingReviewApprovalDecline';
    static ComplianceDocumentUserActionDelete = 'ComplianceDocumentUserActionDelete';
    static ComplianceDocumentUserActionArchive = 'ComplianceDocumentUserActionArchive';

    static BaseOrganizationIdCommand = {
      OrganizationApprovalApprove: 'OrganizationApprove',
      OrganizationApprovalDecline: 'OrganizationDecline',
      OrganizationApprovalRecall: 'OrganizationRecall',
      OrganizationDiscard: 'OrganizationDiscard',
      OrganizationOriginalCorrect: 'OrganizationEditActive',
      OrganizationDiscardChanges: 'OrganizationDiscardChanges',
      OrganizationApprovalRecallCompliance: 'OrganizationRecallToCompliance'
    };

    static BaseContactsCommand = {
      UserProfileStatusToDiscard: 'UserProfileStatusToDiscard',
      UserProfileCancel: 'UserProfileCancel',
      UserProfileSave: 'UserProfileSave',
      UserProfileSubmit: 'UserProfileSubmit',
      UserProfileFinalize: 'UserProfileFinalize',
      UserProfileDecline: 'UserProfileDecline',
      UserProfileRecall: 'UserProfileRecall',
      UserProfileRecallCompliance: 'UserProfileRecallCompliance',
      UserProfileApproval: 'UserProfileApproval',
      UserProfileCorrect: 'UserProfileCorrect',
      UserProfileInactivate: 'UserProfileInactivate',
      UserProfileInactivateApprove: 'UserProfileInactivateApprove',
      UserProfileInactivateDecline: 'UserProfileInactivateDecline',
      UserProfileActivate: 'UserProfileActivate',
      UserProfileActivateApprove: 'UserProfileActivateApprove',
      UserProfileActivateDecline: 'UserProfileActivateDecline',
      UserProfileApprove: 'UserProfileApprove',
      UserProfileDelete: 'UserProfileDelete',
      UserProfileEdit: 'UserProfileEdit',
      UserProfileCreateAdjustment: 'WorkOrderCreateAdjustment',
      UserProfileReassign: 'UserProfileReassign',
      UserProfileDiscard: 'UserProfileDiscard'
    };

    static BaseOrganizationSaveCommand = {
      OrganizationSave: 'OrganizationSave',
      OrganizationFinalize: 'OrganizationFinalizeComplianceDraft',
      OrganizationSubmit: 'OrganizationSubmit'
    };

    static BaseDocumentRuleCommand = {
      ComplianceDocumentRuleUserActionDiscard: 'ComplianceDocumentRuleUserActionDiscard',
      ComplianceDocumentRuleUserActionSave: 'ComplianceDocumentRuleUserActionSave',
      ComplianceDocumentRuleUserActionSubmit: 'ComplianceDocumentRuleUserActionSubmit',
      ComplianceDocumentRuleUserActionOriginalCorrect: 'ComplianceDocumentRuleUserActionOriginalCorrect',
      ComplianceDocumentRuleUserActionApprovalRecall: 'ComplianceDocumentRuleUserActionApprovalRecall',
      ComplianceDocumentRuleUserActionApprovalApprove: 'ComplianceDocumentRuleUserActionApprovalApprove',
      ComplianceDocumentRuleUserActionApprovalDecline: 'ComplianceDocumentRuleUserActionApprovalDecline'
    };

    static WorkOrderActionCommand = {
      WorkOrderDiscardChanges: 'WorkOrderDiscardChanges',
      workOrderSaveAsTemplate: 'workOrderSaveAsTemplate'
    };

    static ComplianceTemplateNew = 'ComplianceTemplateNew';
    static ComplianceTemplateSubmit = 'ComplianceTemplateSubmit';
    static ComplianceTemplateDiscard = 'ComplianceTemplateDiscard';
    static ComplianceTemplateDeleteTemplateDocument = 'ComplianceTemplateDeleteTemplateDocument';
    static ComplianceTemplateDeleteSampleDocument = 'ComplianceTemplateDeleteSampleDocument';
    static UploadComplianceTemplateDocument = 'UploadComplianceTemplateDocument';

    static InvoiceUserActionSave = 'InvoiceUserActionSave';
    static InvoiceUserActionDiscard = 'InvoiceUserActionDiscard';
    static InvoiceConsolidatedUserActionBillingTransactionAdd = 'InvoiceConsolidatedUserActionBillingTransactionAdd';
    static InvoiceUserActionPreview = 'InvoiceUserActionPreview';
    static InvoiceUserActionRelease = 'InvoiceUserActionRelease';
    static InvoiceUserActionSuppressRelease = 'InvoiceUserActionSuppressRelease';
    static InvoiceUserActionCancel = 'InvoiceUserActionCancel';
    static InvoiceUserActionMarkAsPaid = 'InvoiceUserActionMarkAsPaid';
    static TransactionHeaderSave = 'TransactionHeaderManualSave';
    static TransactionHeaderSubmit = 'TransactionHeaderUserActionManualSubmit';
    static TransactionHeaderRemoveLine = 'TransactionHeaderManualRemoveLine';
    static TransactionHeaderAddLine = 'TransactionHeaderManualAddLine';
    static TransactionHeaderDiscard = 'TransactionHeaderManualDiscard';

    static TransactionHeaderActionReverse = 'TransactionHeaderActionReverse';
    static TransactionHeaderActionReverseTimeSheetUnsubmit = 'TransactionHeaderActionReverseTimeSheetUnsubmit';
    static TransactionHeaderActionReverseTimeSheetReturnToException = 'TransactionHeaderActionReverseTimeSheetReturnToException';
    static TransactionHeaderActionReverseAndUnsubmitExpenseClaim = 'TransactionHeaderActionReverseAndUnsubmitExpenseClaim';
    static TransactionHeaderActionReverseAndReturnExpenseClaimToException = 'TransactionHeaderActionReverseAndReturnExpenseClaimToException';
    static TransactionHeaderActionReverseAdvance = 'TransactionHeaderActionReverseAdvance';
    static TransactionHeaderActionReverseAdjustment = 'TransactionHeaderActionReverseAdjustment';

    static commissionRateAction = {
      CommissionRateVersionCorrect: 'CommissionRateVersionCorrect',
      CommissionRateVersionScheduleChange: 'CommissionRateVersionScheduleChange',
      CommissionRateManageRestrictions: 'CommissionRateManageRestrictions',
      CommissionRateDelete: 'CommissionRateDelete'
    };

    static AccessSubscriptionOriginalCorrect = 'AccessSubscriptionOriginalCorrect';
    static AccessSubscriptionSave = 'AccessSubscriptionSave';
    static AccessSubscriptionSubmit = 'AccessSubscriptionSubmit';
    static AccessSubscriptionDiscard = 'AccessSubscriptionDiscard';
    static AccessSubscriptionApprovalApprove = 'AccessSubscriptionApprovalApprove';
    static AccessSubscriptionApprovalDecline = 'AccessSubscriptionApprovalDecline';
    static AccessSubscriptionApprovalRecall = 'AccessSubscriptionApprovalRecall';
  }

  export class DateFormat {
    static MMM_dd_yyyy = 'MMM dd yyyy';
    static MMM_ddComma_yyyy = 'MMM dd, yyyy';
    static yyyy_MM_dd = 'yyyy-MM-dd';
    static int_YYYYMMDD = 'YYYYMMDD';
    static MMM_dd_yyyy_HH_mm = 'MMM dd yyyy HH:mm';
    static MMM_dd_yyyy_HH_mm_ss = 'MMM dd yyyy HH:mm:ss';
    static MMM_dd_yyyy_HH_mm_ss_a = 'MMM dd yyyy hh:mm:ss a';
    static MMM_yyyy = 'MMM yyyy';
    static MinValue = '1970-01-01 00:00:00';

    // example 2017-12-14 */
    static API_Date = 'YYY-MM-DD';
    // example 2017-12-14T16:34:10.234 */
    static API_Datetime = 'YYYY-MM-DDTHH:mm:ss.SSS';

    // example // month is February = 2
    // en-CA = '2018-2-1', fr-CA = '2018-2-1'
    static shortDate = 'l';
    // example en-CA = 'Feb 1, 2018', fr-CA = '1 févr. 2018' */
    static mediumDate = 'll';
    // example en-CA = 'February 1, 2018', fr-CA = '1 février 2018'
    static longDate = 'LL';
  }

  export class OrganizationNavigationName {
    static create = 'create';
    static details = 'details';
    static roles = 'roles';
    static contacts = 'contacts';
    static history = 'history';
    static advances = 'advances';
    static garnishees = 'garnishees';
    static collaborators = 'collaborators';
    static notes = 'notes';

    static roleClient = 'client';
    static roleIndependentContractor = 'independentcontractor';
    static roleInternal = 'internal';
    static roleSubVendor = 'subvendor';
    static roleLimitedLiabilityCompany = 'limitedliabilitycompany';
  }

  export class PurchaseOrderNavigationName {
    static details = 'details';
    static workOrders = 'workorders';
    static changeHistory = 'changehistory';
    static documents = 'documents';
  }

  export class VmsDocumentNavigationName {
    static details = 'details';
    static files = 'files';
    static workflow = 'workflow';
  }

  export class DocumentRuleNavigationName {
    static details = 'details';
    static rules = 'rules';
    static templates = 'templates';
    static history = 'history';
  }

  export class WorkorderNavigationName {
    static core = 'core';
    static parties = 'parties';
    static contacts = 'contacts';
    static timematerialinvoice = 'timematerialinvoice';
    static expensemanagement = 'expensemanagement';
    static purchaseorder = 'purchaseorder';
    static earningsanddeductions = 'earningsanddeductions';
    static taxes = 'taxes';
    static compliancedocuments = 'compliancedocuments';
    static activity = 'activity';
    static clientspecificfields = 'clientspecificfields';

    static notes = 'activity/notes';
    static history = 'activity/history';
    static transaction = 'activity/transaction';
    static documents = 'activity/documents';
    static workflow = 'activity/workflow';
  }

  export class ContactNavigationName {
    static contact = 'detail';
    static workorders = 'workorders';
    static notes = 'notes';
    static history = 'history';
  }

  export class SubscriptionNavigationName {
    static subscription = 'detail';
    static history = 'history';
  }

  export class TransactionNavigationName {
    static summary = 'summary';
    static detail = 'detail';
    static notes = 'notes';
    static billingdocuments = 'billingdocuments';
    static workflow = 'workflow';
    static invoices = 'invoices';
    static payments = 'payments';
    static vmsrecord = 'vmsrecord';
  }

  export class CommissionRateNavigationName {
    static detail = 'detail';
    static workorders = 'workorders';
  }

  export enum ComplianceTemplateDocumentType {
    Template = 1,
    Sample = 2
  }

  export enum EntityEventType {
    Add = 1,
    Update = 2,
    Delete = 3
  }

  export class FormGroupName {
    static TabDetails = 'TabDetails';
    static TabRoles = 'TabRoles';
    static TabDetailsDetail = 'TabDetailsDetail';
    static TabDetailsAddresses = 'TabDetailsAddresses';
  }

  export enum WorkOrderCreationReason {
    New = 1,
    Extend = 2,
    ScheduleChange = 3,
    CorrectWorkOrderVersionEarliest = 4,
    CorrectWorkOrderVersionLatest = 5,
    CorrectWorkOrderVersionMiddle = 6,
    CorrectWorkOrderVersionUnique = 7
  }

  export class Regex {
    static Email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    static CountryCanadaPostalCode = /^[AaBbCcEeGgHhJjKkLlMmNnPpRrSsTtVvXxYy]{1}\d{1}[A-Za-z]{1} *\d{1}[A-Za-z]{1}\d{1}$/;
    static CountryUsaPostalCode = /^\d{5}(\d{4})?$/;
    static CountryMexicoPostalCode = /^\d{5}$/;
    static CountryGermanyPostalCode = /^(?!01000|99999)(0[1-9]\d{3}|[1-9]\d{4})$/;
  }

  export class Mask {
    static CA = [/[AaBbCcEeGgHhJjKkLlMmNnPpRrSsTtVvXxYy]/i, /\d/, /[A-Z]/i, /\d/, /[A-Z]/i, /\d/];
    static MX = [/\d/, /\d/, /\d/, /\d/, /\d/];
    static US = [/\d/, /\d/, /\d/, /\d/, /\d/];
    static DE = [/\d/, /\d/, /\d/, /\d/, /\d/];
  }

  export enum FilterType {
    Dropdown = <any>'Dropdown',
    Checkbox = <any>'Checkbox',
    Date = <any>'Date'
  }

  export enum UserProfileType {
    Organizational = 1,
    Internal = 2,
    WorkerTemp = 3,
    WorkerCanadianSp = 4,
    WorkerCanadianInc = 5,
    WorkerSubVendor = 6,
    WorkerUnitedStatesW2 = 7,
    WorkerUnitedStatesLLC = 8
  }

  export enum ContactStatus {
    Active = 1,
    InActive = 2,
    Locked = 3,
    InvitationPending = 4,
    Draft = 5,
    PendingReview = 6,
    PendingChange = 7,
    Declined = 8,
    Recalled = 9
  }

  export enum UserProfileGroups {
    UserProfileGroupOrganization = 1,
    UserProfileGroupInternal = 2,
    UserProfileGroupWorker = 3
  }

  export enum NewProfile {
    WizardOrganizationalProfile = 1,
    WizardWorkerProfile = 2,
    WizardInternalProfile = 3
  }

  export enum ApplicationConfigurationType {
    DisableATS = 1
  }
  export const ProductionHideFunctionality = false;

  export const PaymentOtherEarningTypeVacationPayRatePercentageDefault = 4;

  export enum SalesTaxType {
    GSTHST = 1,
    QST = 3,
    PST = 4
  }
  export const CountryCanada = 124;

  export enum WidgetCategories {
    All = 1,
    InternalOnly = 2
  }

  export enum ValidationCodes {
    TimeSheetWorkOrderHasDailyPayRates = 14060,
    TimeSheetWorkOrderHasFixedRates = 14070,
    NotEnoughPurchaseOrderFunds = 14080,
    TimeSheetOver50HoursInAWeek = 14090,
    TimeSheetTransactionExistsForTheSameTimePeriod = 14100,
    TimeSheetOver50kTransaction = 14110
  }
  export class VmsFeeRebate {
    static VmsFee = 1;
    static Rebate = 2;
  }

  export enum ActionActivity {
    TimeSheetWorkOrderHasDailyPayRates = 901,
    TimeSheetWorkOrderHasFixedRates = 902,
    TimeSheetOver50HoursInAWeek = 903,
    TimeSheetOver50kTransaction = 904,
    TimeSheetTransactionExistsForTheSameTimePeriod = 905
  }

  export enum StateAction {
    ManualDataFix = 1,
    TimesheetApprove = 901,
    TimesheetAttachDocument = 902,
    TimesheetDecline = 903,
    TimesheetPrint = 904,
    TimesheetRecall = 905,
    TimesheetRemoveDocument = 906,
    TimesheetSaveTimesheetDetail = 907,
    TimesheetSubmit = 908,
    TimesheetUnsubmitTimesheetAndReverseTransactionState = 909,
    ReturnTimesheetToExceptionAndReverseTransaction = 910,

    VmsCommissionProcessedRecordManualResolve = 11101,
    VmsCommissionProcessedRecordAutoResolve = 11102,
    VmsCommissionProcessedRecordDiscard = 11103,
    VmsCommissionProcessedRecordIntercompanyTransfer = 11104,
    VmsCommissionProcessedRecordMoveToConflict = 11105,
    VmsCommissionProcessedRecordCreate = 11106,

    VmsUnitedStatesSourceDeductionProcessedRecordManualResolve = 11501,
    VmsUnitedStatesSourceDeductionProcessedRecordAutoResolve = 11502,
    VmsUnitedStatesSourceDeductionProcessedRecordDiscard = 11503,
    VmsUnitedStatesSourceDeductionProcessedRecordIntercompanyTransfer = 11504,
    VmsUnitedStatesSourceDeductionProcessedRecordMoveToConflict = 11505,
    VmsUnitedStatesSourceDeductionProcessedRecordCreate = 11506,

    VmsFixedPriceProcessedRecordManualResolve = 12101,
    VmsFixedPriceProcessedRecordAutoResolve = 12102,
    VmsFixedPriceProcessedRecordDiscard = 12103,
    VmsFixedPriceProcessedRecordIntercompanyTransfer = 12104,
    VmsFixedPriceProcessedRecordMoveToConflict = 12105,
    VmsFixedPriceProcessedRecordCreate = 12106,

    InvoiceSave = 2201,
    InvoiceDiscard = 2202,
    InvoiceRelease = 2204,
    InvoiceSuppress = 2205,
    InvoiceAddBillingTransaction = 2212,
    InvoiceCancel = 2213,
    InvoiceEdit = 2214,
    InvoiceSubmit = 2215,
    InvoiceMarkAsPaid = 2216,
    InvoiceRemoveTransaction = 2217,
    PaymentPrint = 2301,
    PaymentSetToHold = 2302,
    PaymentEnqueuePrint = 2303,
    PaymentClearCheques = 2304,
    PaymentMarkAsNSF = 2305,
    PaymentStopPayment = 2306,
    PaymentCancelCheques = 2307,
    PaymentMoveToInProgress = 2308,

    VmsTimesheetProcessedRecordManualResolve = 3601,
    VmsTimesheetProcessedRecordAutoResolve = 3602,
    VmsTimesheetProcessedRecordDiscard = 3603,
    VmsTimesheetProcessedRecordIntercompanyTransfer = 3604,
    VmsTimesheetProcessedRecordMoveToConflict = 3605,
    VmsTimesheetProcessedRecordCreate = 3606,

    CommissionRateHeaderSubmit = 4001,
    CommissionRateHeaderDeactivate = 4002,
    CommissionRateHeaderDelete = 4003,
    CommissionRateHeaderManageRestriction = 4004,
    CommissionRateVersionScheduleChange = 4005,
    CommissionRateVersionEdit = 4006,

    VmsFeeVersionCorrect = 4401,
    VmsFeeVersionScheduleChange = 4402,
    RebateVersionCorrect = 4601,
    RebateVersionScheduleChange = 4602,
    CommissionTransactionScheduleState = 4701,
    CommissionTransactionHoldState = 4702,
    CommissionTransactionFinalizeState = 4703,
    CommissionAdjustmentHeaderSubmit = 4801,
    CommissionAdjustmentHeaderActivate = 4802,
    CommissionAdjustmentHeaderDeactivate = 4803,

    UserProfileSubmit = 5001,
    UserProfileSave = 5002,
    UserProfileDiscard = 5003,
    UserProfileFinalize = 5004,
    UserProfileRecall = 5005,
    UserProfileMakePrimary = 5007,
    UserProfileEdit = 5008,
    UserProfileCreateAdjustment = 5009,
    UserProfileReassign = 5010,
    UserProfileDeactivate = 5011,
    UserProfileCancelInactivation = 5014,
    UserProfileRecallToCompliance = 5015,
    UserProfileDecline = 5016,
    UserProfileApprove = 5018,
    UserProfileActivate = 5019,
    UserProfileCancelActivation = 5022,

    PrintQueueStatusToOnHoldState = 6201,
    PrintQueueStatusToPrintingState = 6202,
    PrintQueueStatusToInQueueState = 6203,
    PrintQueueStatusToErrorState = 6204,
    PrintQueueStatusToCompletedState = 6205,
    PrintQueueStatusToCancelledState = 6206,

    VmsDiscountProcessedRecordManualResolve = 8501,
    VmsDiscountProcessedRecordAutoResolve = 8502,
    VmsDiscountProcessedRecordDiscard = 8503,
    VmsDiscountProcessedRecordIntercompanyTransfer = 8504,
    VmsDiscountProcessedRecordMoveToConflict = 8505,
    VmsDiscountProcessedRecordCreate = 8506,

    ComplianceDocumentApprove = 8701,
    ComplianceDocumentArchive = 8702,
    ComplianceDocumentDecline = 8703,
    ComplianceDocumentDiscard = 8704,
    ComplianceDocumentExpireDocument = 8705,
    ComplianceDocumentExpireSnooze = 8706,
    ComplianceDocumentGenerateDocument = 8707,
    ComplianceDocumentRecall = 8708,
    ComplianceDocumentRequestExemption = 8709,
    ComplianceDocumentRequestSnooze = 8710,
    ComplianceDocumentSetToNotApplicable = 8711,
    ComplianceDocumentSubmit = 8712,
    ComplianceDocumentUploadDocument = 8713,
    ComplianceDocumentView = 8714,
    ComplianceDocumentViewSample = 8715,
    ComplianceDocumentApproveSnooze = 8716,
    ComplianceDocumentDeclineSnooze = 8717,

    VmsDocumentUploadDocument = 8901,
    VmsDocumentProcess = 8902,
    VmsDocumentDiscard = 8903,
    ExpenseClaimDiscardState = 9601,
    ExpenseClaimSubmitState = 9602,
    ExpenseClaimAttachDocumentState = 9603,
    ExpenseClaimRemoveDocumentState = 9604,
    ExpenseClaimApproveState = 9605,
    ExpenseClaimDeclineState = 9606,
    ExpenseClaimRecallState = 9607,
    ExpenseClaimUnsubmitAndReverseTransactionState = 9608,
    ExpenseClaimSaveState = 9609,
    ExpenseClaimPrintState = 9610,

    VmsExpenseProcessedRecordManualResolve = 9801,
    VmsExpenseProcessedRecordAutoResolve = 9802,
    VmsExpenseProcessedRecordDiscard = 9803,
    VmsExpenseProcessedRecordIntercompanyTransfer = 9804,
    VmsExpenseProcessedRecordMoveToConflict = 9805,
    VmsExpenseProcessedRecordCreate = 9806,

    RemittanceTransactionRemitState = 10501,
    RemittanceBatchRecallState = 10601,
    TransactionHeaderSave = 1201,
    TransactionHeaderSubmit = 1202,
    TransactionHeaderDiscard = 1203,
    TransactionHeaderReverseTransaction = 1204,
    TransactionHeaderReverseTransactionAndUnsubmitTimeSheet = 1205,
    TransactionHeaderReverseTransactionAndSendTimeSheetToException = 1206,
    TransactionHeaderReverseTransactionAndUnsubmitExpenseClaim = 1207,
    TransactionHeaderReverseTransactionAndSendExpenseClaimToException = 1208,
    TransactionHeaderReverseTransactionAndAdvance = 1209,
    TransactionHeaderReverseTransactionAndAdjustment = 1210,
    TransactionHeaderAddTransactionLine = 1211,
    TransactionHeaderDiscardTransactionLine = 1212,

    PaymentTransactionChangePaymentMethod = 2104,
    PaymentTransactionAddToBatch = 2106,
    PaymentTransactionRemovePaymentTransaction = 2108,
    PaymentTransactionChangeReleaseDate = 2103,
    PaymentTransactionSuppressRelease = 2102,
    PaymentTransactionCreateCheques = 2107,
    PaymentTransactionResumePayment = 2101,

    PaymentRecall = 23001,
    PaymentRemovePayment = 23002,

    PaymentReleaseBatchTransferToBank = 2406,
    PaymentReleaseBatchRecall = 2405,
    PaymentReleaseBatchGenerateFile = 2407,
    PaymentReleaseBatchDiscard = 2403,
    PaymentReleaseBatchFinalize = 2401,
    PaymentReleaseBatchChangeDetails = 2404,
    PaymentReleaseBatchRemoveAffectedPayments = 2402,

    BillingTransactionCreateInvoice = 2001,
    BillingTransactionSuppress = 2002,
    BillingTransactionChangeToConsolidated = 2003,
    BillingTransactionChangeToSingle = 2004,

    // Assignment
    AssignmentExtend = 801,
    // Work Order
    WorkOrderScheduleChange = 1301,
    WorkOrderStopPayment = 1302,
    WorkOrderResumePayment = 1303,
    WorkOrderReactivate = 1304,
    WorkOrderCreateTransaction = 1305,
    WorkOrderReleaseVacationPay = 1306,
    WorkOrderCreateGovernmentAdjustment = 1307,
    WorkOrderTerminate = 1308,
    WorkOrderUnterminate = 1309,
    // Work Order Version
    WorkOrderVersionSave = 1701,
    WorkOrderVersionSubmit = 1702,
    WorkOrderVersionFinalize = 1703,
    WorkOrderVersionApprove = 1704,
    WorkOrderVersionRecallToDraft = 1705,
    WorkOrderVersionRecallToCompliance = 1706,
    WorkOrderVersionDecline = 1707,
    WorkOrderVersionEdit = 1708,
    WorkOrderVersionDiscard = 1709,
    WorkOrderVersionApproveReactivation = 1710,
    WorkOrderVersionDeclineActivation = 1711,
    WorkOrderVersionReSyncATS = 1712,

    OrganizationSave = 101,
    OrganizationDiscard = 102,
    OrganizationSubmit = 103,
    OrganizationApprove = 104,
    OrganizationDecline = 105,
    OrganizationRecall = 106,
    OrganizationRecallToCompliance = 107,
    OrganizationFinalizeComplianceDraft = 108,
    OrganizationEditActive = 109,

    SalesTaxScheduleChange = 3102,
    SalesTaxCorrect = 3103
  }

  export class CommonListsNames {
    static UserProfileInternal = 'UserProfileInternal';
    static Organizations = 'organizations';
    static OrganizationSuppliers = 'organizationSuppliers';
    static UserProfileWorker = 'UserProfileWorker';
  }

  // expense state action Command
  export class ExpenseClaimStateActionCommand {
    static ExpenseClaimDiscard = 'ExpenseClaimDiscardState';
    static ExpenseClaimSubmit = 'ExpenseClaimSubmitState';
    static ExpenseClaimAttachDocument = 'ExpenseClaimAttachDocumentState';
    static ExpenseClaimRemoveDocument = 'ExpenseClaimRemoveDocumentState';
    static ExpenseClaimApprove = 'ExpenseClaimApproveState';
    static ExpenseClaimDecline = 'ExpenseClaimDeclineState';
    static ExpenseClaimRecall = 'ExpenseClaimRecallState';
    static ExpenseClaimUnsubmitAndReverseTransaction = 'ExpenseClaimUnsubmitAndReverseTransactionState';
    static ExpenseClaimSave = 'ExpenseClaimSaveState';
    static ExpenseClaimPrint = 'ExpenseClaimPrintState';
  }

  // commission rate state action Command
  export class CommissionRateVersionStateActionCommand {
    static CommissionRateVersionCorrect = 'CommissionRateVersionEdit';
    static CommissionRateVersionScheduleChange = 'CommissionRateVersionScheduleChange';
    static CommissionRateVersionManageRestrictions = 'CommissionRateHeaderManageRestriction';
    static CommissionRateVersionDelete = 'CommissionRateHeaderDelete';
    static CommissionRateHeaderDeactivate = 'CommissionRateHeaderDeactivate';
  }

  export enum TimesheetStatus {
    New = 1,
    Draft = 2,
    PendingClientReview = 3,
    Approved = 4,
    Declined = 5,
    PendingSupportingDocumentUpload = 6,
    Recalled = 7,
    PendingSupportingDocumentReview = 8,
    SupportingDocumentAccepted = 9,
    ApprovedAndAccepted = 10,
    Unsubmitted = 11,
    PendingBackofficeReview = 12,
    PendingSystemApproval = 13
  }

  export const DefaultPaymentRateDeductions = [
    {
      RateTypeId: 1,
      defaults: [
        { SubdivisionId: 592, IsApplyVacation: true, IsApplyDeductions: true }, //AB
        { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
        { SubdivisionId: 594, IsApplyVacation: true, IsApplyDeductions: true }, //MB
        { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
        { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
        { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
        { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
        { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
        { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true } //SK
      ]
    },
    {
      //Overtime
      RateTypeId: 2,
      defaults: [
        { SubdivisionId: 592, IsApplyVacation: false, IsApplyDeductions: true }, //AB
        { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
        { SubdivisionId: 594, IsApplyVacation: false, IsApplyDeductions: true }, //MB
        { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
        { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
        { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
        { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
        { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
        { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true } //SK
      ]
    },
    {
      //DoubleTime
      RateTypeId: 7,
      defaults: [
        { SubdivisionId: 592, IsApplyVacation: false, IsApplyDeductions: true }, //AB
        { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
        { SubdivisionId: 594, IsApplyVacation: false, IsApplyDeductions: true }, //MB
        { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
        { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
        { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
        { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
        { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
        { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true } //SK
      ]
    },
    {
      //On Call
      RateTypeId: 3,
      defaults: [
        { SubdivisionId: 592, IsApplyVacation: true, IsApplyDeductions: true }, //AB
        { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
        { SubdivisionId: 594, IsApplyVacation: true, IsApplyDeductions: true }, //MB
        { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
        { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
        { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
        { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
        { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
        { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true } //SK
      ]
    },
    {
      //Pager
      RateTypeId: 4,
      defaults: [
        { SubdivisionId: 592, IsApplyVacation: true, IsApplyDeductions: true }, //AB
        { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
        { SubdivisionId: 594, IsApplyVacation: true, IsApplyDeductions: true }, //MB
        { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
        { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
        { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
        { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
        { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
        { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true } //SK
      ]
    },
    {
      //Travel Time
      RateTypeId: 8,
      defaults: [
        { SubdivisionId: 592, IsApplyVacation: true, IsApplyDeductions: true }, //AB
        { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
        { SubdivisionId: 594, IsApplyVacation: true, IsApplyDeductions: true }, //MB
        { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
        { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
        { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
        { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
        { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
        { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true } //SK
      ]
    }
  ];
}

// fix me
(<any>window).ApplicationConstants = this.ApplicationConstants;
(<any>window).ApplicationConstants = this.PhxConstants;
