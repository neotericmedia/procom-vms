/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';

    var controllerId = 'AssignmentCreateController';
    angular.module('phoenix.workorder.controllers').controller(controllerId, ['$state', 'common', 'dialogs', 'NavigationService', 'AssignmentCommonFunctionalityService', 'resolvetListWorkOrderTemplate', 'resolvetDefaultAssignment', 'resolveAts', 'resolvetListCodeValue', 'resolvetListOrganizationClient', 'resolvetListUserProfileWorker', 'AssignmentDataService', 'AssignmentApiService', 'ProfileApiService', AssignmentCreateController]);

    function AssignmentCreateController($state, common, dialogs, NavigationService, AssignmentCommonFunctionalityService, resolvetListWorkOrderTemplate, resolvetDefaultAssignment, resolveAts, resolvetListCodeValue, resolvetListOrganizationClient, resolvetListUserProfileWorker, AssignmentDataService, AssignmentApiService, ProfileApiService) {
        var self = this;

        NavigationService.setTitle('workorder-new');

        if (parseInt($state.params.lineOfBusinessId) === ApplicationConstants.LineOfBusiness.Regular && parseInt($state.params.atsPlacementId) > 0 && resolveAts.AtsPlacementId === 0) {
            $state.go('workorder.createresetup', { lineOfBusinessId: $state.params.lineOfBusinessId, atsSourceId: $state.params.atsSourceId, atsPlacementId: $state.params.atsPlacementId });
        }

        angular.extend(self, {
            lists: resolvetListCodeValue,
            templateId: undefined,
            workOrderCreateInProgress: false,
            ats: {
                SourceId: 0,
                PlacementId: 0,
                StartDate: null,
                EndDate: null,
                OrganizationIdClient: null,
                OrganizationClientDisplayName: '',
                UserProfileIdWorker: null,
                UserProfileWorkerName: '',
                BillingRates: [],
                PaymentRates: [],
            },
            resultModel: {
                lineOfBusinessId: parseInt($state.params.lineOfBusinessId),
                SuggestedOrganizationIdClient: null,
                SuggestedUserProfileIdWorker: null,
                MappedOrganizationIdClient: null,
                MappedUserProfileIdWorker: null
            },
            tagHandler: function (tag) {
                return null;
            },
            workOrderCreate: function () {

                //  Attension! It should be only this order: 
                //  1. from getAssignmentCopied; 
                //  2. from templateId; 
                //  3. from getDefault;
                var assignment = {};
                if (!common.isEmptyObject(AssignmentDataService.getAssignmentCopied())) {
                    assignment = angular.copy(AssignmentDataService.getAssignmentCopied());
                    AssignmentDataService.setAssignmentCopied({});
                }
                else if (self.templateId > 0) {

                    var template = _.find(self.lists.listWorkOrderTemplates, function (item) {
                        return item.Id === self.templateId;
                    });

                    if (common.isEmptyObject(template)) {
                        dialogs.notify('Update information', 'Exception: can NOT find template from "listWorkOrderTemplates" by ' + self.templateId.toString(), { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
                    }
                    else {
                        assignment = angular.copy(template.Entity);
                        assignment = AssignmentCommonFunctionalityService.getAssignmentWithTemplate(template.Entity);
                        assignment.TemplateId = self.templateId;

                        var userProfileIdWorker = self.resultModel.MappedUserProfileIdWorker || self.resultModel.SuggestedUserProfileIdWorker;
                        var worker = _.find(self.lists.listUserProfileWorker, ['Id', userProfileIdWorker]);
                        var templateWorker = _.find(self.lists.listUserProfileWorker, ['Id', assignment.UserProfileIdWorker]);
                        if (worker && templateWorker && (worker.ProfileTypeId != templateWorker.ProfileTypeId)) {
                            console.log(worker.ProfileTypeId, templateWorker.ProfileTypeId);
                            var workerProfile = _.find(self.lists.listProfileType, ['id', worker.ProfileTypeId]);
                            var templateWorkerProfile = _.find(self.lists.listProfileType, ['id', templateWorker.ProfileTypeId]);
                            var errorMessage = 'Incompatible template. Profile type on the template is "' + templateWorkerProfile.text + '". Profile type of the worker is "' + workerProfile.text + '".';
                            dialogs.notify('Update information', errorMessage, { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
                            return;
                        }
                    }
                }
                else {
                    assignment = angular.copy(resolvetDefaultAssignment);
                    //  http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=26231
                    assignment.WorkOrders[0].StartDate = null;//new Date();
                    assignment.WorkOrders[0].EndDate = null;//new Date();
                }

                this.workOrderCreateInProgress = true;
                common.logSuccess("Work Order Creation in Progress");
                AssignmentDataService.setAssignment({});

                if (self.ats.PlacementId > 0) {

                    assignment.AtsSourceId = self.ats.SourceId;
                    assignment.AtsPlacementId = self.ats.PlacementId;

                    assignment.WorkOrders[0].WorkOrderVersions[0].WorkOrderStartDateState = self.ats.StartDate ? self.ats.StartDate : assignment.WorkOrders[0].StartDate;
                    assignment.WorkOrders[0].WorkOrderVersions[0].WorkOrderEndDateState = self.ats.EndDate ? self.ats.EndDate : assignment.WorkOrders[0].EndDate;

                    assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].BillingRates = [];
                    angular.forEach(self.ats.BillingRates, function (rate) {
                        assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].BillingRates.push({ RateTypeId: rate.RateTypeId, Rate: rate.Rate, RateUnitId: self.ats.BillingRateUnitId });
                    });

                    assignment.WorkOrders[0].WorkOrderVersions[0].PaymentInfoes[0].PaymentRates = [];
                    angular.forEach(self.ats.PaymentRates, function (rate) {
                        assignment.WorkOrders[0].WorkOrderVersions[0].PaymentInfoes[0].PaymentRates.push({ RateTypeId: rate.RateTypeId, Rate: rate.Rate, RateUnitId: self.ats.PaymentRateUnitId, IsApplyDeductions: rate.IsApplyDeductions, IsApplyVacation: rate.IsApplyVacation, IsApplyStatHoliday: rate.IsApplyStatHoliday });
                    });
                }

                assignment.WorkOrders[0].WorkOrderVersions[0].LineOfBusinessId = self.resultModel.lineOfBusinessId;


                if (self.resultModel.MappedUserProfileIdWorker > 0) {
                    assignment.UserProfileIdWorker = self.resultModel.MappedUserProfileIdWorker;
                }
                else if (self.resultModel.SuggestedUserProfileIdWorker > 0) {
                    assignment.UserProfileIdWorker = self.resultModel.SuggestedUserProfileIdWorker;
                    var workerProfile = _.find(self.lists.listUserProfileWorker, function (w) { return w.Id == assignment.UserProfileIdWorker; });
                    if (workerProfile && workerProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp) {
                        assignment.WorkOrders[0].WorkOrderVersions[0].PaymentInfoes[0].PaymentInvoices[0].PaymentInvoiceTemplateId = ApplicationConstants.PaymentInvoiceTemplate.PCGLTempWorkerPaystub;
                        assignment.WorkOrders[0].WorkOrderVersions[0].ApplyFlatStatPay = ApplicationConstants.WorkerTempApplyFlatStatPay;
                    }

                    if (workerProfile
                        && (workerProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp
                            || workerProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc
                            || workerProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerSubVendor)) {
                        assignment.WorkOrders[0].WorkOrderVersions[0].PaymentInfoes[0].ApplySalesTax = true;
                    }
                }
                else if (assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].OrganizationIdClient > 0) {

                }
                else {
                    dialogs.notify('Update information', 'Exception: UserProfileIdWorker is required ', { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
                }

                assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].OrganizationClientDisplayName = '';
                if (self.resultModel.MappedOrganizationIdClient > 0) {
                    assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].OrganizationIdClient = self.resultModel.MappedOrganizationIdClient;

                }
                else if (self.resultModel.SuggestedOrganizationIdClient > 0) {
                    assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].OrganizationIdClient = self.resultModel.SuggestedOrganizationIdClient;
                }
                else if (assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].OrganizationIdClient > 0) {

                }
                else {
                    dialogs.notify('Update information', 'Exception: OrganizationIdClient is required ', { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
                }
                var firstInstanceOfBillingInfoesHours = assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].Hours > 0 ? assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].Hours : 0;


                AssignmentCommonFunctionalityService.onChangeWorkerId(assignment, assignment.WorkOrders[0].WorkOrderVersions[0].PaymentInfoes[0], self.lists.listUserProfileWorker, firstInstanceOfBillingInfoesHours).then(function () {
                    AssignmentCommonFunctionalityService.onChangeOrganizationIdClient(assignment, assignment.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0], self.lists.listOrganizationClient).then(function () {
                        self.ValidationMessages = [];
                        var workOrderNewCommand = {
                            AtsSourceId: assignment.AtsSourceId,
                            AtsPlacementId: assignment.AtsPlacementId,
                            TemplateId: assignment.TemplateId,

                            UserProfileIdWorker: assignment.UserProfileIdWorker,
                            OrganizationIdInternal: assignment.OrganizationIdInternal,

                            StartDate: assignment.WorkOrders[0].StartDate,
                            EndDate: assignment.WorkOrders[0].EndDate,

                            WorkOrderVersion: assignment.WorkOrders[0].WorkOrderVersions[0]
                        };
                        AssignmentApiService.workOrderNew(workOrderNewCommand).then(
                            function (workOrderNewResponseSucces) {
                                $state.go('workorder.edit.core', { assignmentId: 0, workOrderId: 0, workOrderVersionId: workOrderNewResponseSucces.EntityId });
                            },
                            function (responseError) {
                                self.ValidationMessages = common.responseErrorMessages(responseError);
                                common.logValidationMessages(self.validationMessages);
                                self.workOrderCreateInProgress = false;
                            });
                    }, function (err) {
                        common.logError(err);
                        self.workOrderCreateInProgress = false;
                    });
                });
            }
        });

        angular.extend(self.lists, {
            listOrganizationClient: resolvetListOrganizationClient,
            listUserProfileWorker: resolvetListUserProfileWorker,
            listWorkOrderTemplates: resolvetListWorkOrderTemplate,
            listCodeValue: resolvetListCodeValue,
        });

        function onLoad() {
            if (!common.isEmptyObject(resolveAts) && resolveAts.AtsPlacementId > 0) {
                self.ats.SourceId = resolveAts.AtsSourceId;
                self.ats.PlacementId = resolveAts.AtsPlacementId;
                self.ats.StartDate = resolveAts.StartDate;
                self.ats.EndDate = resolveAts.EndDate;
                self.ats.OrganizationIdClient = resolveAts.AtsOrganizationIdClient;
                self.ats.OrganizationClientDisplayName = resolveAts.AtsOrganizationClientDisplayName;
                self.ats.UserProfileIdWorker = resolveAts.AtsUserProfileIdWorker;
                self.ats.UserProfileWorkerName = resolveAts.AtsUserProfileWorkerName;
                self.ats.BillingRates = resolveAts.BillingRates;
                self.ats.PaymentRates = resolveAts.PaymentRates;
                self.ats.BillingRateUnitId = resolveAts.BillingRateUnitId;
                self.ats.PaymentRateUnitId = resolveAts.PaymentRateUnitId;

                self.resultModel.SuggestedOrganizationIdClient = resolveAts.SuggestedOrganizationIdClient;
                self.resultModel.SuggestedUserProfileIdWorker = resolveAts.SuggestedUserProfileIdWorker;

                self.resultModel.MappedOrganizationIdClient = resolveAts.MappedOrganizationIdClient;
                self.resultModel.MappedUserProfileIdWorker = resolveAts.MappedUserProfileIdWorker;
            }
            ProfileApiService.removeInactiveProfile(self.lists.listUserProfileWorker);
        }

        onLoad();

        return self;
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.AssignmentCreateController = {

        resolveAts: ['$q', '$stateParams', 'AssignmentApiService', function ($q, $stateParams, AssignmentApiService) {
            var result = $q.defer();
            if ($stateParams.atsSourceId > 0 && $stateParams.atsPlacementId > 0) {
                AssignmentApiService.getAts($stateParams.atsSourceId, $stateParams.atsPlacementId).then(
                    function (responseSucces) {
                        result.resolve(responseSucces);
                    },
                    function (responseError) {
                        result.reject(responseError);
                    });
            }
            else {
                result.resolve({});
            }
            return result.promise;
        }],

        resolvetListWorkOrderTemplate: ['$q', 'TemplateApiService', function ($q, TemplateApiService) {
            var result = $q.defer();
            TemplateApiService.getTemplatesByEntityTypeId(ApplicationConstants.EntityType.Assignment).then(
                function (responseSucces) {
                    result.resolve(responseSucces.Items);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],

        resolvetDefaultAssignment: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();

            AssignmentApiService.getDefaultAssignment().then(
                function (responseSucces) {
                    responseSucces.WorkOrders[0].WorkOrderVersions[0].PaymentInfoes[0].PaymentContacts = [];
                    result.resolve(responseSucces);
                },
                function (responseError) {
                    result.reject(responseError);
                });

            return result.promise;
        }],

        resolvetListOrganizationClient: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getListOrganizationClient().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],

        resolvetListUserProfileWorker: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getListUserProfileWorker().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],

        resolvetListCodeValue: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var lists = {};

            var listLineOfBusiness = CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness);
            lists.listLineOfBusiness = _.filter(listLineOfBusiness, function (o) { return o.id != ApplicationConstants.LineOfBusiness.PermPlacement; });
            lists.listAtsSource = CodeValueService.getCodeValues(CodeValueGroups.AtsSource);
            lists.listRateType = CodeValueService.getCodeValues(CodeValueGroups.RateType);
            lists.listRateUnit = CodeValueService.getCodeValues(CodeValueGroups.RateUnit);
            lists.listProfileType = CodeValueService.getCodeValues(CodeValueGroups.ProfileType);

            result.resolve(lists);
            return result.promise;
        }],
    };

})(angular, Phoenix.App, Phoenix.Directives);