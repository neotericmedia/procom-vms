/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';

    angular.module('phoenix.workorder.controllers').controller('AssignmentCreateSetupController', AssignmentCreateSetupController);

    AssignmentCreateSetupController.$inject = ['$state', 'common', 'NavigationService', 'resolveCodeValueLists', 'resolvetApplicationConfigurationDisableATS', 'AssignmentApiService'];

    function AssignmentCreateSetupController($state, common, NavigationService, resolveCodeValueLists, resolvetApplicationConfigurationDisableATS, AssignmentApiService) {

        var self = this;

        NavigationService.setTitle('workorder-new');

        angular.extend(self, {
            lists: resolveCodeValueLists,
            disableATS: resolvetApplicationConfigurationDisableATS,
            lineOfBusinessId: undefined,
            atsSourceId: 1,
            atsPlacementId: undefined,
            getDataInProgress: false,
            checkingDuplicateWorkOrders: false,
            displayWarningMessage: false,
            duplicateWorkOrders: [],
            workOrderCreate: function () {
                this.getDataInProgress = true;
                if (!this.disableATS && this.atsSourceId !== undefined ? this.atsSourceId : 0) {
                    common.logSuccess("Get  ATS Service Data in Progress");
                }
                $state.go('workorder.create',
                    {
                        lineOfBusinessId: this.lineOfBusinessId,
                        atsSourceId: this.disableATS ? 0 : this.atsSourceId !== undefined ? this.atsSourceId : 0,
                        atsPlacementId: this.atsPlacementId > 0 ? this.atsPlacementId : 0,
                    });
            },
            onChangeLineOfbusinessId: function() {
                checkDuplicateATS();
            },
            onChangeAtsSourceId: function() {
                checkDuplicateATS();
            },
            onChangePlacementId: function() {
                checkDuplicateATS();
            },
            openWorkOrder: function(workOrder) {
                $state.go('workorder.edit.core', { assignmentId: workOrder.AssignmentId, workOrderId: workOrder.WorkOrderId, workOrderVersionId: workOrder.WorkOrderVersionId });
            }
        });

        function checkDuplicateATS() {
            self.duplicateWorkOrders = [];
            self.displayWarningMessage = false;
            if (self.formAssignmentCreateSetup.$valid && self.atsSourceId && self.atsPlacementId) {
                self.checkingDuplicateWorkOrders = true;
                AssignmentApiService.getDuplicateAtsWorkOrder(self.atsSourceId, self.atsPlacementId).then(function (data) {
                    self.duplicateWorkOrders = data && data.Items && data.Items.length ? data.Items : [];
                }).finally(function () {
                    self.checkingDuplicateWorkOrders = false;
                    self.displayWarningMessage = true;
                });
            }
        }

        if ($state.current.name == 'workorder.createresetup' && parseInt($state.params.lineOfBusinessId) == ApplicationConstants.LineOfBusiness.Regular && parseInt($state.params.atsSourceId) > 0) {
            self.lineOfBusinessId = parseInt($state.params.lineOfBusinessId);
            self.atsPlacementId = parseInt($state.params.atsPlacementId);
            common.logError('No ATS result on requested id: ' + $state.params.atsPlacementId.toString());
        }

        return self;
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.AssignmentCreateSetupController = {

        resolveCodeValueLists: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var lists = {};

            var listLineOfBusiness = CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness);
            lists.listLineOfBusiness = _.filter(listLineOfBusiness, function (o) { return o.id != ApplicationConstants.LineOfBusiness.PermPlacement; });
            lists.listAtsSource = CodeValueService.getCodeValues(CodeValueGroups.AtsSource);

            result.resolve(lists);
            return result.promise;
        }],

        resolvetApplicationConfigurationDisableATS: ['$q', 'ApplicationConfigurationApiService', function ($q, ApplicationConfigurationApiService) {
            var result = $q.defer();
            ApplicationConfigurationApiService.getApplicationConfigurationByTypeId(ApplicationConstants.ApplicationConfigurationType.DisableATS).then(
                function (response) {
                    var disableATS = response.ConfigurationValue.toLowerCase() == 'true';
                    result.resolve(disableATS);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],

    };

})(angular, Phoenix.App);