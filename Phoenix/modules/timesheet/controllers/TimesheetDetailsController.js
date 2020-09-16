(function (app, angular) {
    'use strict';
    var controllerId = 'TimesheetDetailsController';
    angular.module('phoenix.timesheet.controllers').controller(controllerId,
        ['$scope', '$rootScope', '$filter', '$state', '$stateParams', 'common', 'TimesheetApiService', 'resolveTimesheetsAndWorkOrdersSummaryByCurrentUser', 'CodeValueService', 'Timesheet', 'dialogs', 'phoenixapi', 'phoenixsocket', 'WorkflowApiService', 'NoteApiService', 'DocumentApiService', '$timeout', 'NavigationService', 'timesheetUtils', 'CodeValueService', '$sce', 'resolveTimesheetsAndWorkOrdersSummary', 'previousState', TimesheetDetailsController]);

    function TimesheetDetailsController(
        $scope, $rootScope, $filter, $state, $stateParams, common, TimesheetApiService, resolveTimesheetsAndWorkOrdersSummaryByCurrentUser, codeValues, Timesheet, dialogs, phoenixapi, phoenixsocket, WorkflowApiService, NoteApiService, DocumentApiService, $timeout, NavigationService, timesheetUtils, CodeValueService, $sce, resolveTimesheetsAndWorkOrdersSummary, previousState) {
        var $q = common.$q;
        common.setControllerName(controllerId);

        angular.extend($scope, {
            timesheet: {},
            timesheets: [],
            unregisterFunctionList: [],
            viewLoading: true,
            statusList: {
                timesheetStatusList: [
                    { id: 1, text: 'New', groupName: 'TimesheetStatus' },
                    { id: 2, text: 'Draft', groupName: 'TimesheetStatus' },
                    { id: 3, text: 'Pending Review', groupName: 'TimesheetStatus' },
                    { id: 4, text: 'Approved', groupName: 'TimesheetStatus' },
                    { id: 5, text: 'Declined', groupName: 'TimesheetStatus' },
                    { id: 6, text: 'Pending Documents', groupName: 'TimesheetStatus' },
                    { id: 7, text: 'Withdrawn', groupName: 'TimesheetStatus' }
                ],
                rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
                woRateUnits: [
                    { id: 1, text: 'Hours', groupName: 'WORateUnits' },
                    { id: 2, text: 'Days', groupName: 'WORateUnits' },
                    { id: 3, text: 'Fixed', groupName: 'WORateUnits' }
                ]
            },
            options: {
                hoursInput: {
                    floatFrom: 0,
                    floatTo: 24,
                    decimalPlaces: 2
                }
            },

            getPdfStreamByPublicId: function (publicId) {
                return DocumentApiService.getPdfStreamByPublicId(publicId);
            },

            getDocumentUrl: function (pdfDocumentIdToPreview) {
                //http://helpx.adobe.com/x-productkb/multi/swf-file-ignores-stacking-order.html
                return $sce.trustAsResourceUrl($scope.getPdfStreamByPublicId(pdfDocumentIdToPreview) + '&wmode=transparent');
            },

            workOrderChanged: function (woId) {
                $scope.viewLoading = true;

                var result = timesheetUtils.findCurrentTimesheet(resolveTimesheetsAndWorkOrdersSummaryByCurrentUser, new Date(), woId);
                $state.go('timesheet.details', {
                    timesheetId: result.TimeSheetId,
                    workOrderId: result.WorkOrderId
                });
            },

            isWorkerView: function () {
                return resolveTimesheetsAndWorkOrdersSummaryByCurrentUser && resolveTimesheetsAndWorkOrdersSummaryByCurrentUser.length > 0;
            },

            workflowHistoryLength: 0,
            getWorkflowHistoryLength: function (count) {
                $scope.workflowHistoryLength = count;
            },

            workflowHistoryEnable: false,
            workflowHistoryOnClick: function () {
                $scope.workflowHistoryEnable = true;
            },

            workflowLastItem: {},
            getWorkflowLastItem: function (workflowLastItem) {
                $scope.workflowLastItem = workflowLastItem;
            },

            wfItems: [],
            getWorkflowHistory: function (timesheet) {
                if (!timesheet && $scope.timesheet) {
                    timesheet = $scope.timesheet;
                }
            },

            workflowPanelClose: function () {
                angular.element('#workflowHistory-panel').removeClass('in');
                angular.element('#workflowHistory-panel').addClass('collapse');
                $scope.workflowHistoryEnable = false;
            },

            clearValidations: function () {
                if ($scope.model && $scope.model.validationMessages) {
                    delete $scope.model.validationMessages;
                }
            },

            go: function (direction) {
                $scope.clearValidations();
                var i = $scope.index($scope.timesheet);
                if (direction == 'first') {
                    $scope.timesheet = $scope.timesheets[0];
                } else if (direction == 'prev') {
                    $scope.timesheet = $scope.timesheets[i - 1];
                } else if (direction == 'next') {
                    $scope.timesheet = $scope.timesheets[i + 1];
                } else if (direction == 'last') {
                    i = $scope.timesheets.length;
                    $scope.timesheet = $scope.timesheets[i - 1];
                }
                if ($scope.timesheet) {
                    $scope.viewLoading = true;
                    loadTimesheet($scope.timesheet.Id).then(function () {
                        //ToFix: should be false but causes issues with document upload and notes - need time to fix it
                        $state.go('timesheet.details', { timesheetId: $scope.timesheet.Id, workOrderId: $scope.timesheet.WorkOrderId }, { notify: false, reload: true });
                    });
                    $scope.dateModel.selectedId = $scope.timesheet.Id;

                }
            },

            resultName: function (taskResultId) {
                return codeValues.getCodeValueText(taskResultId, CodeValueGroups.TaskResult);
            },

            buttonTaskResultClass: function (taskResultId) {
                // Not supported
                return 'btn-deafult';
            },

            documentDelete: function (document) {
                var dlg = dialogs.confirm('Document Delete', 'This document will be deleted. Continue?');
                dlg.result.then(function (btn) {
                    var result = 'Confirmed';
                    DocumentApiService.deleteDocumentByPublicId(document.PublicId).then(function () {
                        $scope.getDocuments($scope.timesheet);
                    });
                }, function (btn) {
                    var result = 'Not Confirmed';
                });
            },
            documentUploadCallbackOnDone: function () {
                $scope.getDocuments($scope.timesheet);
            },

            changeTimesheet: function (timesheetId) {
                var tms = {

                };
                if (typeof timesheetId != "undefined") {
                    tms = _.find($scope.timesheets, function (ts) {
                        return ts.Id == timesheetId;
                    });
                } else {
                    tms = $scope.timesheets[0];
                }
                if (tms && tms.Id) {
                    $scope.viewLoading = true;

                    $scope.timesheet = tms;

                    if ($scope.timesheet.IsLoaded === false) {
                        $scope.viewLoading = true;
                        loadTimesheet($scope.timesheet.Id).then(function () {
                            //ToFix: should be false but causes issues with document upload and notes - need time to fix it
                            $state.go('timesheet.details', {
                                timesheetId: $scope.timesheet.Id,
                                workOrderId: $scope.timesheet.WorkOrderId
                            }, {
                                notify: false
                            });
                        });
                    } else {
                        $state.go('timesheet.details', {
                            timesheetId: $scope.timesheet.Id,
                            workOrderId: $scope.timesheet.WorkOrderId
                        }, {
                            notify: false
                        });
                        $scope.viewLoading = false;
                    }

                    $scope.dateModel.selectedId = $scope.timesheet.Id;

                    //$state.go('timesheet.details', {
                    //    timesheetId: tms.Id,
                    //    workOrderId: tms.WorkOrderId
                    //});
                } else {
                    $scope.viewLoading = false;
                }
            },

            executeAction: function (action, entityTypeId, entityId) {
                action.startLoading = function () {
                    $scope.viewLoading = true;
                    toggleServerInProgress(true);
                };

                WorkflowApiService.executeAction(action, entityTypeId, entityId).then(function (rsp) {
                    $scope.actionComplete = true;
                });
            },

            itemClass: function (item) {
                var result = 'fc-day';
                if (item.IsHoliday) {
                    result += ' fc-sun';
                    if (!item.isReadonly) {
                        result = result + ' time-entry';
                    } else {
                        result = result + ' empty';
                    }
                    return result;
                }
                result = result + ' fc-' + item.Date.toString('ddd').toLowerCase();
                if (item.Date.getDay() == (new Date()).getDay() && item.Date.getWeek() == (new Date()).getWeek()) {
                    result = result + ' fc-today';
                }
                if (!item.isReadonly) {
                    result = result + ' time-entry';
                } else {
                    result = result + ' empty';
                }
                return result;
            },

            commentPanelClose: function () {
                angular.element('#comment-panel').removeClass('in');
                angular.element('#comment-panel').addClass('collapse');
            },

            tsCellFocused: function (e) {
                $(e.target).focus();
            },
            tsTableBlurred: function () {
                $('#tsWfHistory').focus();
            },

            index: function (ts) {
                var idx = -1;
                _.find($scope.timesheets, function (tms, index) {
                    if (tms.Id == ts.Id) {
                        idx = index;
                        return true;
                    }
                    return false;
                });
                return idx;
            },

            unreadCount: function (notes) {
                var length = 0;
                $.each(notes, function (idx, item) {
                    if (!item.UnreadNote.IsRead ||
                    (item.UnreadNote.IsRead && item.IsCritical))
                        length += 1;
                });
                return length;
            },

            scrollDown: function () {
                $timeout(function () {
                    var scrl = angular.element(document.getElementById('noteScroll'));
                    if (scrl && scrl[0] && scrl[0].scrollHeight) {
                        var height = scrl[0].scrollHeight;
                        scrl.scrollTop(height);
                    }
                }, 0);
            },

            save: function () {
                toggleServerInProgress(true);
                $scope.clearValidations();
                TimesheetApiService.saveTimesheet({
                    WorkflowPendingTaskId: $scope.timesheet.WorkflowPendingTaskId > 0 ? $scope.timesheet.WorkflowPendingTaskId : -1,
                    TimeSheetId: $scope.timesheet.Id,
                    TimeSheetStatusId: $scope.timesheet.TimeSheetStatusId,
                    TimeSheetDetails: $scope.timesheet.Details
                }).then(
                function () {
                    loadTimesheet($scope.timesheet.Id);
                    common.logSuccess("Timesheet saved");
                },
                function (responseError) {
                    $scope.model.validationMessages = common.responseErrorMessages(responseError);
                    toggleServerInProgress(false);
                });
            },

            submit: function () {
                //$scope.viewLoading = true;
                toggleServerInProgress(true);
                $scope.clearValidations();
                TimesheetApiService.saveTimesheet({
                    WorkflowPendingTaskId: $scope.timesheet.WorkflowPendingTaskId > 0 ? $scope.timesheet.WorkflowPendingTaskId : -1,
                    TimeSheetId: $scope.timesheet.Id,
                    TimeSheetStatusId: $scope.timesheet.TimeSheetStatusId,
                    TimeSheetDetails: $scope.timesheet.Details
                }).then(
                function () {
                    //SergeyM: NOT ok- as soon as 'saveTimesheet' will be moved under workflow, then here need to update WorkflowPendingTaskId, or better to make saveTimesheet as part of submitTimesheet command
                    TimesheetApiService.submitTimesheet({
                        WorkflowPendingTaskId: $scope.timesheet.WorkflowPendingTaskId > 0 ? $scope.timesheet.WorkflowPendingTaskId : -1,
                        TimeSheetId: $scope.timesheet.Id
                    }).then(
                        function success(responseSucces) {
                            responseSucces.route = 'timesheet';
                            if (responseSucces) {
                                common.logSuccess('Timesheet submitted successfully.');
                            } else {
                                common.logError('There are not enough funds on this work order for the hours entered. Please contact your work order administrator.');
                            }
                        },
                        function error(responseError) {
                            toggleServerInProgress(false);
                            $scope.model.validationMessages = common.responseErrorMessages(responseError);
                        }
                    );
                },
                function (responseError) {
                    toggleServerInProgress(false);
                    $scope.model.validationMessages = common.responseErrorMessages(responseError);
                });
            },

            totalHours: function () {
                return _.reduce($scope.timesheet.ImportedDetails || [], function(acc, i) { return acc + i.UnitAmount; }, 0);
            },
        });

        function promiseOnGetTimesheetAndWorkOrdersDetailByTimeSheetId(timesheetId) {
            var deferred = $q.defer();
            var timesheetAndWorkOrdersDetailsByTimeSheetId = TimesheetApiService.getTimesheetAndWorkOrdersDetailByTimeSheetId(timesheetId,
                oreq.request()
                //.withExpand(['Days', 'Days/Details', 'ImportedDetails'])
                //.withSelect([
                //    'WorkflowPendingTaskId',
                //    'Id',
                //    'StartDate',
                //    'EndDate',
                //    'WorkOrderId',
                //    'WorkOrderNumberFull',
                //    'TimeSheetStatusId',
                //    'TimeSheetTypeId',
                //    'TotalHours',
                //    'ApproverName',
                //    'ClientName',
                //    'ContactFirstName',
                //    'ContactLastName',
                //    'WorkerProfileId',
                //    'WorkerName',
                //    'Description',
                //    'OrganizationIdClient',
                //    'PONumber',
                //    'POUnitsRemaining',
                //    'PORateUnitId',
                //    'Details/Id',
                //    'Details/Date',
                //    'Details/RateTypeId',
                //    'Details/RateUnitId',
                //    'Details/UnitAmount',
                //    'Details/IsHoliday',
                //    'ImportedDetails/Id',
                //    'ImportedDetails/RateTypeId',
                //    'ImportedDetails/RateUnitId',
                //    'ImportedDetails/UnitAmount', 
                //    'Days/Details/Id',
                //    'Days/Details/RateTypeId',
                //    'Days/Details/RateUnitId',
                //    'Days/Details/UnitAmount',
                //    ]
                //    )
                .url()).then(
                function (resolveSuccess) {
                    var timesheet = new Timesheet(resolveSuccess);
                    timesheet.IsLoaded = true;
                    timesheet.ApproverName = timesheet.ApproverName && timesheet.ApproverName.trim().length > 0 ? timesheet.ApproverName : "-";
                    timesheet.StartDate = moment(timesheet.StartDate).toDate();
                    timesheet.EndDate = moment(timesheet.EndDate).toDate();
                    timesheet.loadTaskSummary();
                    $scope.getDocuments(timesheet);
                    //$scope.getWorkflowHistory(timesheet);
                    deferred.resolve(timesheet);
                },
                function (resolveError) {
                    deferred.reject(resolveError);
                });
            return deferred.promise;
        }

        $q.all([promiseOnGetTimesheetAndWorkOrdersDetailByTimeSheetId($stateParams.timesheetId)]).then(
            function (rsp) {
                var timesheets;
                if (previousState.Name === 'transaction.view.billingdocuments') {
                    timesheets = _.filter(resolveTimesheetsAndWorkOrdersSummary, function (ts, index) {
                        return ts.WorkOrderId === parseInt($stateParams.workOrderId);
                    });
                }
                else {
                    timesheets = _.filter(resolveTimesheetsAndWorkOrdersSummaryByCurrentUser, function (ts, index) {
                    return ts.WorkOrderId === parseInt($stateParams.workOrderId);
                });
                }

                $scope.timesheet = rsp[0];

                if (common.isEmptyObject(timesheets)) {
                    $scope.timesheets[0] = $scope.timesheet;
                }
                else {
                    angular.forEach(timesheets, function (item) {
                        if (item.TimeSheetId === $scope.timesheet.Id) {
                            $scope.timesheets.push($scope.timesheet);
                        }
                        else {
                            $scope.timesheets.push({
                                Id: item.TimeSheetId,
                                StartDate: moment(item.TimesheetStartDate).toDate(),
                                EndDate: moment(item.TimesheetEndDate).toDate(),
                                WorkOrderId: item.WorkOrderId,
                                IsLoaded: false,
                            });
                        }
                    });
                }


                $scope.redirectOnComplete = $stateParams.redirectOnComplete || 'timesheet.search';
                $scope.actionComplete = false;

                $scope.workflow = {
                    runningStatus: {
                        IsRunning: false,
                    },
                };

                $scope.documentIdsToExclude = [ApplicationConstants.DocumentTypes.TimesheetPrint];

                $scope.workOrderId = $stateParams.workOrderId;
                $scope.noTimesheets = false;
                NavigationService.setTitle('thirdpartyimport-manage-timesheet');
                if (resolveTimesheetsAndWorkOrdersSummaryByCurrentUser.length === 0) {
                    $scope.noTimesheets = true;
                    NavigationService.setTitle('thirdpartyimport-manage-timesheet');
                }

                function getUniqueWorkOrders(wo) {
                    _.each(wo, function (e) {
                        e.Description = e.AssignmentId + '.' + e.WorkOrderNumber + ': ' + moment.utc(e.WorkOrderStartDate).format('L') + ' - ' + moment.utc(e.WorkOrderEndDate).format('L');
                    });
                    var mapped = _.map(wo, function (e) {
                        return {
                            WorkOrderId: e.WorkOrderId, Description: e.Description
                        };
                    });
                    mapped = _.uniqBy(mapped, 'WorkOrderId');
                    return mapped;
                }

                $scope.uniqueWorkOrders = getUniqueWorkOrders(resolveTimesheetsAndWorkOrdersSummaryByCurrentUser);

                if (!$scope.timesheet || !$scope.timesheets) {
                    $scope.viewLoading = false;
                    common.logError('Timesheet cannot be loaded. Redirecting in a few seconds ...');

                    $timeout(function () {
                        $state.go('timesheet.entry');
                    }, 3000);
                    return;
                }

                postLoadTimesheetEvents();
            },
            function (responseError) {
                common.responseErrorMessages(responseError);
                $state.go('timesheet.entry');
            });



        function loadTimesheet(timesheetId) {
            toggleServerInProgress(true);

            return promiseOnGetTimesheetAndWorkOrdersDetailByTimeSheetId(timesheetId).then(function (data) {
                $scope.timesheet = new Timesheet(data);
                $scope.timesheet.loadTaskSummary();

                var idx = -1;

                _.find($scope.timesheets, function (ts, index) {
                    if (ts.Id === $scope.timesheet.Id) {
                        idx = index;
                        return true;
                    }
                    return false;
                });

                if (idx > -1) {
                    $scope.timesheets[idx] = $scope.timesheet;
                }

                $scope.timesheet.IsLoaded = true;

                postLoadTimesheetEvents();

                //broadcastStatusChange($scope.timesheet.Id, $scope.timesheet);
                if ($scope.timesheet.Id && $scope.timesheet.Id > 0) {
                    $rootScope.$broadcast('event:timesheet-changed', { timesheetId: $scope.timesheet.Id, timesheet: $scope.timesheet });
                }
            })
                .finally(function () {
                    toggleServerInProgress(false);
                    $scope.viewLoading = false;
                });
        }

        var taskCompleteInProgress = false;
        function toggleServerInProgress(val) {
            if (taskCompleteInProgress === true && val === false) {
                return;
            }
            if (val) {
                $scope.workflow.runningStatus.IsRunning = true;
            } else {
                $scope.workflow.runningStatus.IsRunning = false;
            }
        }

        function getPoRemainingUnit(id) {
            switch (id) {
                case 1:
                    return "Hour(s)";
                case 2:
                    return "Day(s)";
                case 3:
                    return "Fixed";

                default:
                    return '';
            }
        }

        function postLoadTimesheetEvents() {
            //Tiny Calendar Section
            $scope.dateModel = {
                entity: []
            };
            $scope.dateModel.selectedId = $scope.timesheet.Id;
            $scope.dateModel.entity.timesheetDisplayed = $scope.timesheet.Id;
            $scope.dateModel.entity = angular.copy($scope.timesheets);
            $scope.dateModel.entity.minDate = $filter('date')($scope.timesheets[0].StartDate, ApplicationConstants.formatDateSorting);
            $scope.dateModel.entity.maxDate = $filter('date')($scope.timesheets[$scope.timesheets.length - 1].EndDate, ApplicationConstants.formatDateSorting);
            $scope.dateModel.date = $filter('date')($scope.timesheet.StartDate, ApplicationConstants.formatDateSorting);

            //Main Calendar Section

            $scope.viewLoading = false;

            $scope.timesheet.RateUnitId = ($scope.timesheet.Details && $scope.timesheet.Details[0] && $scope.timesheet.Details[0].RateUnitId) ? $scope.timesheet.Details[0].RateUnitId : 1;
            $scope.timesheet.totalAmountHeader = $scope.timesheet.RateUnitId == 2 ? "Total Days" : "Total Hours";
            $scope.timesheet.RemainingUnit = getPoRemainingUnit($scope.timesheet.PORateUnitId);
            //$scope[$scope.timesheet] = $scope.timesheet.POUnitsReamining;
        }

        var notesCount, docsCount;

        $scope.getComments = function (timesheet) {
            return NoteApiService.getNotes(ApplicationConstants.EntityType.TimeSheet, timesheet.Id).then(
                function success(responseSuccess) {
                    timesheet.notes = timesheet.notes || [];
                    var items = responseSuccess.Items;
                    $.each(items, function (index, item) {
                        item.time = item.CreatedDatetime;
                        if (!item.UnreadNote) {
                            item.UnreadNote = {
                                Id: 0,
                                IsRead: false,
                                NoteId: item.Id
                            };
                        }
                        timesheet.notes.push(item);
                    });
                    var length = $scope.unreadCount(timesheet.notes);
                    timesheet.notesLength = length;
                    notesCount = length;
                    timesheet.total = timesheet.notes.length;
                }
            );
        };

        $scope.getDocuments = function (timesheet) {
            return DocumentApiService.getEntityDocuments(ApplicationConstants.EntityType.TimeSheet, timesheet.Id).then(function success(response) {
                var items = response.Items;
                var returnItems = [];

                _.each(items, function (item) {
                    if (item.DocumentTypeId !== ApplicationConstants.DocumentTypes.TimesheetPrint) {
                        var nameIndex = item.Name.lastIndexOf("\\") + 1;
                        item.Name = item.Name.substring(nameIndex);
                        returnItems.push(item);
                    }
                });

                timesheet.documentsLength = returnItems.length;
                timesheet.documents = returnItems;
                docsCount = returnItems.length;
            });
        };

        $scope.getNotesLength = function (notes) {
            if ($scope.timesheet) {
                $scope.total = notes.length;
                var notesLength = $scope.unreadCount(notes);
                $scope.timesheet.notesLength = notesLength;
                notesCount = notesLength;
            }
        };

        $scope.getDocumentsLength = function (docsLength) {
            $scope.timesheet.documentsLength = docsLength;
            docsCount = docsLength;
        };

        $scope.unregisterFunctionList.push($rootScope.$on('event:timesheet-changed', function (evant, eventDetails) {
            if (typeof $scope.timesheet !== 'undefined' && $scope.timesheet.Id == eventDetails.timesheetId) {
                $scope.timesheet = eventDetails.timesheet;
                $scope.timesheet.notesLength = notesCount;
                $scope.timesheet.documentsLength = docsCount;
                $scope.timesheet.RateUnitId = ($scope.timesheet.Details && $scope.timesheet.Details[0] && $scope.timesheet.Details[0].RateUnitId) ? $scope.timesheet.Details[0].RateUnitId : 1;
                $scope.timesheet.totalAmountHeader = $scope.timesheet.RateUnitId == 2 ? "Total Days" : "Total Hours";
                $scope.timesheet.RemainingUnit = getPoRemainingUnit($scope.timesheet.PORateUnitId);
                $scope.timesheet.POUnitsReamining = $scope[$scope.timesheet];
            }
        }));
        var ConcurrencyNotifyEvent = true;
        $scope.unregisterFunctionList.push($rootScope.$on('broadcastEvent:WorkflowProcess', function (event, data) {
            if ($scope.actionComplete && !$scope.isWorkerView() && data.GroupingEntityId == $scope.timesheet.Id && data.GroupingEntityTypeId == ApplicationConstants.EntityType.TimeSheet) {
                $scope.viewLoading = false;
                $state.go($scope.redirectOnComplete);
            }
            if (data.IsOwner || !ConcurrencyNotifyEvent) {//remove "if (data.IsOwner || !ConcurrencyNotifyEvent)" after finish testing the logic for ConcurrencyNotifyEvent
            if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.TimeSheet && $scope.timesheet && data.GroupingEntityId == $scope.timesheet.Id) {
                if (data.TaskResult == ApplicationConstants.TaskResult.InsufficientPurchaseOrderFunds) {
                    common.logError("Insufficient PO funds"); // TODO: find a better way to do this
                }
                loadTimesheet($scope.timesheet.Id);
                $scope.getWorkflowHistory();
            }
            }
        }));

        $scope.$on('$destroy', function () {
            if ($scope.unregisterFunctionList && $scope.unregisterFunctionList.length) {
                for (var i = 0; i < $scope.unregisterFunctionList.length; i++) {
                    if (typeof $scope.unregisterFunctionList[i] === 'function') {
                        $scope.unregisterFunctionList[i]();
                    }
                }
            }

        });
        $scope.$watch('timesheet', function (newVal) {
            $scope.back = $scope.index(newVal) <= 0;
            $scope.forth = $scope.index(newVal) < 0 || $scope.index(newVal) >= $scope.timesheets.length - 1;
        });


    }
})(Phoenix.App, angular);
