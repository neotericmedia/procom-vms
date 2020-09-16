(function (angular) {
    /**
     * service for some common time sheet utility methods
     */
    var serviceId = 'timesheetUtils';
    angular.module('phoenix.timesheet.services').factory(serviceId, ['dateFilter',
        function (dateFilter) {

            return {
                /**
                * @ngdoc function
                * @name timesheetUtils.isDate
                * @function
                * @description
                * checks if the object is a date
                * @param {obj} object to check
                */
                isDate: isDate,
                stringToDate: stringToDate,
                dateRange: dateRange,
                timesheet: timesheet,
                /**
                * @ngdoc function
                * @name timesheetUtils.findCurrentTimesheet
                * @function
                * @description
                * for a given collection of timesheets, return the one that is current for the provided date.
                * @param {timesheets} timesheets collection of timesheets to check
                * @param {date} checkdate the date to use to consider 'current'
                * @param {int} assignmentId - optional assignment id. If provided, will find current within that assignment, if not provided will get current for all provided
                */
                findCurrentTimesheet: findCurrentTimesheet
            };

            function sortByStartDate(itemA, itemB) {
                if (!itemB) {
                    return itemA.TimesheetStartDate;
                }
                else {
                    return itemA.TimesheetStartDate - itemB.TimesheetEndDate;
                }

            }

            function sortByAssignmentId(itemA, itemB) {
                if (!itemB) {
                    return itemA.WorkOrderId;
                }
                else {
                    return itemA.WorkOrderId - itemB.WorkOrderId;
                }


            }

            function checkBetweenDate(checkDate, item) {
                var startDate = item.TimesheetStartDate;
                var endDate = item.TimesheetEndDate;

                if (typeof startDate === "string") {
                    startDate = moment(item.TimesheetStartDate).toDate();
                }
                if (typeof endDate === "string") {
                    endDate = moment(item.TimesheetEndDate).toDate();
                }
                return (checkDate >= startDate && checkDate <= endDate.setDate(endDate.getDate() + 1));
            }

            function filterByWorkOrder(workOrderId, item) {
                return (item.WorkOrderId == workOrderId || workOrderId == []._ || workOrderId === "");
            }


            function findCurrentTimesheet(timesheets, checkDate, workOrderId) {
                var result;

                // first see if any older-active ones that are before todays date but not submitted

                var timesheetsBetween = _.chain(timesheets)
                    .filter(_.partial(filterByWorkOrder, workOrderId))
                    .filter(_.partial(checkBetweenDate, checkDate))
                    .sortBy(sortByStartDate)
                    .sortBy(sortByAssignmentId)
                    .value();

                if (timesheetsBetween.length > 0) {
                    result = timesheetsBetween[0];

                } else {
                    if (workOrderId === undefined) {
                        result = _.chain(timesheets)
                            .filter(function (i) { return moment(i.TimesheetStartDate).isBefore(checkDate); })
                            .sortBy(function (i) { return moment(i.TimesheetStartDate); })
                            .last()
                            .value();
                    } else {
                        var sortedWorkOrders = _.chain(timesheets)
                            .filter(_.partial(filterByWorkOrder, workOrderId))
                            .sortBy(sortByStartDate).value();
                        if (sortedWorkOrders.length > 0) {
                            if (moment(sortedWorkOrders[0].TimesheetStartDate).toDate() < checkDate) {
                                result = sortedWorkOrders[sortedWorkOrders.length - 1];
                            } else {
                                result = sortedWorkOrders[0];
                            }
                        }
                    }
                }
                return result;
            }

            function isDate(obj) {
                return Object.prototype.toString.call(obj) === '[object Date]';
            }

            function stringToDate(dateString) {
                if (this.isDate(dateString)) return new Date(dateString);
                var dateParts = dateString.split('-'),
                    year = dateParts[0],
                    month = dateParts[1],
                    day = dateParts[2];
                // set hour to 3am to easily avoid DST change
                return new Date(year, month - 1, day, 3);
            }

            function dateRange(first, last, initial, format) {
                var date, i, _i, dates = [];

                if (!format) format = ApplicationConstants.formatDateSorting;

                for (i = _i = first; first <= last ? _i < last : _i > last; i = first <= last ? ++_i : --_i) {
                    date = this.stringToDate(initial);
                    date.setDate(date.getDate() + i);
                    dates.push(dateFilter(date, format));
                }
                return dates;
            }

            function timesheet(dStrStart, dStrEnd, timesheetId) {
                var dStart = new Date(dStrStart);
                var dEnd = new Date(dStrEnd);

                var timesheets = [];
                var newTimesheet = {
                    id: [],
                    day: ''
                };

                if (dStart <= dEnd) {
                    for (var d = angular.copy(dStart) ; d <= dEnd; d.setDate(d.getDate() + 1)) {
                        var m = angular.copy(d);

                        newTimesheet.id = timesheetId;
                        newTimesheet.day = dateFilter(m, ApplicationConstants.formatDateSorting);
                        timesheets.push(angular.copy(newTimesheet));
                    }
                }
                return timesheets;
            }


        }
    ]);

}(angular));
