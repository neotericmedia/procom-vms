(function (angular) {
    'use strict';

    Date.prototype.addDays = function addDays(days) {
        this.setDate(this.getDate() + parseInt(days));
        return this;
    };

    Date.prototype.getWeek = function () {
        var firstJanuary = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - firstJanuary) / 86400000) + firstJanuary.getDay() + 1) / 7);
    };

    angular.module('phoenix.timesheet.models').factory('ModelBase', ['ValidationMessages',
        function (ValidationMessages) {
            var ModelBase = Class.extend({
                init: function (json) {
                    //angular.extend(this, json);
                    angular.extend(this, json);
                    var validationMessages = new ValidationMessages();
                    if (this.ValidationMessages) {
                        validationMessages = new ValidationMessages(this.ValidationMessages);
                    }
                    this.ValidationMessages = validationMessages;
                },
                validate: function () {
                    return this.name + ': ' + message;
                }
            });
            return ModelBase;
        }

    ]);

    angular.module('phoenix.timesheet.models').factory('ValidationMessages', ['ValidationMessage',
        function (ValidationMessage) {
            var ValidationMessages = Class.extend({
                init: function (errors) {
                    var that = this;
                    this.messages = [];
                    if (errors) {
                        angular.forEach(errors, function (error) {
                            that.messages.push(new ValidationMessage(error));
                        });
                    }
                },
                add: function (message) {
                    this.messages.push(message);
                },
                clear: function () {
                    this.messages = [];
                },
                isValid: function () {
                    // we can put more comprehensive logic here to filter
                    // warnings
                    return this.messages.length === 0;
                }
            });
            return ValidationMessages;

        }
    ]);

    angular.module('phoenix.timesheet.models').factory('ValidationMessage', [
        function () {

            var ValidationMessage = Class.extend({
                init: function (property, message, type) {
                    if (property && typeof property === 'object') {
                        this.property = property.PropertyName;
                        this.message = property.Message;
                        this.type = property.Category;
                    } else {
                        this.property = property;
                        this.message = message;
                        this.type = 'error';
                        if (type) this.type = type;
                    }
                }
            });
            return ValidationMessage;
        }
    ]);

    angular.module('phoenix.timesheet.models').factory('Timesheet', ['ModelBase', 'TimesheetWeeks', 'WorkflowApiService', '$q',
        function (ModelBase, TimesheetWeeks, WorkflowApiService, $q) {
            var timesheets = [];
            var Timesheet = ModelBase.extend({
                init: function (obj) {
                    this.accessCache = [];
                    this._super(obj);
                    this.TaskSummary = {};
                    this._weeklyDetails = undefined;
                },
                // extend the validate method
                validate: function () {
                    this._super.validate();

                    // perform additional validation logic here
                },
                handleTaskStarted: function (ngEvent, data) {
                    if (data.EntityId == this.Id) {
                        console.log("Data is data", this.Id, data.EntityId);
                    } else {
                        console.log("Data is not data!", this.Id, data.EntityId);
                    }
                },
                hasAccess: function (items) {
                    var access = false;
                    var cantAttachFilesStatusId = [ApplicationConstants.TimeSheet.Status.PendingReview, ApplicationConstants.TimeSheet.Status.Approved];
                    var cantModifyDetailsStatusId = [ApplicationConstants.TimeSheet.Status.PendingReview, ApplicationConstants.TimeSheet.Status.Approved, ApplicationConstants.TimeSheet.Status.Pending, -1];

                    if (items == 'AttachDocument') {
                        access = (cantAttachFilesStatusId.indexOf(this.TimeSheetStatusId) == -1);
                    } else if (items == 'ModifyTimesheetDetails') {
                        access = (cantModifyDetailsStatusId.indexOf(this.TimeSheetStatusId) == -1);
                    } else if (items == 'SaveTimesheet') {
                        access = (cantModifyDetailsStatusId.indexOf(this.TimeSheetStatusId) == -1);
                    } else if (items == 'SubmitTimesheet') {
                        if (this.TaskSummary.TaskDetails != []._ && this.TaskSummary.TaskDetails.length > 0) {
                            access = false;
                        } else {
                            access = (cantModifyDetailsStatusId.indexOf(this.TimeSheetStatusId) == -1);
                        }
                    }
                    return access;

                },
                totalHours: function () {
                    var result = _.reduce(this.Details, function (memo, item) {
                        return memo + (parseFloat(item.UnitAmount) || 0);
                    }, 0);
                    return result;
                },

                weeklyDetails: function () {
                    if (this._weeklyDetails == []._) {
                        var result = new TimesheetWeeks();
                        angular.forEach(this.Details, function (detail) {
                            result.add(detail);
                        });
                        this._weeklyDetails = result;

                    }
                    return this._weeklyDetails;

                },
                closeHub: function () {


                },
                loadTaskSummary: function () {
                    var deferred = $q.defer();
                    var self = this;
                    if (self.Id == []._) {
                        loaded.reject("No Timesheet ID");

                    } else {
                        WorkflowApiService.getTasksAvailableActionsByTargetEntity(ApplicationConstants.EntityType.TimeSheet, self.Id).then(
                            function (responseSucces) {
                                if (responseSucces instanceof Array && responseSucces.length > 0) {
                                    angular.extend(self.TaskSummary, responseSucces[0]);
                                    self.WorkflowPendingTaskId = responseSucces[0].WorkflowPendingTaskId;
                                    deferred.resolve(responseSucces[0]);
                                }
                                else {
                                    angular.extend(self.TaskSummary, { WorkflowAvailableActions: [] });
                                    deferred.resolve({ WorkflowAvailableActions: [] });
                                }
                            },
                            function (err) {
                                deferred.reject(err);
                            });
                    }
                    return deferred.promise;
                }
            });
            return Timesheet;
        }

    ]);

    angular.module('phoenix.timesheet.models').factory('TimesheetWeeks', ['ModelBase', 'TimesheetWeek',
        function (ModelBase, TimesheetWeek) {

            var TimesheetWeeks = Class.extend({
                init: function () {
                    this.weeks = [];
                },

                add: function (item) {
                    if (typeof item.Date == "string") {
                        item.Date = moment(item.Date).toDate();
                    }
                    var year = item.Date.getFullYear();
                    var weekNumber = this.getWeek(item.Date);
                    var week = this.getTimesheetWeek(year, weekNumber);
                    week.add(item);
                },

                getTimesheetWeek: function (year, weekNumber) {
                    var result = null;
                    angular.forEach(this.weeks, function (w) {
                        if (w.weekNumber == weekNumber && w.year == year) {
                            result = w;
                            return;
                        }
                    });

                    if (!result) {
                        var newTW = new TimesheetWeek(year, weekNumber);
                        result = newTW;
                        // TimesheetWeeks at the end of a year and at the beginning of the next year may overlap.
                        if (weekNumber == 1) {
                            angular.forEach(this.weeks, function (w) {
                                if (w.fromDate.getDate() == newTW.fromDate.getDate() && w.toDate.getDate() == newTW.toDate.getDate()) {
                                    result = w;
                                }
                            });
                        }
                        if (result == newTW) {
                            this.weeks.push(newTW);
                        }
                    }

                    return result;
                },

                getWeek: function (date) {
                    var onejan = new Date(date.getFullYear(), 0, 1);
                    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                }
            });
            return TimesheetWeeks;
        }
    ]);

    angular.module('phoenix.timesheet.models').factory('TimesheetWeek', ['ModelBase', 'TimesheetDay',
        function (ModelBase, TimesheetDay) {
            var TimesheetWeek = Class.extend({
                init: function (year, weekNumber) {
                    this.year = year;
                    this.weekNumber = weekNumber;
                    this.fromDate = this.weeksToDate(year, weekNumber, 0);
                    this.toDate = this.weeksToDate(year, weekNumber, 6);
                    this.details = [];
                    for (var d = angular.copy(this.fromDate); d <= this.toDate; d.addDays(1)) {
                        this.details.push(new TimesheetDay(d));
                    }
                },

                add: function (item) {
                    var index = item.Date.getDay();
                    this.details[index] = item;
                },

                weeksToDate: function weeksToDate(y, w, d) {
                    var days = 1 + d + (w - 1) * 7 - (new Date(y, 0, 1)).getDay();
                    return new Date(y, 0, days);
                }
            });
            return TimesheetWeek;
        }
    ]);

    angular.module('phoenix.timesheet.models').factory('TimesheetDay', [
        function () {
            var TimesheetDay = Class.extend({
                init: function (date) {

                    this.Date = angular.copy(date);
                    this.isReadonly = true;
                    //console.log("whats this?,this", this);
                }
            });
            return TimesheetDay;

        }
    ]);
})(angular);
