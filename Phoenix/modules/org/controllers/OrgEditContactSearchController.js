/*global Phoenix: false, console: false*/
(function (app, angular) {
    'use strict';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular
        .module('phoenix.org.controllers')
        .controller('OrgEditControllerContactSearch', ['$scope', '$state', '$stateParams', 'CodeValueService', 'ProfileApiService',
            function OrgEditControllerContactSearch($scope, $state, $stateParams, CodeValueService, ProfileApiService) {


                if (typeof $scope.viewLoading == "undefined" || typeof $scope.stopSpinning == "undefined")
                    $scope.viewLoading = false;
                else
                    $scope.stopSpinning();

                $scope.selectedCount = 0;
                $scope.totalItemCount = 0;



                $scope.model = $scope.model || {};
                $scope.model.search = '';

                $scope.currentPage = 1;
                $scope.totalItems = 0;
                $scope.pageSize = 20;
                $scope.pageCount = 1;
                $scope.items = [];
                $scope.isLoading = true;
                $scope.lists = {
                    draftStatusList: [{ id: true, text: 'Draft' }, { id: false, text: 'Active' }],
                    profileTypeList: CodeValueService.getCodeValues(CodeValueGroups.ProfileType),
                    profileStatusesList: CodeValueService.getCodeValues(CodeValueGroups.ProfileStatus),
                };

                // Used for the loading bar
                $scope.loadItemsPromise = null;

                // Reloading data entry point
                $scope.callServer = function (tableState) {

                    $scope.currentPage = $scope.currentPage || 1;

                    var isPaging = false;

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
                        'Contact/FullName',
                        'ProfileTypeId',
                        'ProfileStatusId',
                        'PrimaryEmail',
                        'IsDraft',
                        'ContactId',
                        'Id'
                    ]).withExpand(['Contact'])
                        .url();

                    var promise = ProfileApiService.getProfilesForOrganization($stateParams.organizationId, tableState, oDataParams)

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
                $scope.rowClick = function (item) {
                    var profileType = CodeValueService.getCodeValue(item.ProfileTypeId, CodeValueGroups.ProfileType).code;
                    $state.go('Edit' + profileType + 'Profile', { contactId: item.ContactId, profileId: item.Id });
                };
            }]);
})(Phoenix.App, angular);