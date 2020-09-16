/*global Phoenix: false, console: false*/

(function(angular, app) {
  'use strict';

  var controllerId = 'PaymentWireTransferBatchManagementController';

  angular
    .module('phoenix.payment.controllers')
    .controller(controllerId, [
      '$rootScope',
      '$scope',
      '$state',
      '$stateParams',
      'dialogs',
      'common',
      'commonDataService',
      'NavigationService',
      'PaymentApiService',
      'WorkflowApiService',
      'CodeValueService',
      'resolveModel',
      PaymentWireTransferBatchManagementController
    ]);

  function PaymentWireTransferBatchManagementController($rootScope, $scope, $state, $stateParams, dialogs, common, commonDataService, NavigationService, PaymentApiService, WorkflowApiService, CodeValueService, resolveModel) {
    common.setControllerName(controllerId);

    $scope.model = resolveModel;

    $scope.workflow = {
      WorkflowAvailableActions: [],
      SelectedActionId: null,

      onLoad: function() {
        $scope.workflow.WorkflowAvailableActions = [];
        angular.forEach($scope.model.WorkflowAvailableActions, function(action) {
          //if (action.CommandName == 'PaymentReleaseBatchActionTransferToBank' || action.CommandName == 'PaymentReleaseBatchActionRecall') {
          $scope.workflow.WorkflowAvailableActions.push(action);
          //}
        });

        if ($scope.model.BatchStatusId == ApplicationConstants.PaymentReleaseBatchStatus.Finalized || $scope.model.BatchStatusId == ApplicationConstants.PaymentReleaseBatchStatus.Transferred) {
          $scope.workflow.WorkflowAvailableActions.push({ Id: -1, Name: 'Generate Wire Transfer File', IsWorkflow: false });
        }
        $scope.model.fullBankName = $scope.model.InternalOrganizationBankAccountDescription !== '' ? $scope.model.InternalOrganizationBankAccountBankName + '-' + $scope.model.InternalOrganizationBankAccountDescription : $scope.model.InternalOrganizationBankAccountBankName;
      },

      actionButtonOnClick: function(action) {
        if (action && action.IsWorkflow === false) {
          window.location.assign(PaymentApiService.wireTransferCSVById($stateParams.batchId));
          $scope.workflow.SelectedActionId = null;
        } else {
          var dlg = dialogs.confirm('Batch Payments Action', 'Are you sure you want to ' + action.Name + ' these payments?');
          dlg.result.then(
            function(btn) {
              //var dialogResult = 'Confirmed';
              $rootScope.activateGlobalSpinner = true;
              WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.PaymentReleaseBatch, $stateParams.batchId);
              commonDataService.setWatchConfigOnWorkflowEvent(
                'payment.wiretransferbatch.management',
                'payment.wiretransferbatch.management',
                ApplicationConstants.EntityType.PaymentReleaseBatch,
                ApplicationConstants.EntityType.PaymentReleaseBatch,
                $stateParams.batchId,
                { batchId: $stateParams.batchId }
              );
            },
            function(btn) {
              //var dialogResult = 'Not Confirmed';
              $scope.workflow.SelectedActionId = null;
            }
          );
        }
      }
    };

    $scope.workflow.onLoad();

    $scope.lists = {
      paymentReleaseBatchStatusList: CodeValueService.getCodeValues(CodeValueGroups.PaymentReleaseBatchStatus),
      paymentStatusList: CodeValueService.getCodeValues(CodeValueGroups.PaymentStatus),
      workOrderWorkLocations: CodeValueService.getCodeValues(CodeValueGroups.Worksite, true),
      currencyList: CodeValueService.getCodeValues(CodeValueGroups.Currency, true)
    };

    NavigationService.setTitle('payments-managewire', [$scope.model.InternalOrganizationLegalName, $scope.model.InternalOrganizationBankAccountBankName, $scope.model.BatchNumber]);

    if (typeof $scope.viewLoading == 'undefined' || typeof $scope.stopSpinning == 'undefined') {
      $scope.viewLoading = false;
    } else {
      $scope.stopSpinning();
    }

    $scope.selectedCount = 0;
    $scope.totalItemCount = 0;
    $scope.currentPage = 1;
    $scope.totalItems = 0;
    $scope.pageSize = 30;
    $scope.pageCount = 1;
    $scope.items = [];
    $scope.isLoading = true;

    // Used for the loading bar
    $scope.loadItemsPromise = null;

    // Reloading data entry point
    $scope.callServer = function(tableState) {
      $scope.currentPage = $scope.currentPage || 1;

      var isPaging = false;

      // full refresh
      if (tableState.pagination.start === 0) {
        angular.element("table[data-st-table='items'] tbody").scrollTop(0);
        $scope.currentPage = 1;
        isPaging = false;
      }
      // pagination
      else {
        $scope.currentPage++;
        isPaging = true;
      }

      tableState.pagination.currentPage = $scope.currentPage;
      tableState.pagination.pageSize = $scope.pageSize;

      var oDataParams = oreq
        .request()
        .withExpand(['PaymentTransactions', 'WorkflowAvailableActions'])
        .withSelect([
          'Id',
          'PaymentNumber',
          'PaymentStatusId',
          'PaymentPayeeName',
          'Amount',
          'CurrencyId',
          'GroupedWorkerName',
          'PaymentTransactions/Id',
          'PaymentTransactions/PaymentTransactionNumber',
          'PaymentTransactions/PaymentTransactionPayeeName',
          //'PaymentTransactions/WorkerUserProfileId',
          'PaymentTransactions/WorkerName',
          'PaymentTransactions/WorksiteId',
          //'PaymentTransactions/PaymentDate',
          'PaymentTransactions/StartDate',
          'PaymentTransactions/EndDate',
          'PaymentTransactions/Amount',
          'PaymentTransactions/CurrencyId',

          'WorkflowAvailableActions/Id',
          'WorkflowAvailableActions/WorkflowPendingTaskId',
          'WorkflowAvailableActions/Name',
          'WorkflowAvailableActions/PendingCommandName',
          'WorkflowAvailableActions/CommandName',
          //'WorkflowAvailableActions/UiView',
          'WorkflowAvailableActions/IsActionButton',
          'WorkflowAvailableActions/TaskResultId',
          'WorkflowAvailableActions/DisplayButtonOrder',
          'WorkflowAvailableActions/TaskRoutingDialogTypeId'
        ])
        .url();

      var promise = PaymentApiService.getPaymentJoinedToTask($stateParams.batchId, tableState, null).then(
        function(response) {
          if (isPaging === true) {
            $scope.items = $scope.items.concat(response.Items);
            $scope.totalItemCount = response.Items.length;
          } else {
            $scope.totalItemCount = response.Items.length;
            $scope.items = response.Items;
          }

          angular.forEach($scope.items, function(payment) {
            if (typeof payment.workflow === 'undefined') {
              payment.workflow = {
                WorkflowAvailableActions: [],
                SelectedActionId: null,

                onLoad: function() {
                  angular.forEach(payment.WorkflowAvailableActions, function(action) {
                    if (action.CommandName == 'PaymentChangeStatusToRecalled') {
                      //if (action.CommandName != 'PaymentChangeStatusToPaid') {
                      payment.workflow.WorkflowAvailableActions.push(action);
                    }
                  });
                },

                actionButtonOnClick: function(action) {
                  var dlg = dialogs.confirm('Payment Action', 'Are you sure you want to ' + action.Name + ' this payment?');
                  dlg.result.then(
                    function(btn) {
                      //var dialogResult = 'Confirmed';
                      WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.Payment, payment.Id);
                      commonDataService.setWatchConfigOnWorkflowEvent(
                        'payment.wiretransferbatch.management',
                        'payment.wiretransferbatch.management',
                        ApplicationConstants.EntityType.Payment,
                        ApplicationConstants.EntityType.Payment,
                        payment.Id,
                        { batchId: $stateParams.batchId }
                      );
                    },
                    function(btn) {
                      //var dialogResult = 'Not Confirmed';
                      payment.workflow.SelectedActionId = null;
                    }
                  );
                }
              };
              payment.workflow.onLoad();
            }
          });
        },
        function(responseError) {
          common.responseErrorMessages(responseError);
        }
      );

      if (isPaging !== true) {
        $scope.loadItemsPromise = promise;
      }
    };
  }

  if (!app.resolve) app.resolve = {};
  app.resolve.PaymentWireTransferBatchManagementController = {
    resolveModel: [
      '$stateParams',
      'PaymentApiService',
      '$q',
      function($stateParams, PaymentApiService, $q) {
        var result = $q.defer();
        var oDataParams = oreq
          .request()
          .withExpand(['WorkflowAvailableActions'])
          .withSelect([
            'WorkflowPendingTaskId',
            'Id',
            'BatchNumber',
            'DepositDate',
            'CreateDate',
            'Amount',
            'CurrencyId',
            'BatchStatusId',
            'InternalOrganizationBankAccountBankName',
            'InternalOrganizationBankAccountDescription',
            'InternalOrganizationLegalName',

            'WorkflowAvailableActions/Id',
            'WorkflowAvailableActions/WorkflowPendingTaskId',
            'WorkflowAvailableActions/Name',
            'WorkflowAvailableActions/PendingCommandName',
            'WorkflowAvailableActions/CommandName',
            //'WorkflowAvailableActions/UiView',

            'WorkflowAvailableActions/IsActionButton',
            'WorkflowAvailableActions/TaskResultId',
            'WorkflowAvailableActions/DisplayButtonOrder',
            'WorkflowAvailableActions/TaskRoutingDialogTypeId'
          ])
          .url();
        PaymentApiService.getPaymentWireTransferBatch($stateParams.batchId, null, oDataParams).then(
          function(response) {
            result.resolve(response);
          },
          function(responseError) {
            result.reject(responseError);
          }
        );
        return result.promise;
      }
    ]
  };
})(angular, Phoenix.App);
