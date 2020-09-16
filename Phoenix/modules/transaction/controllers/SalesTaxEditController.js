/*global angular*/
/*global Phoenix*/
(function (angular, app) {
    "use strict";

    var controllerId = "SalesTaxEditController";

    function SalesTaxEditController($scope, $uibModalInstance, data, phoenixapi, CodeValueService) {

        function getSubdivisionName(id) {
            return CodeValueService.getCodeValue(id, CodeValueGroups.Subdivision).text;
        }

        function loadTaxes() {
            phoenixapi
                .query('SalesTaxVersionRate/getSalesTaxVersionRatesByOrganizationId/' + (data.OrganizationIdInternal || data.OrganizationId))
                .then(function (rsp) {
                    _.forEach(rsp.Items, function (e) {
                        var taxField = 'PaymentTransactionLineSalesTaxes';
                        if (angular.isDefined(data.BillingTransactionLineSalesTaxes)) {
                            taxField = 'BillingTransactionLineSalesTaxes';
                        }

                        var found = _.find(data[taxField], function (r) {
                            return r.SalesTaxId === e.SalesTaxId;
                        });

                        if (angular.isDefined(found)) {
                            e.Amount = found.Amount;
                        }
                    });
                    var grouped = _.groupBy(rsp.Items, 'SubdivisionId');
                    //var filtered = _.pick(grouped, data.SubdivisionId)
                    var mapped = _.map(grouped, function (val, key) {
                        return { SubdivisionId: key, SubdivisionName: getSubdivisionName(key), values: val };
                    });
                    $scope.model.taxList = mapped;

                    if (angular.isArray(mapped) && mapped.length > 0) {
                        $scope.model.selected = mapped[0];
                    }
                });
        }

        function load() {
            loadTaxes();
        }

        load();

        $scope.isLocked = function (tax) {
            return !tax.HasNumberAssigned || data.transactionLine.RateTypeId !== ApplicationConstants.RateType.Other;
        };

        $scope.model = {
            taxList: [],
            lineItem: data,
        };

        $scope.close = function() {
            $uibModalInstance.close({});
        };

        $scope.okTaxes = function () {
            if (data.transactionLine.RateTypeId !== ApplicationConstants.RateType.Other) {
                $scope.close();
            }

            $uibModalInstance.close($scope.model.selected.values);
        };
    }

    app.controller(controllerId, ['$scope', '$uibModalInstance', 'data', 'phoenixapi', 'CodeValueService', SalesTaxEditController]);

}(angular, Phoenix.App));