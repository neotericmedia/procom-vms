(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsPreprocessedController', VmsPreprocessedController);

    VmsPreprocessedController.$inject = ['$rootScope', '$scope', '$sce', '$state', 'common', 'config', '$filter', '$timeout', 'NavigationService', 'dialogs', 'TransactionApiService', 'CodeValueService', 'resolveListtDocuments', '$stateParams', '$q', 'commonDataService'];

    function VmsPreprocessedController($rootScope, $scope, $sce, $state, common, config, $filter, $timeout, NavigationService, dialogs, TransactionApiService, CodeValueService, resolveListtDocuments, $stateParams, $q, commonDataService) {

        $scope.totalItemCount = 0;
        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.isDisabled = true;
        $scope.tableState = {};
        $scope.tableState.pagination = {};
        $scope.documentPublicId = $stateParams.documentPublicId;
        $scope.entityTypeId = null;

        $scope.items = [];
        $scope.lists = {
            vmsImportedRecordTypeList: [
                { id: 1, text: 'Import as Pending', groupName: 'VmsImportedRecordType' },
                { id: 2, text: 'Import as Conflict', groupName: 'VmsImportedRecordType' },
                { id: 3, text: 'Discarded', groupName: 'VmsImportedRecordType' }
            ],
            documentsList: resolveListtDocuments,
            rateTypesList: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            //transactionTypeList: [{ id: 1, text: 'Timesheet' }, { id: 2, text: 'Manual' }, { id: 2, text: 'Expense' }]
            //transactionTypeList: CodeValueService.getCodeValues(CodeValueGroups.TransactionType, true),
            //    transactionStatusList: [
            //        { id: 1, text: 'New' },
            //        { id: 2, text: 'Draft' },
            //        { id: 3, text: 'Pending Review' },
            //        { id: 4, text: 'Approved' },
            //        { id: 5, text: 'Declined' },
            //        { id: 6, text: 'Pending Documents' },
            //        { id: 7, text: 'Withdrawn' }
            //    ]
        };

        NavigationService.setTitle('thirdpartyimport-preprocessing');

        $scope.onDocumentChange = function (documentPublicId) {
            var docIndex = $scope.lists.documentsList.map(function (x) { return x.Document.PublicId; }).indexOf(documentPublicId);
            if (docIndex != -1) {
                var document = $scope.lists.documentsList[docIndex].Document;
                $scope.documentPublicId = documentPublicId;
                $scope.entityTypeId = document.EntityTypeId;


                $rootScope.globalTableState = $rootScope.globalTableState.filter(function (tableState) {
                    return tableState.routeName !== "vms.preprocessed";
                });

                $scope.$broadcast('vmsPreprocessedDocumentChange', {
                    documentPublicId: documentPublicId,
                    entityTypeId: document.EntityTypeId,
                    lists: $scope.lists
                });
            }
            else {
                $scope.documentPublicId = null;
                //document = null;
            }
        };

        if ($scope.documentPublicId !== undefined)
            $scope.onDocumentChange($scope.documentPublicId);

        // Used for the loading bar
        $scope.loadItemsPromise = null;

        if ($stateParams.documentPublicId) {
            var documentPublicId = +$stateParams.documentPublicId;
            var document = _.find($scope.lists.documentsList, {
                Document: {
                    PublicId: documentPublicId
                }
            });
            if (document) {
                $timeout(function () {
                    $scope.documentPublicId = documentPublicId;
                    $scope.onDocumentChange($scope.documentPublicId);
                });
            }
        }

        $rootScope.$on('vmsPreprocessedDocumentRemove', function (event, data) {
            if (data.documentPublicId) {
                var idx = $scope.lists.documentsList.map(function (x) { return x.Document.PublicId; }).indexOf(data.documentPublicId);
                if (idx != -1) {
                    $scope.lists.documentsList.splice(idx, 1);
                }

                if (!$scope.lists.documentsList || $scope.lists.documentsList.length === 0) {
                    $scope.processing = true;

                    commonDataService.setWatchConfigOnWorkflowEvent(
                        'vms.management',
                        $state.current.name,
                        data.entityType,
                        data.entityType,
                        data.vmsDocumentId,
                        {});
                }

                $scope.documentPublicId = undefined;
                $scope.onDocumentChange($scope.documentPublicId);
            }
        });

    }

    if (!app.resolve) app.resolve = {};
    app.resolve.VmsPreprocessedController = {        
        resolveListtDocuments: ['$q', '$stateParams', 'TransactionApiService', function ($q, $stateParams, TransactionApiService) {
            var result = $q.defer();
            var oDataParams = oreq.request()
            .withExpand(['Document'])
            .withSelect(['Document/PublicId', 'Document/Name', 'Document/UploadedDatetime', 'Document/LastModifiedDatetime', 'Document/EntityTypeId', 'VmsDocumentId'])
            .url();
            TransactionApiService.getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization($stateParams.organizationIdInternal, $stateParams.organizationIdClient, oDataParams).then(
                function (response) {
                    if (response.Items) {
                        angular.forEach(response.Items, function (item) {
                            if (item && item.Document && item.Document.UploadedDatetime) {
                                item.Document.UploadedDatetime = moment.utc(item.Document.UploadedDatetime).toDate();
                            }

                        });

                        result.resolve(response.Items);
                    } else {
                        result.resolve(response);
                    }
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }]
    };

})(angular, Phoenix.App);