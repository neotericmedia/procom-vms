/*global Phoenix: false, console: false*/

(function (angular, app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'AssignmentSearchController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.workorder.controllers').controller(controllerId,
        ['$scope', '$state', '$rootScope', '$location', '$filter', 'common', 'NavigationService', 'CodeValueService', 'commonDataService', 'AssignmentApiService', AssignmentSearchController]);

    function AssignmentSearchController($scope, $state, $rootScope, $location, $filter, common, NavigationService, CodeValueService, commonDataService, AssignmentApiService) {

        common.setControllerName(controllerId);

        if (typeof $scope.viewLoading == "undefined" || typeof $scope.stopSpinning == "undefined")
            $scope.viewLoading = false;
        else
            $scope.stopSpinning();

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        var title = ($state.current.name === 'workorder.pendingApproval') ? 'Work Orders Pending Review' : 'workorder-manage';
        NavigationService.setTitle(title);

        $scope.model = {};
        $scope.model.search = '';
        $scope.list = {
            profileType: CodeValueService.getCodeValues(CodeValueGroups.ProfileType, true),
            listOrganizationInternal: [],
        };

        function getListOrganizationInternal() {
            commonDataService.getListOrganizationInternal().then(
                 function (response) {
                     angular.forEach(response, function (org) {
                         $scope.list.listOrganizationInternal.push({ id: org.Id, text: org.DisplayName });
                     });
                     //$scope.list.listOrganizationInternal.push({ id: null, text: 'Blank' });
                 });
        }
        getListOrganizationInternal();

        //profileType: ApplicationConstants.addBlankSelectionRowToAll(CodeValueService.getCodeValues(CodeValueGroups.ProfileType, true))
        //status: ApplicationConstants.addBlankSelectionRowToAll(CodeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true))

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];
        $scope.isLoading = true;

        // Used for the loading bar
        $scope.loadItemsPromise = null;

        // Reloading data entry point
        $scope.callServer = function (tableState) {

            $scope.currentPage = $scope.currentPage || 1;

            var isPaging = false;

            // Set intial filtering
            if (!tableState.isLoadedFromPreviousState && tableState.search && !tableState.search.predicateObject) {
                tableState.search.predicateObject = {};
            }

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

            var oDataParams = oreq.request().withSelect([
                'WorkOrderFullNumber',
                'WorkerName',
                'WorkerProfileType',
                'ClientName',
                'StartDate',
                'EndDate',
                'BillingPrimaryRateSumPerRateUnit',
                'PaymentPrimaryRateSumPerRateUnit',
                'WorkOrderStatus',
                'AssignmentId',
                'WorkOrderId',
                'WorkOrderVersionId',
                'InternalCompanyDisplayName',
                'OrganizationIdInternal',
            ])
            .url();

            var promise = AssignmentApiService.getSearchByTableState(tableState, oDataParams, $state.current.name)
               .then(function (response) {
                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(response.Items);
                       $scope.totalItemCount = response.Count;
                   } else {
                       $scope.totalItemCount = response.Count;
                       $scope.items = response.Items;
                   }
               });

            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }

        };
        $scope.addWorkOrder = function () {
            $state.go('workorder.createsetup');
        };


    }


})(angular, Phoenix.App);