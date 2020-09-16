/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
(function (angular) {
    //'use strict';
    /**
       @name workflow.WorkflowEventsHistoryDirective
       @description
       Used to display a summary of workflows for a given record
       Attributes:
            data-entity-type-id        - entity type we are loading the summary for
            data-entity-id             - id of the entity we are loading the summary for
           
       example:   
       <workflow-events-history data-entity-type-id="ApplicationConstants.EntityType.TimeSheet"
                                                     data-entity-id="timesheet.Id"
                                                     data-approver-name="timesheet.ApproverName"
                                                     data-func-get-history-length="getWorkflowHistoryLength"
                                                     data-func-get-last-item="getWorkflowLastItem">
       </workflow-events-history>
       **/
    angular.module('phoenix.workflow.directives').directive('workflowEventsHistory', [function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                entityTypeId: "=",
                entityId: "=",
                approverName: "=",
                funcGetHistoryLength: "&?",
                funcGetLastItem: "&?",
                showHeader: "="
            },
            templateUrl: '/Phoenix/modules/workflow/directives/WorkflowEventsHistoryDirective.html',
            controller: 'WorkflowEventsHistoryDirective'
        };
    }
    ]);
    angular.module('phoenix.workflow.directives').controller('WorkflowEventsHistoryDirective', ['$attrs', '$rootScope', '$scope', 'WorkflowApiService', 'CodeValueService', 'common', 'WorkflowDataService',
                    function ($attrs, $rootScope, $scope, WorkflowApiService, codeValues, common, WorkflowDataService) {
                        $scope.unique = Math.floor(Math.random() * 1000000);
                        $scope.wfItems = [];
                        $scope.wfCount = 0;
                        var names = ["Correction", "Schedule Change", "Terminate", "Accounting Approval", "Submit Timesheet"];
                        $scope.viewLoading = true;
                        $scope.isInt = function (value) {
                            var er = /^[0-9]+$/;
                            return (er.test(value)) ? true : false;
                        };

                        $scope.displayHeader = $scope.showHeader === undefined ? true : $scope.showHeader;

                        $scope.historyLengthFunction = typeof ($scope.funcGetHistoryLength) !== 'undefined' ? $scope.funcGetHistoryLength() : null;

                        function toLocalTime(date) {
                            if (!date) return null;
                            date = moment(date).format('YYYY-MM-DD HH:mm:ss');
                            date = moment.utc(date).toDate();
                            date = moment(date).format('YYYY-MM-DD HH:mm:ss');
                            return date;
                        }

                        function spliceItemsByAt(items) {
                            angular.forEach(items, function (item, i) {
                                if (item.TaskTemplateDisplayHistoryEventName === "User Review") {
                                    item.TaskComments = [];
                                }
                                if (item.TaskTemplateDisplayHistoryEventName === "Declined" && items[i + 1]) {
                                    items.splice(i + 1, 1);
                                }
                                if ((item.TaskTemplateDisplayHistoryEventName === "Approved" || item.TaskTemplateDisplayHistoryEventName === "Discarded") && items[i + 1] && items[i + 1].TaskTemplateDisplayHistoryEventName === "Approved") {
                                    items.splice(i + 1, 1);
                                }
                            });

                            return items;
                        }

                        function splitUserActions(items) {
                            var result = [], temp = [], k = 0;
                            for (var i = 0; i < items.length; i++) {
                                items[i].TaskResultName = codeValues.getCodeValueText(items[i].TaskRoutingTaskResultId, CodeValueGroups.TaskResult);
                                items[i].isLastInGroup = false;
                                items[i].isFirstInGroup = false;
                                if (items[i].TaskTemplateDisplayHistoryEventName == "System Review") {
                                    items[i].LastModifiedByContactName = "System";
                                }
                                if (!items[i].TaskRoutingTaskResultId) {
                                    items[i].LastModifiedDatetime = null;
                                    items[i].LastModifiedByContactName = null;
                                }
                                var idx = items[i].TaskTemplateDisplayHistoryEventName.indexOf('@');
                                if (idx === 0) {
                                    var name = items[i].TaskTemplateDisplayHistoryEventName.substring(1);
                                    items[i].WorkflowTemplateName = items[i].TaskTemplateDisplayHistoryEventName = name;
                                    items[i].isFirstInGroup = true;
                                    items[i - 1].isLastInGroup = true;
                                    result[k] = temp;
                                    k++; temp = [];
                                }
                                temp.push(items[i]);
                            }

                            if (temp.length > 0) {
                                result[k] = temp;
                            }
                            return result;
                        }

                        var workflowHistoryModelBuilder = function (items) {
                            $scope.wfCount = items.length;

                            var eachCurrentItem = function (item) {
                                var taskName = item.TaskTemplateDisplayHistoryEventName;
                                item.CreatedDatetime = toLocalTime(item.CreatedDatetime);
                                item.LastModifiedDatetime = toLocalTime(item.LastModifiedDatetime);
                                item.Comment = '';
                                angular.forEach(item.TaskComments, function (taskComment) {
                                    item.Comment = item.Comment + (item.Comment.length > 0 ? ', ' : '') + taskComment.Comment;
                                });
                            };

                            for (var i = 0; i < items.length; i++) {
                                var currentItem = items[i];
                                if (currentItem !== [] && currentItem.length > 0) {
                                    _.each(currentItem, eachCurrentItem);
                                    var len = currentItem.length - 1;
                                    var approver = $scope.entityTypeId == ApplicationConstants.EntityType.TimeSheet ? $scope.approverName : currentItem[len].LastModifiedByContactName;
                                    $scope.wfItems[i] = {
                                        action: currentItem[0].WorkflowTemplateName,
                                        started: currentItem[0].CreatedDatetime,
                                        completed: currentItem[len].LastModifiedDatetime,
                                        approver: approver ? approver : '-',
                                        task: currentItem[len].TaskResultName ? '-' : currentItem[len].TaskTemplateDisplayHistoryEventName,
                                        status: codeValues.getCodeValueText(currentItem[len].TaskStatusId, CodeValueGroups.TaskResult),
                                        items: currentItem,
                                        entityTypeId: currentItem[0].WorkflowGroupingEntityTypeId
                                    };

                                    if ($scope.wfItems[i].approver === null || (currentItem[0].isFirstInGroup === true && currentItem.length === 1 && currentItem[0].isLastInGroup === false)) {
                                        $scope.wfItems[i].completed = '-';
                                    }

                                    if ($scope.wfItems[i].approver === null ||
                                        currentItem[len].isLastInGroup === true ||
                                        currentItem[len].TaskTemplateDisplayHistoryEventName === 'Approved' ||
                                        ($scope.entityTypeId == ApplicationConstants.EntityType.Organization && currentItem[len].TaskTemplateCommandName === 'OrganizationChangeStatusFromPendingReviewToActive') ||
                                        $scope.entityTypeId == ApplicationConstants.EntityType.UserProfile && currentItem[len].TaskTemplateCommandName === 'UserProfileApproval') {
                                        $scope.wfItems[i].approver = '-';
                                    }
                                }
                            }

                            if (typeof $scope.funcGetLastItem === 'function') {
                                var resultingFunction = $scope.funcGetLastItem();
                                if (typeof resultingFunction !== 'undefined') {
                                    var item = $scope.wfItems && $scope.wfItems.length ? $scope.wfItems[Math.max(items.length - 1, 0)] : null;
                                    resultingFunction(item);
                                }
                            }

                            if (typeof $scope.historyLengthFunction === 'function') {
                                $scope.historyLengthFunction($scope.wfCount);
                            }
                        };

                        $scope.getHistory = function () {
                            if ($scope.entityTypeId == ApplicationConstants.EntityType.WorkOrder) {
                                var workflowHistoryModel = WorkflowDataService.getWorkflowHistoryModel($scope.entityTypeId);
                                if (common.isEmptyObject(workflowHistoryModel) || workflowHistoryModel.entityId != $scope.entityId) {
                                    $scope.loadItemsPromise = WorkflowApiService.getWorkflowEventsHistory($scope.entityTypeId, $scope.entityId).then(function (response) {
                                        var Items = splitUserActions(response.Items);
                                        WorkflowDataService.setWorkflowHistoryModel($scope.entityTypeId, { entityId: $scope.entityId, data: Items });
                                        if (response.Items.length > 0) {
                                            workflowHistoryModelBuilder(Items);
                                        }
                                        $scope.loadItemsPromise = null;
                                    });
                                }
                                else {
                                    workflowHistoryModelBuilder(workflowHistoryModel.data);
                                    $scope.viewLoading = false;
                                }
                            }
                            else if ($scope.entityTypeId == ApplicationConstants.EntityType.TimeSheet) {
                                $scope.wfCount = 0;
                                $scope.wfItems = [];

                                var splitUserActionsForTimeSheet = function (items) {
                                    if (!items || !items.length) {
                                        return items;
                                    }

                                    var result = [], temp = [], j = 0;
                                    for (var k = 0; k < items.length; k++) {
                                        items[k].TaskResultName = codeValues.getCodeValueText(items[k].TaskRoutingTaskResultId, CodeValueGroups.TaskResult);
                                        if ((items[k].TaskTemplateDisplayHistoryEventName == "System Review" && items[k].TaskRoutingTaskResultId == 12) ||
                                            (items[k].TaskTemplateDisplayHistoryEventName == "User Action On Approval" && !items[k].TaskRoutingTaskResultId)) {
                                            delete items[k]; continue;
                                        }
                                        if (items[k].TaskTemplateDisplayHistoryEventName == "System Review" &&
                                            items[k].TaskRoutingTaskResultId == 13) {
                                            items[k].LastModifiedByContactName = "System";
                                            items[k].TaskResultName = "Approve";
                                        }
                                        if (items[k].TaskTemplateDisplayHistoryEventName == "Timesheet Approval" || items[k].TaskTemplateDisplayHistoryEventName == "Transaction Generated") {
                                            items[k].LastModifiedByContactName = "System";
                                        }
                                        if (!items[k].TaskRoutingTaskResultId) {
                                            items[k].LastModifiedDatetime = null;
                                            items[k].LastModifiedByContactName = null;
                                            items[k].AssignedOnContactName = (items[k].TaskTemplateDisplayHistoryEventName != "Timesheet Review") ? items[k].AssignedOnContactName : $scope.approverName;
                                        }
                                        else {
                                            items[k].AssignedOnContactName = null;
                                        }
                                        temp[j] = items[k];
                                        j++;
                                    }
                                    result[0] = temp;
                                    return result;
                                };

                                $scope.loadItemsPromise = WorkflowApiService.getWorkflowEventsHistory($scope.entityTypeId, $scope.entityId).then(function (response) {
                                    var Items = splitUserActionsForTimeSheet(response.Items) || [];
                                    workflowHistoryModelBuilder(Items);
                                    $scope.loadItemsPromise = null;
                                });
                            }
                            else {
                                $scope.wfCount = 0;
                                $scope.wfItems = [];
                                $scope.loadItemsPromise = WorkflowApiService.getWorkflowEventsHistory($scope.entityTypeId, $scope.entityId).then(function (response) {
                                    response.Items = spliceItemsByAt(response.Items);
                                    var Items = splitUserActions(response.Items) || [];
                                    workflowHistoryModelBuilder(Items);
                                    $scope.loadItemsPromise = null;
                                });
                            }
                        };

                        $scope.$watch('entityId', function (newVal, oldVal) {
                            if (newVal && $scope.entityTypeId) {
                                $scope.getHistory();
                            }
                        });

                        $rootScope.$on('broadcastEvent:WorkflowProcess', function (event, data) {
                            if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.TimeSheet && data.GroupingEntityId == $scope.entityId) {
                                $scope.getHistory();
                            }
                        });

                        $scope.rowClicked = function (entityTypeId, entityId, index) {
                            var id = entityTypeId + '_' + entityId + '_' + index + '_' + $scope.unique;
                            if ($('#workflowIcon' + id).hasClass('icon-chevron-up'))
                            {
                                $('#workflowIcon' + id).removeClass('chevron')
                                $('#workflowIcon' + id).removeClass('icon-chevron-up')
                                $('#workflowIcon' + id).addClass('icon-chevron-down')
                                $('#workflowBlock' + id).collapse('hide');
                            }
                            else if($('#workflowIcon' + id).hasClass('icon-chevron-down'))
                            {
                                $('#workflowIcon' + id).removeClass('icon-chevron-down')
                                $('#workflowIcon' + id).addClass('chevron')
                                $('#workflowIcon' + id).addClass('icon-chevron-up')
                                $('#workflowBlock' + id).collapse('show');
                            }
                        };


                    }
    ]);
})(angular);