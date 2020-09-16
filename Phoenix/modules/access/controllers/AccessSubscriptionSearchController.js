(function (angular) {
    'use strict';

    angular.module('phoenix.access.controllers').controller('AccessSubscriptionSearchController', AccessSubscriptionSearchController);

    AccessSubscriptionSearchController.$inject = ['$scope', '$state', 'NavigationService', 'CodeValueService', 'AccessSubscriptionApiService'];

    function AccessSubscriptionSearchController($scope, $state, NavigationService, CodeValueService, AccessSubscriptionApiService) {

        var self = this;

        NavigationService.setTitle('Subscriptions', 'icon icon-organization');

        //self.HasAdministratorView = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.CommissionReportAdministratorView);

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];
        $scope.list = {
            types: CodeValueService.getCodeValues(CodeValueGroups.AccessSubscriptionType, true),
            statuses: CodeValueService.getCodeValues(CodeValueGroups.AccessSubscriptionStatus, true),
        };

        $scope.model = {};
        $scope.tableState = {};
        $scope.initTableState = {};
        $scope.loadItemsPromise = null;
        $scope.toState = $state.current.name;

        $scope.callServer = function (tableState, client) {
            $scope.tableState = tableState;
            $scope.currentPage = $scope.currentPage || 1;
            var isPaging = false;
            // full refresh
            //if (tableState.pagination.start === 0) {
            //    //angular.element("table[data-st-table='items'] tbody").scrollTop(0);
            //    isPaging = false;
            //}
            // pagination
            if (tableState.pagination.start >= $scope.pageSize) {
                $scope.currentPage++;
                isPaging = true;
            } else {
                $scope.currentPage = 1;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;

            var oDataParams = oreq.request().url();

            var api = $scope.toState == 'access.pendingSubscriptions' ? AccessSubscriptionApiService.getPendingAccessSubscriptionsForSearch : AccessSubscriptionApiService.getAllOriginalAccessSubscriptions;



            var promise = api(tableState, oDataParams)
               .then(function (response) {

                   var items = response.Items;

                   if (!client) {
                       $scope.initTableState = angular.copy(tableState);
                   }
                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(items);
                       $scope.totalItemCount = response.Count;
                   } else {
                       $scope.totalItemCount = response.Count;
                       $scope.items = items;
                   }
               });
            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }
        };

        self.accessSubscriptionNew = function () {
            AccessSubscriptionApiService.accessSubscriptionNew({ IsTimeRestricted: false, }).then(
                function (success) {
                    $state.go('access.subscription.edit', { accessSubscriptionId: success.EntityId });
                }
            );
        };
    }

})(angular);