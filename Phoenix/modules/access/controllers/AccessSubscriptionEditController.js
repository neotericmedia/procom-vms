(function (angular, app) {
    'use strict';

    angular.module('phoenix.access.controllers').controller('AccessSubscriptionEditController', AccessSubscriptionEditController);

    AccessSubscriptionEditController.$inject = ['phoenixsocket', '$rootScope', '$state', 'common', 'CodeValueService', 'commonDataService', 'dialogs', 'phoenixapi', 'NavigationService', 'AccessSubscriptionApiService', 'Subscription', 'InternalUsers', 'InternalOrganizations', 'ClientOrganizations', 'WorkflowApiService'];

    function AccessSubscriptionEditController(phoenixsocket, $rootScope, $state, common, CodeValueService, commonDataService, dialogs, phoenixapi, NavigationService, AccessSubscriptionApiService, Subscription, InternalUsers, InternalOrganizations, ClientOrganizations, WorkflowApiService) {

       

        var self = this;

        angular.extend(self, {
            //properties
            ValidationMessages: [],
            Subscription: Subscription,
            internalUsers: InternalUsers,
            branches: CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition1, true),
            lineOfBusinesses: CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness, true),
            subRestrictionTypes: CodeValueService.getCodeValues(CodeValueGroups.AccessSubscriptionRestrictionType, true),
            subscriptionTypes: CodeValueService.getCodeValues(CodeValueGroups.AccessSubscriptionType, true),
            subStatuses: CodeValueService.getCodeValues(CodeValueGroups.AccessSubscriptionStatus, true),
            clientOrganizations: ClientOrganizations,
            internalOrganizations: InternalOrganizations,
            subscriptionRestrictionsGroups: [],
            UserProfileSubscriber: null,
            subscribersList: [],
            internalsList: [],
            IsDateValid: null,
            allowCreate: true,
            isSubmitted: false,
            IsNotSubscriberPage: false,

            //methods
            init: init,
            actionButtonOnClick: actionButtonOnClick,
            subscriberChanged: subscriberChanged,
            subscriberCleaned: subscriberCleaned,
            subscriptionTypeCleared: subscriptionTypeCleared,
            subscriptionTypeChanged: subscriptionTypeChanged,
            addRestriction: addRestriction,
            datePickerCallback: datePickerCallback,
            fieldViewEditModeInit: fieldViewEditModeInit,
            subscriptionRestrictionsGrouped: subscriptionRestrictionsGrouped,
            filterGroupBySubscriptionRestrictionTypeId: filterGroupBySubscriptionRestrictionTypeId
        });

        function init() {

            WorkflowApiService.getWorkflowAvailableActions(self.Subscription, self.Subscription, ApplicationConstants.EntityType.AccessSubscription).then(function (success) {
                self.Subscription.AvailableActions = success && success[0] ? success[0].WorkflowAvailableActions : [];
            });

            angular.forEach(self.Subscription.AccessSubscriptionRestrictions, function (res) {
                res.CommissionRateRestrictionTypeId = res.AccessSubscriptionRestrictionTypeId;
            });

            self.isEditMode = self.Subscription.AccessSubscriptionStatusId === ApplicationConstants.AccessSubscriptionStatus.Draft;
             
            if(self.Subscription.UserProfileSubscriber ) {
                NavigationService.setTitle('subscription-viewedit' , [self.Subscription.UserProfileSubscriber]);
            } else {
                NavigationService.setTitle('subscription-new');
            }
 
            validateDates();

            self.fieldViewEditModeInit();

            var userId = $rootScope.CurrentProfile.Id;
            var userFound = self.internalUsers.some(function (i) { return i.Id == userId; });
            if (userFound && self.Subscription.UserProfileIdSubscriber === null) {
                self.Subscription.UserProfileIdSubscriber = userId;
            }
        }

        self.init();

        function onResponseError(responseError, errorMessage) {
            if (errorMessage && errorMessage.length) {
                common.logError(errorMessage);
            }
            self.ValidationMessages = common.responseErrorMessages(responseError);
            self.isSubmitted = false;
        }

        function onWorkflowEventSuccess(accessSubscriptionId, stateNameGoTo, message) {
            self.ValidationMessages = [];
            self.isSubmitted = false;

            if (message && message.length) {
                common.logSuccess(message);
            }

            commonDataService.setWatchConfigOnWorkflowEvent(
                stateNameGoTo,
                $state.current.name,
                ApplicationConstants.EntityType.AccessSubscription,
                ApplicationConstants.EntityType.AccessSubscription,
                accessSubscriptionId,
                { accessSubscriptionId: accessSubscriptionId }
            );
        }

        function subscriberCleaned() {
            if (self.subscribersList.length > 0) {
                self.internalUsers.push(self.subscribersList[0]);
            }
            self.internalUsers = _.chain(self.internalUsers)
                .orderBy(function (usr) { return usr.Contact.FullName.toLowerCase(); }).value();
            self.subscribersList = [];
            self.Subscription.UserProfileSubscriber = null;
            self.Subscription.UserProfileIdSubscriber = null;
        }

        function subscriberChanged(subscriber) {
            if (self.subscribersList.length > 0) {
                self.internalUsers.push(self.subscribersList[0]);
            }
            self.subscribersList = [];
            self.subscribersList.push(subscriber);
            self.Subscription.UserProfileSubscriber = subscriber.Contact.FullName;
            self.internalUsers = _.chain(self.internalUsers)
                .filter(function (user) { return user.Id !== subscriber.Id; })
                .orderBy(function (usr) { return usr.Contact.FullName.toLowerCase(); }).value();
        }

        function subscriptionTypeChanged() {
            self.Subscription.OrganizationIdClient = null;
            self.Subscription.InternalOrganizationDefinition1Id = null;
            self.Subscription.AccessSubscriptionRestrictions = [];
        }

        function subscriptionTypeCleared() {
            self.subscriptionTypeChanged();
            self.Subscription.AccessSubscriptionTypeId = null;
        }

        function addRestriction(type) {

            var subscriptionRestrictionDialogConfig = {
                title: "Add/Edit Restriction", commissionRateRestrictions: self.Subscription.AccessSubscriptionRestrictions, commissionRateRestrictionTypeId: type, viewType: 'Checkbox'
            };

            switch (type) {
                case ApplicationConstants.AccessSubscriptionRestrictionType.InternalOrganization:
                    subscriptionRestrictionDialogConfig.list = self.internalOrganizations;
                    subscriptionRestrictionDialogConfig.viewType = 'DropDown';
                    break;
                case ApplicationConstants.AccessSubscriptionRestrictionType.ClientOrganization:
                    subscriptionRestrictionDialogConfig.list = self.clientOrganizations;
                    subscriptionRestrictionDialogConfig.viewType = 'DropDown';
                    break;
                case ApplicationConstants.AccessSubscriptionRestrictionType.LineOfBusiness:
                    subscriptionRestrictionDialogConfig.list = self.lineOfBusinesses;
                    break;
                case ApplicationConstants.AccessSubscriptionRestrictionType.InternalOrganizationDefinition1:
                    subscriptionRestrictionDialogConfig.list = self.branches;
                    break;
            }

            dialogs.create('/Phoenix/modules/commission/views/CommissionRateAddRestrictionDialog.html', 'CommissionRateAddRestrictionDialogController', subscriptionRestrictionDialogConfig, {
                keyboard: false, backdrop: 'static', windowClass: 'restrictionTypeWindow'
            }).result.then(
                function (result) {
                    if (result.action == 'create') {
                        angular.forEach(result.commissionRateRestrictions, function (res) {
                            res.AccessSubscriptionRestrictionTypeId = res.CommissionRateRestrictionTypeId;
                        });
                        self.Subscription.AccessSubscriptionRestrictions = angular.copy(result.commissionRateRestrictions);
                    }
                }, function () {
                });
        }

        function subscriptionRestrictionsGrouped() {
            self.subscriptionRestrictionsGroups = [];
            return self.Subscription.AccessSubscriptionRestrictions;
        }

        function filterGroupBySubscriptionRestrictionTypeId(restriction) {
            var isNew = self.subscriptionRestrictionsGroups.indexOf(restriction.AccessSubscriptionRestrictionTypeId) == -1;
            if (isNew) {
                self.subscriptionRestrictionsGroups.push(restriction.AccessSubscriptionRestrictionTypeId);
            }
            return isNew;
        }

        function fieldViewEditModeInit() {

            var viewEditModeConfig = {

                funcToCheckViewStatus: function (modelPrefix, fieldName) {

                    if (self.Subscription.AccessSubscriptionStatusId === ApplicationConstants.AccessSubscriptionStatus.Draft) {
                        return ApplicationConstants.viewStatuses.edit;
                    }
                    else {
                        return ApplicationConstants.viewStatuses.view;
                    }
                },
                funcToPassMessages: function (message) {
                    common.logWarning(message);
                }
            };

            self.ptFieldViewStatus = viewEditModeConfig;
        }

        function datePickerCallback() {
            validateDates();
        }

        function validateDates() {
            self.IsDateValid = null;
            if (self.Subscription.StartDate && self.Subscription.EndDate) {
                if (self.Subscription.EndDate < self.Subscription.StartDate) {
                    self.IsDateValid = false;
                    common.logWarning("End Date must be greater than or equal to Start Date");
                }
                else {
                    self.IsDateValid = true;
                }
            }
        }

        self.onVersionClick = function (subscription, isOriginal) {

            var accessSubscriptionId = subscription.Id;

            self.IsNotSubscriberPage = false;

            if (isOriginal && subscription.SourceId) {
                accessSubscriptionId = subscription.SourceId;
            }
            if (!isOriginal && subscription.ChildId) {
                accessSubscriptionId = subscription.ChildId;
            }

            $state.go('access.subscription.edit', { accessSubscriptionId: accessSubscriptionId });
        };

        self.onChangeIsTimeRestricted = function () {
            if (!self.Subscription.IsTimeRestricted) {
                self.Subscription.StartDate = null;
                self.Subscription.EndDate = null;
            }
        };

        function actionButtonOnClick(action) {
            self.ValidationMessages = [];

            switch (action.CommandName) {
                case 'AccessSubscriptionSave':
                    AccessSubscriptionApiService.accessSubscriptionSave(self.Subscription).then(
                        function (responseSuccess) {
                            onWorkflowEventSuccess(responseSuccess.EntityId, $state.current.name, 'Subscription Saved');
                        },
                        function (responseError) {
                            onResponseError(responseError, 'Subscription save error.');
                        });
                    break;
                case 'AccessSubscriptionSubmit':
                    AccessSubscriptionApiService.accessSubscriptionSubmit(self.Subscription).then(
                        function (responseSuccess) {
                            onWorkflowEventSuccess(responseSuccess.EntityIdRedirect || responseSuccess.EntityId, $state.current.name, 'Subscription submitted successfully.');
                        },
                        function (responseError) {
                            onResponseError(responseError, 'Subscription is NOT valid');
                        });
                    break;
                case 'AccessSubscriptionDiscard':
                    dialogs.confirm('Discard Subscription', 'Do you want to discard changes to this Subscription?').result.then(
                        function () {
                            WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.AccessSubscription, $state.params.accessSubscriptionId).then(
                                function (responseSuccess) {
                                    if (responseSuccess.EntityIdRedirect) {
                                        onWorkflowEventSuccess(responseSuccess.EntityIdRedirect, $state.current.name);
                                    }
                                    //else {
                                    //    $state.go('access.subscription.search');
                                    //}
                                },
                                function (responseError) {
                                    onResponseError(responseError);
                                });
                        },
                        function () { }
                    );
                    break;
                default:
                    WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.AccessSubscription, $state.params.accessSubscriptionId)
                        .then(
                        function (responseSuccess) {
                            onWorkflowEventSuccess(responseSuccess.EntityIdRedirect || responseSuccess.EntityId, $state.current.name);
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
            }
        }

        phoenixsocket.onPublic('NonWorkflowEvent', function (event, data) {
            if ($rootScope.$state.includes('access.subscription.edit') && data.EntityTypeId == ApplicationConstants.EntityType.AccessSubscription && data.EntityId == $rootScope.$state.params.accessSubscriptionId && data.ReferenceCommandName === 'AccessSubscriptionDelete') {
				//$rootScope.$state.transitionTo('access.subscription.search', {}, { reload: true, inherit: true, notify: true });
				$rootScope.$state.transitionTo('ngtwo.m', { p: "contact/subscriptions" });
            }
        });

        self.goUp = function () {
            if (self.IsNotSubscriberPage) {
                self.IsNotSubscriberPage = false;
                $state.go("^");
            }
        };
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.AccessSubscriptionEditController = {

        Subscription: ['$q', '$stateParams', 'AccessSubscriptionApiService', function ($q, $stateParams, AccessSubscriptionApiService) {
            var result = $q.defer();
            var accessSubscriptionId = parseInt($stateParams.accessSubscriptionId, 10);
            AccessSubscriptionApiService.getAccessSubscription(accessSubscriptionId).then(
                function (success) {
                    result.resolve(success);
                },
                function (error) {
                    result.reject(error);
                }
            );
            return result.promise;
        }],

        InternalUsers: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            var internalDataParams = oreq.request()
                .withExpand(['Contact'])
                .withSelect(['Id', 'ProfileStatusId', 'Contact/FullName']).url();
            AssignmentApiService.getListUserProfileInternal(internalDataParams).then(
                function (response) {
                    var items = response.Items;
                    items = _.filter(items,
                        function (item) {
                            return item.ProfileStatusId === ApplicationConstants.ProfileStatus.Active ||
                                item.ProfileStatusId === ApplicationConstants.ProfileStatus.PendingChange;
                        });
                    result.resolve(items);
                }, function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],

        InternalOrganizations: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {
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

        ClientOrganizations: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {
            var result = $q.defer();
            CommissionApiService.getListOrganizationClient().then(
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