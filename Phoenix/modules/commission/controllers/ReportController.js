(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('ReportController', ReportController);

    /** @ngInject */
    ReportController.$inject = ['$stateParams', '$rootScope', 'CodeValueService', 'common', 'dialogs', 'CommissionApiService', 'NavigationService', 'phoenixsocket', 'commissionRateHeaderUsers', 'internalOrgs'];

    function ReportController($stateParams, $rootScope, CodeValueService, common, dialogs, CommissionApiService, NavigationService, phoenixsocket, commissionRateHeaderUsers, internalOrgs) {

        NavigationService.setTitle('commission-report');

        var self = this;

        angular.extend(self, {
            //properties
            validationMessages: [],
            commissionUsers: commissionRateHeaderUsers,
            internalOrgs: internalOrgs,

            CommissionUserProfileId: $stateParams.reportUserProfileId,
            OrganizationIdInternal: $stateParams.reportOrganizationIdInternal,
            reportDate: ($stateParams.reportYear && $stateParams.reportMonth) ? new Date($stateParams.reportYear, $stateParams.reportMonth - 1) : null,
            reportData: null,

            //methods
            getCommissionReport: getCommissionReport,
            init: init,
            modalInvoicesIssued: modalInvoicesIssued,
            modalInvoicesReversed: modalInvoicesReversed,
            modalInterest: modalInterest,
            modalDirectCharges: modalDirectCharges,
            modalRecurringCharges: modalRecurringCharges,
            modalCorrections: modalCorrections,
            modalRebooked: modalRebooked,
            modalScheduledFutureMonth: modalScheduledFutureMonth,
            modalReadyToReleasePriorMonthTransactions: modalReadyToReleasePriorMonthTransactions,
            modalReadyToReleasePriorMonthAdjustments: modalReadyToReleasePriorMonthAdjustments,
            finalize: finalize,

            HasAdministratorView: common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.CommissionReportAdministratorView)
        });
        if (!self.HasAdministratorView) {
            self.CommissionUserProfileId = $rootScope.CurrentProfile.Id;
            self.DisplayOwnName = $rootScope.UserContext.User.PreferredFirstName + " " + $rootScope.UserContext.User.PreferredLastName;
        }

        if ($stateParams.reportUserProfileId && $stateParams.reportYear && $stateParams.reportMonth && $stateParams.reportOrganizationIdInternal) {
            getCommissionReport();
        }

        function init() {
            phoenixsocket.onPrivate("CommissionReport", function (event, data) {
                self.reportData = data;
            });
        }

        self.init();

        function getCommissionReport() {
            if (self.CommissionUserProfileId && self.CommissionUserProfileId > 0
                && self.OrganizationIdInternal && self.OrganizationIdInternal > 0
                && self.reportDate && self.reportDate instanceof Date && !isNaN(self.reportDate.valueOf())) {
                //self.reportData = null;
                var command = {
                    WorkflowPendingTaskId: -1,
                    CommissionUserProfileId: self.CommissionUserProfileId,
                    Month: self.reportDate.getMonth() + 1,
                    Year: self.reportDate.getFullYear(),
                    OrganizationIdInternal: self.OrganizationIdInternal,
                };
                CommissionApiService.getCommissionReport(command);
            }
        }
        function finalize() {
            if (self.CommissionUserProfileId && self.CommissionUserProfileId > 0
                && self.OrganizationIdInternal && self.OrganizationIdInternal > 0
                && self.reportDate && self.reportDate instanceof Date && !isNaN(self.reportDate.valueOf())) {
                //self.reportData = null;                
                var command = {
                    WorkflowPendingTaskId: -1,
                    CommissionUserProfileId: self.CommissionUserProfileId,
                    Month: self.reportDate.getMonth() + 1,
                    Year: self.reportDate.getFullYear(),
                    OrganizationIdInternal: self.OrganizationIdInternal,
                };

                $rootScope.activateGlobalSpinner = true;
                CommissionApiService.finalizeCommissionReport(command).then(function () {              
                    getCommissionReport();
                }).finally(function () { $rootScope.activateGlobalSpinner = false });
            }
        }

        function modalInvoicesIssued() {
            dialogs.create('/Phoenix/modules/commission/views/ReportEarningsModal.html', 'ReportModalController', { title: "Invoices Issued", data: self.reportData.InvoicesIssued }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalInvoicesReversed() {
            dialogs.create('/Phoenix/modules/commission/views/ReportEarningsModal.html', 'ReportModalController', { title: "Invoices Reversed", data: self.reportData.InvoicesReversed }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalInterest() {
            dialogs.create('/Phoenix/modules/commission/views/ReportInterestModal.html', 'ReportModalController', { title: "Interest", data: self.reportData.Interest }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalDirectCharges() {
            dialogs.create('/Phoenix/modules/commission/views/ReportAdjustmentsModal.html', 'ReportModalController', { title: "Direct Charges", data: self.reportData.DirectCharges }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalRecurringCharges() {
            dialogs.create('/Phoenix/modules/commission/views/ReportRecurringAdjustmentsModal.html', 'ReportModalController', { title: "Recurring Charges", data: self.reportData.RecurringAdjustments }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalCorrections() {
            dialogs.create('/Phoenix/modules/commission/views/ReportEarningsModal.html', 'ReportModalController', { title: "Corrections / Reversals", data: self.reportData.Corrections }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalRebooked() {
            dialogs.create('/Phoenix/modules/commission/views/ReportEarningsModal.html', 'ReportModalController', { title: "Rebooked Transactions", data: self.reportData.Rebooked }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalScheduledFutureMonth() {
            dialogs.create('/Phoenix/modules/commission/views/ReportEarningsModal.html', 'ReportModalController', { title: "Payments scheduled for Future Months", data: self.reportData.ScheduledFutureMonth }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalReadyToReleasePriorMonthTransactions() {
            dialogs.create('/Phoenix/modules/commission/views/ReportEarningsModal.html', 'ReportModalController', { title: "Ready to Release transactions from Prior Periods", data: self.reportData.ReadyToReleasePriorMonthTransactions }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }
        function modalReadyToReleasePriorMonthAdjustments() {
            dialogs.create('/Phoenix/modules/commission/views/ReportAdjustmentsModal.html', 'ReportModalController', { title: "Ready to Release adjustments from Prior Periods", data: self.reportData.ReadyToReleasePriorMonthAdjustments }, { keyboard: false, backdrop: 'static', windowClass: 'commission-report-modal' }, 'modal');
        }

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.ReportController = {
        commissionRateHeaderUsers: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {

            var result = $q.defer();
            var commissionPatternDataParams = oreq.request().withSelect(['CommissionUserProfileId', 'CommissionUserProfileFirstName', 'CommissionUserProfileLastName']).url();
            var pseudoTableState = { pagination: { isDisabled: true } };

            CommissionApiService.getCommissionUserProfileListWithRatesOnly(pseudoTableState, commissionPatternDataParams).then(
                     function (success) {
                         result.resolve(success.Items);
                     },
                     function (error) {
                         result.reject(error);
                     }
                 );

            return result.promise;
        }],
        internalOrgs: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {

            var result = $q.defer();

            CommissionApiService.getListOrganizationInternal().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });

            return result.promise;
        }]
    };
    
    angular.module('phoenix.commission.controllers').controller('ReportModalController', ReportModalController);
    ReportModalController.$inject = ['$scope', '$uibModalInstance', '$translate', 'data', 'CodeValueService', '$state', '$rootScope'];

    function ReportModalController($scope, $uibModalInstance, $translate, data, CodeValueService, $state, $rootScope) {
        var self = this;
        angular.extend(self, {
            data: data.data,
            lists: {
                AdjustmentTypeList: CodeValueService.getCodeValues(CodeValueGroups.CommissionAdjustmentHeaderType),
                CommissionStatusList: CodeValueService.getCodeValues(CodeValueGroups.CommissionTransactionStatus),
                LineOfBusinessList: CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness),
            },
            title: data.title,
            //methods
            close: close,
        });

        function close() {
            $uibModalInstance.close();
            $scope.$destroy();
        }

        var stateListener = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            close();
        });

        $scope.$on('$destroy', function () {
            stateListener();
        });
    }

})(angular, Phoenix.App);