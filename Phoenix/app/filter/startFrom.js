/*global Phoenix: false, console: false*/


(function (filters) {
    'use strict';

    filters.filter('startFrom',[ function () {
        return function (input, start) {
            if (!input) {
                return [];
            }
            else {
                start = +start; //parse to int
                return input.slice(start);
            }
        };

    }]);
})(Phoenix.Filters);
