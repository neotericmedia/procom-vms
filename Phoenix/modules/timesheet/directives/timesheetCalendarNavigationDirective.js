/// <reference path="../../../../Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="../../../../Content/libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
(function (directives) {
    'use strict';
    /**
        @name directives.timesheetCalendarNavigation
        @description
        Used to navigate betwin timesheets in calendar controll
        Attributes:
             data-ng-model              - model.date
             data-min-date              - start date from first timesheet
             data-max-date              - end date from last timesheet        
             data-disabled-dates        - dates disabled in callendar eg. holidays
             data-selected-id           - id of selected timesheet
             data-timesheets            - all timesheets
             data-timesheet-displayed   - force timesheet id displayed (when selecting from outside of directive)
             
        example:   
        <div timesheet-calendar-navigation 
            ng-model="date" 
            selected-id="model.selectedId" 
            min-date="model.entity.minDate" 
            max-date="model.entity.maxDate" 
            timesheets="model.entity" 
            timesheet-displayed="model.entity.timesheetDisplayed">
        </div>
        **/
    
    directives.directive('timesheetCalendarNavigation', ['$locale', 'timesheetUtils', 'dateFilter', function ($locale, dateUtils, dateFilter) {
        return {
            require: 'ngModel',
            scope: {
                date: '=ngModel',
                minDate: '=',
                maxDate: '=',
                disabledDates: '=',
                selectedId: '=',
                timesheets: '=',
                timesheetDisplayed: '=',
                changeTimesheet: '&'
            },
            template:
              '<div class="pickadate">' +
                '<div class="pickadate-header">' +
                  '<div class="pickadate-controls">' +
                      '<a href="" class="pickadate-next" ng-click="changeMonth(1)" ng-show="allowNextMonth"><i class="icon-chevron-right"></i></a>' +
                      '<a href="" class="pickadate-prev" ng-click="changeMonth(-1)" ng-show="allowPrevMonth"><i class="icon-chevron-left"></i></a>' +
                  '</div>' +
                  '<h3 class="pickadate-centered-heading pickadate-regular">' +
                    '{{currentDate | date:"MMMM yyyy"}}' +
                  '</h3>' +
                  '<h3 class="pickadate-centered-heading pickadate-small">' +
                    '{{currentDate | date:"MMM yyyy"}}' +
                  '</h3>' +
                '</div>' +
                '<div class="pickadate-body">' +
                  '<div class="pickadate-main">' +
                    '<ul class="pickadate-cell">' +
                      '<li class="pickadate-head pickadate-regular" ng-repeat="dayName in dayNamesLong">' +
                        '{{dayName}}' +
                      '</li>' +
                      '<li class="pickadate-head pickadate-small" ng-repeat="dayName in dayNamesShort track by dayName.id">' +
                        '{{dayName.value}}' +
                      '</li>' +
                    '</ul>' +
                    '<ul class="pickadate-cell">' +
                      '<li ng-repeat="d in dates" class="{{d.className}}" ng-class="getClass(date, d.date, d.timesheetId)">' +
                        '<div ng-click="setTimesheet(d.timesheetId, d.date)" ng-model="date" ng-if="!isDateOutsideScope(d)" >' +
                            '<a data-value="{{d.date}}"  >' +
                              '{{d.date | date:"d"}}' +
                            '</a>' +
                        '</div>' +
                        //'<span ng-if="isDateDisabled(d)">' +
                        //  '{{d.date | date:"d"}}' +
                        //'</span>' +
                      '</li>' +
                    '</ul>' +
                  '</div>' +
                '</div>' +
              '</div>',

            link: function (scope, element, attrs, ngModel) {

                var indexOf = [].indexOf || function (item) {
                    for (var i = 0, l = this.length; i < l; i++) {
                        if (i in this && this[i] === item) return i;
                    }
                    return -1;
                };
                  
                var minDate = scope.minDate && dateUtils.stringToDate(scope.minDate),
                    maxDate = scope.maxDate && dateUtils.stringToDate(scope.maxDate),
                    disabledDates = scope.disabledDates || [],
                    currentDate = new Date();

                if (currentDate < dateUtils.stringToDate(scope.minDate))
                    currentDate = dateUtils.stringToDate(scope.minDate);
                if (currentDate > dateUtils.stringToDate(scope.maxDate))
                    currentDate = dateUtils.stringToDate(scope.maxDate);

                scope.dayNamesLong = $locale.DATETIME_FORMATS.SHORTDAY;
                scope.dayNamesShort = [{ id: 1, value: 'S' }, { id: 2, value: 'M' }, { id: 3, value: 'T' }, { id: 4, value: 'W' }, { id: 5, value: 'T' }, { id: 6, value: 'F' }, { id: 7, value: 'S' }];
                // Set the currentDate to the first of the month for proper navigation (22781)
                currentDate.setDate(1);
                scope.currentDate = currentDate;

                scope.isActive = function (date, compareDate) {
                    return date == compareDate;
                };

                scope.getClass = function (date, compareDate, timesheetId) {
                    var ret = "";
                    if (date == compareDate) {
                        //ret = 'pickadate-active ';
                    }
                    if (timesheetId == scope.selectedId || timesheetId == scope.timesheetDisplayed) {
                        ret += 'same-timesheet';
                    }
                    return ret;
                };

                var tempDate;
                var findDate = function (dateInRange) {
                    return dateInRange.day == tempDate;
                };

                scope.render = function (initialDate) {
                    initialDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 3);

                    var currentMonth = initialDate.getMonth() + 1,
                      dayCount = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0, 3).getDate(),
                      prevDates = dateUtils.dateRange(-initialDate.getDay(), 0, initialDate),
                      currentMonthDates = dateUtils.dateRange(0, dayCount, initialDate),
                      lastDate = dateUtils.stringToDate(currentMonthDates[currentMonthDates.length - 1]),
                      nextMonthDates = dateUtils.dateRange(1, 7 - lastDate.getDay(), lastDate),
                      allDates = prevDates.concat(currentMonthDates, nextMonthDates),
                      dates = [],
                      today = dateFilter(new Date(), ApplicationConstants.formatDateSorting);

                    // Add an extra row if needed to make the calendar to have 6 rows
                    if (allDates.length / 7 < 6) {
                        allDates = allDates.concat(dateUtils.dateRange(1, 8, allDates[allDates.length - 1]));
                    }

                    var nextMonthInitialDate = new Date(initialDate);
                    nextMonthInitialDate.setMonth(currentMonth);

                    scope.allowPrevMonth = !minDate || initialDate > minDate;
                    scope.allowNextMonth = !maxDate || nextMonthInitialDate < maxDate;
                    var datesInRange = [];
                    angular.forEach(scope.timesheets, function (timesheet) {
                        datesInRange = datesInRange.concat(dateUtils.timesheet(moment(timesheet.StartDate).toDate(), moment(timesheet.EndDate).toDate(), timesheet.Id));
                    });

                    for (var i = 0; i < allDates.length; i++) {
                        var className = null;
                        tempDate = allDates[i];

                        if (tempDate < scope.minDate || tempDate > scope.maxDate || dateFilter(tempDate, 'M') !== currentMonth.toString()) {
                            className = 'pickadate-disabled';
                        } else if (indexOf.call(disabledDates, tempDate) >= 0) {
                            className = 'pickadate-disabled pickadate-unavailable';
                        } else if (tempDate === today) {
                            className = 'pickadate-today';
                        }
                        if (tempDate < scope.minDate || tempDate > scope.maxDate) {
                            className = 'pickadate-outside-scope';
                        }

                        //var timesheet = _.find(datesInRange, function (x) {
                        //    return x.day == tempDate;
                        //});

                        var timesheet = _.find(datesInRange, findDate);

                        dates.push({ date: tempDate, className: className, timesheetId: (timesheet !== null && typeof timesheet !== "undefined") ? timesheet.id : "" });
                    }

                    scope.dates = dates;
                };



                scope.setTimesheet = function (id, date) {
                    if (id && scope.selectedId != id)
                        scope.changeTimesheet({timesheetId: id});
                    if (id)
                        scope.selectedId = id;
                    //ngModel.$setViewValue(date);                    
                };

                scope.$watch("selectedId", function(newVal, oldVal) {
                    if (newVal) {
                        var matchedTimesheet = _.find(scope.timesheets, function(x) {
                            return x.Id == newVal;
                        });
                        if (matchedTimesheet) {
                            currentDate.setMonth(matchedTimesheet.StartDate.getMonth());
                            scope.render(currentDate);
                        }
                    }
                });

                ngModel.$render = function () {
                    if ((scope.date = ngModel.$modelValue) && (indexOf.call(disabledDates, scope.date) === -1)) {
                        scope.currentDate = currentDate = dateUtils.stringToDate(scope.date);
                        scope.setTimesheet(scope.timesheetDisplayed, scope.date);
                    } else if (scope.date) {
                        // if the initial date set by the user is in the disabled dates list, unset it
                        scope.setDate(undefined);
                    }
                    scope.render(currentDate);
                };

                scope.changeMonth = function (offset) {
                    currentDate.setMonth(currentDate.getMonth() + offset);
                    scope.render(currentDate);
                };

                scope.isDateOutsideScope = function (dateObj) {
                    return (/pickadate-outside-scope/.test(dateObj.className));
                };
            }
        };   
    }]);
})(Phoenix.Directives);
