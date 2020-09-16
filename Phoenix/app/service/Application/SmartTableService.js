(function (services, oRequest) {
    'use strict';

    var serviceId = 'SmartTableService';
    services.factory(serviceId, ['$q', SmartTableService]);

    function SmartTableService($q) {

        var service = {
            generateRequestObject: generateRequestObject
        };

        return service;

        function generateRequestObject(tableState) {

            var searchObj = tableState && tableState.search && tableState.search.predicateObject ? tableState.search.predicateObject : null;
            var sortObj = tableState && tableState.sort && tableState.sort.predicate ? tableState.sort.predicate + (tableState.sort.reverse ? " desc " : "") : null;
            var currentPage = tableState && tableState.pagination && tableState.pagination.currentPage ? tableState.pagination.currentPage : 1;
            var pageSize = tableState && tableState.pagination && tableState.pagination.pageSize ? tableState.pagination.pageSize : 30;
            var isDisabled = tableState && tableState.pagination && tableState.pagination.isDisabled ? tableState.pagination.isDisabled : null;

            // subtract one for 0 index;
            currentPage--;

            var oDataParams = oreq.request();

            if (searchObj && !angular.equals({}, searchObj)) {
                oDataParams = oDataParams.withFilter(oRequest.filter().smartTableObjectConverter(searchObj));
            }

            if (sortObj) {
                oDataParams = oDataParams.withOrderby(sortObj);
            }
            if (!(tableState && tableState.pagination && tableState.pagination.isDisabled === true)) {
                oDataParams = oDataParams.withTop(pageSize)
                    .withSkip(currentPage * pageSize)
                    .withInlineCount();
            }
            else {
                // even though we don't apply filters we need to know maximum amount of rows "InlineCount"
                oDataParams = oDataParams.withInlineCount();
            }
            return oDataParams;
        }

    }

}(Phoenix.Services, oreq));