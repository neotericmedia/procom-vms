(function (filters) {
    'use strict';





    filters.filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field]);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    });

    filters.filter('orderWorkOrderVersionsByEffectiveDate', function () {
        return function (items, reverse, showReplacedEntities) {
            showReplacedEntities = showReplacedEntities || false;
            var filtered = [];
            angular.forEach(items, function (item) {
                if (showReplacedEntities) {
                    filtered.push(item);
                } else {
                    if (item.StatusId != ApplicationConstants.WorkOrderStatus.Replaced) {
                        filtered.push(item);
                    }
                }

            });
            filtered.sort(function (a, b) {
                var aEffectiveDate = parseInt(moment(a.EffectiveDate).format(ApplicationConstants.formatDateInt));
                var bEffectiveDate = parseInt(moment(b.EffectiveDate).format(ApplicationConstants.formatDateInt));
                return (aEffectiveDate > bEffectiveDate);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    });

    filters.filter('orderWorkOrdersByNumberAndVersion', function () {
        return function (items, reverse, showReplacedEntities) {
            showReplacedEntities = showReplacedEntities || false;
            var filtered = [];
            angular.forEach(items, function (item) {
                if (showReplacedEntities) {
                    filtered.push(item);
                } else {
                    if (item.StatusId != ApplicationConstants.WorkOrderStatus.Replaced) {
                        filtered.push(item);
                    }
                }

            });
            filtered.sort(function (a, b) {
                var aFilter = parseInt(a.WorkOrderNumber.toString() + a.WorkOrderVersion.toString());
                var bFilter = parseInt(b.WorkOrderNumber.toString() + b.WorkOrderVersion.toString());
                return (aFilter > bFilter);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    });

    filters.filter('purchaseOrderLinesFilteredByUsage', [function () {
        return function (inputList, excludeCollection) {
            var result = [];
            angular.forEach(inputList, function (i) {
                var exists = false;
                angular.forEach(excludeCollection, function (e) {
                    if (e.PurchaseOrderNumber == i.PurchaseOrderNumber && e.PurchaseOrderLineNumber == i.PurchaseOrderLineNumber) {
                        exists = true;
                    }
                });
                if (!exists) {
                    result.push(i);
                }
            });
            return result;
        };
    }]);

   

})(Phoenix.Filters);