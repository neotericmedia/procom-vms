(function(services) {
  'use strict';

  var serviceId = 'AdminApiService';

  angular
    .module('phoenix.admin.services')
    .factory(serviceId, ['$q', 'common', 'phoenixapi', AdminApiService]);

  function AdminApiService($q, common, phoenixapi) {
    common.setControllerName(serviceId);

    var service = {
      //  Commands
      workflowMigration: workflowMigration,
      forceInvalidateCodeCache: forceInvalidateCodeCache,
      updatePaymentVersions: updatePaymentVersions
    };

    return service;

    // Commands
    function workflowMigration(command) {
      return phoenixapi.command('WorkflowMigration', command);
    }

    function forceInvalidateCodeCache() {
      return phoenixapi.command('ForceInvalidateCodeCache', {});
    }

    function updatePaymentVersions(ids) {
      return phoenixapi.command('UpdatePaymentVersions', {
        PaymentIds: ids
      });
    }
  }
})(Phoenix.Services);
