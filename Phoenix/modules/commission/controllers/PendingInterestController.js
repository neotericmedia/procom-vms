(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('PendingInterestController', PendingInterestController);

    PendingInterestController.$inject = ['$scope', '$stateParams', '$state', 'CommissionApiService', 'NavigationService', 'commissionRateHeaderUsers',
        '$q', 'JournalApiService', 'common', '$rootScope'];

    function PendingInterestController($scope, $stateParams, $state, CommissionApiService, NavigationService, commissionRateHeaderUsers,
        $q, JournalApiService, common, $rootScope) {

        var self = this;

        NavigationService.setTitle('Pending Interest Report', ['icon icon-commission']);

        self.commissionUsers = commissionRateHeaderUsers;
        self.commissionUserProfileId = $stateParams.reportUserProfileId;
        self.HasAdministratorView = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.CommissionReportAdministratorView);

        if (!self.HasAdministratorView) {
            self.commissionUserProfileId = $rootScope.CurrentProfile.Id;
            self.DisplayOwnName = $rootScope.UserContext.User.PreferredFirstName + " " + $rootScope.UserContext.User.PreferredLastName;
        }

        $scope.totalItemCount = 0;
        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        //$scope.paginationIsDisabled = true;
        $scope.items = [];

        $scope.tableState = {};
        $scope.initTableState = {};
        $scope.loadItemsPromise = null;
        //$scope.isLoading = true;

        $scope.tableState = {};
        $scope.tableState.pagination = {};

        function buildPromise(tableState) {
            if (self.commissionUserProfileId) {
                var oDataParams = oreq.request()
                        .withSelect([
                            'TransactionId',
                            'TransactionNumber',
                            'WorkerName',
                            'ClientOrganization',
                            'InvoiceReleaseDate',
                            'WorkerPayReleaseDate',
                            'PaymentAmount',
                            'DaysPassed',
                            'DaysInterestAccrued',
                            'CommissionRate',
                            'InterestIncurred',
                            'InterestOnTransaction',
                            'InterestToSales'
                        ]).url();
                return CommissionApiService.getPendingInterestSearch(tableState, oDataParams, self.commissionUserProfileId);
            }
            else {
                return $q.reject();
            }
        }

        // Reloading data entry point
        $scope.callServer = function (tableState) {

            var isPaging = false;
            $scope.currentPage = $scope.currentPage || 1;

            // full refresh
            if (tableState.pagination.start === 0) {
                angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                $scope.currentPage = 1;
            }
                // pagination
            else {
                $scope.currentPage++;
                isPaging = true;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;
            //tableState.pagination.isDisabled = $scope.paginationIsDisabled;
            //$scope.tableState = tableState;

            //var promise = buildPromise(tableState)
            //   .then(function (response) {
            //       $scope.totalItemCount = response.Count;
            //       $scope.items = response.Items;
            //   });

            var promise = buildPromise(tableState)
               .then(function (response) {
                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(response.Items);
                   } else {
                       $scope.items = response.Items;
                   }
                   $scope.totalItemCount = response.Count;
               });

            if (isPaging !== true) {
                // prevents from spinner showing up when getting more rows from responce
                $scope.loadItemsPromise = promise;
            }
        };

        if (self.commissionUserProfileId) {
            getTotal(self.commissionUserProfileId);
        }

        self.onUserSelected = function (userProfileId) {
            $state.go('commission.pendinginterest', { reportUserProfileId: userProfileId }, { reload: true });
        };

        function getTotal(userProfileId) {
            self.total = undefined;
            CommissionApiService.getPendingInterestTotal(userProfileId)
            .then(
            function (data) {
                self.total = data;
            },
            function (error) {
                console.log(error);
            });
        }

        $scope.getExcel = function () {
            var columnsCount = 12;
            var excelData = JournalApiService.tableToExcel("pendingInterest", columnsCount);
            var exportString = excelData.exportString;
            var exportData = excelData.exportData;

            saveTextAs(exportString, "PendingInterest.csv");
        };

    }

    app.resolve = app.resolve || {};

    app.resolve.PendingInterestController = {
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
        }]
    };

})(angular, Phoenix.App);