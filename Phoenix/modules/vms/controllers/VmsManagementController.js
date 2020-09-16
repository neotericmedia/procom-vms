(function (angular) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsManagementController', VmsManagementController);

    VmsManagementController.$inject = ['$scope', '$state', 'common', 'phoenixauth', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'TransactionApiService', 'resolveListOrganizationClient'];

    function VmsManagementController($scope, $state, common, phoenixauth, phoenixsocket, UtilityService, CodeValueService, NavigationService, TransactionApiService, resolveListOrganizationClient) {

        NavigationService.setTitle('thirdpartyimport-manage');

        var self = this;
        phoenixauth.getCurrentProfile().then(function (user) {
            $scope.currentUser = user;
        });
        angular.extend(self, {
            //properties
            selectedOrganizationIdInternal: null,
            selectedOrganizationIdClient: null,
            unregisterFunctionList: [],
            showUploader: false,
            lists: {
                listOrganizationClient: resolveListOrganizationClient
            },
            //methods
            showRecords: showRecords,
            importFile: importFile,
            documentUploadCallbackOnDone: documentUploadCallbackOnDone,
            toggleImportOpen: toggleImportOpen,
            toggleOpen2: toggleOpen2,
            toggleOpen3: toggleOpen3,
            toggleProcessingOpen: toggleProcessingOpen,
            documentUploadValidation: documentUploadValidation,
            goToPreprocess: goToPreprocess,
            hasVMSImportAccess: common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.VMSImport),
        });

        TransactionApiService.getVmsAllItems().then(
            function (success) {
                var items = success.Items;
                self.internalCompanies = _.chain(items)
                    .groupBy("InternalOrgDisplayName")
                    .map(function (values, key) {
                        var documentCount = 0, conflictCount = 0, preparedCount = 0;
                        var discountDocumentCount = 0, discountConflictCount = 0, discountPreparedCount = 0;
                        var unitedstatessourcedeductionDocumentCount = 0, unitedstatessourcedeductionConflictCount = 0, unitedstatessourcedeductionPreparedCount = 0;
                        var expenseDocumentCount = 0, expenseConflictCount = 0, expensePreparedCount = 0;
                        var commissionDocumentCount = 0, commissionConflictCount = 0, commissionPreparedCount = 0;
                        var fixedPriceDocumentCount = 0, fixedPriceConflictCount = 0, fixedPricePreparedCount = 0;
                        var internalId = values[0].OrganizationIdInternal;
                        var clientCompanyDocuments = [];

                        var result = _.each(values, function (item) {
                            documentCount += item.DocumentCount;
                            conflictCount += item.ConflictCount;
                            preparedCount += item.PreparedCount;

                            discountDocumentCount += item.DiscountDocumentCount;
                            discountConflictCount += item.DiscountConflictCount;
                            discountPreparedCount += item.DiscountPreparedCount;

                            unitedstatessourcedeductionDocumentCount += item.UnitedStatesSourceDeductionDocumentCount;
                            unitedstatessourcedeductionConflictCount += item.UnitedStatesSourceDeductionConflictCount;
                            unitedstatessourcedeductionPreparedCount += item.UnitedStatesSourceDeductionPreparedCount;

                            expenseDocumentCount += item.ExpenseDocumentCount;
                            expenseConflictCount += item.ExpenseConflictCount;
                            expensePreparedCount += item.ExpensePreparedCount;

                            commissionDocumentCount += item.CommissionDocumentCount;
                            commissionConflictCount += item.CommissionConflictCount;
                            commissionPreparedCount += item.CommissionPreparedCount;

                            fixedPriceDocumentCount += item.FixedPriceDocumentCount;
                            fixedPriceConflictCount += item.FixedPriceConflictCount;
                            fixedPricePreparedCount += item.FixedPricePreparedCount;

                            clientCompanyDocuments.push({
                                ClientOrgDisplayName: item.ClientOrgDisplayName,
                                OrganizationIdClient: item.OrganizationIdClient,
                                totalDocumentCount: item.DocumentCount + item.DiscountDocumentCount + item.UnitedStatesSourceDeductionDocumentCount + item.ExpenseDocumentCount + item.CommissionDocumentCount + item.FixedPriceDocumentCount,
                            });
                        });

                        clientCompanyDocuments = _.filter(clientCompanyDocuments, function (i) { return i.totalDocumentCount > 0; });

                        return {
                            InternalCompanyName: key,
                            InternalCompanyId: internalId,
                            DocumentCount: documentCount,
                            conflictCount: conflictCount,
                            PreparedCount: preparedCount,

                            discountDocumentCount: discountDocumentCount,
                            discountConflictCount: discountConflictCount,
                            discountPreparedCount: discountPreparedCount,

                            unitedstatessourcedeductionDocumentCount: unitedstatessourcedeductionDocumentCount,
                            unitedstatessourcedeductionConflictCount: unitedstatessourcedeductionConflictCount,
                            unitedstatessourcedeductionPreparedCount: unitedstatessourcedeductionPreparedCount,

                            expenseDocumentCount: expenseDocumentCount,
                            expenseConflictCount: expenseConflictCount,
                            expensePreparedCount: expensePreparedCount,

                            commissionDocumentCount: commissionDocumentCount,
                            commissionConflictCount: commissionConflictCount,
                            commissionPreparedCount: commissionPreparedCount,

                            fixedPriceDocumentCount: fixedPriceDocumentCount,
                            fixedPriceConflictCount: fixedPriceConflictCount,
                            fixedPricePreparedCount: fixedPricePreparedCount,

                            clientCompanyDocuments: clientCompanyDocuments,
                            documentCountTotal: documentCount + discountDocumentCount + unitedstatessourcedeductionDocumentCount + expenseDocumentCount + commissionDocumentCount + fixedPriceDocumentCount,
                            conflictCountTotal: conflictCount + discountConflictCount + unitedstatessourcedeductionConflictCount + expenseConflictCount + commissionConflictCount + fixedPriceConflictCount,
                            preparedCountTotal: preparedCount + discountPreparedCount + unitedstatessourcedeductionPreparedCount + expensePreparedCount + commissionPreparedCount + fixedPricePreparedCount,
                            isOpen: internalId == $scope.currentUser.OrganizationId,
                            openImport: false,
                            openProcessing: false,
                            openConflicts: false,
                            openPrepared: false,
                            importOrgId: null,
                            preprosOrgId: null
                        };
                    }).value();
                self.internalCompanies = self.internalCompanies.sort(function (a, b) {
                    if (a.InternalCompanyId == $scope.currentUser.OrganizationId && b.InternalCompanyId != $scope.currentUser.OrganizationId) {
                        return -1;
                    } else if (a.InternalCompanyId != $scope.currentUser.OrganizationId && b.InternalCompanyId == $scope.currentUser.OrganizationId) {
                        return 1;
                    } else {
                        return a.InternalCompanyName < b.InternalCompanyName ? -1 : b.InternalCompanyName < a.InternalCompanyName ? 1 : 0;
                    }
                });
            },
            function (error) {
                console.log(error);
                //ToDo:
            }
        );

        function showRecords(company) {
            var isOpen = company.isOpen;
            angular.forEach(self.internalCompanies, function (company) {
                company.isOpen = false;
            });
            company.isOpen = !isOpen;
        }

        function importFile(internalCompId, clientOrgId) {
            self.selectedOrganizationIdInternal = internalCompId;
            self.selectedOrganizationIdClient = clientOrgId;
            if (self.selectedOrganizationIdClient && self.selectedOrganizationIdInternal) {
                self.showUploader = true;
            }
        }

        function documentUploadCallbackOnDone(result, eventType, dataResult) {
            if (eventType == 'fileuploaddone' &&
                dataResult !== null &&
                dataResult.exceptionMessage !== null &&
                dataResult.exceptionMessage.length > 0) {
                common.logError(dataResult.exceptionMessage);
            }
            else if (eventType == 'fileuploaddone' &&
                dataResult !== null &&
                dataResult.notificationMessage !== null &&
                dataResult.notificationMessage.length > 0) {
                common.logSuccess(dataResult.notificationMessage);
                self.showUploader = false;
                self.selectedOrganizationIdInternal = null;
                self.selectedOrganizationIdClient = null;
            }
            else if (eventType == 'fileuploaddone' &&
                dataResult !== null &&
                dataResult.publicId !== null && dataResult.publicId !== '00000000-0000-0000-0000-000000000000' &&
                dataResult.documentTypeId !== null &&
                dataResult.documentTypeId > 0 &&
                dataResult.documentTypeId == ApplicationConstants.DocumentTypes.VmsRecordsFormatted) {
                if ($state.includes('vms.management') && self.selectedOrganizationIdInternal > 0 && self.selectedOrganizationIdClient) {
                    self.showUploader = false;
                    var organizationIdInternal = angular.copy(self.selectedOrganizationIdInternal);
                    var organizationIdClient = angular.copy(self.selectedOrganizationIdClient);
                    var documentPublicId = dataResult.publicId;
                    // $state.go('vms.preprocessed', { organizationIdInternal: organizationIdInternal, organizationIdClient: organizationIdClient, documentPublicId: documentPublicId });
                    var p = 'transaction/vms-preprocess/' + organizationIdInternal + '/' + organizationIdClient + '/' + documentPublicId;
                    $state.go('ngtwo.m', { p: p });
                }
            } else if (eventType == 'fileUploadClose') {
                self.showUploader = false;
                self.selectedOrganizationIdInternal = null;
                self.selectedOrganizationIdClient = null;
            }
        }

        function documentUploadValidation(queue) {
            var messages = [];
            if (queue !== null && typeof queue !== 'undefined') {
                if (queue.length === 0) {
                    messages.push("You need to upload at least one file");
                }
                if (queue.length == 1 || queue.length == 2) {
                    var formatCount = 0, originalCount = 0;
                    angular.forEach(queue, function (file) {
                        if (file.DocumentTypeId == ApplicationConstants.DocumentTypes.VmsRecordsFormatted) {
                            formatCount++;
                        } else if (file.DocumentTypeId == ApplicationConstants.DocumentTypes.VmsRecordsOriginal) {
                            originalCount++;
                        }
                    });
                    if (formatCount === 0) {
                        messages.push("You must upload a formatted Document");
                    }
                    if (formatCount === 2) {
                        messages.push("Cannot upload two formatted Documents at once");
                    }
                    if (originalCount === 2) {
                        messages.push("Cannot upload two original Documents at once");
                    }
                }
            } else {
                messages.push("You need to upload at least one file");
            }
            return messages;
        }

        function toggleImportOpen(company, forcedValue) {
            company.openProcessing = false;
            company.openPrepared = false;
            company.openConflicts = false;
            company.openImport = typeof forcedValue === "boolean" ? forcedValue : !company.openImport;
            company.importOrgId = undefined;
            company.preprosOrgId = undefined;
        }

        function toggleProcessingOpen(company, forcedValue) {
            company.openImport = false;
            company.openPrepared = false;
            company.openConflicts = false;
            if (company.documentCountTotal) {
                company.openProcessing = typeof forcedValue === "boolean" ? forcedValue : !company.openProcessing;
                company.importOrgId = undefined;
                company.preprosOrgId = undefined;
            }
        }

        function toggleOpen2(company, forcedValue) {
            company.openImport = false;
            company.openProcessing = false;
            company.openConflicts = false;
            company.openPrepared = typeof forcedValue === "boolean" ? forcedValue : !company.openPrepared;
            company.importOrgId = undefined;
            company.preprosOrgId = undefined;
        }

        function toggleOpen3(company, forcedValue) {
            company.openImport = false;
            company.openProcessing = false;
            company.openPrepared = false;
            company.openConflicts = typeof forcedValue === "boolean" ? forcedValue : !company.openConflicts;
            company.importOrgId = undefined;
            company.preprosOrgId = undefined;
        }

        function goToPreprocess(company) {
            if (company.preprosOrgId) {
                var path = 'transaction/vms-preprocess/' + company.InternalCompanyId + '/' + company.preprosOrgId + '/00000000-0000-0000-0000-000000000000/timesheet/00000000-0000-0000-0000-000000000000';
                $state.go('ngtwo.m', { p: path });
            }
        }

    }

})(angular);