(function (filters) {
    'use strict';

    filters.filter('displayPercentageView', ['common', function (common) {
        return function (item, decimalPlaces) {
            if (decimalPlaces === null || typeof decimalPlaces !== 'number')
                decimalPlaces = 2;
            if (Object.prototype.toString.call(item) === '[object Array]')
                return item.map(function (val, idx, arr) { return common.floatApplySpecifiedNumberOfDecimalPlaces(val, decimalPlaces) + "%"; });
            else
                return common.floatApplySpecifiedNumberOfDecimalPlaces(item, decimalPlaces) + "%";
        };
    }]);

})(Phoenix.Filters);