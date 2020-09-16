(function (services) {
    'use strict';

    var serviceId = 'WorkflowDataService';
    angular.module('phoenix.workflow.services').factory(serviceId, ['common', WorkflowDataService]);

    function WorkflowDataService(common) {

        common.setControllerName(serviceId);

        var service = {
            getWorkflowHistoryModel: getWorkflowHistoryModel,
            setWorkflowHistoryModel: setWorkflowHistoryModel,
        };

        var data = {
            workflowHistoryModel: {},
        };
        return service;

        function getWorkflowHistoryModel(entityTypeId) { return angular.copy(data.workflowHistoryModel[entityTypeId]); }
        function setWorkflowHistoryModel(entityTypeId, workflowHistoryData) { data.workflowHistoryModel[entityTypeId] = angular.copy(workflowHistoryData); }
    }

}(Phoenix.Services));
