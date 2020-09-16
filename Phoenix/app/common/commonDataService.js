(function (services) {
    'use strict';

    var serviceId = 'commonDataService';
    services.factory(serviceId, ['$q', 'common', 'phoenixapi', commonDataService]);

    function commonDataService($q, common, phoenixapi) {

        common.setControllerName(serviceId);

        var service = {
            getWatchConfigOnWorkflowEvent: getWatchConfigOnWorkflowEvent,
            setWatchConfigOnWorkflowEvent: setWatchConfigOnWorkflowEvent,
            eraseWatchConfigOnWorkflowEvent: eraseWatchConfigOnWorkflowEvent,
            getCustomObjectByEntityTypeIdAndEntityId: getCustomObjectByEntityTypeIdAndEntityId,
            setCustomObjectByEntityTypeIdAndEntityId: setCustomObjectByEntityTypeIdAndEntityId,


            getListOrganizationInternal: getListOrganizationInternal,
            //, setListOrganizationInternal: setListOrganizationInternal, 
            delListOrganizationInternal: delListOrganizationInternal,
        };

        var data = {
            watchConfigOnWorkflowEvent: { stateNameGo: '', stateIncludesFilter: '', groupingEntityTypeId: 0, targetEntityTypeId: 0, targetEntityId: 0, stateParamMapping: {}, functionCallBack: null },
            scheduledProcesses: [],
            customObjectByEntityTypeIdAndEntityId: {},

            organizationsListInternal: [],
        };

        return service;
        function getWatchConfigOnWorkflowEvent() {
            return angular.copy(data.watchConfigOnWorkflowEvent);
        }
        function setWatchConfigOnWorkflowEvent(stateNameGo, stateIncludesFilter, groupingEntityTypeId, targetEntityTypeId, targetEntityId, stateParamMapping, functionCallBack) {
            data.watchConfigOnWorkflowEvent.stateNameGo = angular.copy(stateNameGo);
            data.watchConfigOnWorkflowEvent.stateIncludesFilter = angular.copy(stateIncludesFilter);
            data.watchConfigOnWorkflowEvent.groupingEntityTypeId = angular.copy(groupingEntityTypeId);
            data.watchConfigOnWorkflowEvent.targetEntityTypeId = angular.copy(targetEntityTypeId);
            data.watchConfigOnWorkflowEvent.targetEntityId = angular.copy(targetEntityId);
            data.watchConfigOnWorkflowEvent.stateParamMapping = angular.copy(stateParamMapping);
            data.watchConfigOnWorkflowEvent.functionCallBack = angular.copy(functionCallBack);
        }
        function eraseWatchConfigOnWorkflowEvent() {
            data.watchConfigOnWorkflowEvent = { stateNameGo: '', stateIncludesFilter: '', groupingEntityTypeId: 0, targetEntityTypeId: 0, targetEntityId: 0, stateParamMapping: {}, functionCallBack: null };
        }

        function getCustomObjectByEntityTypeIdAndEntityId(entityTypeId, entityId) {
            var result = data.customObjectByEntityTypeIdAndEntityId[entityTypeId] ? data.customObjectByEntityTypeIdAndEntityId[entityTypeId][entityId] : null;
            if (result) {
                return angular.copy(result);
            }
            else {
                return null;
            }
        }
        function setCustomObjectByEntityTypeIdAndEntityId(entityTypeId, entityId, obj) {
            data.customObjectByEntityTypeIdAndEntityId[entityTypeId] = data.customObjectByEntityTypeIdAndEntityId[entityTypeId] ? data.customObjectByEntityTypeIdAndEntityId[entityTypeId] : [];
            data.customObjectByEntityTypeIdAndEntityId[entityTypeId][entityId] = angular.copy(obj);
        }


        function delListOrganizationInternal() { data.organizationsListInternal = []; }

        function getListOrganizationInternal(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest']).url();
            var deferred = $q.defer();
            if (common.isEmptyObject(data.organizationsListInternal)) {
                phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole?' + oDataParams).then(
                    function (response) {
                        data.organizationsListInternal = angular.copy(response.Items);
                        deferred.resolve(data.organizationsListInternal);
                    },
                    function (responseError) {
                        data.organizationsListInternal = [];
                        deferred.reject(responseError);
                    }
                );
            } else {
                deferred.resolve(data.organizationsListInternal);
            }
            return deferred.promise;
        }

    }
}(Phoenix.Services));