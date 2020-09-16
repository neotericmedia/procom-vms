/*global Phoenix: false, console: false*/
(function (app, angular) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'OrgSearchController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.org.controllers').controller(controllerId, ['$scope', '$state', 'common', 'NavigationService', 'SmartTableService', 'OrgApiService', 'CodeValueService',
            function OrgSearchController($scope, $state, common, NavigationService, SmartTableService, OrgApiService, CodeValueService) {

                common.setControllerName(controllerId);

                $scope.selectedCount = 0;
                $scope.totalItemCount = 0;

                NavigationService.setTitle('organization-manage');

                $scope.currentPage = 1;
                $scope.totalItems = 0;
                $scope.pageSize = 30;
                $scope.pageCount = 1;
                $scope.items = [];
                $scope.lists = {
                    organizationStatusList: CodeValueService.getCodeValues(CodeValueGroups.OrganizationStatus),
                };

                // Used for the loading bar
                $scope.loadItemsPromise = null;

                // Reloading data entry point
                $scope.callServer = function (tableState) {

                    $scope.currentPage = $scope.currentPage || 1;

                    var isPaging = false;

                    // Set Intial Filtering
                    if (tableState.search && !tableState.search.predicateObject) {
                        if (!tableState.isLoadedFromPreviousState) {
                            tableState.search.predicateObject = {};
                        }
                    }

                    // full refresh
                    if (tableState.pagination.start === 0) {
                        angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                        $scope.currentPage = 1;
                        isPaging = false;
                    }
                        // pagination
                    else {
                        $scope.currentPage++;
                        isPaging = true;
                    }

                    tableState.pagination.currentPage = $scope.currentPage;
                    tableState.pagination.pageSize = $scope.pageSize;

                    var oDataParams = oreq.request().withSelect([
                        'Id',
                        'DisplayName',
                        'Code',
                        'LegalName',
                        'IsOrganizationClientRole',
                        'IsOrganizationIndependentContractorRole',
                        'IsOrganizationLimitedLiabilityCompanyRole',
                        'IsOrganizationInternalRole',
                        'IsOrganizationSubVendorRole',
                        'IsDraft',
                        'OrganizationStatusId'
                    ]).url();
                    var promise = OrgApiService.getListOriginalOrganizations(oDataParams + '&' + SmartTableService.generateRequestObject(tableState).url()).then(
                        function (responseSuccess) {
                            if (isPaging === true) {
                                $scope.items = $scope.items.concat(responseSuccess.Items);
                                $scope.totalItemCount = responseSuccess.Count;
                            } else {
                                $scope.totalItemCount = responseSuccess.Count;
                                $scope.items = responseSuccess.Items;
                            }
                        },
                        function (responseError) {
                            common.responseErrorMessages(responseError);
                        });

                    if (isPaging !== true) {
                        $scope.loadItemsPromise = promise;
                    }
                };

            }]);
})(Phoenix.App, angular);