ApplicationConstants = {
    Culture: {
        Default: 48,
        CanadaEnglish: 48,
        CanadaFrench: 88
    },

    GuidEmpty: '00000000-0000-0000-0000-000000000000',

    max: {
        currency: 999999999999.99,
        percent: 100
    },

    viewStatuses: {
        edit: 'edit',
        view: 'view',
        hideElement: 'hideElement',
        hideFormGroup: 'hideFormGroup'
    },

    formatDate: 'MMM dd yyyy',
    formatMomentDate: 'MMM DD YYYY',
    formatMomentDateFull: 'MMM DD YYYY, H:mm',
    formatDateFull: 'EEE, MMM d, yyyy',
    formatDateComma: 'MMM dd, yyyy',
    formatDateSorting: 'yyyy-MM-dd',
    formatDateInt: 'YYYYMMDD',
    formatDateTimeHM: 'MMM dd yyyy HH:mm',
    formatDateTimeHMAMPM: 'MMM dd, yyyy hh:mm A',
    formatDateTimeHMS: 'MMM dd yyyy HH:mm:ss',
    formatDateTimeHMSAMPM: 'MMM dd yyyy hh:mm:ss A',
    formatDateMin: '1970-01-01 00:00:00',
    formatMonth: 'MMM yyyy',


    Regex: {
        Email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        CountryCanadaPostalCode: /^[AaBbCcEeGgHhJjKkLlMmNnPpRrSsTtVvXxYy]{1}\d{1}[A-Za-z]{1} *\d{1}[A-Za-z]{1}\d{1}$/,
        CountryUsaZip: /^\d{5}(\d{4})?$/,
        CountryMexicoPostalCode: /^\\d{5}$/,
        CurrencyGreaterThanZero: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
    },

    RebateType: {
        Amount: 1,
        Percentage: 2,
    },

    CountryCanada: 124,
    CountryUSA: 840,
    CountryMexico: 484,

    Currencies: {
        CAD: 27,
        USD: 159,
        MXN: 108
    },

    //User Profile Groups
    UserProfileGroupOrganization: 1,
    UserProfileGroupInternal: 2,
    UserProfileGroupWorker: 3,

    //User Profile Types
    UserProfileType: {
        Organizational: 1,
        Internal: 2,
        WorkerTemp: 3,
        WorkerCanadianSp: 4,
        WorkerCanadianInc: 5,
        WorkerSubVendor: 6,
        WorkerUnitedStatesW2: 7,
        WorkerUnitedStatesLLC: 8
    },

    //User Profile Edit Types for State Navigation
    UserProfileEditType: {
        EditOrganizationalProfile: 1,
        EditInternalProfile: 2,
        EditWorkerTempProfile: 3,
        EditWorkerCanadianSPProfile: 4,
        EditWorkerCanadianIncProfile: 5,
        EditWorkerSubVendorProfile: 6,
        EditWorkerUnitedStatesW2Profile: 7,
        EditWorkerUnitedStatesLLCProfile: 8
    },

    UserProfileWorkerBenefit: {
        Benefit: 1
    },

    ProfileStatus: {
        Active: 1,
        InActive: 2,
        Suspeneded: 3,
        Draft: 4,
        New: 5,
        PendingReview: 6,
        PendingChange: 7,
        Discard: 8,
        PendingInactive: 9,
        PendingActive: 10,
        Declined: 11,
        Recalled: 12,
        ComplianceDraft: 13,
        RecalledCompliance: 14,
    },

    ContactStatus: {
        Active: 1,
        InActive: 2,
        Locked: 3,
        InvitationPending: 4,
        Draft: 5,
        PendingReview: 6,
        PendingChange: 7,
        Declined: 8,
        Recalled: 9,
    },

    getWorkerSourceDeductionsCommon: function () {
        return [
            { SourceDeductionTypeId: 1, IsApplied: true, RatePercentage: null, RateAmount: null },
            { SourceDeductionTypeId: 2, IsApplied: true, RatePercentage: null, RateAmount: null },
            { SourceDeductionTypeId: 3, IsApplied: true, RatePercentage: null, RateAmount: null },
            { SourceDeductionTypeId: 8, IsApplied: true, RatePercentage: null, RateAmount: null }
        ];
    },

    getWorkerTempSourceDeductions: function () {
        return [
            { SourceDeductionTypeId: 6, IsApplied: true, RatePercentage: null, RateAmount: null },
            { SourceDeductionTypeId: 7, IsApplied: true, RatePercentage: null, RateAmount: null },
            { SourceDeductionTypeId: 10, IsApplied: false, RatePercentage: null, RateAmount: null },
            { SourceDeductionTypeId: 15, IsApplied: true, RatePercentage: null, RateAmount: null }
        ];
    },

    DefaultPaymentRateDeductions: [
        {   //Primary
            RateTypeId: 1, defaults: [
                { SubdivisionId: 592, IsApplyVacation: true, IsApplyDeductions: true }, //AB
                { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
                { SubdivisionId: 594, IsApplyVacation: true, IsApplyDeductions: true }, //MB
                { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
                { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
                { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
                { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
                { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
                { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true }, //SK
            ]
        },
        {   //Overtime
            RateTypeId: 2, defaults: [
                { SubdivisionId: 592, IsApplyVacation: false, IsApplyDeductions: true }, //AB
                { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
                { SubdivisionId: 594, IsApplyVacation: false, IsApplyDeductions: true }, //MB
                { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
                { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
                { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
                { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
                { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
                { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true }, //SK
            ]
        }
        ,
        {   //DoubleTime
            RateTypeId: 7, defaults: [
                { SubdivisionId: 592, IsApplyVacation: false, IsApplyDeductions: true }, //AB
                { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
                { SubdivisionId: 594, IsApplyVacation: false, IsApplyDeductions: true }, //MB
                { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
                { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
                { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
                { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
                { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
                { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true }, //SK
            ]
        },
        {   //On Call
            RateTypeId: 3, defaults: [
                { SubdivisionId: 592, IsApplyVacation: true, IsApplyDeductions: true }, //AB
                { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
                { SubdivisionId: 594, IsApplyVacation: true, IsApplyDeductions: true }, //MB
                { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
                { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
                { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
                { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
                { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
                { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true }, //SK
            ]
        },
        {   //Pager                                          
            RateTypeId: 4, defaults: [
                { SubdivisionId: 592, IsApplyVacation: true, IsApplyDeductions: true }, //AB
                { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
                { SubdivisionId: 594, IsApplyVacation: true, IsApplyDeductions: true }, //MB
                { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
                { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
                { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
                { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
                { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
                { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true }, //SK
            ]
        },
        {   //Travel Time
            RateTypeId: 8, defaults: [
                { SubdivisionId: 592, IsApplyVacation: true, IsApplyDeductions: true }, //AB
                { SubdivisionId: 593, IsApplyVacation: true, IsApplyDeductions: true }, //BC
                { SubdivisionId: 594, IsApplyVacation: true, IsApplyDeductions: true }, //MB
                { SubdivisionId: 595, IsApplyVacation: true, IsApplyDeductions: true }, //NB
                { SubdivisionId: 596, IsApplyVacation: true, IsApplyDeductions: true }, //NL
                { SubdivisionId: 597, IsApplyVacation: true, IsApplyDeductions: true }, //NS
                { SubdivisionId: 600, IsApplyVacation: true, IsApplyDeductions: true }, //ON
                { SubdivisionId: 602, IsApplyVacation: true, IsApplyDeductions: true }, //QC
                { SubdivisionId: 603, IsApplyVacation: true, IsApplyDeductions: true }, //SK
            ]
        }

    ],


    WorkerTempOtherEarnings: [{ PaymentOtherEarningTypeId: 1, IsApplied: true, RatePercentage: 4.0, IsAccrued: false }],
    WorkerTempApplyFlatStatPay: false,

    ResidencyStatusOptions: [{ key: false, value: 'Resident' }, { key: true, value: 'Non-Resident' }],

    DefaultPaymentMethods: [{ Id: 0, PaymentMethodTypeId: 1, IsSelected: false, IsPreferred: false },
    { Id: 0, PaymentMethodTypeId: 2, IsSelected: false, IsPreferred: false, BankCode: null, BankBranchCode: null, BankAccountNumber: null },
    {
        Id: 0, PaymentMethodTypeId: 3, IsSelected: false, IsPreferred: false, ProfileNameBeneficiary: null, NameBeneficiary: null, AccountNumberBeneficiary: null,
        Address1Beneficiary: null, Address2Beneficiary: null, CityBeneficiary: null, ProvinceOrStateBeneficiary: null, CountryCodeBeneficiary: null, PostalorZipBeneficiary: null,
        PayCurrencyBeneficiary: null, WireTransferBankTypeIdBeneficiary: null, BankIDBeneficiary: null, ABANoBeneficiary: null, WireTransferBankTypeIdIntemediary: null, BankNameIntemediary: null,
        BankIdIntemediary: null, Address1Intemediary: null, Address2Intemediary: null, CityIntemediary: null, ProvinceOrStateIntemediary: null, CountryCodeIntemediary: null, PostalOrZipIntemediary: null,
        WireTransferBankTypeIdReceivers: null, BankNameReceivers: null, BankIdReceivers: null, Address1Receivers: null, Address2Receivers: null, CityReceivers: null, ProvinceOrStateReceivers: null,
        CountryCodeReceivers: null, PostalOrZipReceivers: null, PaymentDetailNotes: null
    },
    { Id: 0, PaymentMethodTypeId: 5, IsSelected: false, IsPreferred: false, EmployeeId: null }],

    EntityType: {
        Organization: 1,
        UserProfileOrganizational: 2,
        UserProfileInternal: 3,
        UserProfileWorkerCanadianInc: 4,
        UserProfileWorkerCanadianSP: 5,
        UserProfileWorkerTemp: 6,
        Assignment: 8,
        TimeSheet: 9,
        Contact: 10,
        PurchaseOrder: 11,
        TransactionHeader: 12,
        WorkOrder: 13,
        EntityChange: 14,
        WorkOrderPurchaseOrderLine: 15,
        Document: 16,
        WorkOrderVersion: 17,
        PurchaseOrderTransaction: 18,
        Task: 19,
        BillingTransaction: 20,
        PaymentTransaction: 21,
        Invoice: 22,
        Payment: 23,
        PaymentReleaseBatch: 24,
        FinancialTransactionBatch: 25,
        FederalTaxHeader: 26,
        ProvincialTaxHeader: 27,
        FederalTaxVersion: 28,
        ProvincialTaxVersion: 29,
        SalesTaxHeader: 30,
        SalesTaxVersion: 31,
        Advance: 32,
        Garnishee: 33,
        VmsImportedRecord: 34,
        PaymentTransactionGarnishee: 35,
        VmsProcessedRecord: 36,
        VmsProcessedRecordWorkOrderVersionAllocation: 37,
        PaymentVersion: 39,
        CommissionRateHeader: 40,
        CommissionRateVersion: 41,
        CommissionRateRestriction: 42,
        VmsFeeHeader: 43,
        VmsFeeVersion: 44,
        RebateHeader: 45,
        RebateVersion: 46,
        CommissionTransaction: 47,
        CommissionAdjustmentHeader: 48,
        PaymentReleaseScheduleDetail: 49,
        UserProfile: 50,
        CommissionSalesPattern: 51,
        GarnisheePayTo: 52,
        Note: 53,
        ClientHoliday: 54,
        SubdivisionHoliday: 55,
        InvoiceTransaction: 56,
        FinancialTransaction: 57,
        OrganizationClientRole: 58,
        OrganizationIndependentContractorRole: 59,
        OrganizationInternalRole: 60,
        ParentOrganization: 61,
        PrintQueue: 62,
        SalesTaxVersionRate: 63,
        PaymentTransactionPayment: 64,
        WCBHeader: 65,
        Template: 66,
        ProvincialTaxVersionTaxType: 67,
        ApplicableSourceDeduction: 68,
        ApplicableSalesTax: 69,
        OrganizationClientRoleLOB: 70,
        UserProfileWorkerSPTaxNumber: 71,
        OrganizationTaxNumber: 72,
        CommissionReportHeader: 73,
        InternalTeam: 74,
        AccessSubscription: 75,
        AccessSubscriptionRestriction: 76,
        Branch: 77,
        NoteReadReceipt: 78,
        UserProfileDashboardSetting: 79,
        UserProfileBookmark: 80,
        UserProfileSearchSetting: 81,
        PurchaseOrderLine: 82,
        ComplianceDocumentRule: 83,
        VmsDiscountImportedRecord: 84,
        VmsDiscountProcessedRecord: 85,
        UserDefinedCodeComplianceDocumentType: 86,
        ComplianceDocument: 87,
        ComplianceDocumentHeader: 88,
        VmsDocument: 89,
        OrganizationSubVendorRole: 90,
        UserProfileWorkerSubVendor: 91,
        WorkerCompensation: 92,
        WCBSubdivisionHeader: 93,
        WCBSubdivisionVersion: 94,
        ExpenseItem: 95,
        ExpenseClaim: 96,
        VmsExpenseImportedRecord: 97,
        VmsExpenseProcessedRecord: 98,
        Project: 99,
        TimeSheetDetail: 100,
        PrintUserProfileSetting: 101,
        TimeSheetCapsuleConfiguration: 102,
        PaymentSourceDeduction: 103,
        UserProfileWorkerSourceDeduction: 104,
        RemittanceTransaction: 105,
        RemittanceTransactionBatch: 106,
        Remittance: 107,
        ProjectVersion: 108,
        OrganizationLimitedLiabilityCompanyRole: 109,
        VmsCommissionImportedRecord: 110,
        VmsCommissionProcessedRecord: 111,
        UserProfileWorkerUnitedStatesW2: 112,
        UserProfileWorkerUnitedStatesLLC: 113,
        VmsUnitedStatesSourceDeductionImportedRecord: 114,
        VmsUnitedStatesSourceDeductionProcessedRecord: 115,
        ComplianceTemplate: 116,
        InvoiceTransactionDocument: 117,
        BranchManager: 118,
        UserGuide: 119,
        VmsFixedPriceImportedRecord: 120,
        VmsFixedPriceProcessedRecord: 121,
    },

    TimeSheet: {
        Status: {
            New: 1,
            Draft: 2,
            PendingReview: 3,
            Approved: 4,
            Declined: 5,
            Pending: 6
        }
    },
    TaskTemplate: {
        WCBSubdivisionHeaderNew: 320001
    }

    , TaskResult: {
        Complete: 1,
        Yes: 2,
        No: 3,
        UnsubmitTimeSheet: 201,
        SendTimeSheetToBackOfficeReview: 202,
        TimesheetTransactionHeaderActionReverseTimeSheetUnsubmit: 265,
        TimesheetTransactionHeaderActionReverseTimeSheetReturnToException: 266,
        WovActionDiscard: 305,
        WovActionCancel: 306,
        WovActionDelete: 310,
        WovActionOnline: 311,
        WovActionOffline: 312,
        WovIsDraft: 318,
        WovIsPendingReview: 319,
        WovIsTerminated: 324,
        WovActionAccessibilityAll: 334,
        WovActionAccessibilityCreateTransactionCancelExtendTerminate: 335,
        WovActionAccessibilityCreateTransactionCorrectTerminate: 336,
        WovActionAccessibilityCreateTransactionTerminate: 337,
        WovActionAccessibilityNone: 338,
        WovActionAccessibilityCreateTransactionExtend: 339,
        WovActionCreateTransactionManual: 341,
        WovActionCreateTransactionAdjustment: 342,
        WovActionAccessibilityCreateTransactionExtendReactivate: 345,
        WovIsComplianceDraft: 346,
        TransactionHeaderWorkflowBeginOnActive: 441,
        TransactionHeaderWorkflowBeginOnDraftManual: 443,
        TransactionHeaderDraftManualActionSave: 446,
        TransactionHeaderDraftManualActionSubmit: 447,
        TransactionHeaderDraftManualActionDiscard: 448,
        TransactionHeaderDraftManualActionDelete: 449,
        TransactionHeaderDraftManualActionApprovalOnline: 450,
        TransactionHeaderDraftManualActionApprovalOffline: 451,
        TransactionHeaderDraftManualActionApprovalDecline: 452,
        TransactionHeaderDraftManualActionApprovalConfirm: 453,
        TransactionBillingInvoiceCreateDecisionIsConsolidation: 454,
        TransactionBillingInvoiceCreateDecisionIsOneToOne: 455,
        TransactionBillingInvoiceDecisionIsNotInternal: 457,
        TransactionBillingInvoiceDecisionIsAutoRelease: 458,
        TransactionBillingInvoiceDecisionIsNotAutoRelease: 459,
        TransactionBillingInvoiceActionRelease: 460,
        TransactionHeaderIsActiveReversed: 461,
        TransactionHeaderContainTimesheet: 462,
        TransactionHeaderNotContainTimesheet: 463,
        TransactionHeaderActionReverse: 464,
        TransactionHeaderActionReverseTimeSheetUnsubmit: 465,
        TransactionHeaderActionReverseTimeSheetReturnToException: 466,
        TransactionBillingInvoiceActionCreateConsolidation: 467,
        TransactionHeaderSendNotificationOnReversed: 468,
        TransactionHeaderNotSendNotificationOnReversed: 469,
        TransactionHeaderIsActiveNotReversed: 470,
        TransactionPaymentActionApprovalOnline: 471,
        TransactionPaymentActionApprovalOffline: 472,
        TransactionPaymentReleaseApproved: 473,
        TransactionPaymentReleaseDeclined: 474,
        TransactionPaymentReleaseByDirectDeposit: 475,
        TransactionPaymentReleaseByCheque: 476,
        TransactionPaymentReleaseWithDateChange: 477,
        TransactionPaymentReleaseByChequeContinue: 478,
        TransactionPaymentReleaseByDirectDepositContinue: 479,
        TransactionPaymentReleaseToMarkPaid: 480,
        TransactionPaymentReleaseToOnHold: 481,
        TransactionHeaderManualAddLine: 482,
        TransactionHeaderManualRemoveLine: 483,
        TransactionBillingInvoiceActionSuppressRelease: 485,
        TransactionPaymentReleaseBatchActionRecall: 486,
        TransactionHeaderAdvanceDecisionIsNotAllowedToReverse: 488,
        TransactionHeaderAdvanceDecisionIsAllowedToReverse: 489,
        TransactionHeaderAdvanceActionReverse: 490,
        TransactionHeaderAdjustmentDecisionIsAllowedToReverse: 491,
        TransactionHeaderAdjustmentActionReverse: 492,
        TransactionPaymentSuppressRelease: 493,
        TransactionPaymentRelease: 494,
        TransactionPaymentReleaseByADPContinue: 498,
        PaymentReleaseBatchPaymentMethodDirectDeposit: 501,
        PaymentReleaseBatchPaymentMethodCheque: 502,
        PaymentReleaseBatchPaymentMethodWireTransfer: 503,
        PaymentReleaseBatchPaymentReleaseBatchActionRecall: 506,
        PaymentReleaseBatchPaymentReleaseBatchActionTransferToBank: 507,
        PaymentMethodDirectDeposit: 601,
        PaymentMethodCheque: 602,
        PaymentMethodWireTransfer: 603,
        PaymentReleaseBatchActionRecall: 686,
        PaymentReleaseBatchActionTransferToBank: 687,
        FederalTaxVersionIsActive: 701,
        FederalTaxVersionIsReplaced: 702,
        FederalTaxVersionActionCorrect: 703,
        FederalTaxVersionActionScheduleChange: 704,
        ProvincialTaxVersionIsActive: 801,
        ProvincialTaxVersionIsReplaced: 802,
        ProvincialTaxVersionActionCorrect: 803,
        ProvincialTaxVersionActionScheduleChange: 804,
        SalesTaxVersionIsActive: 901,
        SalesTaxVersionIsReplaced: 902,
        SalesTaxVersionActionCorrect: 903,
        SalesTaxVersionActionScheduleChange: 904,
        VmsProcessedRecordHasTypeConflict: 1001,
        VmsProcessedRecordHasTypeToProcess: 1002,
        BatchThreadExecutionOnVmsProcessedRecordTransferInternally: 1003,
        VmsProcessedRecordDiscard: 1004,
        VmsProcessedRecordResolve: 1005,
        VmsProcessedRecordMarkAsConflicting: 1006,
        VmsProcessedRecordGenerateTransaction: 1007,
        PaymentTransactionGarnisheesBatchToPayments: 1101,
        CommissionRateVersionIsActive: 1201,
        CommissionRateVersionIsReplaced: 1202,
        CommissionRateVersionActionCorrect: 1203,
        CommissionRateVersionActionScheduleChange: 1204,
        CommissionRateDuplicateFound: 1205,
        VmsFeeVersionIsActive: 1301,
        VmsFeeVersionIsReplaced: 1302,
        VmsFeeVersionActionCorrect: 1303,
        VmsFeeVersionActionScheduleChange: 1304,
        RebateVersionIsActive: 1401,
        RebateVersionIsReplaced: 1402,
        RebateVersionActionCorrect: 1403,
        RebateVersionActionScheduleChange: 1404,
        CommissionTransactionToScheduled: 1501,
        CommissionTransactionToOnHold: 1502,
        CommissionTransactionToPaid: 1503,
        OrganizationActionNew: 1701,
        OrganizationActionSave: 1702,
        OrganizationActionSubmit: 1704,
        OrganizationDecisionApprovalOnline: 1709,
        OrganizationDecisionApprovalOffline: 1710,
        OrganizationIsOriginal: 1711,
        OrganizationIsDuplicate: 1712,
        OrganizationIsSupplier: 1713,
        OrganizationIsInternalOrClient: 1714,
        UserProfileActionSave: 1802,
        UserProfileActionSubmit: 1803,
        UserProfileActionDiscard: 1804,
        UserProfileOnlineSubmission: 1805,
        UserProfileOfflineSubmission: 1806,
        UserProfileActionApprove: 1807,
        UserProfileIsOriginal: 1808,
        UserProfileIsDuplicate: 1809,
        UserProfileActionCorrect: 1810,
        UserProfileActionRecall: 1811,
        UserProfileActionDecline: 1812,
        AccessSubscriptionActionNew: 2001,
        AccessSubscriptionActionSave: 2002,
        AccessSubscriptionActionDiscard: 2003,
        AccessSubscriptionActionSubmit: 2004,
        AccessSubscriptionActionCorrect: 2005,
        AccessSubscriptionActionApprovalRecall: 2006,
        AccessSubscriptionActionApprovalDecline: 2007,
        AccessSubscriptionActionApprovalApprove: 2008,
        AccessSubscriptionDecisionApprovalOnline: 2009,
        AccessSubscriptionDecisionApprovalOffline: 2010,
        AccessSubscriptionIsOriginal: 2011,
        AccessSubscriptionIsDuplicate: 2012,
        VmsDiscountRecordIsTypeConflict: 2101,
        VmsDiscountRecordIsTypeToProcess: 2102,
        VmsDiscountRecordToChangeInternalOrg: 2103,
        VmsDiscountRecordToDiscard: 2104,
        VmsDiscountRecordToResolve: 2105,
        VmsDiscountRecordMarkAsConflicting: 2106,
        VmsDiscountRecordGenerateTransaction: 2107,
        VmsDocumentTimesheetImportRecords: 2201,
        VmsDocumentDiscountImportRecords: 2202,
        VmsDocumentExpenseImportRecords: 2203,
        VmsDocumentCommissionImportRecords: 2204,
        VmsDocumentUnitedStatesSourceDeductionImportRecords: 2205,
        VmsDocumentPreprocessFile: 2211,
        VmsDocumentTimesheetProcessRecords: 2212,
        VmsDocumentDiscountProcessRecords: 2213,
        VmsDocumentExpenseProcessRecords: 2214,
        VmsDocumentCommissionProcessRecords: 2215,
        VmsDocumentUnitedStatesSourceDeductionProcessRecords: 2216,
        VmsDocumentFileProcessed: 2230,
        VmsDocumentDiscardFile: 2240,
        ComplianceDocumentRuleDecisionApprovalOnline: 3011,
        ComplianceDocumentRuleDecisionApprovalOffline: 3012,
        ComplianceDocumentRuleIsOriginal: 3013,
        ComplianceDocumentRuleIsDuplicate: 3014,
        ComplianceDocumentDecisionApprovalOnline: 3111,
        ComplianceDocumentDecisionApprovalOffline: 3112,
        VmsExpenseRecordIsTypeConflict: 3501,
        VmsExpenseRecordIsTypeToProcess: 3502,
        VmsExpenseRecordToChangeInternalOrg: 3503,
        VmsExpenseRecordToDiscard: 3504,
        VmsExpenseRecordToResolve: 3505,
        VmsExpenseRecordMarkAsConflicting: 3506,
        VmsExpenseRecordGenerateTransaction: 3507,
        VmsCommissionRecordIsTypeConflict: 3901,
        VmsCommissionRecordIsTypeToProcess: 3902,
        VmsCommissionRecordToChangeInternalOrg: 3903,
        VmsCommissionRecordToDiscard: 3904,
        VmsCommissionRecordToResolve: 3905,
        VmsCommissionRecordMarkAsConflicting: 3906,
        VmsCommissionRecordGenerateTransaction: 3907,
        VmsUnitedStatesSourceDeductionRecordIsTypeConflict: 4001,
        VmsUnitedStatesSourceDeductionRecordIsTypeToProcess: 4002,
        VmsUnitedStatesSourceDeductionRecordToChangeInternalOrg: 4003,
        VmsUnitedStatesSourceDeductionRecordToDiscard: 4004,
        VmsUnitedStatesSourceDeductionRecordToResolve: 4005,
        VmsUnitedStatesSourceDeductionRecordMarkAsConflicting: 4006,
        VmsUnitedStatesSourceDeductionRecordGenerateTransaction: 4007,
        VmsFixedPriceRecordIsTypeConflict: 4201,
        VmsFixedPriceRecordIsTypeToProcess: 4202,
        VmsFixedPriceRecordToChangeInternalOrg: 4203,
        VmsFixedPriceRecordToDiscard: 4204,
        VmsFixedPriceRecordToResolve: 4205,
        VmsFixedPriceRecordMarkAsConflicting: 4206,
        VmsFixedPriceRecordGenerateTransaction: 4207,
    },

    Task: {
        AssigneeType: {
            Role: 1,
            User: 2,
            System: 3
        },
        Status: {
            Pending: 1,
            Completed: 2,
            Exception: 3,
            WorkflowMigrationTrigger: 4
        }
    },

    BillingTransactionGenerationMethod: {
        OneBillingTransactionPerBillingDocument: 1,
        OneBillingTransactionPerProject: 2,
    },

    TaskRoutingDialogType: {
        None: 1,
        Decline: 2,
    },
    //TaskCardGroupType
    PendingReview: "Pending Review",
    PendingDocuments: "Pending Document Review",
    ApproveTimesheet: "Approve Timesheet",

    PurchaseOrderStatus: {
        New: 1,
        Active: 2,
        Draft: 3
    },

    InternalTeamStatus: {
        New: 2,
        Active: 1
    },

    InternalTeamRestrictionType: {
        InternalOrganization: 1,
        ClientOrganization: 2,
        LineOfBusiness: 3,
        InternalOrganizationDefinition1: 4
    },

    WorkOrderStatus: {
        New: 1,
        Active: 2,
        Draft: 3,
        Replaced: 4,
        PendingReview: 5,
        Cancelled: 6,
        Terminated: 7,
        Discarded: 8,
        Declined: 9,
        Recalled: 10,
        Expired: 11,
        ComplianceDraft: 12,
        RecalledCompliance: 13,
        PendingUnterminate: 14
    },
    WorkOrderCreationReason:
    {
        New: 1,
        Extend: 2,
        ScheduleChange: 3,
        CorrectWorkOrderVersionEarliest: 4,
        CorrectWorkOrderVersionLatest: 5,
        CorrectWorkOrderVersionMiddle: 6,
        CorrectWorkOrderVersionUnique: 7
    },

    ValidationCodes:
    {
        TimeSheetWorkOrderHasDailyPayRates: 14060,
        TimeSheetWorkOrderHasFixedRates: 14070,
        NotEnoughPurchaseOrderFunds: 14080,
        TimeSheetOver50HoursInAWeek: 14090,
        TimeSheetTransactionExistsForTheSameTimePeriod: 14100,
        TimeSheetOver50kTransaction: 14110
    },

    TransactionCategory: {
        Bonus: 1,
        HoursAdjustment: 2,
        RateAdjustment: 3,
        StatHolidayPayAdjust: 4,
        VacationPay: 5,
    },

    TransactionType: {
        Timesheet: 1,
        Manual: 2,
        Expense: 3,
        Advance: 4,
        VmsTimesheet: 5,
        Adjustment: 6,
        VacationPayment: 7,
        VmsCommission: 8,
        VmsExpense: 9,
        VmsFixedPrice: 10,
    },

    RateType: {
        Primary: 1,
        Overtime: 2,
        OnCallWeekday: 3,
        Pager: 4,
        Other: 5,
        Stat: 6,
        DoubleTime: 7,
        TravelTime: 8,
        Session: 9,
        OnCallWeekend: 10
    },

    RateUnit: {
        Hour: 1,
        Day: 2,
        Fixed: 3,
        Words: 4,
        Monthly: 5,
        Shift: 6
    },
    DocumentTypes:
    {
        TaxDocs: 1,
        IncorpDocs: 2,
        ClientSide: 3,
        SupplierSide: 4,
        TimesheetSupportingDocument: 5,
        TaxDoc: 6,
        Profile: 7,
        PODocument: 8,
        ClientExtensionLetter: 9,
        ClientAgreement: 10,
        PurchaseOrderDocument: 11,
        WorkerContract: 12,
        WorkerExtensionLetter: 13,
        VoidCheque: 14,
        NDAIP: 15,
        DirectDepositLetter: 16,
        IncDocument: 17,
        TaxDocument: 18,
        ProjectNote: 19,
        TimesheetPrint: 20,
        TransactionBillingDocument: 21,
        VmsRecordsFormatted: 22,
        VmsRecordsOriginal: 23,
        InvoiceVersionDraft: 24,
        InvoiceVersionInternalView: 25,
        InvoiceVersionStandard: 26,
        InvoiceVersionCourtesyCopy: 27,
        PaymentVersionDraft: 28,
        PaymentVersionInternalView: 29,
        PaymentVersionStandard: 30,
        PaymentVersionCourtesyCopy: 31,
        CommissionDocument: 32,
        CommissionAdjustmentDocument: 33,
        WorkerProfileDocument: 34,
        VmsDiscountRecordsFormatted: 35,
        VmsDiscountRecordsOriginal: 36,
        VmsUnitedStatesSourceDeductionRecordsFormatted: 37,
        VmsUnitedStatesSourceDeductionRecordsOriginal: 38,
        MigratedDocument: 39,
        InternalOrganizationPortraitHeader: 60001,
        InternalOrganizationPortraitFooter: 60002,
        InternalOrganizationLandscapeHeader: 60003,
        InternalOrganizationLandscapeFooter: 60004,
        ComplianceDocumentRuleSample: 83001,
        ComplianceDocumentRuleTemplate: 83002,
        ComplianceDocumentMain: 87001,
        ComplianceDocumentExemption: 87002,
        ExpenseItemDocument: 95001,
        ExpenseClaimDocument: 96001,
        ComplianceTemplateTemplate: 116001,
        ComplianceTemplateSample: 116002,
    },
    TransactionHeaderStatus: {
        New: 1,
        Draft: 2,
        PendingReview: 3,
        Active: 4
    },
    PaymentTransactionStatus: {
        New: 1,
        Draft: 2,
        PendingReview: 3,
        PendingPaymentRelease: 4,

        PendingPaymentProcessing: 5,
        PendingReleaseVirtual: {
            ReadyToRelease: 51,
            PlannedForRelease: 52,
            Stopped: 53
        },
        OnHold: 6,
        Paid: 7,
        Suppress: 8
    },
    PaymentInvoiceTemplate: {
        PCGLStandardPaymentVoucher: 1,
        PCGLTempWorkerPaystub: 2,
    },
    PaymentInvoiceTerms: {
        PayWhenPaid: 1,
        ScheduledTerms: 2,
        Immediate: 3,
        Term: 4
    },
    PaymentStatus: {
        PendingRelease: 1,
        PendingBackofficeReview: 2,
        MarkedPaid: 3,
        SuppressRelease: 4,
        Released: 5,
        Recalled: 6,
        WaitingForPrint: 7,
        WaitingForClearance: 8,
        OnHold: 9,
        CancelledBeforePrinting: 11,
        CancelledAfterPrinting: 12,
        PaymentStopped: 13,
        NSF: 14,
        Cleared: 15
    },
    PaymentReleaseBatchStatus: {
        Finalized: 1,
        Transferred: 2,
        Recalled: 3,
        CreationInProgress: 4,
        Draft: 5,
        DeletionInProgress: 6
    },
    TimeSheetStatus: {
        New: 1,
        Draft: 2,
        PendingReview: 3,
        Approved: 4,
        Declined: 5,
        PendingDocuments: 6,
        Recalled: 7
    },
    SourceDeductionType: {
        CanadaPensionPlan: 1,
        EmploymentInsurance: 2,
        ParentalInsurancePlan: 3,
        HealthCare: 4,
        WCB: 5,
        FederalTax: 6,
        ProvincialTax: 7,
        QuebecPensionPlan: 8,
        NonResidentWithholding: 9,
        AdditionalTax: 10,
        Medicare: 11,
        SocialSecurity: 12,
        Fudi: 13,
        Sui: 14,
    },
    PaymentOtherEarningType: {
        VacationPay: 1,
    },

    PaymentOtherEarningTypeVacationPayRatePercentageDefault: 4,

    TaxVersionStatus: {
        New: 1,
        Active: 2,
        Replaced: 3
    },
    WorkerCompensationStatus: {
        Active: 1,
        InActive: 2
    },
    RecipientType: {
        InvoiceRecipient: 1,
        CourtesyCopy: 2,
        InvoiceViewer: 3,
    },
    DeliveryMethod:{
        HardCopy: 1,
        SoftCopy: 2,
        Suppressed: 3,
        InternalProfile: 4
    },
    ProfileAddressType: {
        Home: 1,
        Business: 2,
    },
    ClientSalesTaxDefault: {
        HeadOffice: 1,
        WorkOrderWorksite: 2
    },
    PaymentMethodType: {
        Cheque: 1,
        DirectDeposit: 2,
        WireTransfer: 3,
        FromPayeeProfile: 4,
        ADP: 5,
        ManualWire: 6
    },
    AdvanceStatus: {
        Active: 1,
        Complete: 2,
        Cancelled: 3
    },
    GarnisheeStatus: {
        Active: 1,
        Complete: 2,
        Cancelled: 3
    },
    VmsImportedRecordType: {
        ToProcess: 1,
        Conflict: 2,
        Discarded: 3,
        Error: 4,
        Completed: 5
    },
    VmsDiscountImportedRecordType: {
        ToProcess: 1,
        Conflict: 2,
        Discarded: 3,
        Error: 4,
        Completed: 5
    },
    VmsUnitedStatesSourceDeductionImportedRecordType: {
        ToProcess: 1,
        Conflict: 2,
        Discarded: 3,
        Error: 4,
        Completed: 5
    },
    VmsExpenseImportedRecordType: {
        ToProcess: 1,
        Conflict: 2,
        Discarded: 3,
        Error: 4,
        Completed: 5
    },
    VmsCommissionImportedRecordType: {
        ToProcess: 1,
        Conflict: 2,
        Discarded: 3,
        Error: 4,
        Completed: 5
    },
    VmsFixedPriceImportedRecordType: {
        ToProcess: 1,
        Conflict: 2,
        Discarded: 3,
        Error: 4,
        Completed: 5
    },
    LineOfBusiness: {
        Regular: 1,
        PermPlacement: 2,
        Payroll: 3,
        Subvendor: 4
    },

    CommissionRateHeaderStatus: {
        New: 1,
        Active: 2,
        InActive: 3
    },

    CommissionRateVersionStatus: {
        New: 1,
        Active: 2,
        Replaced: 3
    },

    PayeeType: {
        SupplierOrganization: 1,
        UserProfileWorker: 2,
        GarnisheePayTo: 3
    },
    CommissionRateRestrictionType: {
        InternalOrganization: 1,
        ClientOrganization: 2,
        LineOfBusiness: 3,
        InternalOrganizationDefinition1: 4
    },
    CommissionRole: {
        JobOwnerRoleNoSupport: 1,
        JobOwnerRoleWithSupport: 2,
        SupportingJobOwner: 3,
        RecruiterRole: 4,
        NationalAccountsRole: 5,
        BranchManagerRole: 6,
    },
    ScheduledChangeRateApplication:
    {
        AllWorkOrders: 1,
        OnlyNewAssignmentsAndWorkOrderExtension: 2,
        OnlyNewAssignments: 3
    },
    FunctionalRole: {
        OrganizationalRole: 1,
        Worker: 2,
        AccountsReceivable: 3,
        BackOffice: 4,
        Finance: 5,
        AccountManager: 6,
        Recruiter: 7,
        SystemAdministrator: 8,
        ClientServices: 9,
        Controller: 10,
        BackOfficeARAP: 11,
        RecruitmentLead: 12,
        ClientServicesLead: 13,
        BranchManager: 14,
        LegalLead: 15,
        Legal: 16,
        Executive: 17
    },
    ProductionHideFunctionality: false,

    RebateHeaderStatus: {
        New: 1,
        Active: 2,
        Inactive: 3
    },

    RebateVersionStatus: {
        New: 1,
        Active: 2,
        Replaced: 3
    },

    VmsFeeHeaderStatus: {
        New: 1,
        Active: 2,
        Inactive: 3
    },

    VmsFeeVersionStatus: {
        New: 1,
        Active: 2,
        Replaced: 3
    },
    VmsFeeRebate: {
        VmsFee: 1,
        Rebate: 2
    },
    AtsSource: {
        ProcomBullhorn: 1,
    },

    CommissionTransactionStatus: {
        Recognized: 1,
        Scheduled: 2,
        OnHold: 3,
        Paid: 4
    },

    CommissionTransactionType: {
        Transaction: 1,
        Adjustment: 2
    },

    CommissionAdjustmentHeaderStatus: {
        New: 1,
        Active: 2,
        InActive: 3
    },

    CommissionAdjustmentHeaderType: {
        ManualAdjustment: 1,
        BackgroundCheck: 2,
        VmsDiscount: 3,
        Interest: 4,
        VmsUnitedStatesSourceDeduction: 5,
    },

    CommissionAdjustmentDetailType: {
        JobOwnerAllocation: 1,
        WorkorderAllocation: 2
    },

    ApplicationConfigurationType: {
        DisableATS: 1,
    },

    TimeSheetType: {
        Manual: 1,
        Imported: 2
    },

    WorkerEligibility: {
        CitizenOrPermanentResident: 1,
        ForeignWorker: 2,
        NA: 3
    },

    TemporaryForeignPermitType: {
        ForeignWorkerTWA: 1,
        StudentIEC: 2,
        NAFTA: 3
    },

    IECCategoryStudentType: {
        WorkingHolidays: 1,
        YoungProfessionalsOrGraduates: 2,
        InternationalCoop: 3,
        SummerJob: 4
    },

    EligibilityForWorkPermit: {
        NotReceived: 1,
        Received: 2,
        Refused: 3
    },

    WorkPermitType: {
        OpenUnrestricted: 1,
        OpenRestricted: 2,
        Closed: 3,
        Other: 4
    },
    getWatchers: function (root) {
        //  https://gist.github.com/kentcdodds/31c90402750572107922
        //  Open web browser console and execute:
        //  ApplicationConstants.getWatchers().length
        root = angular.element(root || document.documentElement);
        var watcherCount = 0;

        function getElemWatchers(element) {
            var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
            var scopeWatchers = getWatchersFromScope(element.data().$scope);
            var watchers = scopeWatchers.concat(isolateWatchers);
            angular.forEach(element.children(), function (childElement) {
                watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
            });
            return watchers;
        }

        function getWatchersFromScope(scope) {
            if (scope) {
                return scope.$$watchers || [];
            } else {
                return [];
            }
        }

        return getElemWatchers(root);
    },

    addBlankSelectionRowToAll: function (list) {
        list.push({
            id: null,
            code: "Blank",
            text: "Blank"
        });
        return angular.copy(list);
    },

    EntityAccessAction: {
        exists: function (accessActionsList, action) {
            var isExist = false;
            angular.forEach(accessActionsList, function (accessActionInstance) {
                if (accessActionInstance.AccessAction == action) {
                    isExist = true;
                    return isExist;
                }
            });
            return isExist;
        },
        OrganizationView: 1000,
        TimeSheetView: 9000,
        TimeSheetSave: 9001,
        TimeSheetViewBackOffice: 9002,
        ContactView: 10000,
        PurchaseOrderView: 11000,
        TransactionHeaderView: 12000,
        WorkOrderVersionView: 17000,
        BillingTransactionView: 20000,
        PaymentTransactionView: 21000,
        InvoiceView: 22000,
        InvoiceEdit: 22001,
        PaymentView: 23000,
        PaymentReleaseBatchView: 24000,
        FederalTaxHeaderView: 26000,
        ProvincialTaxHeaderView: 27000,
        SalesTaxHeaderView: 30000,
        VmsImportedRecordView: 34000,
        PaymentTransactionGarnisheeView: 35000,
        CommissionRateHeaderView: 40000,
        CommissionTransactionView: 47000,
        CommissionAdjustmentHeaderView: 48000,
        CommissionSalesPatternView: 51000,
        FinancialTransactionView: 57000,
        WCBHeaderView: 65000,
        TemplateView: 66000,
        CommissionReportHeaderView: 73000,
        InternalTeam: 74000,
        AccessSubscriptionView: 75000,
        BranchView: 77000,
        ComplianceDocumentRuleView: 83000,
        UserDefinedCodeComplianceDocumentTypeView: 86000,
        ComplianceDocumentView: 87000,
        WorkerCompensationView: 92000,
        WCBSubdivisionHeaderView: 93000,
        WCBSubdivisionVersionView: 94000,
        ExpenseClaimView: 96000,
        ExpenseClaimSave: 96001,
        ProjectView: 99000,
        ProjectSave: 99001,
        ProjectDiscard: 99002,
        RemittanceTransactionView: 105000,
        ComplianceTemplateView: 116000,
    },
    FunctionalOperation: {
        Dashboard: 10,
        ActivityCenter: 20,
        ContractManagement: 30,
        FinancialManagement: 40,
        Administration: 90,
        WorkflowTaskManagment: 100,
        WorkflowTaskSearch: 101,
        DraftsManagment: 102,
        OrganizationManage: 200,
        OrganizationSearch: 201,
        OrganizationCreate: 202,
        OrganizationRebate: 203,
        OrganizationNewOnQuickAdd: 204,
        OrganizationAddContact: 205,
        OrganizationAddClientRole: 206,
        OrganizationAddIndependentContractorRole: 207,
        OrganizationAddInternalRole: 208,
        OrganizationSubmitClientRole: 209,
        OrganizationSubmitIndependentContractorRole: 210,
        OrganizationSubmitInternalRole: 211,
        OrganizationDeleteClientRole: 212,
        OrganizationDeleteIndependentContractorRole: 213,
        OrganizationDeleteInternalRole: 214,
        OrganizationViewClientRole: 215,
        OrganizationViewIndependentContractorRole: 216,
        OrganizationViewInternalRole: 217,
        OrganizationInternalRoleAddBankAccount: 218,
        OrganizationInternalRoleEditBankAccount: 219,
        OrganizationIndependentContractorRoleAddTaxNumber: 220,
        OrganizationIndependentContractorRoleEditTaxNumber: 221,
        OrganizationIndependentContractorRoleAddPaymentMethodCheque: 222,
        OrganizationIndependentContractorRoleEditPaymentMethodCheque: 223,
        OrganizationIndependentContractorRoleAddPaymentMethodDirectDeposit: 224,
        OrganizationIndependentContractorRoleEditPaymentMethodDirectDeposit: 225,
        OrganizationIndependentContractorRoleAddPaymentMethodWireTransfer: 226,
        OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer: 227,
        OrganizationInternalRoleAddTaxNumber: 228,
        OrganizationInternalRoleEditTaxNumber: 229,
        OrganizationIndependentContractorRoleAdvanceView: 230,
        OrganizationIndependentContractorRoleAdvanceNew: 231,
        OrganizationIndependentContractorRoleAdvanceSubmit: 232,
        OrganizationIndependentContractorRoleGarnisheeView: 233,
        OrganizationIndependentContractorRoleGarnisheeNew: 234,
        OrganizationIndependentContractorRoleGarnisheeSubmit: 235,
        OrganizationSubvendorRoleAdvanceView: 236,
        OrganizationSubvendorRoleAdvanceNew: 237,
        OrganizationSubvendorRoleAdvanceSubmit: 238,
        OrganizationRebateView: 239,
        OrganizationRebateNew: 240,
        OrganizationVmsFeeView: 241,
        OrganizationVmsFeeNew: 242,
        OrganizationClientRoleEditNationalAccountManager: 243,
        OrganizationClientRoleEditAlternateBill: 244,
        OrganizationAddSubVendorRole: 245,
        OrganizationSubmitSubVendorRole: 246,
        OrganizationDeleteSubVendorRole: 247,
        OrganizationViewSubVendorRole: 248,
        OrganizationSubVendorRoleAddTaxNumber: 249,
        OrganizationSubVendorRoleEditTaxNumber: 250,
        OrganizationSubVendorRoleAddPaymentMethodCheque: 251,
        OrganizationSubVendorRoleEditPaymentMethodCheque: 252,
        OrganizationSubVendorRoleAddPaymentMethodDirectDeposit: 253,
        OrganizationSubVendorRoleEditPaymentMethodDirectDeposit: 254,
        OrganizationSubVendorRoleAddPaymentMethodWireTransfer: 255,
        OrganizationSubVendorRoleEditPaymentMethodWireTransfer: 256,
        OrganizationSubVendorRoleEditUseADifferentPayeeName: 257,
        OrganizationSubVendorRoleEditPayeeName: 258,
        OrganizationViewLimitedLiabilityCompanyRole: 259,
        OrganizationAddLimitedLiabilityCompanyRole: 260,
        OrganizationSubmitLimitedLiabilityCompanyRole: 261,
        OrganizationDeleteLimitedLiabilityCompanyRole: 262,
        OrganizationIndependentContractorRoleAddPaymentMethodAdp: 263,
        OrganizationIndependentContractorRoleEditPaymentMethodAdp: 264,
        OrganizationSubVendorRoleAddPaymentMethodAdp: 265,
        OrganizationSubVendorRoleEditPaymentMethodAdp: 266,
        OrganizationInternalRoleRollOver: 267,
        ContactManagment: 300,
        ContactSearch: 301,
        ContactCreateOrganizational: 302,
        ContactCreateInternal: 303,
        ContactCreateWorker: 304,
        ContactCreateProfileTypeInternal: 305,
        ContactCreateProfileTypeOrganizational: 306,
        ContactCreateProfileTypeWorkerTemp: 307,
        ContactCreateProfileTypeWorkerCanadianSP: 308,
        ContactCreateProfileTypeWorkerCanadianInc: 309,
        ContactCreateProfilePaymentMethodsChange: 310,
        ContactSearchInternalTeams: 311,
        ContactInternalTeamCreate: 312,
        ContactCreate: 313,
        CreateInternalTeam: 314,
        EditInternalTeam: 315,
        WorkOrderManagement: 400,
        WorkOrderSearch: 401,
        WorkOrderCreateSetup: 402,
        WorkOrderSavedTeplatesSearch: 403,
        WorkOrderCreate: 404,
        WorkOrderVersionChangePaymentSourceDeduction: 405,
        WorkOrderVersionChangePaymentRateIsApplyDeduction: 406,
        WorkOrderVersionChangePaymentRateIsApplyVacation: 407,
        PurchaseOrderManagement: 500,
        PurchaseOrderSearch: 501,
        PurchaseOrderCreate: 502,
        TransactionManagement: 600,
        TransactionSearch: 601,
        VMSManagement: 602,
        TransactionManualCreation: 603,
        VMSAccess: 604,
        ManageVMSBatches: 605,
        VMSImport: 606,
        VMSDiscardAllConflictRecords: 607,
        PaymentManagement: 800,
        PaymentSearch: 801,
        PaymentPending: 802,
        PaymentDirectDepositBatchSearch: 803,
        PaymentPaymentTransactionGarnisheeGrouped: 804,
        PaymentWireTransferBatchSearch: 805,
        ManageCheques: 806,
        PaymentAdpBatchSearchGroup: 807,
        YTDEarningsInfo: 808,
        PaymentPendingView: 809,
        JournalManagement: 900,
        JournalSearch: 901,
        JournalPending: 902,
        PayrollManagement: 1000,
        PayrollSearch: 1001,
        PayrollSalesTaxesSearch: 1002,
        TimesheetManagement: 1100,
        TimesheetEntry: 1101,
        TimesheetSearch: 1102,
        TimesheetExceptionsSearch: 1103,
        CommissionManagement: 1200,
        CommissionSearch: 1201,
        CommissionSearchTemplates: 1202,
        CommissionSearchSalesPatterns: 1203,
        CommissionSearchAdjustment: 1204,
        CommissionReport: 1205,
        CommissionReportPendingInterest: 1206,
        CommissionReportNotFinalized: 1207,
        CommissionReportAdministratorView: 1208,
        CommissionBranchSummary: 1209,
        DashboardHomeView: 1301,
        BranchView: 1401,
        BranchEdit: 1402,
        BranchSave: 1403,
        AccessSubscriptionView: 1501,
        AccessSubscriptionCreate: 1502,
        BillingTransactionSingleToConsolidated: 2001,
        BillingTransactionConsolidatedToSingle: 2002,
        BillingTransactionCreateInvoice: 2003,
        BillingTransactionSuppress: 2004,
        BillingTransactionUnsuppress: 2005,
        InvoiceManagement: 2200,
        InvoiceSearch: 2201,
        InvoiceCreate: 2202,
        InvoicePending: 2203,
        PaymentReleaseBatchManagement: 2400,
        PaymentReleaseBatchSearch: 2401,
        PaymentReleaseBatchCreate: 2402,
        FederalTaxManagement: 2600,
        FederalTaxSearch: 2601,
        FederalTaxCreate: 2602,
        ProvincialTaxManagement: 2700,
        ProvincialTaxSearch: 2701,
        ProvincialTaxCreate: 2702,
        CommissionRateManagement: 4000,
        CommissionRateSearch: 4001,
        CommissionRateCreate: 4002,
        CommissionAdjustmentManagement: 4800,
        CommissionAdjustmentSearch: 4801,
        CommissionAdjustmentCreate: 4802,
        UserProfileManagement: 5000,
        UserProfileSearch: 5001,
        UserProfileCreate: 5002,
        UserProfileReassign: 5003,
        UserProfileEditTypeOrganizational: 5004,
        UserProfileEditTypeInternal: 5005,
        UserProfileEditTypeWorker: 5006,
        UserProfileEditWorkerPaymentMethod: 5007,
        UserProfileViewWorkerAdvance: 5008,
        UserProfileNewWorkerAdvance: 5009,
        UserProfileEditWorkerAdvance: 5010,
        UserProfileViewWorkerGarnishee: 5011,
        UserProfileNewWorkerGarnishee: 5012,
        UserProfileEditWorkerGarnishee: 5013,
        UserProfileAddGovernmentAdjustment: 5014,
        UserProfileInviteTypeOrganizational: 5015,
        UserProfileInviteTypeInternal: 5016,
        UserProfileInviteTypeWorker: 5017,
        Report: 6000,
        ComplianceDocumentManage: 8300,
        ComplianceDocumentRuleAreaTypeSearch: 8301,
        ComplianceDocumentRuleView: 8302,
        ComplianceDocumentRuleCreate: 8303,
        ComplianceDocumentRuleAddAccessSubscriptionRestriction: 8304,
        ComplianceDocumentRuleSubmitAccessSubscriptionRestriction: 8305,
        ComplianceDocumentRuleDeleteAccessSubscriptionRestriction: 8306,
        UserDefinedCodeComplianceDocumentTypeSearch: 8601,
        UserDefinedCodeComplianceDocumentTypeView: 8602,
        UserDefinedCodeComplianceDocumentTypeCreate: 8603,
        UserDefinedCodeComplianceDocumentTypeSave: 8604,
        UserDefinedCodeComplianceDocumentTypeSubmit: 8605,
        UserDefinedCodeComplianceDocumentTypeDiscard: 8606,
        UserDefinedCodeComplianceDocumentTypeActivate: 8607,
        UserDefinedCodeComplianceDocumentTypeInactivate: 8608,
        ComplianceDocumentSearch: 8701,
        ComplianceDocumentView: 8702,
        ComplianceDocumentCreate: 8703,
        WorkerCompensationSearch: 9201,
        WorkerCompensationCreate: 9202,
        WorkerCompensationSave: 9203,
        WCBSubdivisionSearch: 9301,
        WCBSubdivisionCreate: 9302,
        WCBSubdivisionHeaderSave: 9303,
        ExpenseItemSearch: 9501,
        ExpenseItemView: 9502,
        ExpenseItemCreate: 9503,
        ExpenseManagement: 9600,
        ExpenseClaimSearch: 9601,
        ExpenseClaimView: 9602,
        ExpenseClaimCreate: 9603,
        ExpenseClaimExceptions: 9604,
        ProjectSearch: 9901,
        ProjectView: 9902,
        ProjectCreate: 9903,
        TimeSheetDetailCreate: 10002,
        PayrollRemittance: 10501,
        UserGuideEdit: 10750,
    },

    OrganizationStatus: {
        New: 1,
        Draft: 2,
        PendingReview: 3,
        Active: 4,
        PendingChange: 5,
        Discard: 6,
        DuplicateActive: 7,
        Declined: 8,
        Recalled: 9,
        ComplianceDraft: 10,
        RecalledCompliance: 11,
    },

    OrganizationRoleStatus:
    {
        Active: 1,
        Inactive: 2
    },
    OrganizationClientRoleAlternateBillStatus: {
        New: 1,
        Draft: 2,
        PendingReview: 3,
        Active: 4
    },

    OrganizationRoleType:
    {
        Client: 1,
        IndependentContractor: 2,
        Internal: 3,
        SubVendor: 4,
        LimitedLiabilityCompany: 5
    },
    OrganizationSubVendorRoleRestrictionType:
    {
        InternalOrganization: 1,
        ClientOrganization: 2
    },
    SalesTaxType: {
        GSTHST: 1,
        QST: 3,
        PST: 4
    },

    AccessSubscriptionRestrictionType:
    {
        InternalOrganization: 1,
        ClientOrganization: 2,
        LineOfBusiness: 3,
        InternalOrganizationDefinition1: 4
    },

    AccessSubscriptionStatus:
    {
        New: 1,
        Draft: 2,
        PendingReview: 3,
        Active: 4,
        PendingChange: 5,
        Discard: 6,
        DuplicateActive: 7
    },

    AccessSubscriptionType:
    {
        Branch: 2,
        Client: 3
    },

    ComplianceDocumentRuleAreaType:
    {
        OrganizationInternal: 1,
        OrganizationClient: 2,
        Assignment: 3
    },
    ComplianceDocumentRuleEntityType:
    {
        Worker: 1,
        Organization: 2,
        WorkOrder: 3
    },
    ComplianceDocumentRuleExpiryType:
    {
        UserDefinedMandatory: 1,
        UserDefinedOptional: 2,
        None: 3
    },
    ComplianceDocumentRuleRequiredSituationType:
    {
        NewAssignment: 1,
        Extension: 2,
        Termination: 3
    },
    ComplianceDocumentRuleProfileVisibilityType:
    {
        WorkerProfile: 1,
        SupplierProfiles: 2,
        ClientProfiles: 3
    },
    ComplianceDocumentRuleRequiredType:
    {
        MandatoryForSubmission: 1,
        Optional: 2
    },
    ComplianceDocumentRuleRestrictionType:
    {
        Branch: 1,
        LineOfBusiness: 2,
        WorkerType: 3,
        OrganizationRoleType: 5,
        InternalOrganization: 6,
        Worksite: 7,
        ClientOrganization: 8,
        TaxSubdivision: 9,
        WorkerEligibility: 10,
    },
    ComplianceDocumentRuleStatus:
    {
        New: 1,
        Draft: 2,
        PendingReview: 3,
        Active: 4,
        PendingChange: 5,
        Discard: 6,
        DuplicateActive: 7,
        Inactive: 8,
    },
    ComplianceDocumentStatus:
    {
        New: 1,
        PendingUpload: 2,
        PendingSystem: 3,
        PendingExemptionRequest: 4,
        Exemption: 5,
        PendingReview: 6,
        Active: 7,
        Declined: 8,
        Deleted: 9,
        Archived: 10,
        Expired: 11,
        PendingSnoozeRequest: 12,
        Snooze: 13,
        NotApplicable: 14,
    },
    UserDefinedCodeComplianceDocumentTypeStatus:
    {
        New: 1,
        Draft: 2,
        Active: 3,
        Inactive: 4,
    },
    TimesheetMethodology:
    {
        Online: 1,
        Offline: 2,
        ThirdPartyImport: 3,
        NoTimesheet: 4,
    },
    ExpenseMethodology:
    {
        Online: 1,
        Offline: 2,
        ThirdPartyImport: 3,
        NoExpense: 4,
    },
    BillingInvoicePresentationStyles: {
        Consolidated: 1,
        OneInvoicePerTransactions: 2
    },
    BillingConsolidationType: {
        ManualConsolidation: 1,
        OneInvoicePerBillingPeriod: 2
    },
    CommissionStructureType: {
        BasePlusCommission: 1,
        OneHundredPercentCommission: 2
    },
    EarningsAndDeductionsType: {
        SourceDeductionCanadaPensionPlan: 1,
        SourceDeductionEmploymentInsurance: 2,
        SourceDeductionParentalInsurancePlan: 3,
        SourceDeductionHealthCare: 4,
        SourceDeductionWCB: 5,
        SourceDeductionFederalTax: 6,
        SourceDeductionProvincialTax: 7,
        SourceDeductionQuebecPensionPlan: 8,
        SourceDeductionNonResidentWithHolding: 9,
        SourceDeductionAdditionalTax: 10,
        PaymentOtherEarningVacationPay: 11,
        Advance: 12,
        Garnishee: 13,
        VmsFee: 14,
        Rebate: 15,
        SourceDeductionMedicare: 16,
        SourceDeductionSocialSecurity: 17,
        SourceDeductionFudi: 18,
        SourceDeductionSui: 19,
        SourceDeductionQuebecTrainingFee: 20,
        SourceDeductionBenefits: 21
    },
    RemittanceTransactionBatchStatus: {
        Created: 1,
        Transferred: 2,
        Recalled: 3
    },
    RemittanceType:
    {
        Payroll: 1,
        WorkerSafety: 2,
        HealthTax: 3
    },
    RemittanceStatus: {
        Created: 1,
        Recalled: 2
    },
    RemittanceTransactionStatus: {
        New: 1,
        Draft: 2,
        PendingRelease: 3,
        Released: 4,
        Recalled: 5
    },
    WidgetCategories: {
        All: 1,
        InternalOnly: 2
    },
    TemplateStatus: {
        Active: 1,
        Inactive: 2,
    },
    ReassignmentType: {
        Collaborator: 1,
        Recruiter: 2,
    },
    StateAction: {
        ManualDataFix: 1,
        TransactionHeaderManualSaveAction: 12001,
        TransactionHeaderUserActionManualSubmitAction: 12002,
        TransactionHeaderManualDiscardAction: 12003,
        TransactionHeaderActionReverseAction: 12004,
        TransactionHeaderActionReverseTimeSheetUnsubmitAction: 12005,
        TransactionHeaderActionReverseTimeSheetReturnToExceptionAction: 12006,
        TransactionHeaderActionReverseAndUnsubmitExpenseClaimAction: 12007,
        TransactionHeaderActionReverseAndReturnExpenseClaimToExceptionAction: 12008,
        TransactionHeaderActionReverseAdvanceAction: 12009,
        TransactionHeaderActionReverseAdjustmentAction: 12010,
        TransactionHeaderManualAddLineAction: 12011,
        TransactionHeaderManualRemoveLineAction: 12012,
        BillingTransactionAutoInvoice: 2201,
        BillingTransactionManualInvoice: 2202,
        InvoiceSaveState: 2203,
        InvoiceDiscardState: 2204,
        InvoiceReleaseState: 2205,
        InvoiceSuppressReleaseState: 2206,
        InvoicePaidState: 2207,
        InvoiceCancelState: 2208,
        InvoiceAddBillingTransactionsState: 2209,
        InvoiceBatchReleaseState: 2210,
        InvoiceBatchSuppressReleaseState: 2211,
        CommissionRateHeaderSubmitAction: 4000,
        CommissionRateHeaderInactiveAction: 4001,
        CommissionRateHeaderDeleteAction: 4002,
        CommissionRateHeaderManageRestrictionAction: 4003,
        CommissionRateVersionScheduleChangeAction: 4100,
        CommissionRateVersionEditAction: 4101,
        TimesheetApprove: 901,
        TimesheetAttachDocument: 902,
        TimesheetDecline: 903,
        TimesheetPrint: 904,
        TimesheetRecall: 905,
        TimesheetRemoveDocument: 906,
        TimesheetSaveTimesheetDetail: 907,
        TimesheetSubmit: 908,
        TimesheetUnsubmitTimesheetAndReverseTransactionState: 909,
        ReturnTimesheetToExceptionAndReverseTransaction: 910,
        ExpenseClaimDiscardState: 9601,
        ExpenseClaimSubmitState: 9602,
        ExpenseClaimAttachDocumentState: 9603,
        ExpenseClaimRemoveDocumentState: 9604,
        ExpenseClaimApproveState: 9605,
        ExpenseClaimDeclineState: 9606,
        ExpenseClaimRecallState: 9607,
        ExpenseClaimUnsubmitAndReverseTransactionState: 9608,
        ExpenseClaimSaveState: 9609,
        ExpenseClaimPrintState: 9610,
        CommissionTransactionCreateAction: 4700,
        CommissionTransactionScheduleAction: 4701,
        CommissionTransactionHoldAction: 4702,
        CommissionTransactionFinalizeAction: 4703,
        CommissionAdjustmentHeaderCreateAction: 4800,
        CommissionAdjustmentHeaderSubmitAction: 4801,
        CommissionAdjustmentChangeStatusAction: 4802,
        AddToBatchAction: 21002,
        RemovePaymentTransactionAction: 21003,
        PaymentReleaseBatchTransferToBankAction: 24001,
        PaymentReleaseBatchRecallAction: 24002,
        PaymentReleaseBatchGenerateFileAction: 24003,
        PaymentReleaseBatchDiscardDraftAction: 24004,
        PaymentReleaseBatchFinalizeDraftAction: 24005,
        PaymentReleaseBatchChangeDetailsAction: 24006,
        PaymentReleaseBatchRemoveAffectedPaymentsAction: 24009,
        PaymentRecallAction: 23001,
        PaymentRemoveAction: 23002,
        PaymentChequePrintState: 2301,
        PaymentChequeCancelBeforePrintingState: 2302,
        PaymentChequeSetToHoldState: 2303,
        PaymentChequeEnquePrintState: 2304,
        PaymentChequeClearState: 2305,
        PaymentChequeMarkAsNSFState: 2306,
        PaymentChequeStopPaymentState: 2307,
        PaymentChequeMoveInProgressState: 2308,
        PaymentChequeCancelAfterPrintingState: 2309,
        PrintQueueStatusToOnHoldState: 6201,
        PrintQueueStatusToPrintingState: 6202,
        PrintQueueStatusToInQueueState: 6203,
        PrintQueueStatusToErrorState: 6204,
        PrintQueueStatusToCompletedState: 6205,
        PrintQueueStatusToCancelledState: 6206,
        RemittanceTransactionRemitState: 10501,
        RemittanceBatchRecallState: 10601,
    }
};