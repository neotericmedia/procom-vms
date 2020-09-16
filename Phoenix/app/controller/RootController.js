/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />

(function (app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'RootController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    app.controller(controllerId,
        ['$rootScope', '$scope', '$stateParams', '$state', '$transitions', 'CodeValueService', '$location', '$timeout', 'common', 'dialogs', 'UserApiService', 'AccountApiService', 'NavigationService', 'WorkflowApiService', 'phoenixauth', 'commonDataService', 'AssignmentDataService', 'phoenixsocket', 'phoenixapi', 'phxLocalizationService', RootController]);



    function RootController
        ($rootScope, $scope, $stateParams, $state, $transitions, CodeValueService, $location, $timeout, common, dialogs, UserApiService, AccountApiService, NavigationService, WorkflowApiService, phoenixauth, commonDataService, AssignmentDataService, phoenixsocket, phoenixapi, phxLocalizationService) {
        $scope.localization = {
            feedbackLabel: 'account.menu.feedbackLabel',
            manageAccountLabel: 'account.menu.manageAccountLabel',
            settingsLabel: 'account.menu.settingsLabel',
            signOutLabel: 'account.menu.signOutLabel',
            menuLabel: 'account.menu.menuLabel',
            editFavoritesLabel: 'account.menu.editFavoritesLabel',
            addToFavoritesLabel: 'account.menu.addToFavoritesLabel',
        };
        $scope.isProduction = window.isProduction;
        $scope.window = window;

        $scope.model = { tasks: [] };
        var disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting = false;

        var name = $state.$current.name;
        var homeAccountPattern = /(^home(\.|$)|^account(\.|$)|^register(\.|$)|^error(\.|$))|^accountforgot(\.|$)|^reset(\.|$)|^profile-selector(\.|$)|^logout(\.|$)|^view-email-in-browser(\.|$)|^document-view(\.|$)|^unavailable(\.|$)/;
        $scope.hideDash = name === '' || homeAccountPattern.test(name);

        $transitions.onStart({}, function (trans) {
            var identifier = trans.targetState().identifier();
            var transName = identifier.name || identifier;
            $scope.hideDash = homeAccountPattern.test(transName);
            $rootScope.isLoading = true;
            $rootScope.activateGlobalSpinner = true;
        });

        $transitions.onSuccess({}, function (trans) {
            var identifier = trans.targetState().identifier();
            var transName = identifier.name || identifier;
            $scope.hideDash = homeAccountPattern.test(transName);
            $rootScope.isLoading = false;
            $rootScope.activateGlobalSpinner = false;
        });
        $transitions.onError({}, function (trans) {
            $rootScope.isLoading = false;
            $rootScope.activateGlobalSpinner = false;
        });

        function unregisterFunctionList() {
            if ($rootScope.$state.unregisterFunctionList && $rootScope.$state.unregisterFunctionList.length) {
                for (var i = 0; i < $rootScope.$state.unregisterFunctionList.length; i++) {
                    if (typeof $rootScope.$state.unregisterFunctionList[i] === 'function') {
                        $rootScope.$state.unregisterFunctionList[i]();
                    }
                }
            }
        }

        phoenixsocket.onPrivate('HandlerExecuteException', function (event, data) {
            dialogs.notify(
                phxLocalizationService.translate('common.generic.handlerExecuteExceptionTitle')
                , '<strong>' + phxLocalizationService.translate('common.generic.handlerExecuteExceptionMessage') + '</strong><br/><br/>' + data.Message
                , { keyboard: false, backdrop: 'static' }
            ).result.then(function (btn) { }, function (btn) { });
        }, true);

        phoenixsocket.onPublic('WorkflowProcess', function (event, data) {
            $rootScope.$broadcast('broadcastEvent:WorkflowProcess', data);
        }, true);

        phoenixsocket.onPublic('NonWorkflowEvent', function (event, data) {
            if ($rootScope.$state.includes('org.edit') && data.EntityTypeId == ApplicationConstants.EntityType.Organization && data.EntityId == $rootScope.$state.params.organizationId && data.ReferenceCommandName === 'OrganizationDelete') {
                if (data.IsOwner) {
                    unregisterFunctionList();
                    $rootScope.$state.transitionTo('ngtwo.m', { p: "organization/search" });
                }
                else {
                    if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }
                    dialogs.notify('Organization update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                        unregisterFunctionList();
                        $rootScope.$state.transitionTo('ngtwo.m', { p: "organization/search" });
                    });
                }
            }
            else if ($rootScope.$state.includes('compliancedocument.documentrule.edit') && data.EntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.EntityId == $rootScope.$state.params.complianceDocumentRuleId && data.ReferenceCommandName === 'ComplianceDocumentRuleDelete') {
                if (data.IsOwner) {
                    unregisterFunctionList();
                    $state.go('ngtwo.m', { p: "compliance/document-rule/search/" + data.CustomId });
                }
                else {
                    if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }
                    dialogs.notify('Compliance Document Rule Deleted', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                        unregisterFunctionList();
                        $state.go('ngtwo.m', { p: "compliance/document-rule/search/" + data.CustomId });
                    });
                }
            }
            else if ($rootScope.$state.includes('commission.rate') && data.EntityTypeId == ApplicationConstants.EntityType.CommissionRateHeader && data.EntityId == $rootScope.$state.params.commissionRateHeaderId) {
                if (data.ReferenceCommandName === "CommissionRateDelete") {
                    if (data.IsOwner) {
                        unregisterFunctionList();
                        $rootScope.$state.transitionTo('ngtwo.m', { p: "commission/rates-search/" + data.CustomId });
                    } else {
                        dialogs.notify('Commission Rate update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                            unregisterFunctionList();
                            $rootScope.$state.transitionTo('ngtwo.m', { p: "commission/rates-search/" + data.CustomId });
                        });
                    }
                }
            }
            else if ($rootScope.$state.includes('workorder.edit') && data.EntityTypeId == ApplicationConstants.EntityType.WorkOrder && data.EntityId == $rootScope.$state.params.workOrderId && data.ReferenceCommandName === 'WorkOrderDelete') {
                var redirect = function (data) {
                    if (data.ParentEntityId > 0) {
                        $rootScope.$state.transitionTo('workorder.edit', {assignmentId: 0, workOrderId: data.ParentEntityId, workOrderVersionId: 0});
                    } else {
                        $rootScope.$state.transitionTo('ngtwo.m', { p: "workorder/search" });
                    }
                }
                if (data.IsOwner) {
                    unregisterFunctionList();
                    redirect(data);
                }
                else {
                    if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }
                    dialogs.notify('WorkOrder update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                        unregisterFunctionList();
                        redirect(data);
                    });
                }
            }

            if (data.IsOwner) {

            }
            else {
                if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }

                if (($rootScope.$state.current.name.indexOf('EditWorker') >= 0 || $rootScope.$state.current.name.indexOf('EditOrganizational') >= 0 || $rootScope.$state.current.name.indexOf('EditInternal') >= 0) && data.EntityTypeId == ApplicationConstants.EntityType.UserProfile && (data.EntityId == $rootScope.$state.params.profileId || data.CustomId == $rootScope.$state.params.profileId)) {
                    if (data.ReferenceCommandName === "UserProfileDiscard" || data.ReferenceCommandName === "UserProfileDelete") {
                        dialogs.notify('Profile update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                            unregisterFunctionList();
                            $rootScope.$state.transitionTo('ngtwo.m', { p: "contact/search" });
                        });
                    }
                    //if (data.ReferenceCommandName === "UserProfileStatusToActiveFromPendingChange") {
                    //    dialogs.notify('Profile update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                    //        unregisterFunctionList();
                    //        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: data.ParentEntityId, profileId: data.CustomId }, { reload: true, inherit: true, notify: true });
                    //    });
                    //}
                    //if (data.ReferenceCommandName === "UserProfileDuplicateToGetOriginal") {
                    //    dialogs.notify('Profile update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                    //        unregisterFunctionList();
                    //        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: data.ParentEntityId, profileId: data.EntityId }, { reload: true, inherit: true, notify: true });
                    //    });
                    //}
                    //if (data.ReferenceCommandName === "UserProfileStatusToDraft" || data.ReferenceCommandName === "UserProfileStatusToActive") {
                    //    dialogs.notify('Profile update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                    //        unregisterFunctionList();
                    //        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: data.ParentEntityId, profileId: data.EntityId }, { reload: true, inherit: true, notify: true });
                    //    });
                    //}
                    //if (data.ReferenceCommandName === "UserProfileSave" || data.ReferenceCommandName === "UserProfileSubmit") {
                    //    dialogs.notify('Profile update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                    //        unregisterFunctionList();
                    //        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: data.ParentEntityId, profileId: data.EntityId }, { reload: true, inherit: true, notify: true });
                    //    });
                    //}
                }
                else if ($rootScope.$state.includes('ContactCreate.Search') && data.EntityTypeId == ApplicationConstants.EntityType.UserProfile) {
                    if (data.ReferenceCommandName === "UserProfileDiscard" && data.ParentEntityId === 0) {
                        dialogs.notify('Profile update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                            unregisterFunctionList();
                            $rootScope.$state.transitionTo('ContactCreate.Search', {}, { reload: true, inherit: true, notify: true });
                        });
                    }
                }
                else if ($rootScope.$state.is('purchaseorder.edit.details') && data.EntityTypeId == ApplicationConstants.EntityType.PurchaseOrder && data.EntityId == $rootScope.$state.params.purchaseOrderId) {
                    if (data.ReferenceCommandName === "PurchaseOrderDiscard") {
                        dialogs.notify('Purchase Order update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                            unregisterFunctionList();
                            $rootScope.$state.transitionTo('purchaseorder.search', {}, { reload: true, inherit: true, notify: true });
                        });
                    }
                    if (data.ReferenceCommandName === "PurchaseOrderSave" || data.ReferenceCommandName === "PurchaseOrderSubmit") {
                        dialogs.notify('Purchase Order update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                            unregisterFunctionList();
                            $rootScope.$state.transitionTo('purchaseorder.edit.details', { purchaseOrderId: data.EntityId }, { reload: true, inherit: true, notify: true });
                        });
                    }
                }
                else if ($rootScope.$state.includes('purchaseorder.search') && data.EntityTypeId == ApplicationConstants.EntityType.PurchaseOrder) {
                    if (data.ReferenceCommandName === "PurchaseOrderDiscard" || (data.ReferenceCommandName === "PurchaseOrderSave" && data.EntityId === 0)) {
                        dialogs.notify('Purchase Order update information', data.Message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                            unregisterFunctionList();
                            $rootScope.$state.transitionTo('purchaseorder.search', {}, { reload: true, inherit: true, notify: true });
                        });
                    }
                }
            }
        }, true);

        phoenixsocket.onPrivate('BulkRegistrationInviteEvent', function (event, data) {
            if (data.CountTotal > 0) {
                $rootScope.globalSpinnerProgressText = data.CountFinishedWithSuccess + ' of ' + data.CountTotal + ' items processed.';
            }

            else {
                $rootScope.globalSpinnerProgressText = '';
                $rootScope.activateGlobalSpinner = false;

                if (data.LogWarning !== null && data.LogWarning.length > 0) {
                    common.logWarning(data.LogWarning);
                }

                if (data.LogSuccess !== null && data.LogSuccess.length > 0) {
                    common.logSuccess(data.LogSuccess);
                }
            }

        }, true);

        phoenixsocket.onPrivate('ScheduledProcessEvent', function (event, data) {
            if (data.LogWarning !== null && data.LogWarning.length > 0) {
                common.logWarning(data.LogWarning);
            }
            if (data.LogError !== null && data.LogError.length > 0) {
                common.logError(data.LogError);
            }
            if (data.StateNameToGo !== null &&
                data.StateNameToGo.length > 0 &&
                (data.StateNameToCancelRedirection === null || !$rootScope.$state.includes(data.StateNameToCancelRedirection)) &&
                data.LogSuccess !== null &&
                data.LogSuccess.length > 0) {

                var stateParamMapping = {
                };
                angular.forEach(data.StateParams, function (stateParam) {
                    stateParamMapping[stateParam.Name] = stateParam.Value;
                });
                if (data.ResultToDialog) {
                    dialogs.confirm('Scheduled Process is Finished', data.LogSuccess + '\n' + 'The current page will be redirected to the Scheduled Process resulting page. Continue?').result.then(
                        function (btn) {
                            var result = 'Confirmed';
                            var p = 'transaction/vms-preprocess/' + stateParamMapping.organizationIdInternal + '/' + stateParamMapping.organizationIdClient + '/' + stateParamMapping.documentPublicId;
                            if (!_.includes($rootScope.$state.params.p, p)) {
                                $rootScope.$state.transitionTo('ngtwo.m', { p: p });
                            }
                        }, function (btn) {
                            var result = 'Not Confirmed';
                        });
                }
                else {
                    if (data.LogSuccess !== null && data.LogSuccess.length > 0) {
                        common.logSuccess(data.LogSuccess);
                    }
                    $rootScope.$state.transitionTo(data.StateNameToGo, stateParamMapping, { reload: true, inherit: true, notify: true });
                }
            }
        }, true);

        phoenixsocket.onPrivate('WorkflowMigration_ExistingEntityPushToWorkflow', function (event, data) {
            var newLine = '\n<br/>';
            var workflowMigrationResult =
                newLine + 'Total: ' + data.CountTotal +
                newLine + 'Success: ' + data.CountSuccess +
                newLine + 'Exception: ' + data.CountException +
                newLine +
                newLine + 'Workflow Migrations By Groups:'
                ;
            angular.forEach(data.WorkflowMigrationGroupByCommandNames, function (group) {
                workflowMigrationResult = workflowMigrationResult +
                    newLine +
                    newLine + 'Group Name: "' + group.GroupCommandName + '"' +
                    newLine + 'Total: ' + group.CountTotal +
                    newLine + 'Success: ' + group.CountSuccess +
                    newLine + 'Exception: ' + group.CountException
                    ;
            });
            dialogs.notify('Workflow Migration Process is Finished', workflowMigrationResult, { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                unregisterFunctionList();
            });
        }, true);

        var broadcastEventProcessWorkflow = $rootScope.$on('broadcastEvent:WorkflowProcess', function (event, data) {
            var watchConfigOnWorkflowEvent = commonDataService.getWatchConfigOnWorkflowEvent();
            if (data.IsOwner) {
                if (watchConfigOnWorkflowEvent.stateNameGo.length > 0 &&
                    watchConfigOnWorkflowEvent.groupingEntityTypeId > 0 &&
                    watchConfigOnWorkflowEvent.targetEntityTypeId &&
                    watchConfigOnWorkflowEvent.targetEntityId &&
                    watchConfigOnWorkflowEvent.groupingEntityTypeId == data.GroupingEntityTypeId &&
                    watchConfigOnWorkflowEvent.targetEntityTypeId == data.TargetEntityTypeId &&
                    watchConfigOnWorkflowEvent.targetEntityId == data.TargetEntityId)
                {
                    if (watchConfigOnWorkflowEvent.groupingEntityTypeId === ApplicationConstants.EntityType.Assignment 
                        && watchConfigOnWorkflowEvent.stateIncludesFilter != 'workorder.edit.compliancedocuments')
                    {
                        AssignmentDataService.setAssignment({});
                    }
                    
                    if ($rootScope.$state.includes(watchConfigOnWorkflowEvent.stateIncludesFilter)) {

                        unregisterFunctionList();

                        if ($rootScope.$state.includes('payroll.salesTaxDetails')) {
                            watchConfigOnWorkflowEvent.stateParamMapping.salesTaxHeaderId = data.GroupingEntityId;
                        }
                        else if ($rootScope.$state.includes('org.vmsfee')) {
                            watchConfigOnWorkflowEvent.stateParamMapping.vmsFeeHeaderId = data.GroupingEntityId;
                        }
                        else if ($rootScope.$state.includes('org.rebate')) {
                            watchConfigOnWorkflowEvent.stateParamMapping.rebateHeaderId = data.GroupingEntityId;
                        }

                        if (data.TaskResult != ApplicationConstants.TaskResult.WovActionDelete) // Handled in wo delete event
                        {
                            if (watchConfigOnWorkflowEvent.functionCallBack && typeof watchConfigOnWorkflowEvent.functionCallBack === "function") {
                                watchConfigOnWorkflowEvent.functionCallBack(data);
                            }
                            else {
                                $rootScope.$state.transitionTo(watchConfigOnWorkflowEvent.stateNameGo, watchConfigOnWorkflowEvent.stateParamMapping, { reload: true, inherit: true, notify: true });
                            }
                        }
                    }
                }
                else if (watchConfigOnWorkflowEvent.stateNameGo.length > 0 &&
                    watchConfigOnWorkflowEvent.groupingEntityTypeId > 0 &&
                    watchConfigOnWorkflowEvent.targetEntityTypeId &&
                    watchConfigOnWorkflowEvent.targetEntityId &&
                    watchConfigOnWorkflowEvent.groupingEntityTypeId == data.GroupingEntityTypeId &&
                    $rootScope.$state.includes('transaction.view') && data.GroupingEntityId == $rootScope.$state.params.transactionHeaderId &&
                    ($rootScope.$state.includes(watchConfigOnWorkflowEvent.stateIncludesFilter)
                        //|| ($rootScope.$state.includes(watchConfigOnWorkflowEvent.stateNameGo) && data.ReferenceCommandName === "TransactionBillingInvoiceSwitchToTransactionBilling")
                    )) {
                    //  http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=16249
                    //  do not filter 'TransactionBillingInvoiceSwitchToTransactionBilling'
                    if (data.ReferenceCommandName === "FinancialTransactionRecordOnTransactionHeaderReversed" ||
                        data.ReferenceCommandName === "PaymentTransactionDecisionOnDirectDepositOrCheque"
                        //|| data.ReferenceCommandName === "TransactionBillingInvoiceDecisionAutoRelease"
                    ) {
                        return;
                    }
                    unregisterFunctionList();
                    $rootScope.$state.transitionTo(watchConfigOnWorkflowEvent.stateNameGo, watchConfigOnWorkflowEvent.stateParamMapping, { reload: true, inherit: true, notify: true });
                }
            }
            else {
                if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }

                if ($rootScope.$state.includes('workorder.edit') &&
                    data.GroupingEntityTypeId == ApplicationConstants.EntityType.Assignment &&
                    data.TargetEntityTypeId == ApplicationConstants.EntityType.WorkOrderVersion &&
                    data.TargetEntityId == $rootScope.$state.params.workOrderVersionId &&
                    data.TaskResult != ApplicationConstants.TaskResult.WovActionDelete // Handled in wo delete event
                ) {
                    dialogs.notify('This Work Order has been updated', 'The work order will be refreshed to provide the most up to date data', { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                        AssignmentDataService.setAssignment({});
                        unregisterFunctionList();
                        $rootScope.$state.transitionTo($rootScope.$state.current.name, { assignmentId: 0, workOrderId: 0, workOrderVersionId: $rootScope.$state.params.workOrderVersionId }, { reload: true, inherit: true, notify: true });
                    });
                }
                else if ($rootScope.$state.includes('transaction.manual') &&
                    data.GroupingEntityTypeId == ApplicationConstants.EntityType.TransactionHeader &&
                    data.TargetEntityTypeId == ApplicationConstants.EntityType.TransactionHeader &&
                    data.TargetEntityId == $rootScope.$state.params.transactionHeaderId) {
                    dialogs.notify('This Transaction has been updated', 'The transaction will be refreshed to provide the most up to date data', { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                        AssignmentDataService.setAssignment({});
                        unregisterFunctionList();
                        $rootScope.$state.transitionTo($rootScope.$state.current.name, { transactionHeaderId: $rootScope.$state.params.transactionHeaderId }, { reload: true, inherit: true, notify: true });
                    });
                }
                else if ($rootScope.$state.includes('transaction.view') &&
                    data.GroupingEntityTypeId == ApplicationConstants.EntityType.TransactionHeader &&
                    data.GroupingEntityId == $rootScope.$state.params.transactionHeaderId) {

                    if ([
                        'FinancialTransactionRecordOnTransactionHeaderReversed',//(N'40006', N'4',	N'1', N'Financial Record'
                        //'TransactionBillingInvoiceSwitchToTransactionBilling',//(N'40056', N'4',	N'1', null
                        'PaymentTransactionDecisionOnDirectDepositOrCheque'//(N'40075', N'4',	N'1', null
                        //'TransactionBillingInvoiceDecisionAutoRelease'//(N'40050', N'4',	N'1', N'Invoice Auto Released'
                    ].indexOf(data.ReferenceCommandName) < 0) {
                        return;
                    }

                    dialogs.notify('This Transaction has been updated', 'The transaction will be refreshed to provide the most up to date data' +
                        ' (' + data.ReferenceCommandName + ')',//ToDo Sergey: remove this line when bug will be fixed: http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=21925
                        { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                            AssignmentDataService.setAssignment({});
                            unregisterFunctionList();
                            $rootScope.$state.transitionTo($rootScope.$state.current.name, { transactionHeaderId: $rootScope.$state.params.transactionHeaderId }, { reload: true, inherit: true, notify: true });
                        });
                }
                else if ($rootScope.$state.includes('org.edit') &&
                    data.GroupingEntityTypeId == ApplicationConstants.EntityType.Organization &&
                    data.TriggerEntityTypeId == ApplicationConstants.EntityType.Organization && data.TriggerEntityId == $rootScope.$state.params.organizationId) {
                    dialogs.notify('This Organization has been updated', 'The Organization will be refreshed to provide the most up to date data', { keyboard: false, backdrop: 'static' }).result.then(function (btn) {
                        unregisterFunctionList();
                        $rootScope.$state.transitionTo($rootScope.$state.current.name, { organizationId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
                    });
                }
            }
        });

        $scope.$on("$destroy", function () {
            broadcastEventProcessWorkflow();
        });

        //phoenixapi.PhoenixNavigationCache().then(function (data) { $scope.NavigationCache = data; });

        $rootScope.isLoading = false;
        $rootScope.ApplicationConstants = ApplicationConstants;
        $rootScope.CodeValueGroups = CodeValueGroups;

        var routeChangeStartHandler = $rootScope.$on("$routeChangeStart", function () {
            $rootScope.isLoading = false;
        });

        $scope.$on("$destroy", function () {
            routeChangeStartHandler();
        });

        var routeChangeSuccessHandler = $rootScope.$on("$routeChangeSuccess", function () {
            $rootScope.isLoading = false;
        });

        $scope.$on("$destroy", function () {
            routeChangeSuccessHandler();
        });

        var rootChangeErrorHandler = $rootScope.$on("$rootChangeError", function () {
            $rootScope.isLoading = false;
        });

        $scope.$on("$destroy", function () {
            rootChangeErrorHandler();
        });

        $scope.changeWorkSpace = function () {
            var workspaceCode = $('#user-workspaces').val();
            if ($scope.window.navigation.workspace.Code != workspaceCode) {
                NavigationService.initWorkspace(workspaceCode);
            }
        };

        $scope.showMenu = function (containerId, itemId, menuContainerId, menuItemId) {
            $(menuContainerId + " li").removeClass("active");
            $(menuContainerId).find(menuItemId).addClass('active');

            $(containerId + " .tab-pane").removeClass("active");
            $(containerId).find(itemId).addClass('active');
        };

        $scope.displayLoginModal = function () {
            $rootScope.$broadcast("event:show-login-modal");
            $scope.showLoginModal = true;
        };

        $scope.logoff = function () {
            $state.go('logout');
            // phoenixauth.logout();
            // $location.path("/");
            // window.location = window.location.origin;
            // AccountApiService.logoff().then(function (data) {
            //     UserApiService.getContext();
            //     $location.path("/");
            // });
        };

        $scope.onMenuOpenChange = function (open) {
            if (open) {
                $scope.closeLeftMenu();
                $scope.setScrollLock(true);
            } else {
                $scope.setScrollLock(false);
            }
        };

        $scope.closeLeftMenu = function () {
            if ($('#menu-toggler').hasClass('active')) {
                $('#menu-toggler').trigger(ace.click_event);
            }
        };

        $scope.setScrollLock = function (lockScroll) {
            if (lockScroll) {
                $('html, body').addClass('noScroll');
            } else {
                $('html, body').removeClass('noScroll');
            }
        };

        var authLoginRequiredHandler = $rootScope.$on("event:auth-loginRequired", function () {
            $scope.displayLoginModal();
        });

        $scope.$on("$destroy", function () {
            authLoginRequiredHandler();
            onUserSwitchedHandler();
        });

        //applicationHub.connect();

        $scope.setProfile = function (profile) {
            phoenixauth.setCurrentProfile(profile.DatabaseId, profile.ProfileId).then(function (result) {
                if (result) {
                    var url = $state.href('ngtwo.m', { p: 'activity-centre' }, { absolute: true });
                    if (url) {
                        window.location.href = url;
                    }
                    window.location.reload();
                }
            });
        }

        var onUserSwitchedHandler = $rootScope.$on('event:profile-changed', function (event, data) {
            var url = data ? (data.rootUrl || "/") : "/";
            if ($location.path().toUpperCase() !== url.toUpperCase()) {
                $timeout(function () {
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $location.path(url);
                    }
                }, 0);
            }
        });

        $scope.openFeedbackDialog = function () {
            dialogs.create('/Phoenix/templates/Template/Account/FeedbackDialog.html', 'FeedbackDialogController', {}, { keyboard: false, backdrop: 'static', windowClass: 'responsiveModal feedbackDialog' });
        };
    }

})(Phoenix.App);