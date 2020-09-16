/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';


    // Controller name is handy for logging
    var controllerId = 'AssignmentEntryController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.

    angular.module('phoenix.workorder.controllers').controller(controllerId,
        [
            '$rootScope', '$scope', '$q', '$state', '$stateParams', '$controller', 'dialogs', 'common', 'PayrollApiService', 'OrgApiService', 'ProfileApiService',
            'AssignmentApiService', 'AssignmentDataService', 'AssignmentValidationService', 'WorkOrderVersionModel', 'NavigationService', 'AssignmentCommonFunctionalityService', 'ClientSpecificFieldsService',
            'resolveCodeValueLists', 'resolveDefaultAssignment', 'resolveDefaultWorkOrderPurchaseOrderLine', 'resolveAssignment', 'resolveListOrganizationInternal', 'resolveListOrganizationClient', 'resolveListOrganizationSupplier', 'resolveListUserProfileWorker', 'resolveListUserProfileCommissions', 'resolveListSalesPatterns', 'resolveListUserProfileAssignedTo',
            AssignmentEntryController
        ]);

    function AssignmentEntryController($rootScope, $scope, $q, $state, $stateParams, $controller, dialogs, common, PayrollApiService, OrgApiService, ProfileApiService,
        AssignmentApiService, AssignmentDataService, AssignmentValidationService, WorkOrderVersionModel, NavigationService, AssignmentCommonFunctionalityService, ClientSpecificFieldsService,
        resolveCodeValueLists, resolveDefaultAssignment, resolveDefaultWorkOrderPurchaseOrderLine, resolveAssignment, resolveListOrganizationInternal, resolveListOrganizationClient, resolveListOrganizationSupplier, resolveListUserProfileWorker, resolveListUserProfileCommissions, resolveListSalesPatterns, resolveListUserProfileAssignedTo) {

        common.setControllerName(controllerId);
        $scope.triggerToRefreshComplianceDocument = 1;
        $scope.floatApplyTwoDecimalPlaces = function (c) {
            return common.floatApplyTwoDecimalPlaces(c);
        };
        $scope.floatApplySpecifiedNumberOfDecimalPlaces = function (c, n) {
            return common.floatApplySpecifiedNumberOfDecimalPlaces(c, n);
        };

        $scope.workOrderTabs = $state.current.data.workOrderTabs;

        $controller('AssignmentAddRemoveSubentitiesController', { $scope: $scope });
        $controller('AssignmentEventHandlerController', { $scope: $scope });
        $controller('AssignmentNotesController', { $scope: $scope });

        $scope.modelOriginal = {};
        $scope.model = {};
        $scope.model.WorkOrderIndex = 0;
        $scope.model.WorkOrderVersionIndex = 0;

        $scope.model.cultureId = 48;
        $scope.viewLoading = true;

        $scope.model.changeHistoryBlackList = [
            { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
            { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
            { TableSchemaName: '', TableName: '', ColumnName: 'SourceId' },

            { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
            { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },

            { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
            { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },

            { TableSchemaName: '', TableName: '', ColumnName: 'AssignmentId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'WorkOrderId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'WorkOrderVersionId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'PaymentInfoId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'BillingInfoId' },

            { TableSchemaName: 'workorder', TableName: 'Assignment', ColumnName: 'StatusId' },

            { TableSchemaName: 'workorder', TableName: 'WorkOrder', ColumnName: 'WorkOrderVersion' },
            //, { TableSchemaName: 'workorder', TableName: 'WorkOrder', ColumnName: 'StatusId' }
            //, { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'StatusId' }

            { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'StatusId' },
            { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'WorkOrderCreationReasonId' },
            { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'VersionNumber' },
            { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'WorkOrderStartDateState' },
            { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'WorkOrderEndDateState' },

            { TableSchemaName: 'po', TableName: 'WorkOrderPurchaseOrderLine', ColumnName: 'PurchaseOrderLineId' },
            { TableSchemaName: 'po', TableName: 'WorkOrderPurchaseOrderLine', ColumnName: 'StatusId' },
            { TableSchemaName: 'org', TableName: 'ClientBasedEntityCustomFieldValue', ColumnName: 'EntityTypeId' },
            { TableSchemaName: 'org', TableName: 'ClientBasedEntityCustomFieldValue', ColumnName: 'EntityId' }
        ];

        $scope.formValid =
            {
                entityForm: false,
                core: false,
                partiesAndRates: false,
                timeMaterialInvoice: false,
                expensemanagement: false,
                purchaseorder: false,
                earningsanddeductions: false,
                taxes: false,
                compliancedocuments: true, // validation must be activated when WO will be moved under Angular2. Currently when user choose not compliancedocuments Tab, the ang2 compotent is destroed
                clientspecificfields: true
            };

        $scope.updateClientSpecificFieldsValidation = function (isValid) {
            $scope.formValid.clientspecificfields = isValid;
        };

        // initialize default objects
        $scope.model.defaults = {
            workOrder: {},
            workOrderVersion: {},
            billingInfo: {},
            billingInvoices: [],
            billingRecipient: {},
            billingRate: {},
            billingSalesTax: {},
            paymentInfo: {},
            paymentInvoices: [],
            paymentRate: {},
            paymentContact: {},
            workOrderPurchaseOrderLine: {}
        };

        $scope.ExpenseApproverTypeIds = { "1": "Client", "2": "Internal", "3": "Supplier" };

        $scope.loadWCBCodelist = function () {
            var worksiteChangedMessage = [];

            if (ApplicationConstants.ProductionHideFunctionality && $scope.model.entity.OrganizationIdInternal == null) {
                //$scope.CurrentWorkOrderVersion.WCBHeaderId = $scope.getProductionWCBCodeDefault();//If worksite changes province, need to update
                return;
            }
            //WorkerCompensationId
            var worksite = _.find($scope.lists.workOrderWorkLocations, function (worksite) { return worksite.id == $scope.CurrentWorkOrderVersion.WorksiteId; });
            var subdivisionIdByWorksite = worksite ? worksite.parentId : null;
            var internalOrg = _.find($scope.lists.listOrganizationInternal, function (o) { return o.Id == $scope.model.entity.OrganizationIdInternal; });
            var organizationIdInternal = internalOrg ? internalOrg.Id : 0;
            if (subdivisionIdByWorksite !== null && typeof subdivisionIdByWorksite !== 'undefined' &&
                (($scope.oldSubdivisionIdByWorksite === null || typeof $scope.oldSubdivisionIdByWorksite === 'undefined' || $scope.oldSubdivisionIdByWorksite !== subdivisionIdByWorksite)
                    || ($scope.oldInternalOrgId === null || typeof $scope.oldInternalOrgId === 'undefined' || $scope.oldInternalOrgId !== organizationIdInternal))) {
                var notify = false;
                var notifyOrg = false;
                if ($scope.lists.wcbCodeList !== null && typeof $scope.lists.wcbCodeList !== 'undefined' && $scope.lists.wcbCodeList.length > 0 && subdivisionIdByWorksite !== null && subdivisionIdByWorksite != $scope.oldSubdivisionIdByWorksite) {
                    notify = true;
                }
                if ($scope.lists.wcbCodeList !== null && typeof $scope.lists.wcbCodeList !== 'undefined' && typeof $scope.oldInternalOrgId !== 'undefined' && $scope.oldInternalOrgId !== null && organizationIdInternal != $scope.oldInternalOrgId) {
                    notifyOrg = true;
                }
                if (notify) {
                    worksiteChangedMessage.push('The Workplace Safety Insurance Worker Classification list has been updated.');
                }
                if (notifyOrg) {
                    worksiteChangedMessage.push('The Workplace Safety Insurance Worker Classification list has been updated.');
                }
                AssignmentApiService.getWCBCodesBySubdivisionId(subdivisionIdByWorksite, organizationIdInternal).then(function (responseItems) {
                    $scope.lists.wcbCodeList = responseItems && responseItems.Items;

                    var contains = false;
                    angular.forEach($scope.lists.wcbCodeList, function (wcbCode) {
                        wcbCode.text = wcbCode.WorkerCompensation.Name;// wcbCode.WCBCode + ' - ' + wcbCode.Description;
                        //wcbCode.id = wcbCode.Id; //to make lists work properly
                        if (wcbCode.WorkerCompensationId === $scope.CurrentWorkOrderVersion.WorkerCompensationId)
                            contains = true;
                    });
                    if (!contains) {
                        $scope.CurrentWorkOrderVersion.WorkerCompensationId = undefined;
                    }
                    $scope.oldWCBDetailId = null;

                    $scope.getStateValid(false);
                });

                $scope.oldSubdivisionIdByWorksite = subdivisionIdByWorksite;
                $scope.oldInternalOrgId = organizationIdInternal;
            }

            return worksiteChangedMessage;
        };

        // initialize lists
        $scope.lists = {

            //tab Core
            workOrderStatuses: [],
            lineOfBusinesses: [],
            workOrderWorkLocations: [],
            wcbCodeList: [],
            workOrderPositionTitles: [],
            listOrganizationInternal: [],

            InternalOrganizationDefinition1List: [],
            InternalOrganizationDefinition2List: [],
            InternalOrganizationDefinition3List: [],
            InternalOrganizationDefinition4List: [],
            InternalOrganizationDefinition5List: [],

            //tab partiesAndRates
            currencies: [],
            workOrderRateTypes: [],
            profileTypeList: [],

            workOrderRateUnits: [],

            listOrganizationClient: [],
            listOrganizationSupplier: [],
            listUserProfileWorker: [],

            //tab timeMaterialInvoice
            orgClientAB: [],
            workOrderTimesheetCycles: [],

            workOrderDeliveryMethods: [],
            workOrderPaymentMethods: [],

            workOrderBillingFrequencies: [],
            workOrderPaymentReleaseSchedules: [],
            workOrderBillingInvoiceTerms: [],
            workOrderPaymentInvoiceTerms: [],


            workOrderBillingInvoiceTemplates: [],
            workOrderPaymentInvoiceTemplates: [],

            workOrderBillingRecipientTypes: [],
            workOrderBillingInvoiceRecipientTypes:[],

            workOrderTimesheetMethodologies: [],
            workOrderTimesheetApprovalFlows: [],

            //tab Taxes
            workOrderSalesTaxTerritories: [],
            salesTaxes: [],

            purchaseOrderDepletedOptionList: [],
            purchaseOrderDepletedGroupList: [],
            purchaseOrderStatuses: [],
            currencyList: [],
            workOrderPurchaseOrderLineStatusList: [],
            sourceDeductionTypeList: [],
            paymentOtherEarningTypeList: [],

            activeUserProfileList: [],

            t4PrintableYears: [2018, 2019], // temporary for T4 testing
        };

        $scope.showReplacedEntities = false;
        $scope.onChangeShowReplacedEntities = function () {
            AssignmentDataService.setValueShowReplacedEntities($scope.showReplacedEntities);
        };

        $scope.scopeApply = function () {
            common.scopeApply($scope);
        };

        $scope.getDeliverMethods = function(billingRecipient){
            if(billingRecipient.RecipientTypeId === ApplicationConstants.RecipientType.InvoiceRecipient){
                return $scope.lists.workOrderDeliveryMethods.filter(
                    function(item){ 
                        return item.id !== ApplicationConstants.DeliveryMethod.InternalProfile; 
                    });
            }else{
                return $scope.lists.workOrderDeliveryMethods.filter(
                    function(item){ 
                        return item.id !== ApplicationConstants.DeliveryMethod.InternalProfile && item.id !== ApplicationConstants.DeliveryMethod.Suppressed; 
                    });
            }
        }

        //Should be defined Getter for old browsers: __defineGetter__ sacks
        Object.defineProperty($scope, "CurrentWorkOrder", {
            get: function () {
                if ($scope.model.entity === null) {
                    return null;
                }
                return $scope.model.entity.WorkOrders[$scope.model.WorkOrderIndex];
            }
        });
        Object.defineProperty($scope, "CurrentWorkOrderVersion", {
            get: function () {
                if ($scope.model.entity === null) {
                    return null;
                }
                return $scope.model.entity.WorkOrders[$scope.model.WorkOrderIndex].WorkOrderVersions[$scope.model.WorkOrderVersionIndex];
            }
        });

        $scope.workOrderEvents = [];

        $scope.unbindWorkOrderEvents = function (unbindWorkOrderEventName) {
            angular.forEach($scope.workOrderEvents, function (e) {
                if (unbindWorkOrderEventName) {
                    if (unbindWorkOrderEventName == e.name) {
                        e.event();
                    }
                } else {
                    e.event();
                }
            });
        };

        $scope.$on("$destroy", function () {
            $scope.unbindWorkOrderEvents();
        });

        // validation must be activated when WO will be moved under Angular2. Currently when user choose not compliancedocuments Tab, the ang2 compotent is destroed
        //$scope.onComplianceDocumentOutput = function (complianceDocumentCallBackEmitterObj) {
        //    $scope.formValid.compliancedocuments = complianceDocumentCallBackEmitterObj.AllComplianceDocumentsAreValidForSubmission;
        //}

        $scope.getStateValid = function (populateBrokenRules) {
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!$scope.model.entity.workerProfileTypeId) {
                AssignmentCommonFunctionalityService.getWorker($scope.model.entity, $scope.lists.listUserProfileWorker);//$scope.getWorker();
            }

            AssignmentValidationService.validate($scope.model.entity.OrganizationIdInternal, $scope.model.entity.UserProfileIdWorker, $scope.model.entity.workerProfileTypeId, $scope.CurrentWorkOrder, $scope.CurrentWorkOrderVersion, 'all', populateBrokenRules, $scope.lists);

            $scope.formValid.entityForm = AssignmentValidationService.stateValid.all;
            $scope.formValid.core = AssignmentValidationService.stateValid.core;
            $scope.formValid.partiesAndRates = AssignmentValidationService.stateValid.partiesAndRates;
            $scope.formValid.timeMaterialInvoice = AssignmentValidationService.stateValid.timeMaterialInvoice;
            $scope.formValid.expensemanagement = AssignmentValidationService.stateValid.expensemanagement;
            $scope.formValid.purchaseorder = AssignmentValidationService.stateValid.purchaseorder;
            $scope.formValid.earningsanddeductions = AssignmentValidationService.stateValid.earningsanddeductions;
            $scope.formValid.taxes = AssignmentValidationService.stateValid.taxes;
            // $scope.formValid.compliancedocuments = 
        };

        $scope.currentProfileIsSystemAdministrator = function () {
            return _.filter($scope.CurrentProfile.FunctionalRoles, function (item) {
                return (
                    item.FunctionalRoleId === ApplicationConstants.FunctionalRole.SystemAdministrator
                );
            }).length > 0;
        }

        $scope.currentProfileUnderComplianceRole = function () {
            return _.filter($scope.CurrentProfile.FunctionalRoles, function (item) {
                return (
                    item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOffice
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Finance
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.SystemAdministrator
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Controller
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOfficeARAP
                );
            }).length > 0;
        }

        $scope.currentProfileUnderAccountingRole = function () {
            return _.filter($scope.CurrentProfile.FunctionalRoles, function (item) {
                return (
                    item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Finance             // old: ApplicationConstants.FunctionalRole.AccountingManager
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Controller          // old: ApplicationConstants.FunctionalRole.Controller
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOffice          // old: ApplicationConstants.FunctionalRole.AccountingGeneralist
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.AccountsReceivable  // old: ApplicationConstants.FunctionalRole.AROfficer
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOfficeARAP
                );
            }).length > 0;
        }

        $scope.currentProfileUnderClientServiceRole = function () {
            return _.filter($scope.CurrentProfile.FunctionalRoles, function (item) {
                return (
                    item.FunctionalRoleId === ApplicationConstants.FunctionalRole.ClientServices
                );
            }).length > 0;
        }



        function loadResolveStaticLists() {
            //static Lists
            $scope.lists.workOrderStatuses = resolveCodeValueLists.workOrderStatuses;
            $scope.lists.lineOfBusinesses = _.filter(resolveCodeValueLists.lineOfBusinesses, function (o) { return o.id != ApplicationConstants.LineOfBusiness.PermPlacement; });
            $scope.lists.workOrderWorkLocations = resolveCodeValueLists.workOrderWorkLocations;
            $scope.lists.wcbCodeList = [];
            $scope.lists.workOrderPositionTitles = resolveCodeValueLists.workOrderPositionTitles;

            $scope.lists.InternalOrganizationDefinition1List = resolveCodeValueLists.InternalOrganizationDefinition1List;
            $scope.lists.InternalOrganizationDefinition2List = resolveCodeValueLists.InternalOrganizationDefinition2List;
            $scope.lists.InternalOrganizationDefinition3List = resolveCodeValueLists.InternalOrganizationDefinition3List;
            $scope.lists.InternalOrganizationDefinition4List = resolveCodeValueLists.InternalOrganizationDefinition4List;
            $scope.lists.InternalOrganizationDefinition5List = resolveCodeValueLists.InternalOrganizationDefinition5List;

            $scope.lists.UserProfileCommissions = resolveListUserProfileCommissions;
            $scope.lists.JobOwnersWithSupport = _.filter(angular.copy(resolveListUserProfileCommissions), function (obj) { return _.some(obj.UserProfileCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport; }); });
            $scope.lists.JobOwnersNoSupport = _.filter(angular.copy(resolveListUserProfileCommissions), function (obj) { return _.some(obj.UserProfileCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport; }); });
            $scope.lists.SupportJobOwners = _.filter(angular.copy(resolveListUserProfileCommissions), function (obj) { return _.some(obj.UserProfileCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.SupportingJobOwner; }); });
            $scope.lists.Recruiters = _.filter(angular.copy(resolveListUserProfileCommissions), function (obj) { return _.some(obj.UserProfileCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.RecruiterRole; }); });



            $scope.lists.salesPatterns = resolveListSalesPatterns;
            $scope.lists.salesPatternsActive = _.filter(angular.copy(resolveListSalesPatterns), function (obj) { return obj.SalesPatternStatusId === ApplicationConstants.CommissionRateHeaderStatus.Active });

            $scope.lists.userProfileAssignedTo = resolveListUserProfileAssignedTo;
            $scope.lists.activeUserProfileList = resolveListUserProfileAssignedTo.filter( function(x){ 
                return x.ProfileStatusId === ApplicationConstants.ProfileStatus.Active || x.ProfileStatusId === ApplicationConstants.ProfileStatus.PendingChange 
            } );

            //Organization Lists
            $scope.lists.listOrganizationInternal = resolveListOrganizationInternal;    //  Assignment.OrganizationIdInternal: 'Id', 'DisplayName', 'Code'
            $scope.lists.listOrganizationClient = resolveListOrganizationClient;        //  BillingInfo.OrganizationIdClient: 'Id', 'DisplayName'
            $scope.lists.listOrganizationSupplier = resolveListOrganizationSupplier;    //  paymentInfo.OrganizationIdSupplier: 'Id', 'DisplayName'
            $scope.lists.AB = function (id) {
                return [{ id: 1, text: "abc" }];
            };
            $scope.lists.listUserProfileWorker = resolveListUserProfileWorker;

            //tab partiesAndRates
            $scope.lists.currencies = resolveCodeValueLists.currencies;
            $scope.lists.profileTypeList = resolveCodeValueLists.profileTypeList;
            $scope.lists.workOrderRateTypes = resolveCodeValueLists.workOrderRateTypes;
            $scope.lists.workOrderRateUnits = resolveCodeValueLists.workOrderRateUnits;
            $scope.lists.rebateTypes = resolveCodeValueLists.rebateTypes;

            //tab timeMaterialInvoice
            $scope.lists.workOrderTimesheetCycles = resolveCodeValueLists.workOrderTimesheetCycles;
            $scope.lists.workOrderDeliveryMethods = resolveCodeValueLists.workOrderDeliveryMethods;
            $scope.lists.workOrderPaymentMethods = resolveCodeValueLists.workOrderPaymentMethods;

            $scope.lists.workOrderBillingFrequencies = resolveCodeValueLists.workOrderBillingFrequencies;
            $scope.lists.workOrderPaymentReleaseSchedules = resolveCodeValueLists.workOrderPaymentReleaseSchedules;

            $scope.lists.workOrderBillingInvoiceTerms = resolveCodeValueLists.workOrderBillingInvoiceTerms;
            $scope.lists.workOrderPaymentInvoiceTerms = resolveCodeValueLists.workOrderPaymentInvoiceTerms;

            $scope.lists.workOrderBillingInvoiceTemplates = resolveCodeValueLists.workOrderBillingInvoiceTemplates;
            $scope.lists.workOrderPaymentInvoiceTemplates = resolveCodeValueLists.workOrderPaymentInvoiceTemplates;

            $scope.lists.workOrderBillingRecipientTypes = resolveCodeValueLists.workOrderBillingRecipientTypes;
            $scope.lists.workOrderBillingInvoiceRecipientTypes = $scope.lists.workOrderBillingRecipientTypes.filter(function(item){ return item.id !== 1; });


            $scope.lists.workOrderTimesheetMethodologies = resolveCodeValueLists.workOrderTimesheetMethodologies;
            $scope.lists.workOrderTimesheetApprovalFlows = resolveCodeValueLists.workOrderTimesheetApprovalFlows;

            // Expense and Invoice Tab
            $scope.lists.workOrderExpenseMethodologies = resolveCodeValueLists.workOrderExpenseMethodologies;
            $scope.lists.workOrderExpenseApprovalFlows = resolveCodeValueLists.workOrderTimesheetApprovalFlows;

            $scope.lists.billingInvoicePresentationStyles = resolveCodeValueLists.billingInvoicePresentationStyles;
            $scope.lists.billingConsolidationTypes = resolveCodeValueLists.billingConsolidationTypes;
            $scope.lists.billingTransactionGenerationMethod = resolveCodeValueLists.billingTransactionGenerationMethod;
            //tab Taxes
            $scope.lists.workOrderSalesTaxTerritories = resolveCodeValueLists.workOrderSalesTaxTerritories;
            $scope.lists.salesTaxes = resolveCodeValueLists.salesTaxes;



            $scope.lists.billingTaxIsApplied = [{ id: true, text: 'Yes' }, { id: false, text: 'No' }];
            $scope.lists.purchaseOrderDepletedOptionList = resolveCodeValueLists.purchaseOrderDepletedOptionList;
            $scope.lists.purchaseOrderDepletedGroupList = resolveCodeValueLists.purchaseOrderDepletedGroupList;
            $scope.lists.purchaseOrderStatuses = resolveCodeValueLists.purchaseOrderStatuses;
            $scope.lists.currencyList = resolveCodeValueLists.currencyList;

            $scope.lists.workOrderPurchaseOrderLineStatusList = resolveCodeValueLists.workOrderPurchaseOrderLineStatusList;
            $scope.lists.sourceDeductionTypeList = resolveCodeValueLists.sourceDeductionTypeList;
            $scope.lists.paymentOtherEarningTypeList = resolveCodeValueLists.paymentOtherEarningTypeList;
        }

        function loadDefaults() {

            $scope.model.defaults.workOrder = angular.copy(resolveDefaultAssignment.WorkOrders[0]);
            $scope.model.defaults.workOrderVersion = angular.copy(resolveDefaultAssignment.WorkOrders[0].WorkOrderVersions[0]);

            angular.forEach($scope.model.defaults.workOrderVersion.BillingInfoes, function (billingInfo) {
                angular.forEach(billingInfo.BillingRates, function (billingRate) {
                    billingRate.Rate = common.floatApplyTwoDecimalPlaces(billingRate.Rate);
                });
            });
            angular.forEach($scope.model.defaults.workOrderVersion.PaymentInfoes, function (paymentInfo) {
                angular.forEach(paymentInfo.PaymentRates, function (paymentRate) {
                    paymentRate.Rate = common.floatApplyTwoDecimalPlaces(paymentRate.Rate);
                });
            });

            $scope.model.defaults.billingInfo = angular.copy($scope.model.defaults.workOrderVersion.BillingInfoes[0]);
            $scope.model.defaults.billingRate = angular.copy($scope.model.defaults.workOrderVersion.BillingInfoes[0].BillingRates[0]);
            $scope.model.defaults.billingSalesTax = angular.copy($scope.model.defaults.workOrderVersion.BillingInfoes[0].BillingSalesTaxes[0]);
            $scope.model.defaults.billinginvoices = angular.copy($scope.model.defaults.workOrderVersion.BillingInfoes[0].BillingInvoices);
            $scope.model.defaults.billingRecipient = angular.copy($scope.model.defaults.workOrderVersion.BillingInfoes[0].BillingInvoices[0].BillingRecipients[0]);
            $scope.model.defaults.billingRecipient.RecipientTypeId = null;

            $scope.model.defaults.paymentInfo = angular.copy($scope.model.defaults.workOrderVersion.PaymentInfoes[0]);
            $scope.model.defaults.paymentRate = angular.copy($scope.model.defaults.workOrderVersion.PaymentInfoes[0].PaymentRates[0]);
            $scope.model.defaults.paymentInvoices = angular.copy($scope.model.defaults.workOrderVersion.PaymentInfoes[0].PaymentInvoices);
            $scope.model.defaults.paymentContact = angular.copy($scope.model.defaults.workOrderVersion.PaymentInfoes[0].PaymentContacts[0]);
            $scope.model.defaults.workOrderPurchaseOrderLine = angular.copy(resolveDefaultWorkOrderPurchaseOrderLine);

            $scope.model.defaults.billingRate.RateTypeId = null;
            $scope.model.defaults.billingRate.RateUnitId = null;
            $scope.model.defaults.paymentRate.RateTypeId = null;
            $scope.model.defaults.paymentRate.RateUnitId = null;

            //  after receiving 'defaults.paymentContact' need to erase it from top objects
            $scope.model.defaults.paymentInfo.PaymentContacts = [];
        }

        function initializeApproverList() {
            var requiresExpenseApproverSupplier = true;
            var requiresExpenseApproverInternal = true;
            var requiresExpenseApproverClient = true;

            angular.forEach($scope.CurrentWorkOrderVersion.ExpenseApprovers, function (approver, i) {

                if ($scope.ExpenseApproverTypeIds[approver.ApproverTypeId] == 'Supplier') {
                    requiresExpenseApproverSupplier = false;
                }
                if ($scope.ExpenseApproverTypeIds[approver.ApproverTypeId] == 'Internal') {
                    requiresExpenseApproverInternal = false;
                }

                if ($scope.ExpenseApproverTypeIds[approver.ApproverTypeId] == 'Client') {
                    requiresExpenseApproverClient = false;
                }
            });

            if (requiresExpenseApproverSupplier) {
                $scope.CurrentWorkOrderVersion.ExpenseApprovers = $scope.CurrentWorkOrderVersion.ExpenseApprovers || [];
                $scope.CurrentWorkOrderVersion.ExpenseApprovers.push({
                    WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id,
                    ApproverTypeId: 3,
                    SortOrder: 1,
                    UserProfileId: null,
                    Sequence: 1,
                    MustApprove: true,
                });
            }

            if (requiresExpenseApproverInternal) {
                $scope.CurrentWorkOrderVersion.ExpenseApprovers = $scope.CurrentWorkOrderVersion.ExpenseApprovers || [];
                $scope.CurrentWorkOrderVersion.ExpenseApprovers.push({
                    WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id,
                    ApproverTypeId: 2,
                    SortOrder: 2,
                    UserProfileId: null,
                    Sequence: 2,
                    MustApprove: true,
                });
            }
            if (requiresExpenseApproverClient) {
                $scope.CurrentWorkOrderVersion.ExpenseApprovers = $scope.CurrentWorkOrderVersion.ExpenseApprovers || [];
                $scope.CurrentWorkOrderVersion.ExpenseApprovers.push({
                    WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id,
                    ApproverTypeId: 1,
                    SortOrder: 3,
                    UserProfileId: null,
                    Sequence: 3,
                    MustApprove: true,
                });
            }

            $scope.CurrentWorkOrderVersion.ExpenseApprovers.sort(function (a, b) {
                return parseInt(a.Sequence, 10) - parseInt(b.Sequence, 10);
            });

        }

        function isDraftStatus(statusId) {
            return statusId === ApplicationConstants.WorkOrderStatus.New
                || statusId === ApplicationConstants.WorkOrderStatus.Draft
                || statusId === ApplicationConstants.WorkOrderStatus.Declined
                || statusId === ApplicationConstants.WorkOrderStatus.Recalled
                || (isComplianceDraftStatus(statusId) && $scope.currentProfileUnderComplianceRole()); // TODO: replace role check with WorkflowAvailableActions contains save action in ng2?
        }

        function isComplianceDraftStatus(statusId) {
            return statusId === ApplicationConstants.WorkOrderStatus.ComplianceDraft
                || statusId === ApplicationConstants.WorkOrderStatus.RecalledCompliance
                ;
        }

        function loadModel(assignment, workOrderId, workOrderVersionId) {
            // extension: phoenix.workorder.models.WorkOrderVersionModel
            assignment.IsDraftStatus = isDraftStatus(assignment.StatusId);

            angular.forEach(assignment.WorkOrders, function (workOrder) {
                workOrder.IsDraftStatus = isDraftStatus(workOrder.StatusId);

                angular.forEach(workOrder.WorkOrderVersions, function (workOrderVersion) {
                    if (!workOrderVersion.extended) {
                        WorkOrderVersionModel.mixInto(workOrderVersion);
                    }
                    workOrderVersion.IsDraftStatus = isDraftStatus(workOrderVersion.StatusId);
                    workOrderVersion.IsComplianceDraftStatus = isComplianceDraftStatus(workOrderVersion.StatusId);
                    workOrderVersion.ValidateComplianceDraft = !(workOrderVersion.IsDraftStatus && !workOrderVersion.IsComplianceDraftStatus); // False when Draft/Decline/Recall
                });
            });

            $scope.model.entity = assignment;
            $scope.modelOriginal = angular.copy($scope.model.entity);
            $scope.unbindWorkOrderEvents();

            var ids = { assignmentId: assignment.Id, workOrderId: workOrderId, workOrderVersionId: workOrderVersionId };
            AssignmentDataService.getWorkOrderIds($scope.model.entity, ids);
            workOrderId = ids.workOrderId;
            workOrderVersionId = ids.workOrderVersionId;

            $scope.model.WorkOrderIndex = AssignmentDataService.getWorkOrderIndexById($scope.model.entity.WorkOrders, workOrderId);
            $scope.model.WorkOrderVersionIndex = AssignmentDataService.getWorkOrderVersionIndexById($scope.model.entity.WorkOrders, workOrderId, workOrderVersionId);
            
            // Can now use CurrentWorkOrder and CurrentWorkOrderVersion below
            
            initializeApproverList();

            $scope.CurrentWorkOrderVersion.wovEndDate = AssignmentCommonFunctionalityService.getWorkOrderVersionEndDate($scope.CurrentWorkOrder, $scope.CurrentWorkOrderVersion);

            if ($scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Replaced) {
                $scope.showReplacedEntities = true;
                AssignmentDataService.setValueShowReplacedEntities($scope.showReplacedEntities);
            }

            if (typeof $scope.viewLoading == "undefined" || typeof $scope.stopSpinning == "undefined")
                $scope.viewLoading = false;
            else
                $scope.stopSpinning();
        }

        function onLoad() {

            var ids = { assignmentId: $stateParams.assignmentId, workOrderId: $stateParams.workOrderId, workOrderVersionId: $stateParams.workOrderVersionId };
            if (!ids.assignmentId || ids.assignmentId < 1 || !ids.workOrderId || ids.workOrderId < 1 || !ids.workOrderVersionId || ids.workOrderVersionId < 1) {
                AssignmentDataService.getWorkOrderIds(resolveAssignment, ids);
                if (!$state.includes("template.workorder")) {
                    if ($state.includes('workorder.edit')) {
                        //  $state.go($state.current.name, { assignmentId: ids.assignmentId, workOrderId: ids.workOrderId, workOrderVersionId: ids.workOrderVersionId }, { notify: false });
                        // need to make notify: true becaouse of bug : http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=15183
                        $state.transitionTo('workorder.edit.core', { assignmentId: ids.assignmentId, workOrderId: ids.workOrderId, workOrderVersionId: ids.workOrderVersionId }, { reload: true, inherit: true, notify: true });
                    }
                    else {
                        $state.transitionTo('workorder.edit.core', { assignmentId: ids.assignmentId, workOrderId: ids.workOrderId, workOrderVersionId: ids.workOrderVersionId }, { reload: true, inherit: true, notify: false });
                    }
                }
            }

            if ($state.includes(AssignmentValidationService.edit.edit)) {
                loadResolveStaticLists();
                loadDefaults();
                var currentWorkOrder = resolveAssignment.WorkOrders.find(function (i) { return i.Id == ids.workOrderId; });
                var workOrderNumber = currentWorkOrder && currentWorkOrder.WorkOrderNumber;
                NavigationService.setTitle('workorder-viewedit', [ids.assignmentId + '.' + workOrderNumber]);
                loadModel(resolveAssignment, $stateParams.workOrderId, $stateParams.workOrderVersionId);
                $scope.getStateValid(!$state.includes(AssignmentValidationService.edit.edit));
                $scope.model.ValidationMessages = AssignmentDataService.getValidationMessages();
                AssignmentDataService.setValidationMessages([]);
            } else if ($state.includes('template.workorder')) {
                loadResolveStaticLists();
                loadDefaults();
                AssignmentDataService.setAssignmentCopied({});
                resolveAssignment.WorkOrders[0].WorkOrderVersions[0].extended = false;
                loadModel(resolveAssignment, 0, 0);
                NavigationService.setTitle('workorder-template-viewedit'/*, [$stateParams.templateId]*/);
            }
            $scope.loadWCBCodelist();
            loadCommissionIds();

            if (ApplicationConstants.ProductionHideFunctionality) {
                loadProductionDefaults();
            }

            $scope.setIsTest();

        }

        $scope.setIsTest = function () {
            var isTest = false;
            if ($scope.lists && $scope.lists.listOrganizationInternal && $scope.model && $scope.model.entity && $scope.model.entity.OrganizationIdInternal) {
                var internalOrganization = _.find($scope.lists.listOrganizationInternal, function (org) {
                    return (org.Id == $scope.model.entity.OrganizationIdInternal);
                });
                isTest = internalOrganization ? internalOrganization.IsTest : false;
            }
            $scope.isTest = isTest;
        };

        var loadProductionDefaults = function () {
            $scope.CurrentWorkOrderVersion.JobOwner = { CommissionRoleId: ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport, UserProfileIdSales: 1, CommissionRateHeaderId: null };
            $scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions = [{ CommissionRoleId: ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport, UserProfileIdSales: 1, CommissionRateHeaderId: null, CommissionRates: [] }];
            $scope.CurrentWorkOrderVersion.WCBIsITWorker = true;
            $scope.CurrentWorkOrderVersion.WCBIsApplied = false;
            $scope.CurrentWorkOrderVersion.WCBSubdivisionDetailId = $scope.getProductionWCBCodeDefault();
        };

        $scope.getProductionWCBCodeDefault = function () {
            var worksite = _.find($scope.lists.workOrderWorkLocations, function (worksite) { return worksite.id == $scope.CurrentWorkOrderVersion.WorksiteId; });
            var subdivisionIdByWorksite = worksite ? worksite.parentId : null;
            switch (subdivisionIdByWorksite) {
                case 602://QC
                    return 4;//67100 - QC
                case 600://ON
                    return 1;//929 - ON
                default:
                    return 1;//929 - ON
            }
        };

        $scope.isRecruiterRequired = function () {
            return AssignmentValidationService.validateRecruiterRequired($scope.CurrentWorkOrderVersion);
        };

        var loadCommissionIds = function () {
            angular.forEach($scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions, function (com) {
                if (com.CommissionRateHeaderId && com.Description) {
                    com.CommissionRates = [];
                    com.CommissionRates.push({ Description: com.Description });
                }
            });
            $scope.CurrentWorkOrderVersion.JobOwner = _.find($scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport || obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport; });
            $scope.CurrentWorkOrderVersion.SupportingJobOwners = _.filter($scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.SupportingJobOwner; });
            $scope.CurrentWorkOrderVersion.Recruiters = _.filter($scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.RecruiterRole; });
            $scope.CommissionOrderBy = [function (obj) { switch (obj.CommissionRoleId) { case ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport: case ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport: return 1; case ApplicationConstants.CommissionRole.SupportingJobOwner: return 2; case ApplicationConstants.CommissionRole.RecruiterRole: return 3; case ApplicationConstants.CommissionRole.NationalAccountsRole: return 4; case ApplicationConstants.CommissionRole.BranchManagerRole: return 5; } }, function (obj) { return obj.FullName; }];

            if ($scope.CurrentWorkOrderVersion.JobOwnerUsesSupport === false || $scope.CurrentWorkOrderVersion.JobOwnerUsesSupport === true) {
                $scope.lists.JobOwners = $scope.CurrentWorkOrderVersion.JobOwnerUsesSupport ? $scope.lists.JobOwnersWithSupport : $scope.lists.JobOwnersNoSupport;
            } else {
                $scope.lists.JobOwners = [];
            }

            if ($scope.CurrentWorkOrderVersion.IsDraftStatus) {
                $scope.getCommissionRates();
            }

            ProfileApiService.removeInactiveProfile($scope.lists.JobOwnersWithSupport, $scope.CurrentWorkOrderVersion.JobOwner && $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales);
            ProfileApiService.removeInactiveProfile($scope.lists.JobOwnersNoSupport, $scope.CurrentWorkOrderVersion.JobOwner && $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales);
            var supportingJobOwnerIds = [];
            $scope.CurrentWorkOrderVersion.SupportingJobOwners.map(function (i) { supportingJobOwnerIds.push(i.UserProfileIdSales) });
            ProfileApiService.removeInactiveProfile($scope.lists.SupportJobOwners, supportingJobOwnerIds);
            var recuiterIds = [];
            $scope.CurrentWorkOrderVersion.Recruiters.map(function (i) { recuiterIds.push(i.UserProfileIdSales) });
            ProfileApiService.removeInactiveProfile($scope.lists.Recruiters, recuiterIds);

            //$scope.lists.UserProfileCommissions = resolveListUserProfileCommissions;
            //$scope.lists.JobOwnersWithSupport = _.filter(angular.copy(resolveListUserProfileCommissions), function (obj) { return _.some(obj.UserProfileCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport; }); });
            //$scope.lists.JobOwnersNoSupport = _.filter(angular.copy(resolveListUserProfileCommissions), function (obj) { return _.some(obj.UserProfileCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport; }); });
            //$scope.lists.SupportJobOwners = _.filter(angular.copy(resolveListUserProfileCommissions), function (obj) { return _.some(obj.UserProfileCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.SupportingJobOwner; }); });
            //$scope.lists.Recruiters = _.filter(angular.copy(resolveListUserProfileCommissions), function (obj) { return _.some(obj.UserProfileCommissions, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.RecruiterRole; }); });
        };

        onLoad();

        $scope.$watch('CurrentWorkOrderVersion.Id', function () {

            $scope.actionButton.showToRecalc();
            $scope.html.calculateVisibility();

            $scope.showReplacedEntities = AssignmentDataService.getValueShowReplacedEntities();
            $scope.CurrentWorkOrderVersion.profilesListForApproval = {
                Supplier: [],
                Internal: [],
                Client: []
            };

            if ($scope.model.entity.OrganizationIdInternal > 0) {
                AssignmentApiService.getProfilesListOrganizationalByUserProfileType($scope.model.entity.OrganizationIdInternal, ApplicationConstants.UserProfileType.Internal).then(function (responseItems) {
                    $scope.CurrentWorkOrderVersion.profilesListForApproval.Internal = responseItems;
                });
            } else {
                $scope.CurrentWorkOrderVersion.profilesListForApproval.Internal = [];
            }

            $scope.CurrentWorkOrderVersion.ClientBasedEntityCustomFieldValue = {};

            angular.forEach($scope.CurrentWorkOrderVersion.BillingInfoes, function (billingInfo) {
                if (billingInfo.OrganizationIdClient && billingInfo.OrganizationIdClient > 0) {

                    AssignmentApiService.getProfilesListOrganizationalByUserProfileType(billingInfo.OrganizationIdClient, ApplicationConstants.UserProfileType.Organizational).then(function (responseItems) {


                        $scope.CurrentWorkOrderVersion.profilesListForApproval.Client = $scope.CurrentWorkOrderVersion.profilesListForApproval.Client.concat(responseItems);
                        //remove inactive UserProfiles Start
                        var clientUserProfileIds = [];
                        _.map($scope.CurrentWorkOrderVersion.BillingInfoes, function (billingInfo) {
                            _.map(billingInfo.BillingInvoices, function (billingInvoice) {
                                _.map(billingInvoice.BillingRecipients, function (billingRecipent) {
                                    billingRecipent.UserProfileId && clientUserProfileIds.push(billingRecipent.UserProfileId);
                                })
                            })
                        });

                        // Hide client specific fields Tab if it is empty
                        var clientId = $scope.CurrentWorkOrderVersion.BillingInfoes[0].OrganizationIdClient;
                        var entityId = $state.params.workOrderVersionId;
                        var entityTypeId = ApplicationConstants.EntityType.WorkOrderVersion;
                        if(entityId != null) {
                            ClientSpecificFieldsService.getCustomFields(clientId, entityId, entityTypeId).then(function (customFields) {
                                if (customFields && customFields.length === 0) {
                                    $scope.workOrderTabs = $scope.workOrderTabs.filter(function (el) { return el.state !== 'workorder.edit.clientspecificfields'; });
                                }
                            });
                        }

                        _.map($scope.CurrentWorkOrderVersion.TimeSheetApprovers, function (timeSheetApprover) {
                            timeSheetApprover.UserProfileId && clientUserProfileIds.push(timeSheetApprover.UserProfileId);
                        });
                        _.map($scope.CurrentWorkOrderVersion.ExpenseApprovers, function (expenseApprover) {
                            expenseApprover.UserProfileId && expenseApprover.ApproverTypeId === 1 && clientUserProfileIds.push(expenseApprover.UserProfileId); //client
                        });
                        ProfileApiService.removeInactiveProfile($scope.CurrentWorkOrderVersion.profilesListForApproval.Client, clientUserProfileIds);
                        //remove inactive UserProfiles End
                    });

                    AssignmentApiService.getProfilesListOrganizational(billingInfo.OrganizationIdClient).then(function (responseItems) {
                        billingInfo.profilesListForBillingOrganization = responseItems;
                        ProfileApiService.removeInactiveProfile(billingInfo.profilesListForBillingOrganization, billingInfo.UserProfileIdClient);
                    });
                    //   for getSalesTaxVersionRatesBySubdivisionAndOrganization on billingInfo - must be OrganizationIdInternal
                    if ($scope.model.entity.OrganizationIdInternal > 0 && billingInfo.SubdivisionIdSalesTax > 0 && billingInfo.BillingSalesTaxes.length === 0) {
                        $scope.getBillingSalesTaxes(billingInfo);
                    }
                    else if ($scope.model.entity.OrganizationIdInternal > 0 && billingInfo.SubdivisionIdSalesTax > 0 && billingInfo.BillingSalesTaxes.length > 0) {
                        AssignmentApiService.getSalesTaxVersionRatesBySubdivisionAndOrganization(billingInfo.SubdivisionIdSalesTax, $scope.model.entity.OrganizationIdInternal,
                            oreq.request().withSelect(['Id', 'SalesTaxId', 'RatePercentage', 'IsApplied', 'HasNumberAssigned']).url()).then(
                                function (responseSuccessSalesTaxVersionRates) {
                                    billingInfo.BillingSalesTaxes = _.filter(billingInfo.BillingSalesTaxes, function (st) {
                                        var tst = _.find(responseSuccessSalesTaxVersionRates, function (rst) {
                                            return rst.SalesTaxId == st.SalesTaxId;
                                        });
                                        if (!tst) return false;
                                        return true;
                                    });
                                    angular.forEach(responseSuccessSalesTaxVersionRates, function (salesTaxVersionRate) {
                                        angular.forEach(billingInfo.BillingSalesTaxes, function (billingSalesTax) {
                                            if (salesTaxVersionRate.SalesTaxId == billingSalesTax.SalesTaxId) {
                                                billingSalesTax.ratePercentage = salesTaxVersionRate.RatePercentage;
                                                billingSalesTax.hasNumber = salesTaxVersionRate.HasNumberAssigned ? "Yes" : "No";
                                                billingSalesTax.IsApplied = salesTaxVersionRate.HasNumberAssigned && billingSalesTax.IsApplied ? billingSalesTax.IsApplied : false;
                                            }
                                        });
                                    });
                                },
                                function (responseError) {
                                    common.responseErrorMessages(responseError);
                                });
                    }
                    else {
                        billingInfo.BillingSalesTaxes = [];
                    }


                    OrgApiService.getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(billingInfo.OrganizationIdClient).then(function (data) {
                        var currentOrgClientRoles = data && data.Items;
                        billingInfo.orgClientAB = [];
                        if (currentOrgClientRoles && currentOrgClientRoles.length > 0) {
                            billingInfo.orgClientAB = _.map(currentOrgClientRoles[0].OrganizationClientRoleAlternateBills, function (a) { return { id: a.Id, text: a.AlternateBillLegalName, name: a.AlternateBillCode }; });
                        }
                    });

                } else {
                    billingInfo.BillingSalesTaxes = [];
                    billingInfo.profilesListForBillingOrganization = [];
                    billingInfo.orgClientAB = [];
                }
            });

            var worker = AssignmentCommonFunctionalityService.getWorker($scope.model.entity, $scope.lists.listUserProfileWorker);//var worker = $scope.getWorker();

            angular.forEach($scope.CurrentWorkOrderVersion.PaymentInfoes, function (paymentInfo) {
                paymentInfo.paymentSalesTaxes = [];
                if (paymentInfo.OrganizationIdSupplier && paymentInfo.OrganizationIdSupplier > 0) {

                    AssignmentApiService.getProfilesListOrganizationalByUserProfileType(paymentInfo.OrganizationIdSupplier, ApplicationConstants.UserProfileType.Organizational).then(function (responseItems) {
                        $scope.CurrentWorkOrderVersion.profilesListForApproval.Supplier = $scope.CurrentWorkOrderVersion.profilesListForApproval.Supplier.concat(responseItems);
                    });

                    AssignmentApiService.getProfilesListByOrganizationId(paymentInfo.OrganizationIdSupplier).then(function (responseItems) {
                        //paymentInfo.profilesListForPaymentOrganization = _.filter(responseItems, function (r) { return r.ProfileTypeId != ApplicationConstants.UserProfileType.WorkerSubVendor; });
                        paymentInfo.profilesListForPaymentOrganization = responseItems;
                        ProfileApiService.removeInactiveProfile(paymentInfo.profilesListForPaymentOrganization, paymentInfo.UserProfileIdSupplier);
                        paymentInfo.UserProfileIdSupplier = paymentInfo.UserProfileIdSupplier || worker.UserProfileIdOrgRep;
                        $scope.getPaymentSalesTaxes(paymentInfo, paymentInfo.PaymentSalesTaxes.length === 0 ? null : function (paymentInfo, responseSuccessSalesTaxVersionRates) {
                            angular.forEach(responseSuccessSalesTaxVersionRates, function (salesTaxVersionRate) {
                                angular.forEach(paymentInfo.PaymentSalesTaxes, function (paymentSalesTax) {
                                    if (salesTaxVersionRate.SalesTaxId == paymentSalesTax.SalesTaxId) {
                                        paymentSalesTax.ratePercentage = salesTaxVersionRate.RatePercentage;
                                        paymentSalesTax.hasNumber = salesTaxVersionRate.HasNumberAssigned ? "Yes" : "No";
                                        paymentSalesTax.IsApplied = paymentSalesTax.IsApplied;
                                    }
                                });
                            });
                        });

                    });
                }
                else if (worker && worker.OrganizationId === null && ($scope.model.entity.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp || $scope.model.entity.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp)) {
                    paymentInfo.profilesListForPaymentOrganization = [worker];
                    $scope.getPaymentSalesTaxes(paymentInfo, paymentInfo.PaymentSalesTaxes.length === 0 ? null : function (paymentInfo, responseSuccessSalesTaxVersionRates) {
                        angular.forEach(responseSuccessSalesTaxVersionRates, function (salesTaxVersionRate) {
                            angular.forEach(paymentInfo.PaymentSalesTaxes, function (paymentSalesTax) {
                                if (salesTaxVersionRate.SalesTaxId == paymentSalesTax.SalesTaxId) {
                                    paymentSalesTax.ratePercentage = salesTaxVersionRate.RatePercentage;
                                    paymentSalesTax.hasNumber = salesTaxVersionRate.HasNumberAssigned ? "Yes" : "No";
                                    paymentSalesTax.IsApplied = paymentSalesTax.IsApplied;
                                }
                            });
                        });
                    });
                }
                else if (worker && worker.OrganizationId === null && $scope.model.entity.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesW2) {
                    paymentInfo.profilesListForPaymentOrganization = [worker];
                }
                else {
                    paymentInfo.profilesListForPaymentOrganization = [];
                }
            });

            if ($state.includes(AssignmentValidationService.edit.edit)) {
                angular.forEach($scope.CurrentWorkOrderVersion.BillingInfoes, function (billingInfo) {
                    angular.forEach(billingInfo.BillingRates, function (billingRate) {
                        billingRate.Rate = common.floatApplyTwoDecimalPlaces(billingRate.Rate);
                    });
                });

                angular.forEach($scope.CurrentWorkOrderVersion.PaymentInfoes, function (paymentInfo) {
                    angular.forEach(paymentInfo.PaymentRates, function (paymentRate) {
                        paymentRate.Rate = common.floatApplyTwoDecimalPlaces(paymentRate.Rate);
                    });
                });
            }

            if (!$scope.workflow.runningStatus.IsRunning) {
                var oDataParamsForProvincialTaxVersionTaxType = oreq.request().withSelect(['Id', 'ProvincialTaxHeaderId', 'ProvincialTaxHeaderSubdivisionId', 'ProvincialTaxVersionId', 'ProvincialTaxVersionEffectiveDate', 'SourceDeductionTypeId', 'IsEligible', 'EmployeeRatePercentage']).url();
                angular.forEach($scope.CurrentWorkOrderVersion.PaymentInfoes, function (paymentInfo) {
                    if (typeof paymentInfo.SubdivisionIdSourceDeduction !== 'undefined' && paymentInfo.SubdivisionIdSourceDeduction !== null) {
                        PayrollApiService.getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId(paymentInfo.SubdivisionIdSourceDeduction, oDataParamsForProvincialTaxVersionTaxType).then(
                            function (responseSucces) {
                                angular.forEach(paymentInfo.PaymentSourceDeductions, function (paymentSourceDeduction) {
                                    angular.forEach(responseSucces.Items, function (taxType) {
                                        if (paymentSourceDeduction.SourceDeductionTypeId == taxType.SourceDeductionTypeId
                                            && (paymentSourceDeduction.SourceDeductionTypeId != ApplicationConstants.SourceDeductionType.FederalTax || paymentSourceDeduction.SourceDeductionTypeId != ApplicationConstants.SourceDeductionType.AdditionalTax)) {
                                            paymentSourceDeduction.IsOverWritable = taxType.IsEligible;
                                            paymentSourceDeduction.ToShow = taxType.IsEligible;
                                        } else if (paymentSourceDeduction.SourceDeductionTypeId == ApplicationConstants.SourceDeductionType.FederalTax) {
                                            paymentSourceDeduction.IsOverWritable = false;
                                            paymentSourceDeduction.ToShow = true;
                                        } else if (paymentSourceDeduction.SourceDeductionTypeId == ApplicationConstants.SourceDeductionType.AdditionalTax) {
                                            paymentSourceDeduction.IsOverWritable = true;
                                            paymentSourceDeduction.ToShow = true;
                                        }
                                    });
                                });
                            },
                            function (responseError) {
                                common.responseErrorMessages(responseError);
                            });
                    }
                });
            }

            function effectiveToDateCalc() {
                var currentWorkOrder = $scope.CurrentWorkOrder;
                var activeVersions = _.filter(currentWorkOrder.WorkOrderVersions, function (wov) {
                    return wov.StatusId == ApplicationConstants.WorkOrderStatus.Active ||
                        wov.StatusId == ApplicationConstants.WorkOrderStatus.Terminated ||
                        wov.StatusId == ApplicationConstants.WorkOrderStatus.PendingUnterminate;
                });
                var sortedActiveVersions = _.sortBy(activeVersions, 'EffectiveDate');
                //var sortedActiveVersions = _.sortBy(activeVersions, 'VersionNumber');
                var idx = sortedActiveVersions.indexOf($scope.CurrentWorkOrderVersion);
                if (idx >= 0) {
                    if (idx == sortedActiveVersions.length - 1)
                        $scope.CurrentWorkOrderVersion.EffectiveToDate = currentWorkOrder.EndDate;
                    else {
                        var eD = moment(sortedActiveVersions[idx + 1].EffectiveDate).toDate();
                        //$scope.CurrentWorkOrderVersion.EffectiveToDate = eD.setDate(eD.getDate() - 1);
                        $scope.CurrentWorkOrderVersion.EffectiveToDate = eD;
                        $scope.CurrentWorkOrderVersion.EffectiveToDate.setDate(eD.getDate() - 1);
                    }
                }
            }

            effectiveToDateCalc();
        });

        $controller('AssignmentFieldsAccessibilityController', { $scope: $scope });

        if ($state.includes('template.workorder')) {
            $controller('AssignmentTemplateController', { $scope: $scope });
        }

    }

    if (!app.resolve) app.resolve = {};
    app.resolve.AssignmentEntryController = {

        resolveAssignment: ['$rootScope', '$stateParams', '$state', '$q', 'common', 'AssignmentApiService', 'AssignmentDataService', 'TemplateApiService', function ($rootScope, $stateParams, $state, $q, common, AssignmentApiService, AssignmentDataService, TemplateApiService) {
            var result = $q.defer();

            var oDataParams = oreq.request()
                .withExpand([
                    'AccessActions',
                    'WorkOrders',
                    'WorkOrders/WorkOrderVersions',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions',
                    'WorkOrders/WorkOrderVersions/BillingInfoes',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingRecipients',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingSalesTaxes',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentRates',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentContacts',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSourceDeductions',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentOtherEarnings',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSalesTaxes',
                    'WorkOrders/WorkOrderVersions/WorkOrderVersionCommissions',
                    'WorkOrders/WorkOrderVersions/TimeSheetApprovers',
                    'WorkOrders/WorkOrderVersions/ExpenseApprovers'
                ])

                .withSelect([
                    'Id',
                    'UserProfileIdWorker',
                    'OrganizationIdInternal',
                    'OrganizationCode',
                    'StatusId',
                    'AtsSourceId',
                    'AtsPlacementId',

                    'AccessActions/AccessAction',

                    'WorkOrders/Id',
                    'WorkOrders/StatusId',
                    'WorkOrders/WorkOrderNumber',
                    'WorkOrders/StartDate',
                    'WorkOrders/EndDate',
                    'WorkOrders/TerminationDate',
                    'WorkOrders/AssignmentId',
                    'WorkOrders/TransactionHeaderCount',
                    'WorkOrders/WorkOrderVersionActiveCount',
                    'WorkOrders/WorkOrderVersions/WorkflowPendingTaskId',
                    'WorkOrders/WorkOrderVersions/Id',
                    'WorkOrders/WorkOrderVersions/VersionNumber',
                    'WorkOrders/WorkOrderVersions/VmsWorkOrderReference',
                    'WorkOrders/WorkOrderVersions/EffectiveDate',
                    'WorkOrders/WorkOrderVersions/WorkOrderStartDateState',
                    'WorkOrders/WorkOrderVersions/WorkOrderEndDateState',
                    'WorkOrders/WorkOrderVersions/LineOfBusinessId',
                    'WorkOrders/WorkOrderVersions/WorksiteId',
                    'WorkOrders/WorkOrderVersions/WorkerCompensationId',
                    'WorkOrders/WorkOrderVersions/WCBIsApplied',
                    //'WorkOrders/WorkOrderVersions/WCBIsITWorker',
                    'WorkOrders/WorkOrderVersions/TimeSheetDescription',
                    'WorkOrders/WorkOrderVersions/TimeSheetCycleId',
                    'WorkOrders/WorkOrderVersions/TimeSheetPreviousApprovalRequired',
                    'WorkOrders/WorkOrderVersions/PositionTitleId',
                    'WorkOrders/WorkOrderVersions/AssignedToUserProfileId',
                    'WorkOrders/WorkOrderVersions/StatusId',
                    'WorkOrders/WorkOrderVersions/WorkOrderCreationReasonId',
                    'WorkOrders/WorkOrderVersions/WorkOrderId',
                    'WorkOrders/WorkOrderVersions/InternalOrganizationDefinition1Id',
                    'WorkOrders/WorkOrderVersions/JobOwnerUsesSupport',
                    'WorkOrders/WorkOrderVersions/SalesPatternId',
                    'WorkOrders/WorkOrderVersions/HasRebate',
                    'WorkOrders/WorkOrderVersions/RebateHeaderId',
                    'WorkOrders/WorkOrderVersions/RebateTypeId',
                    'WorkOrders/WorkOrderVersions/RebateRate',
                    'WorkOrders/WorkOrderVersions/HasVmsFee',
                    'WorkOrders/WorkOrderVersions/VmsFeeHeaderId',
                    'WorkOrders/WorkOrderVersions/VmsFeeTypeId',
                    'WorkOrders/WorkOrderVersions/VmsFeeRate',
                    'WorkOrders/WorkOrderVersions/IsEligibleForCommission',
                    'WorkOrders/WorkOrderVersions/IsThirdPartyImport',
                    'WorkOrders/WorkOrderVersions/CommissionThirdPartyWorkerReference',
                    'WorkOrders/WorkOrderVersions/ApplyFlatStatPay',

                    'WorkOrders/WorkOrderVersions/TimeSheetMethodologyId',
                    'WorkOrders/WorkOrderVersions/TimeSheetApprovalFlowId',
                    'WorkOrders/WorkOrderVersions/IsTimeSheetUsesProjects',
                    'WorkOrders/WorkOrderVersions/IsDisplayEstimatedInvoiceAmount',
                    'WorkOrders/WorkOrderVersions/IsDisplayEstimatedPaymentAmount',

                    'WorkOrders/WorkOrderVersions/IsExpenseRequiresOriginal',
                    'WorkOrders/WorkOrderVersions/IsExpenseUsesProjects',
                    'WorkOrders/WorkOrderVersions/ExpenseMethodologyId',
                    'WorkOrders/WorkOrderVersions/ExpenseDescription',
                    'WorkOrders/WorkOrderVersions/ExpenseThirdPartyWorkerReference',
                    'WorkOrders/WorkOrderVersions/ExpenseApprovalFlowId',


                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/WorkflowPendingTaskId',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/PendingCommandName',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/DisplayHistoryEventName',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/Id',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/Name',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/Description',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/CommandName',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/IsActionButton',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/TaskResultId',
                    //'WorkOrders/WorkOrderVersions/WorkflowAvailableActions/TaskRoutingDialogTypeId',

                    'WorkOrders/WorkOrderVersions/TimeSheetApprovers/Id',
                    'WorkOrders/WorkOrderVersions/TimeSheetApprovers/SourceId',
                    'WorkOrders/WorkOrderVersions/TimeSheetApprovers/UserProfileId',
                    'WorkOrders/WorkOrderVersions/TimeSheetApprovers/Sequence',
                    'WorkOrders/WorkOrderVersions/TimeSheetApprovers/MustApprove',
                    'WorkOrders/WorkOrderVersions/TimeSheetApprovers/IsDraft',

                    'WorkOrders/WorkOrderVersions/ExpenseApprovers/Id',
                    'WorkOrders/WorkOrderVersions/ExpenseApprovers/SourceId',
                    'WorkOrders/WorkOrderVersions/ExpenseApprovers/UserProfileId',
                    'WorkOrders/WorkOrderVersions/ExpenseApprovers/Sequence',
                    'WorkOrders/WorkOrderVersions/ExpenseApprovers/MustApprove',
                    'WorkOrders/WorkOrderVersions/ExpenseApprovers/IsDraft',
                    'WorkOrders/WorkOrderVersions/ExpenseApprovers/ApproverTypeId',

                    'WorkOrders/WorkOrderVersions/BillingInfoes/Id',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/OrganizationIdClient',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/OrganizationClientDisplayName',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/OrganizationClientSalesTaxDefaultId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/UserProfileIdClient',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/CurrencyId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/Hours',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/SubdivisionIdSalesTax',


                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/Id',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/Rate',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/RateTypeId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/RateUnitId',

                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/Id',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/InvoiceTypeId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/IsUsesAlternateBilling',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/OrganizatonClientRoleAlternateBillingId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingFrequencyId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingInvoiceTemplateId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingInvoiceTermsId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingConsolidationTypeId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingInvoicePresentationStyleId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/InvoiceNote1',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/InvoiceNote2',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/InvoiceNote3',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/InvoiceNote4',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingTransactionGenerationMethodId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/IsChargebleExpenseSalesTax',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/IsSalesTaxAppliedOnVmsImport',

                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingRecipients/Id',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingRecipients/DeliveryMethodId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingRecipients/RecipientTypeId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingInvoices/BillingRecipients/UserProfileId',

                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingSalesTaxes/Id',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingSalesTaxes/SalesTaxId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingSalesTaxes/IsApplied',

                    'WorkOrders/WorkOrderVersions/PaymentInfoes/Id',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/OrganizationIdSupplier',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/OrganizationSupplierDisplayName',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/UserProfileIdSupplier',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/CurrencyId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/Hours',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/SubdivisionIdSalesTax',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/IsCommissionVacation',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/ApplySalesTax',

                    'WorkOrders/WorkOrderVersions/PaymentInfoes/SubdivisionIdSourceDeduction',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/IsUseUserProfileWorkerSourceDeduction',

                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentContacts/Id',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentContacts/UserProfileId',

                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentRates/Id',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentRates/Rate',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentRates/RateTypeId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentRates/RateUnitId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentRates/IsApplyDeductions',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentRates/IsApplyVacation',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentRates/IsApplyStatHoliday',

                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices/Id',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices/InvoiceTypeId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices/PaymentFrequency',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices/PaymentInvoiceTemplateId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices/PaymentInvoiceTermsId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices/PaymentReleaseScheduleId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices/PaymentMethodId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentInvoices/IsSalesTaxAppliedOnVmsImport',

                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSourceDeductions/Id',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSourceDeductions/SourceDeductionTypeId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSourceDeductions/IsApplied',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSourceDeductions/RatePercentage',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSourceDeductions/RateAmount',

                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentOtherEarnings/Id',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentOtherEarnings/PaymentOtherEarningTypeId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentOtherEarnings/IsApplied',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentOtherEarnings/IsAccrued',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentOtherEarnings/RatePercentage',

                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSalesTaxes/Id',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSalesTaxes/SalesTaxId',
                    'WorkOrders/WorkOrderVersions/PaymentInfoes/PaymentSalesTaxes/IsApplied',

                    'WorkOrders/WorkOrderVersions/WorkOrderVersionCommissions/Id',
                    'WorkOrders/WorkOrderVersions/WorkOrderVersionCommissions/UserProfileIdSales',
                    'WorkOrders/WorkOrderVersions/WorkOrderVersionCommissions/IsApplicable',
                    'WorkOrders/WorkOrderVersions/WorkOrderVersionCommissions/CommissionRoleId',
                    'WorkOrders/WorkOrderVersions/WorkOrderVersionCommissions/CommissionRateHeaderId',
                    'WorkOrders/WorkOrderVersions/WorkOrderVersionCommissions/FullName',
                    'WorkOrders/WorkOrderVersions/WorkOrderVersionCommissions/Description',
                ]).url();
            oDataParams = null;
            function onResponseSuccesStateGo(response) {
                if (!response || common.isEmptyObject(response) || response == {}) {
                    common.logError('Work Order ' +
                        (($stateParams.assignmentId && $stateParams.assignmentId > 0) ? '"' + $stateParams.assignmentId.toString() + '" ' : '') +
                        'does not exists');
                    AssignmentDataService.setAssignment({});
                    $state.go('workorder.search');
                    result.resolve({});
                    return;
                }
                //var ids = { assignmentId: $stateParams.assignmentId, workOrderId: $stateParams.workOrderId, workOrderVersionId: $stateParams.workOrderVersionId };
                //if (!ids.assignmentId || ids.assignmentId < 1 || !ids.workOrderId || ids.workOrderId < 1 || !ids.workOrderVersionId || ids.workOrderVersionId < 1) {
                //    AssignmentDataService.getWorkOrderIds(response, ids);
                //    $state.go('workorder.edit.core', { assignmentId: ids.assignmentId, workOrderId: ids.workOrderId, workOrderVersionId: ids.workOrderVersionId }, { notify: false });
                //}
                /* BUG-12282: Reorder the rate types to make sure primary is at the top */
                if (response) {
                    if (response.WorkOrders && angular.isArray(response.WorkOrders)) {
                        angular.forEach(response.WorkOrders, function (wo) {
                            if (wo.WorkOrderVersions && angular.isArray(wo.WorkOrderVersions)) {
                                angular.forEach(wo.WorkOrderVersions, function (wov) {
                                    if (wov.BillingInfoes && angular.isArray(wov.BillingInfoes)) {
                                        angular.forEach(wov.BillingInfoes, function (billingInfo) {
                                            billingInfo.BillingRates = _.sortBy(billingInfo.BillingRates, function (item) {
                                                return item.RateTypeId === ApplicationConstants.RateType.Primary ? 0 : 1;
                                            });
                                        });
                                    }

                                    if (wov.PaymentInfoes && angular.isArray(wov.PaymentInfoes)) {
                                        angular.forEach(wov.PaymentInfoes, function (paymentInfo) {
                                            paymentInfo.PaymentRates = _.sortBy(paymentInfo.PaymentRates, function (item) {
                                                return item.RateTypeId === ApplicationConstants.RateType.Primary ? 0 : 1;
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
                /* End BUG-12282 */

                AssignmentDataService.setAssignment(response);
                result.resolve(response);
            }

            function onResponseError(responseError) {
                common.responseErrorMessages(responseError);
                result.reject(responseError);
            }

            if ($stateParams.templateId) {
                // if being launched from template screen - 'unsaved' template data may be used
                if (common.isEmptyObject(AssignmentDataService.getAssignmentCopied())) {
                    TemplateApiService.get($stateParams.templateId).then(
                        function (responseSucces) {
                            AssignmentDataService.setAssignment({});
                            AssignmentDataService.setAssignmentCopied(responseSucces.Entity);
                            result.resolve(responseSucces.Entity);
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                } else {
                    AssignmentDataService.setAssignment({});
                    result.resolve(AssignmentDataService.getAssignmentCopied());
                    AssignmentDataService.setAssignmentCopied({});
                }
            }
            else if ($stateParams.assignmentId > 0) {
                $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    if (fromState.name.indexOf('workorder.search') > -1) {
                        AssignmentDataService.setAssignment({});
                    }
                });
                if (!common.isEmptyObject(AssignmentDataService.getAssignment()) && AssignmentDataService.getAssignment().Id != $stateParams.assignmentId) {
                    AssignmentDataService.setAssignment({});
                }
                if (common.isEmptyObject(AssignmentDataService.getAssignment())) {
                    //$stateParams.workOrderId = $stateParams.workOrderId || 0;
                    //$stateParams.workOrderVersionId = $stateParams.workOrderVersionId || 0;
                    AssignmentApiService.getByAssignmentId($stateParams.assignmentId, oDataParams).then(
                        function (responseSucces) {
                            onResponseSuccesStateGo(responseSucces);
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });

                    return result.promise;
                } else {
                    onResponseSuccesStateGo(AssignmentDataService.getAssignment());
                }
            }
            else if ($stateParams.workOrderId > 0) {
                AssignmentDataService.setAssignment({});
                AssignmentApiService.getByWorkOrderId($stateParams.workOrderId, oDataParams).then(
                    function (responseSucces) {
                        onResponseSuccesStateGo(responseSucces);
                    },
                    function (responseError) {
                        onResponseError(responseError);
                    });
                return result.promise;
            }
            else if ($stateParams.workOrderVersionId > 0) {
                AssignmentDataService.setAssignment({});
                AssignmentApiService.getByWorkOrderVersionId($stateParams.workOrderVersionId, oDataParams).then(
                    function (responseSucces) {
                        onResponseSuccesStateGo(responseSucces);
                    },
                    function (responseError) {
                        onResponseError(responseError);
                    });
                return result.promise;
            }
            return result.promise;
        }],
        resolveDefaultAssignment: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getDefaultAssignment().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveDefaultWorkOrderPurchaseOrderLine: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getDefaultWorkOrderPurchaseOrderLine().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveListOrganizationInternal: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getListOrganizationInternal().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveListOrganizationClient: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getListOrganizationClient().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveListOrganizationSupplier: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getListOrganizationSupplier().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveListUserProfileWorker: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getListUserProfileWorker().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveCodeValueLists: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getWorkOrderCodeValueLists().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveListUserProfileCommissions: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            var filter = oreq.filter("UserProfileCommissions").any(oreq.filter("x/CommissionRoleId").gt(0));
            var commissionDataParams = oreq.request()
                .withExpand(['UserProfileCommissions', 'Contact'])
                .withSelect(['Id',
                    'ProfileStatusId',
                    'Contact/FullName',
                    'UserProfileCommissions/CommissionRoleId',
                    'UserProfileCommissions/CommissionRateHeaderStatusId',
                ])
                .withFilter(filter).url();
            AssignmentApiService.getListUserProfileInternal(commissionDataParams).then(
                function (response) {
                    result.resolve(response.Items);
                }, function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveListSalesPatterns: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            var salesPatternDataParams = oreq.request()
                .withSelect(['Id',
                    'Description',
                    'SalesPatternStatusId',
                ]).url();
            AssignmentApiService.getSalesPatterns(salesPatternDataParams).then(
                function (response) {
                    result.resolve(response.Items);
                }, function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveListUserProfileAssignedTo: ['$q', 'ProfileApiService', function ($q, ProfileApiService) {
            var deferred = $q.defer();
            ProfileApiService.getListUserProfileInternal().then(
                function (responseSuccess) {
                    deferred.resolve(responseSuccess.Items);
                },
                function (responseError) {
                    deferred.reject(responseError);
                });
            return deferred.promise;
        }],
    };

})(angular, Phoenix.App, Phoenix.Directives);
