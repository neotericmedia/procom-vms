(function () {
    'use strict';

    var serviceId = 'BranchApiService';

    angular.module('phoenix.org.services').factory(serviceId, ['$q', 'phoenixapi', 'common', 'SmartTableService', BranchApiService]);

    function BranchApiService($q, phoenixapi, common, SmartTableService) {

        common.setControllerName(serviceId);

        var deferredCanCreate = $q.defer();

        var service = {
            //  Queries
            getBranches: getBranches,
            getBranchById: getBranchById,
            isCodeUnique: isCodeUnique,
            //  PageResult
            //  Commands
            branchSave: branchSave,
            //
            canCreate: deferredCanCreate.promise,
        };

        var pollingCounter = 0;
        getCanCreate();

        function getCanCreate() {
            var canCreate = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.BranchEdit);
            // On a browser page refresh, $rootScope.CurrentProfile is not available immediately, it is loaded independently later.
            if (angular.isDefined(canCreate)) {
                deferredCanCreate.resolve(canCreate);
            }
            else {
                if (pollingCounter < 10) {
                    setTimeout(getCanCreate, 500);
                    pollingCounter++;
                }
                else {
                    common.logError('Permissions not found.');
                    deferredCanCreate.reject();
                }
            }
        }

        return service;

        //  Queries
        function getBranchById(id) {
            return phoenixapi.query('branch/' + id);
        }

        function getBranches(tableState, oDataParams) {
            //return phoenixapi.query('branch/list');
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('branch/list' + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function isCodeUnique(code) {
            return phoenixapi.query('branch/isCodeUnique?code=' + code);
        }

        function branchSave(command) {
            return phoenixapi.command('BranchSave', command);
        }



    }
}());