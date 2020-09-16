(function (angular, app) {
    'use strict';

    angular.module('phoenix.dashboard.controllers')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$scope', '$state', 'NavigationService', 'phoenixapi', 'resolveModel', 'phxLocalizationService'];

    function DashboardController($scope, $state, NavigationService, phoenixapi, resolveModel, phxLocalizationService) {

        var self = this;

        NavigationService.setTitle('dashboard');

        self.model = resolveModel.model;
        self.model.titleTemplateUrl = "/assets/dashboard/adf-custom-dashboard-title.html",
        self.model.addTemplateUrl = "/assets/dashboard/adf-custom-widget-add.html",
        self.model.editTemplateUrl = "/assets/dashboard/adf-custom-dashboard-edit.html",
        self.editable = resolveModel.editable;
        self.WidgetFilter = function (widget, type, model) {
            var user = $scope.CurrentProfile;
            switch (widget.category) {
                case ApplicationConstants.WidgetCategories.InternalOnly:
                    if (user.ProfileTypeId !== ApplicationConstants.UserProfileType.Internal) {
                        return false;
                    } else {
                        break;
                    }
                case ApplicationConstants.WidgetCategories.All:
                    break;
                default:
                    return false;
            }
            if (user.ProfileTypeId === ApplicationConstants.UserProfileType.Organizational) {

            } else if (user.ProfileTypeId === ApplicationConstants.UserProfileType.Internal) {

            } else if (user.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp) {

            } else if (user.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp) {

            } else if (user.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianInc) {

            } else if (user.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerSubVendor) {

            }
            else if (user.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesW2) {

            }
            else if (user.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) {

            }
            // Can access widget, now check if it's already on the page
            if (model.rows && angular.isArray(model.rows)) {
                for (var i = 0; i < model.rows.length; i++) {
                    if (model.rows[i] && model.rows[i].columns && angular.isArray(model.rows[i].columns)) {
                        for (var j = 0; j < model.rows[i].columns.length; j++) {
                            if (model.rows[i].columns[j] && model.rows[i].columns[j].widgets && angular.isArray(model.rows[i].columns[j].widgets)) {
                                for (var k = 0; k < model.rows[i].columns[j].widgets.length; k++) {
                                    if (model.rows[i].columns[j].widgets[k] && model.rows[i].columns[j].widgets[k].type && model.rows[i].columns[j].widgets[k].type == type) {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return true;
        }

        var eventFired = function (event, name, model) {
            if (model) {
                var command = {
                    Id: resolveModel.Id,
                    LastModifiedDatetime: resolveModel.LastModifiedDatetime,
                    WorkflowPendingTaskId: -1,
                    ModelJson: angular.toJson(model),
                };
                phoenixapi.command('DashboardSaveModel', command)
                    .then(function () { // retrieve new date
                        return phoenixapi.query('dashboard/model');
                    })
                    .then(function (response) {
                        resolveModel.LastModifiedDatetime = response.LastModifiedDatetime;
                    });
            }
        };

        $scope.$on('adfDashboardChanged', eventFired);
        $scope.$on('adfDashboardEditsCancelled', function () { $state.reload(); });
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.DashboardController = {

        resolveModel: ['$q', 'phoenixapi', 'common', function ($q, phoenixapi, common) {

            var modelGetStarted = {
                title: ".",
                structure: "4-4-4",
                rows: [{
                    columns: [
                        {
                            styleClass: "col-md-4",
                        },
                        {
                            styleClass: "col-md-4",
                            widgets: [{
                                fullScreen: false,
                                type: "ZZZ_getStarted",
                                title: "dashboard.getStarted.getStartedWidgetTitle"
                            }]
                        },
                        {
                            styleClass: "col-md-4",
                        }
                    ]
                }]
            };

            var modelEmpty = {
                title: ".",
                structure: "4-4-4",
                rows: [{
                    columns: [
                        {
                            styleClass: "col-md-4",
                        },
                        {
                            styleClass: "col-md-4",
                        },
                        {
                            styleClass: "col-md-4",
                        }
                    ]
                }]
            };

            var deferred = $q.defer();
            var resolved = {};

            phoenixapi.query('dashboard/model')
                .then(
                function (success) {
                    if (success) {
                        if (success.Value) {
                            resolved.Id = success.Id;
                            resolved.LastModifiedDatetime = success.LastModifiedDatetime;
                            resolved.model = angular.fromJson(success.Value);
                        }
                        else {
                            resolved.model = modelGetStarted;
                        }
                        resolved.editable = true;
                        deferred.resolve(resolved);
                    }
                },
                function (error) {
                    resolved.model = modelEmpty;
                    resolved.editable = false;
                    console.log(error, 'Dashboard access denied.');
                    deferred.resolve(resolved);
                }
                );

            return deferred.promise;
        }],
    };

})(angular, Phoenix.App);