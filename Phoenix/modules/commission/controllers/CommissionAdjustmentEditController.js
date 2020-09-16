(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('CommissionAdjustmentEditController', CommissionAdjustmentEditController);

    CommissionAdjustmentEditController.$inject = ['$rootScope', 'WorkflowApiService', 'CodeValueService', 'common', 'commonDataService', 'dialogs', 'mixinsFactory', 'NavigationService', 'clientOrganizations', 'CommissionApiService', 'commissionRateSearchTableParams', 'commissionHeader', 'commissionTableState', 'commissionUsers', 'internalUsers', 'DocumentApiService', '$scope', '$state', 'ProfileApiService', 'internalOrganizations'];

    function CommissionAdjustmentEditController($rootScope, WorkflowApiService, CodeValueService, common, commonDataService, dialogs, mixinsFactory, NavigationService, clientOrganizations, CommissionApiService, commissionAdjustmentSearchTableParams, commissionHeader, commissionTableState, commissionUsers, internalUsers, DocumentApiService, $scope, $state, ProfileApiService, internalOrganizations) {

        NavigationService.setTitle('commission-adjustment-viewedit');

        var self = this;

        angular.extend(self, {
            //properties
            ValidationMessages: [],
            actionType: null,
            UnallocatedAmount: null,
            AllocatedAmount: null,
            commissionAdjustmentEvents: [],
            commissionHeader: commissionHeader,
            internalOrganizations: internalOrganizations,
            clientOrganizations: clientOrganizations,
            //commissionUsersUnique: _.chain(commissionUsers).uniqBy('CommissionUserProfileId').value(),
            internalUsers: internalUsers,
            commissionUsersAll: _.chain(commissionUsers).filter(function (user) {
                return user.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport ||
                    user.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport ||
                    user.CommissionRoleId == ApplicationConstants.CommissionRole.SupportingJobOwner;
            }).groupBy('CommissionUserProfileId').map(function (roles, userId) {
                return { CommissionUserProfileId: parseInt(userId), Name: roles[0].Name, Roles: roles, CommissionUserProfileStatusId: roles[0].CommissionUserProfileStatusId };
            }).value(),
            commissionAdjustmentHeaderTypes: CodeValueService.getCodeValues(CodeValueGroups.CommissionAdjustmentHeaderType, true),
            //methods
            init: init,
            back: back,
            save: save,
            cancel: cancel,
            discard: discard,
            changeRecurring: changeRecurring,
            addJobOwner: addJobOwner,
            removeJobOwner: removeJobOwner,
            restoreJobOwner: restoreJobOwner,
            jobOwnerChanged: jobOwnerChanged,
            addWorkOrder: addWorkOrder,
            removeWorkorder: removeWorkorder,
            woAmountChanged: woAmountChanged,
            amountNetChanged: amountNetChanged,
            adjustmentTypeChanged: adjustmentTypeChanged,
            internalOrganizationChanged: internalOrganizationChanged,
            recurrencyChanged: recurrencyChanged,
            getPdfStreamByPublicId: getPdfStreamByPublicId,
            documentDelete: documentDelete,
            documentUploadCallbackOnDone: documentUploadCallbackOnDone,
            unbindCommissionAdjustmentEvents: unbindCommissionAdjustmentEvents,
            fieldViewEditModeInit: fieldViewEditModeInit
        });

        function init() {

            self.commissionId = parseInt($state.params.commissionId, 10);

            if (self.commissionId > 0) {
                WorkflowApiService.getWorkflowAvailableActions(self.commissionHeader, self.commissionHeader, ApplicationConstants.EntityType.CommissionAdjustmentHeader);
                DocumentApiService.getEntityDocuments(ApplicationConstants.EntityType.CommissionAdjustmentHeader, self.commissionId).then(function success(response) {
                    self.commissionHeader.CommissionDocuments = response.Items;
                });

                if (self.commissionHeader.CommissionAdjustmentHeaderTypeId == ApplicationConstants.CommissionAdjustmentHeaderType.ManualAdjustment) {
                    self.CommissionJobOwners = _.filter(self.commissionHeader.CommissionAdjustmentDetails, function (detail) { return detail.CommissionAdjustmentDetailTypeId === ApplicationConstants.CommissionAdjustmentDetailType.JobOwnerAllocation; });
                }
                else if (self.commissionHeader.CommissionAdjustmentHeaderTypeId == ApplicationConstants.CommissionAdjustmentHeaderType.BackgroundCheck) {

                    self.CommissionJobOwners = _.filter(self.commissionHeader.CommissionAdjustmentDetails, function (detail) { return detail.CommissionAdjustmentDetailTypeId === ApplicationConstants.CommissionAdjustmentDetailType.JobOwnerAllocation; });

                    if (self.CommissionJobOwners.length > 0) {

                        angular.forEach(self.CommissionJobOwners, function (jobOwner) {

                            var commissionRolesObject = _.find(self.commissionUsersAll, function (usr) {
                                return usr.CommissionUserProfileId == jobOwner.CommissionUserProfileId;
                            });

                            if (commissionRolesObject && commissionRolesObject.Roles) {
                                jobOwner.CommissionRoles = commissionRolesObject.Roles;
                            }
                        });
                    }

                    self.CommissionWorkorders = _.filter(self.commissionHeader.CommissionAdjustmentDetails, function (detail) { return detail.CommissionAdjustmentDetailTypeId === ApplicationConstants.CommissionAdjustmentDetailType.WorkorderAllocation; });

                    if (self.CommissionWorkorders.length > 0) {
                        self.AllocatedAmount = _.sumBy(self.CommissionWorkorders, function (cwo) { return cwo.AdjustmentAmount; });
                        self.UnallocatedAmount = self.commissionHeader.AdjustmentAmountNet - self.AllocatedAmount;
                    }
                    else {
                        self.UnallocatedAmount = self.commissionHeader.AdjustmentAmountNet;
                    }
                }
            }
            else {
                self.commissionAdjustmentHeaderTypes = CodeValueService.getCodeValues(CodeValueGroups.CommissionAdjustmentHeaderType, true).slice(0, 2)
            }
            var commissionJobOwnerIds = [];
            _.map(self.CommissionJobOwners, function (commissionOwner) { commissionJobOwnerIds.push(commissionOwner.CommissionUserProfileId); });
            ProfileApiService.removeInactiveProfileWithConfig({ profileStatusId: 'CommissionUserProfileStatusId', id: 'CommissionUserProfileId' }, self.internalUsers, commissionJobOwnerIds);
            ProfileApiService.removeInactiveProfileWithConfig({ profileStatusId: 'CommissionUserProfileStatusId', id: 'CommissionUserProfileId' }, self.commissionUsersAll, commissionJobOwnerIds);

            self.fieldViewEditModeInit();
        }

        self.init();

        var refreshDocumentsListHandler = $rootScope.$on('event:refresh-documents-list', function () {
            self.init();
        });

        //self.$on("$destroy", function () {
        //    refreshDocumentsListHandler();
        //});

        function adjustmentTypeChanged(type) {
            self.CommissionJobOwners = [];
            self.CommissionWorkorders = [];
            self.commissionHeader.CommissionRecurrency = null;

            if (type == ApplicationConstants.CommissionAdjustmentHeaderType.ManualAdjustment) {
                self.addJobOwner();
                self.commissionHeader.CommissionRecurrency = false;
                delete self.CommissionJobOwners[0].CommissionRoles;
            }
        }

        function internalOrganizationChanged(type) {
            self.CommissionJobOwners = [];
            self.CommissionWorkorders = [];
            self.commissionHeader.CommissionRecurrency = null;

            if (type == ApplicationConstants.CommissionAdjustmentHeaderType.ManualAdjustment) {
                self.addJobOwner();
                self.commissionHeader.CommissionRecurrency = false;
                delete self.CommissionJobOwners[0].CommissionRoles;
            }
        }

        function amountNetChanged() {
            self.UnallocatedAmount = self.commissionHeader.AdjustmentAmountNet ? (self.AllocatedAmount ? self.commissionHeader.AdjustmentAmountNet - self.AllocatedAmount : self.commissionHeader.AdjustmentAmountNet) : null;
        }

        function addJobOwner() {
            self.CommissionJobOwners.push({
                CommissionRoles: [],
                AdjustmentAmount: null,
                CommissionUserProfileId: null,
                CommissionAdjustmentDetailTypeId: ApplicationConstants.CommissionAdjustmentDetailType.JobOwnerAllocation
            });
        }

        function removeJobOwner(index) {
            self.CommissionJobOwners.splice(index, 1);
        }

        function restoreJobOwner(jobOwner) {
            jobOwner.CommissionRoles = [];
            jobOwner.CommissionRateHeaderId = null;
            jobOwner.CommissionUserProfileId = null;
        }

        function jobOwnerChanged(jobOwner) {

            var commissionRolesObject = _.find(self.commissionUsersAll, function (usr) {
                return usr.CommissionUserProfileId === jobOwner.CommissionUserProfileId;
            });

            jobOwner.CommissionRateHeaderId = null;

            if (commissionRolesObject && commissionRolesObject.Roles) {
                jobOwner.CommissionRoles = commissionRolesObject.Roles;
            }
        }

        function addWorkOrder() {

            dialogs.create('/Phoenix/modules/commission/views/CommissionAddWorkOrderDialog.html',
                'CommissionAddWorkOrderDialogController',
                {
                    SelectedWorkorders: self.CommissionWorkorders,
                    SelectedClientOrganizationId: self.commissionHeader.ClientOrganizationId,
                    SelectedOrganizationIdInternal: self.commissionHeader.OrganizationIdInternal
                },
                { keyboard: false, backdrop: 'static', windowClass: 'commissionAdjustmentDlg' }).result.then(
                function (result) {
                    if (result.action == 'select') {
                        self.CommissionWorkorders = angular.copy(result.SelectedWorkorders);
                        self.woAmountChanged();
                    }
                },
                function () {
                });
        }

        function removeWorkorder(workorder) {

            self.CommissionWorkorders = _.filter(self.CommissionWorkorders, function (wov) {
                return wov.WorkOrderVersionId !== workorder.WorkOrderVersionId;
            });

            self.woAmountChanged();
        }

        function woAmountChanged(workorder) {

            self.AllocatedAmount = null;

            for (var k = 0; k < self.CommissionWorkorders.length; k++) {

                if (self.CommissionWorkorders[k].AdjustmentAmount) {

                    self.AllocatedAmount += parseFloat(self.CommissionWorkorders[k].AdjustmentAmount);
                }
            }

            self.UnallocatedAmount = self.commissionHeader.AdjustmentAmountNet ? (self.AllocatedAmount ? self.commissionHeader.AdjustmentAmountNet - self.AllocatedAmount : self.commissionHeader.AdjustmentAmountNet) : null;
        }

        function recurrencyChanged() {
            if (self.commissionHeader.CommissionRecurrency === true) {
                self.commissionHeader.AdjustmentDate = null;
            }
        }

        function cancel(type) {

            self.actionType = type;

            angular.forEach(self.commissionHeader.CommissionDocuments, function (document) {
                DocumentApiService.deleteDocumentByPublicId(document.PublicId);
            });

            $state.go('ngtwo.m', { p: 'commission/adjustment' });
        }

        function back(type) {

            self.actionType = type;

            $state.go('ngtwo.m', { p: 'commission/adjustment' });
        }

        function changeRecurring(adjustmentHeaderId, type, workflowPendingTaskId) {

            self.actionType = type;

            CommissionApiService.changeRecurring({ WorkflowPendingTaskId: workflowPendingTaskId, CommissionAdjustmentHeaderId: adjustmentHeaderId }).then(
                function (success) {
                    onWorkflowEventSuccess(success.EntityId, $state.current.name, "Commission Adjustment Recurring has been changed.");
                },
                function (error) {
                    onResponseError(error);
                });
        }

        function onWorkflowEventSuccess(adjustmentHeaderId, stateNameGo, message) {
            self.ValidationMessages = [];
            if (message && message.length > 0) {
                common.logSuccess(message);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, 'commission.adjustmentedit', ApplicationConstants.EntityType.CommissionAdjustmentHeader, ApplicationConstants.EntityType.CommissionAdjustmentHeader, adjustmentHeaderId, { commissionId: adjustmentHeaderId });
        }

        function save(commission, type) {

            self.actionType = type;

            if (self.commissionHeader.CommissionAdjustmentHeaderTypeId === ApplicationConstants.CommissionAdjustmentHeaderType.ManualAdjustment) {

                self.CommissionJobOwners[0].AdjustmentAmount = self.commissionHeader.AdjustmentAmountNet;

                commission.CommissionAdjustmentDetails = angular.copy(self.CommissionJobOwners);

                commission.CommissionAdjustmentDocuments = _.map(commission.CommissionDocuments, function (doc) {
                    return {
                        DocumentPublicId: doc.PublicId
                    };
                });
                commission.WorkflowPendingTaskId = -1;
                CommissionApiService.saveCommissionTransaction(CommissionApiService.convertCommissionAdjustmentUiToApi(commission)).then(
                    function (success) {
                        $state.go('ngtwo.m', { p: 'commission/adjustment' }, { reload: true, inherit: true, notify: true });
                        common.logSuccess("Commission Adjustment has been saved successfully.");
                    },
                    function (error) {
                        onResponseError(error);
                    });
            }
            else if (self.commissionHeader.CommissionAdjustmentHeaderTypeId === ApplicationConstants.CommissionAdjustmentHeaderType.BackgroundCheck) {

                var errors = validateAdjustmentAmounts();

                if (errors.length > 0) {

                    var markup = "<ul>";
                    for (var j = 0; j < errors.length; j++) {
                        markup += "<li>" + errors[j] + "</li>";
                    }
                    markup += "</ul>";

                    dialogs.notify('Errors on commission adjustment creation', markup, { keyboard: false, backdrop: 'static', windowClass: 'vms-conflict-dlg-errors' }).result.then(function () { });
                }
                else {

                    if (self.CommissionJobOwners.length > 0) {
                        _.each(self.CommissionJobOwners, function (jo) {
                            jo.AdjustmentAmount = self.UnallocatedAmount;
                            delete jo.CommissionRoles;
                        });
                    }

                    var commissionWorkorders = [];

                    if (self.CommissionWorkorders.length > 0) {
                        commissionWorkorders = _.map(self.CommissionWorkorders, function (wo) {
                            return { WorkOrderVersionId: wo.WorkOrderVersionId, AdjustmentAmount: wo.AdjustmentAmount, CommissionAdjustmentDetailTypeId: ApplicationConstants.CommissionAdjustmentDetailType.WorkorderAllocation };
                        });
                    }

                    commission.CommissionAdjustmentDetails = self.CommissionJobOwners.concat(commissionWorkorders);

                    commission.CommissionAdjustmentDocuments = _.map(commission.CommissionDocuments, function (doc) {
                        return { DocumentPublicId: doc.PublicId };
                    });
                    commission.WorkflowPendingTaskId = -1;
                    CommissionApiService.saveCommissionTransaction(CommissionApiService.convertCommissionAdjustmentUiToApi(commission)).then(
                        function (success) {
                            $state.go('ngtwo.m', { p: 'commission/adjustment' });
                            common.logSuccess("Commission Adjustment has been saved successfully.");
                        },
                        function (error) {
                            onResponseError(error);
                        });

                }
            }
        }

        function discard(commission, type) {

            self.actionType = type;

            dialogs.confirm('Discard Commission Adjustment', 'Are you sure you want to discard this Adjustment?').result.then(
                function (btn) {
                    angular.forEach(self.commissionHeader.CommissionDocuments, function (document) {
                        DocumentApiService.deleteDocumentByPublicId(document.PublicId);
                    });
                    $state.go('ngtwo.m', { p: 'commission/adjustment' });
                }, function (btn) { });
        }

        function documentUploadCallbackOnDone(document) {

            if (document && document.documentPublicId) {
                DocumentApiService.getDocumentByPublicId(document.documentPublicId).then(
                    function (responseSucces) {
                        self.commissionHeader.CommissionDocuments.push(responseSucces);
                    },
                    function (responseError) {
                        self.ValidationMessages = common.responseErrorMessages(responseError);
                    });
            }
        }

        function documentDelete(document) {

            var dlg = dialogs.confirm('Document Delete', 'This document will be deleted. Continue?');

            dlg.result.then(function (btn) {
                DocumentApiService.deleteDocumentByPublicId(document.PublicId).then(function () {
                    self.commissionHeader.CommissionDocuments = _.filter(self.commissionHeader.CommissionDocuments, function (doc) { return doc.PublicId != document.PublicId; });
                });
            }, function (btn) { });
        }

        function getPdfStreamByPublicId(publicId) {
            return DocumentApiService.getPdfStreamByPublicId(publicId);
        }

        function onResponseError(responseError) {
            self.ValidationMessages = common.responseErrorMessages(responseError);
        }

        var onCommissionAdjustmentStateChange = function (event, toState, toParams, fromState, fromParams) {
            if (!self.actionType && self.commissionHeader.CommissionDocuments.length > 0 && self.commissionId === 0) {
                var dlg = dialogs.confirm('Warning', 'Moving away from this page will cause unsaved changes to be lost. Do you want to continue?');
                dlg.result.then(function (btn) {
                    self.unbindCommissionAdjustmentEvents();
                    angular.forEach(self.commissionHeader.CommissionDocuments, function (document) {
                        DocumentApiService.deleteDocumentByPublicId(document.PublicId);
                    });
                    self.commissionHeader.CommissionDocuments = [];
                    $rootScope.activateGlobalSpinner = false;
                    $state.go('ngtwo.m', { p: 'commission/adjustment' });
                    return;
                }, function (btn) {
                    $rootScope.activateGlobalSpinner = false;
                    event.preventDefault();
                    return;
                });
                event.preventDefault();
                return;
            }
        };

        var commissionAdjustmentStateChangeWatchOff = $scope.$on('$stateChangeStart', onCommissionAdjustmentStateChange);

        self.commissionAdjustmentEvents.push({
            name: 'commissionAdjustmentStateChangeWatchOff', event: commissionAdjustmentStateChangeWatchOff
        });

        function unbindCommissionAdjustmentEvents() {
            angular.forEach(self.commissionAdjustmentEvents, function (e) {
                e.event();
            });
        }

        $scope.$on("$destroy", function () {
            self.unbindCommissionAdjustmentEvents();
        });

        function fieldViewEditModeInit() {

            var viewEditModeConfig = {

                funcToCheckViewStatus: function (modelPrefix, fieldName) {

                    if (self.commissionId > 0) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else {
                        return ApplicationConstants.viewStatuses.edit;
                    }
                },

                funcToPassMessages: function (message) {
                    common.logWarning(message);
                }
            };

            self.ptFieldViewConfigOnChangeStatusId = viewEditModeConfig;
        }

        function validateAdjustmentAmounts() {

            var errors = [];

            if (self.UnallocatedAmount > 0.0001 && self.CommissionJobOwners.length === 0) {
                errors.push("There is an unallocated amount remaining.");
            }

            if (self.AllocatedAmount > self.commissionHeader.AdjustmentAmountNet) {
                errors.push("Allocated amount cannot be greater than adjustment amount.");
            }

            return errors;
        }
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.CommissionAdjustmentEditController = {

        commissionHeader: ['$q', '$stateParams', 'CommissionApiService', function ($q, $stateParams, CommissionApiService) {

            var result = $q.defer();

            var commissionId = parseInt($stateParams.commissionId, 10);

            if (commissionId > 0) {

                CommissionApiService.getCommissionHeaderById($stateParams.commissionId).then(
                    function (success) {
                        result.resolve(CommissionApiService.convertCommissionAdjustmentApiToUi(success));
                    },
                    function (error) {
                        result.reject(error);
                    }
                );
            }
            else {
                result.resolve({
                    Id: 0,
                    WorkflowPendingTaskId: -1,
                    CommissionAdjustmentHeaderTypeId: null,
                    OrganizationIdInternal: null,
                    ClientOrganizationId: null,
                    CommissionRecurrency: null,
                    AdjustmentDate: null,
                    AdjustmentAmountNet: null,
                    isAdjustmentAmountAdd: null,
                    Description: '',
                    CommissionDocuments: [],
                    CommissionAdjustmentDetails: []
                });
            }

            return result.promise;
        }],

        clientOrganizations: ['OrgApiService', '$q', function (OrgApiService, $q) {

            var deferred = $q.defer();

            OrgApiService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole().then(
                function (success) {
                    success.Items = _.filter(success.Items, function (item) { return item.DisplayName !== null; });
                    deferred.resolve(success.Items);
                },
                function (error) { deferred.resolve([]); });

            return deferred.promise;
        }],

        commissionUsers: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {

            var result = $q.defer();

            var commissionDataParams = oreq.request().withSelect(['CommissionUserProfileId', 'CommissionUserProfileStatusId', 'CommissionUserProfileFirstName', 'CommissionUserProfileLastName', 'CommissionUserProfileStatusId', 'Id', 'Description', 'CommissionRoleId']).url();

            CommissionApiService.getCommissionRateHeaderUsers(commissionDataParams).then(
                function (success) {
                    angular.forEach(success.Items, function (item) {
                        item.Name = item.CommissionUserProfileFirstName + ' ' + item.CommissionUserProfileLastName;
                    });
                    result.resolve(success.Items);
                },
                function (error) {
                    result.reject(error);
                }
            );

            return result.promise;
        }],

        internalUsers: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {

            var result = $q.defer();

            var commissionDataParams = oreq.request().withSelect(['CommissionUserProfileId', 'CommissionUserProfileFirstName', 'CommissionUserProfileLastName', 'CommissionUserProfileStatusId']).url();

            CommissionApiService.getInternalUserProfileList(commissionDataParams).then(
                function (success) {
                    angular.forEach(success.Items, function (item) {
                        item.Name = item.CommissionUserProfileFirstName + ' ' + item.CommissionUserProfileLastName;
                    });
                    result.resolve(success.Items);
                },
                function (error) {
                    result.reject(error);
                }
            );

            return result.promise;
        }],

        internalOrganizations: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {

            var result = $q.defer();

            CommissionApiService.getListOrganizationInternal().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });

            return result.promise;
        }],
    };
})(angular, Phoenix.App);