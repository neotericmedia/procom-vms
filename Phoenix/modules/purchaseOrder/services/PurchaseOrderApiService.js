(function (services) {
    'use strict';

    var serviceId = 'PurchaseOrderApiService';

    angular.module('phoenix.purchaseOrder.services').factory(serviceId, ['$q', 'common', 'phoenixapi', 'SmartTableService', '$timeout', PurchaseOrderApiService]);

    function PurchaseOrderApiService($q, common, phoenixapi, SmartTableService, $timeout) {
        common.setControllerName(serviceId);

        var defaultPo = {
            "DepletedActionId": null,
            "Description": null,
            "Id": 0,
            "InvoiceRestrictionId": null,
            "IsDraft": true,
            "OrganizationId": null,
            "PurchaseOrderLines": [{
                "Amount": null,
                "CurrencyId": null,
                "DepletionOptionId": null,
                "DepletionGroupId": null,
                "Description": null,
                "EndDate": null,
                "Id": 0,
                "IsDraft": true,
                "IsTaxIncluded": null,
                "PurchaseOrderId": 0,
                "PurchaseOrderNumber": null,
                "PurchaseOrderLineNumber": null,
                "PurchaseOrderLineReference": null,
                "PurchaseOrderTransactions": null,
                "StartDate": null,
                "StatusId": 0,
                "WorkOrderPurchaseOrderLines": null,
                "CreatedDatetime": null
            }],
            "PurchaseOrderNumber": null,
            "StatusId": 1
        };

        var service = {
            //  Queries
            getSearchByTableState: getSearchByTableState,
            getDefault: getDefault,
            getByPurchaseOrderId: getByPurchaseOrderId,
            getByPurchaseOrderLineId: getByPurchaseOrderLineId,
            getByWorkOrderId: getByWorkOrderId,
            getByWorkOrderNumber: getByWorkOrderNumber,
            getByOrganizationIdClient: getByOrganizationIdClient,
            getPurchaseOrderLineByOrganizationIdClient: getPurchaseOrderLineByOrganizationIdClient,
            getByTransactionHeaderId: getByTransactionHeaderId,
            getWorkOrderPurchaseOrderLinesByWorkOrderId: getWorkOrderPurchaseOrderLinesByWorkOrderId,
            getWorkOrderPurchaseOrderLinesByTransactionHeaderId: getWorkOrderPurchaseOrderLinesByTransactionHeaderId,
            getWorkOrderPurchaseOrderLinesByPurchaseOrderId: getWorkOrderPurchaseOrderLinesByPurchaseOrderId,
            //  Commands
            purchaseOrderSave: purchaseOrderSave,
            purchaseOrderSubmit: purchaseOrderSubmit,
            purchaseOrderDiscard: purchaseOrderDiscard,
            purchaseOrderLineSave: purchaseOrderLineSave,
            workOrderPurchaseOrderLineSave: workOrderPurchaseOrderLineSave,
            workOrderPurchaseOrderLineStatusToActivate: workOrderPurchaseOrderLineStatusToActivate,
        };

        return service;

        //  Queries
        function getSearchByTableState(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('purchaseorder/getSearch?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function getDefault() {
            var deferred = $q.defer();
            deferred.resolve(angular.copy(defaultPo));
            return deferred.promise;
        }
        function getByPurchaseOrderId(purchaseOrderId) {
            return phoenixapi.query('purchaseorder?id=' + purchaseOrderId);
        }
        function getByPurchaseOrderLineId(purchaseOrderLineId, oDataParams) {
            return phoenixapi.query('purchaseorder/getByPurchaseOrderLineId/' + purchaseOrderLineId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getByWorkOrderId(workOrderId, oDataParams) {
            return phoenixapi.query('purchaseorder/getByWorkOrderId/' + workOrderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getByOrganizationIdClient(organizationIdClient, oDataParams) {
            return phoenixapi.query('purchaseorder/getByOrganizationIdClient/' + organizationIdClient + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getPurchaseOrderLineByOrganizationIdClient(organizationIdClient, oDataParams) {
            return phoenixapi.query('purchaseorder/getPurchaseOrderLineByOrganizationIdClient/' + organizationIdClient + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getByTransactionHeaderId(transactionHeaderId, oDataParams) {
            return phoenixapi.query('purchaseorder/getByTransactionHeaderId/' + transactionHeaderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getByWorkOrderNumber(assignmentId, workOrderNumber, oDataParams) {
            oDataParams = oDataParams || oreq.request()
               .withExpand(['PurchaseOrderLines/WorkOrderPurchaseOrderLines'])
               .withSelect([
                    'PurchaseOrderLines/CurrencyId',
                    'PurchaseOrderLines/StatusId',
                    'PurchaseOrderLines/StartDate',
                    'PurchaseOrderLines/EndDate',
                    'PurchaseOrderLines/WorkOrderPurchaseOrderLines/Id',
                    'PurchaseOrderLines/WorkOrderPurchaseOrderLines/PurchaseOrderId',
                    'PurchaseOrderLines/WorkOrderPurchaseOrderLines/PurchaseOrderNumber',
                    'PurchaseOrderLines/WorkOrderPurchaseOrderLines/PurchaseOrderLineNumber',
                    'PurchaseOrderLines/WorkOrderPurchaseOrderLines/Amount',
                    'PurchaseOrderLines/WorkOrderPurchaseOrderLines/AmountCommited',
                    'PurchaseOrderLines/WorkOrderPurchaseOrderLines/AmountSpent'
               ]).url();
            var result = $q.defer();
            phoenixapi.query('purchaseorder/getByWorkOrderNumber/' + workOrderNumber + '/forAssignmentId/' + assignmentId + '?' + oDataParams).then(
                    function (responseSuccess) {
                        var response = { Items: [] };
                        _.each(responseSuccess.Items, function (item) {
                            _.each(item.PurchaseOrderLines, function (pol) {
                                _.each(pol.WorkOrderPurchaseOrderLines, function (wopol) {
                                    response.Items.push({
                                        Id: wopol.Id,
                                        StartDate: pol.StartDate,
                                        EndDate: pol.EndDate,
                                        PurchaseOrderId: wopol.PurchaseOrderId,
                                        PurchaseOrderNumber: wopol.PurchaseOrderNumber,
                                        PurchaseOrderLineNumber: wopol.PurchaseOrderLineNumber,
                                        Amount: wopol.Amount,
                                        AmountCommited: wopol.AmountCommited,
                                        AmountSpent: wopol.AmountSpent,
                                        //CurrencyCode: _.find($scope.lists.currencyList, function (currency) { return currency.id == pol.CurrencyId; }).code,
                                        //PurchaseOrderLineStatusName: _.find($scope.lists.workOrderPurchaseOrderLineStatusList, function (status) { return status.id == pol.StatusId; }).code
                                    });
                                });
                            });
                        });
                        result.resolve(response);
                    },
                    function (responseError) {
                        result.reject(responseError);
                    });
            return result.promise;
        }

        function getWorkOrderPurchaseOrderLinesByWorkOrderId(workOrderId, oDataParams) {
            return phoenixapi.query('purchaseorder/getWorkOrderPurchaseOrderLinesByWorkOrderId/' + workOrderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getWorkOrderPurchaseOrderLinesByTransactionHeaderId(transactionHeaderId, tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('purchaseorder/getWorkOrderPurchaseOrderLinesByTransactionHeaderId/' + transactionHeaderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '') + '&' + tableStateParams);
        }

        function getWorkOrderPurchaseOrderLinesByPurchaseOrderId(purchaseOrderId, tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('purchaseorder/getWorkOrderPurchaseOrderLinesByPurchaseOrderId/' + purchaseOrderId + (oDataParams ? ('?' + oDataParams + '&') : '?') + tableStateParams);
        }

        //  Commands
        function purchaseOrderSave(command) {
            return phoenixapi.command('PurchaseOrderSave', command);
        }
        function purchaseOrderSubmit(command) {
            return phoenixapi.command('PurchaseOrderSubmit', command);
        }
        function purchaseOrderDiscard(command) {
            return phoenixapi.command('PurchaseOrderDiscard', command);
        }
        function purchaseOrderLineSave(command) {
            return phoenixapi.command('PurchaseOrderLineSave', command);
        }
        function workOrderPurchaseOrderLineSave(command) {
            return phoenixapi.command('WorkOrderPurchaseOrderLineSave', command);
        }
        function workOrderPurchaseOrderLineStatusToActivate(command) {
            return phoenixapi.command('WorkOrderPurchaseOrderLineStatusToActivate', command);
        }
    }
}(Phoenix.Services));