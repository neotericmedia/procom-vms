/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />


(function (directives) {

    directives.directive('ptUiDate', ['$parse', '$timeout', function ($parse, $timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, controller) {
                var minDate,
                    maxDate,
                    format,
                    parseFormat;

                // assign formats
                if (attr.ptUiDate) {
                    format = attr.ptUiDate;
                    parseFormat = format.replace("m", "M");
                }
                else {
                    format = 'mm/dd/yy';
                    parseFormat = 'M/d/yyyy';
                }

                if (controller) {
                    $(element).datepicker({
                        dateFormat: format,
                        showButtonPanel: true,
                        changeMonth: true,
                        changeYear: true,
                        onSelect: function (date, obj) {
                            var cdate;
                            if (angular.isDate(date)) {
                                cdate = date;
                            } else {
                                cdate = Date.parse(date);
                                if (cdate === null) {
                                    cdate = Date.parseExact(date, parseFormat);
                                }
                            }

                            if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                                $timeout(function() {
                                    controller.$setViewValue(cdate);
                                }, 0);
                            }

                        }
                    });
                    controller.$render = function () {
                        var date = controller.$viewValue;
                        $(element).datepicker("setDate", date);

                        // assign 'infinity' class to the element
                        var cdate;
                        if (angular.isDate(date)) {
                            cdate = date;
                        } else {
                            cdate = Date.parse(date);
                            if (cdate === null) {
                                cdate = Date.parseExact(date, parseFormat);
                            }
                        }
                        if (!cdate) return;

                        if ((cdate.getFullYear() == 1 && cdate.getMonth() == 1 - 1 && cdate.getDate() == 1) ||
                            (cdate.getFullYear() == 1901 && cdate.getMonth() == 1 - 1 && cdate.getDate() == 1) ||
                            (cdate.getFullYear() == 9999 && cdate.getMonth() == 12 - 1 && cdate.getDate() == 31)) {
                            $(element).addClass('infinity');
                        }
                        else {
                            $(element).removeClass('infinity');
                        }

                    };
                }

                // identify datepicker min date
                if (attr.minDate) {
                    scope.$watch(attr.minDate, function (value) {
                        if (angular.isDate(value)) {
                            minDate = value;
                        } else {
                            minDate = Date.parse(value);
                            if (minDate === null || minDate === undefined) {
                                minDate = Date.parseExact(value, parseFormat);
                            }
                        }
                        if (minDate === null || minDate === undefined) {
                            minDate = new Date(1, 1 - 1, 1);
                        }

                        $(element).datepicker("option", "minDate", minDate);
                    });
                }

                // identify datepicker max date
                if (attr.maxDate) {
                    scope.$watch(attr.maxDate, function (value) {
                        if (angular.isDate(value)) {
                            maxDate = value;
                        } else {
                            maxDate = Date.parse(value);
                            if (maxDate === null || maxDate === undefined) {
                                maxDate = Date.parseExact(value, parseFormat);
                            }
                        }
                        if (maxDate === null || maxDate === undefined) {
                            maxDate = new Date(9999, 12 - 1, 31);
                        }
                        else {
                            maxDate = maxDate.add({ days: 1 });
                        }

                        $(element).datepicker("option", "maxDate", maxDate);
                    });
                }
            }
        };
    }]);


})(Phoenix.Directives);


