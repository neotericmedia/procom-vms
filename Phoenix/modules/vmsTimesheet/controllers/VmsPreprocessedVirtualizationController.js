(function (angular) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsPreprocessedVirtualizationController', VmsPreprocessedVirtualizationController);

    VmsPreprocessedVirtualizationController.$inject = ['$q', '$state', 'NavigationService', 'resolveListDocuments', 'TransactionApiService'];

    function VmsPreprocessedVirtualizationController($q, $state, NavigationService, resolveListDocuments, TransactionApiService) {
        var self = this;

        NavigationService.setTitle('VMS Pre-processed Virtualized Records', 'icon icon-transaction');

        angular.extend(self, {
            documentPublicId: $state.params.documentPublicId,
            item: null,
            items: [],
            lists: {
                documentsList: resolveListDocuments,
            },

            callServer: function () {
                var deferred = $q.defer();
                if (this.documentPublicId !== null && this.documentPublicId !== '00000000-0000-0000-0000-000000000000') {
                    var tableState = {};
                    tableState = {
                        pagination: {
                            isDisabled: true
                        }
                    };
                    var oDataParams = oreq.request()
                            .withSelect([
                                'Id',
                                'WorkOrderReference',
                                'FirstName',
                                'LastName',
                                'V1RateTypeId',
                                'V1BillRate',
                                'V1BillUnits',
                                'V2RateTypeId',
                                'V2BillRate',
                                'V2BillUnits',
                                'StartDate',
                                'EndDate',
                                'InvoiceReference',
                                'VmsImportedRecordTypeIdInitial',
                                'VmsImportedRecordTypeIdFinal',
                                'ValidationMessages',

                                'UploadedDatetime'
                            ]).url();
                    TransactionApiService.getVmsTimesheetImportedRecordsTable(this.documentPublicId, oDataParams, tableState).then(
                        function (response) {
                            deferred.resolve(response.Items);
                        },
                        function (responseError) {
                            deferred.reject(responseError);
                        });
                }
                else {
                    deferred.resolve([]);
                }
                return deferred.promise;
            },

            onDocumentChange: function () {
                $state.transitionTo('vms.preprocessedv', { organizationIdInternal: $state.params.organizationIdInternal, organizationIdClient: $state.params.organizationIdClient, documentPublicId: self.documentPublicId }, { reload: true, inherit: true, notify: true });
            },
        });

        if ($state.params.documentPublicId !== null && $state.params.documentPublicId !== '00000000-0000-0000-0000-000000000000') {
            self.testVirtualListData = [];
            self.items = [];
            this.callServer().then(
                    function (response) {
                        self.items = response;
                    },
                    function (responseError) {
                        self.items = [];
                    });
        }
        else {
            var testVirtualListData = [];
            for (var i = 0; i < 1000000; i++) {
                testVirtualListData.push({
                    Id: i,
                    FirstName: "FirstName " + i,
                    LastName: "LastName " + i
                });
            }
            angular.extend(self, {
                testVirtualListData: testVirtualListData,
                testVirtualListOption: null,
                testVirtualListOnSelect: function (option) {
                    console.log(option);
                },
            });
        }

    }

})(angular);