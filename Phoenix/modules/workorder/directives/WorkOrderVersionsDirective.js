/// <reference path="../../../../libs/jquery/jquery-1.9.1.js" />
/// <reference path="../../../../libs/jquery/jquery-1.9.1.intellisense.js" />
/// <reference path="../../../../libs/angular/angular.js" />


(function (directives) {
    'use strict';

    directives.directive("workOrderVersions", function () {
        return {
            restrict: 'A',
            templateUrl: '/Phoenix/modules/workorder/views/DirectiveWorkOrderVersions.html',
            replace: true,
            scope: true,
            controller: ['$scope', '$state', 'NoteApiService', function ($scope, $state, NoteApiService) {               

                $scope.activityNotes = function () {
                    $state.go('workorder.edit.activity.notes');
                };

                var groupedWorkOrders = function (sourceWorkOrders) {
                    var filtered = _.sortBy(sourceWorkOrders, 'StatusId');
                    var tempWorkOrders = {};
                    for (var i = 0, len = filtered.length; i < len; i++) {
                        var value = filtered[i],
                            chkString = $scope.model.entity.Id + "." + value.WorkOrderNumber;
                        if (tempWorkOrders.hasOwnProperty(chkString)) {
                            for (var k = 0, kLen = value.WorkOrderVersions.length; k < kLen; k++) {
                                var detailValue = angular.copy(value.WorkOrderVersions[k]);
                                tempWorkOrders[chkString].WorkOrderVersions.push(detailValue);
                            }
                        } else {
                            tempWorkOrders[chkString] = value;
                        }
                    }
                    var tempFiltered = [];
                    angular.forEach(tempWorkOrders, function (value, key) {
                        tempFiltered.push(value);
                    });
                    return tempFiltered;
                };
                var grouped = groupedWorkOrders($scope.model.entity.WorkOrders);
                //scope.model.grouped = grouped;
                            

                function getUniqueWorkOrders(wo) {
                    _.each(wo, function (e, count) {
                        e.Counter = e.WorkOrderNumber;
                    });                   
                    var mapped = _.map(wo, function (e) {
                        return {
                            WorkOrder: e,
                            Counter: e.Counter
                        };
                    });
                    return mapped;
                }
                var uniqueWorkOrders = getUniqueWorkOrders(grouped);
                $scope.uniqueWorkOrders = uniqueWorkOrders;
                var workOrderVersionId = $state.params.workOrderVersionId;
                var workOrderVersionObject = _.find(grouped, function (wo) {
                    return _.find(wo.WorkOrderVersions, function (wov) {
                        return wov.Id == workOrderVersionId;
                    });
                });

                //$scope.Counter = workOrderVersionObject.Counter;
                $scope.Counter = workOrderVersionObject ? workOrderVersionObject.Counter : 1;

                $scope.model.grouped = [];
                var currentWorkOrder = {};

                function selectCurrentWorkOrder(counter) {
                    $scope.model.grouped = [];
                    currentWorkOrder = _.find(uniqueWorkOrders, function (wo) {
                        return wo.Counter == $scope.Counter;
                    });
                    $scope.model.grouped.push(currentWorkOrder.WorkOrder);
                }

                selectCurrentWorkOrder();

                $scope.workOrderVersionChanged = function (counter) {
                    $scope.Counter = counter;
                    selectCurrentWorkOrder(counter);

                    //var assignment = _.find(uniqueWorkOrders, function (wo) {
                    //    return wo.Counter == $scope.Counter;
                    //});
                    //var activeWorkOrderVersion = _.find(assignment.WorkOrder.WorkOrderVersions, function (wov) {
                    //    return wov.StatusId == ApplicationConstants.WorkOrderStatus.Active;
                    //});
                    //if (activeWorkOrderVersion)
                    //    $scope.workOrderVersionChange($scope.model.entity.Id, activeWorkOrderVersion.WorkOrderId, activeWorkOrderVersion.Id);

                    var activeWorkOrderVersion = [];

                    var assignment = _.find(uniqueWorkOrders, function (wo) {
                        return wo.Counter == $scope.Counter;
                    });
                    activeWorkOrderVersion = _.filter(assignment.WorkOrder.WorkOrderVersions, function (wov) {
                        return wov.StatusId == ApplicationConstants.WorkOrderStatus.Active;
                    });

                    var len = activeWorkOrderVersion.length - 1, version = {};
                    if (len == -1)
                        version = _.first(assignment.WorkOrder.WorkOrderVersions);
                    else
                        version = activeWorkOrderVersion[len];

                    if (version.Id) {
                        $scope.workOrderVersionChange($scope.model.entity.Id, version.WorkOrderId, version.Id);
                    }

                };
            }]
        };
    });

})(Phoenix.Directives);