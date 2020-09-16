

(function (directives) {
    'use strict';

    /**
    @name directives.ptTemporalContainer
    @description
    Used for handling temporal dataset.
    Attributes:
        *pt-temporal-container - temporal container attributes
        *ng-form - model form. Used for validation and change handling
        *data-select-callback - callback function name. Function signature: function(item){} there item - is selected item.
    example:   
    <div data-ng-form="temporalForm" 
         data-pt-temporal-container="model.temporalDateRanges">
         data-selected-date='model.selectedDate' 
         data-select-callback='model.selectItem'
    </div>
    **/
    directives.directive('ptTemporalContainer', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            require: '^form',
            scope: true,
            controller: ['$scope', function (scope) {
                // assign default values
                if (!scope._container) scope._container = {};
                scope._container.dirty = false;
                scope._container.valid = true;
                scope._container.older = [];
                scope._container.newer = [];
                scope._container.items = [];
                scope._container.current = {};
                scope._container.master = {};
            }],
            link: function (scope, elem, attr, ngForm) {
                if (!scope._container) scope._container = {};

                scope._container.modelForm = ngForm;
                scope._container.selectedDate = new Date();

                // read attributes
                scope._container.itemsExp = attr.ptTemporalContainer;
                scope._container.selectedDateExp = attr.selectedDate;
                scope._container.selectCallbackExp = attr.selectCallback;

                // function which reassign arrays and current item properties
                scope._container.assignItems = function (selectedDate) {

                    // find current item
                    var prior = _.filter(scope._container.items, function (item) {
                        return item.EffectiveDate <= selectedDate;
                    });

                    var currentItem = {};

                    if (prior.length > 0) {
                        currentItem = prior[prior.length - 1];
                    } else {
                        var after = _.filter(scope._container.items, function (item) {
                            return item.EffectiveDate > selectedDate;
                        });
                        if (after.length > 0) {
                            currentItem = scope._container.newer[0];
                        }
                    }

                    // find index of current item
                    var older = [];
                    var newer = [];
                    var index = scope._container.items.indexOf(currentItem);
                    if (index >= 0) {
                        for (var i = 0; i < index; i++) {
                            older.push(scope._container.items[i]);
                        }
                        for (var j = index + 1; j < scope._container.items.length; j++) {
                            newer.push(scope._container.items[j]);
                        }
                    }

                    if (scope._container.current != currentItem && currentItem) {
                        
                        scope._container.current = currentItem;
                        scope._container.current.SelectedEffectiveDate = angular.copy(scope._container.current.EffectiveDate);
                        scope._container.current.SelectedEndDate = angular.copy(scope._container.current.EndDate);

                        // callback function
                        if (scope._container.selectCallbackExp) {
                            var realCallBackFn = scope._container.selectCallbackExp + '(_container.current)';
                            scope.$eval(realCallBackFn);
                            scope._container.modelForm.$setPristine();
                        }
                    }
                    scope._container.master = angular.copy(scope._container.current);
                    scope._container.older = older;
                    scope._container.newer = newer;
                };

                // trace form changes
                scope.$watch("_container.modelForm.$dirty", function (newValue) {
                    scope._container.dirty = newValue;
                }, true);

                scope.$watch("_container.modelForm.$valid", function (newValue) {
                    scope._container.valid = newValue;
                }, true);

                // watch of changes for the collection in order
                if (!scope._container.itemsExp) {
                    console.log('ptTemporalContainer is required attribute and it should be pointed to temporal dataset.');
                    return;
                }
                scope._container.items = $parse(scope._container.itemsExp)(scope);
                scope.$watch(scope._container.itemsExp, function (value) {
                    scope._container.items = value;
                    scope._container.assignItems(scope._container.selectedDate);
                }, true);

                // identify currently selected daterange
                // item
                if (scope._container.selectedDateExp) {
                    scope._container.selectedDate = $parse(scope._container.selectedDateExp)(scope);
                    scope.$watch(scope._container.selectedDateExp, function (value) {
                        scope._container.selectedDate = value;
                        if (scope._container.current.EffectiveDate !== null &&
                            scope._container.selectedDate.valueOf() == scope._container.current.EffectiveDate.valueOf()) return;

                        scope._container.assignItems(scope._container.selectedDate);
                    });
                }
                scope._container.assignItems(scope._container.selectedDate);

            }
        };
    }]);

    /**
    @name directives.ptTemporalNavigation
    @description
    Used for navigation  in temporal dataset. Always should be used as child of ptTemporalContainer
    Attributes:
        *pt-temporal-navigation - model property with boolean flag attribute indicating that navigation (changing items) is available or not.
    example:   
    <div data-pt-temporal-navigation='model.canChangeDate'>
    </div>
    **/
    directives.directive('ptTemporalNavigation', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            require: '^ptTemporalContainer',
            scope: true,
            templateUrl: '/Phoenix/templates/Template/Components/Temporal/TemporalNavigation.html',
            link: function (scope, elem, attr) {
                var availableExp = attr.ptTemporalNavigation;

                if (!scope._container) scope._container = {};
                scope._container.available = true;

                // assign availability indicator
                // used to control and suspend navigation during some operations
                // with the model
                if (availableExp) {
                    var avstr = availableExp;
                    if (avstr.toString().toLowerCase() == 'true') {
                        scope._container.available = true;
                    }
                    else if (avstr.toString().toLowerCase() == 'false') {
                        scope._container.available = false;
                    }
                    else {
                        scope._container.available = $parse(avstr)(scope);
                        scope.$watch(avstr, function (value) {
                            scope._container.available = value;
                        });
                    }
                }

                // handle date selection
                scope._container.selectDate = function (item) {

                    scope._container.selectedDate = angular.copy(item.EffectiveDate);
                    // refresh control
                    scope._container.assignItems(scope._container.selectedDate);
                };

                // handle click on older button
                scope._container.olderDate = function () {
                    var item = scope._container.older[scope._container.older.length - 1];
                    scope._container.selectDate(item);
                };

                // handle click on newer button
                scope._container.newerDate = function () {
                    var item = scope._container.newer[0];
                    scope._container.selectDate(item);
                };

                // item class
                scope._container.itemClass = function (item) {
                    if (!scope._container.current) return "";
                    
                    if (item.EffectiveDate == scope._container.current.EffectiveDate) {
                        return "active";
                    }
                    
                    return "";
                };
            }
        };
    }]);

    /**
    @name directives.ptTemporalContainer
    @description
    Used used to show toolbar area. Always should be used as child of ptTemporalContainer
    Attributes:
        *save-callback - save callback function name. "Save" button click in correction mode.  Function signature: function(item){} there item - is selected item.
        *submit-callback - submit callback function name. "Submit" button click in scheduled changes mode.  Function signature: function(item){} there item - is selected item.
        *cancel-callback - cancel function name. "Cancel" button click in correction and scheduled changes modes.  Function signature: function(item, master){} there item - is current item, master is old and pristine copy of the item.
        *correction-callback - edit callback function name. "Edit" button click to switch mode to correction.  Function signature: function(item){} there item - is selected item.
        *schedule-change-callback - schedule change callback function name. "Schedule Change" button click to switch mode to SC mode.  Function signature: function(item){} there item - is selected item.
        *can-correct - model property with boolean flag attribute indicating that correction is available for the user (most useful to enforce security).
        *can-schedule - model property with boolean flag attribute indicating that scheduled changes is available for the user (most useful to enforce security).
    example:   
        <div data-pt-temporal-toolbar=""
             data-save-callback="saveItem"
             data-submit-callback="submitItem"
             data-cancel-callback="cancellEdit"
             data-cancel-view-callback="cancellView"
             data-correction-callback="editItem"
             data-schedule-change-callback="scheduleChanges"
             data-can-correct ="model.canCorrect"
             data-can-schedule ="model.canSchedule"
            ></div>
    **/
    directives.directive('ptTemporalToolbar', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            require: '^ptTemporalContainer',
            scope: true,
            templateUrl: '/Phoenix/templates/Template/Components/Temporal/TemporalToolbar.html',
            link: function (scope, elem, attr) {
                
                if (!scope._container) scope._container = {};
                if (!scope._container.current) scope._container.current = {};               
                
                scope._container.mode = 'view';
                
                scope._container.effectiveDateOptions = {
                    changeYear: true,
                    changeMonth: true,
                    minDate: calculateMinEffectiveDate(scope._container.current)
                };

                scope._container.endDateOptions = {
                    changeYear: true,
                    changeMonth: true,
                    minDate: scope._container.current.EffectiveDate
                };

                scope._container.isEffectiveDateInfinite = false;
                scope._container.isEndDateInfinite = false;

                var saveCallback = attr.saveCallback,
                    submitCallback = attr.submitCallback,
                    cancelCallback = attr.cancelCallback,
                    correctionCallback = attr.correctionCallback,
                    scheduleChangeCallback = attr.scheduleChangeCallback,
                    canCorrect = attr.canCorrect,
                    canSchedule = attr.canSchedule;

                scope._container.canCorrect = true;
                scope._container.canSchedule = canScheduleChanges(scope._container.current);
                scope._container.cancelViewCallback = attr.cancelViewCallback;

                if (canCorrect) {
                    scope._container.canCorrect = $parse(canCorrect)(scope);
                    scope.$watch(canCorrect, function (value) {
                        scope._container.canCorrect = value;
                    });
                }
                if (canSchedule) {
                    scope._container.canSchedule = $parse(canSchedule)(scope);
                    scope.$watch(canSchedule, function (value) {
                        scope._container.canSchedule = value && canScheduleChanges(scope._container.current);
                    });
                }

                // handle changes of current item
                scope.$watch('_container.current', function (value) {
                    // ignore event while assigning current item to null
                    if ((!value) || (!value.EffectiveDate)) return;

                    // calculate min date for the item
                    scope._container.effectiveDateOptions.minDate = calculateMinEffectiveDate(value);

                    // can schedule evaluation
                    if (canSchedule) {
                        scope._container.canSchedule = $parse(canSchedule)(scope) && canScheduleChanges(value);
                    } else {
                        scope._container.canSchedule = canScheduleChanges(value);
                    }

                    // evaluate date range values
                    scope._container.isEffectiveDateInfinite = ((value.EffectiveDate.valueOf() == (new Date(1900, 1 - 1, 1).valueOf())) || (value.EffectiveDate == (new Date(1, 1 - 1, 1)).valueOf()));
                    scope._container.isEndDateInfinite = (value.EndDate === null || value.EndDate.valueOf() == (new Date(9999, 12 - 1, 31)).valueOf());
                }, true);

                scope.$watch('_container.current.SelectedEffectiveDate', function(value) {
                    scope._container.endDateOptions.minDate = value;
                });

                // switch container to correction mode (default action)
                scope._container.edit = function () {
                    // callback function
                    if (correctionCallback) {
                        var realCallBackFn = correctionCallback + '(_container.current)';
                        scope.$eval(realCallBackFn);
                    }
                    scope._container.mode = 'corrections';
                };

                // switch container to correction mode
                scope._container.corrections = function () {
                    // callback function
                    if (correctionCallback) {
                        var realCallBackFn = correctionCallback + '(_container.current)';
                        scope.$eval(realCallBackFn);
                    }
                    scope._container.mode = 'corrections';
                };

                // switch container to scheduled changes mode
                scope._container.scheduledChanges = function () {
                    // callback function
                    if (scheduleChangeCallback) {
                        var realCallBackFn = scheduleChangeCallback + '(_container.current)';
                        scope.$eval(realCallBackFn);
                    }
                    scope._container.mode = 'scheduled-changes';
                };

                scope._container.save = function () {
                    if (saveCallback) {
                        var realCallBackFn = saveCallback + '(_container.current, _container.saveActionCallback)';
                        scope.$eval(realCallBackFn);
                    }
                };

                scope._container.submit = function () {
                    // assign EffectiveDate and EndDate
                    if (scope._container.current.SelectedEffectiveDate) {
                        if (scope._container.current.SelectedEffectiveDate.valueOf() != scope._container.current.EffectiveDate.valueOf()) {
                            scope._container.current.EffectiveDate = scope._container.current.SelectedEffectiveDate;
                            scope._container.selectedDate = scope._container.current.EffectiveDate;
                        }
                    }
                    if (submitCallback) {
                        var realCallBackFn = submitCallback + '(_container.current, _container.saveActionCallback)';
                        scope.$eval(realCallBackFn);
                    }
                };

                scope._container.cancel = function () {
                    // callback function
                    if (cancelCallback) {
                        var realCallBackFn = cancelCallback + '(_container.current, _container.master)';
                        scope.$eval(realCallBackFn);
                    }
                    scope._container.mode = 'view';
                    scope._container.modelForm.$pristine = true;

                    // refresh list of items (cancel could change the items collection)
                    scope._container.items = $parse(scope._container.itemsExp)(scope);
                    scope._container.assignItems(scope._container.selectedDate);
                };

                scope._container.close = function () {
                    // callback function
                    if (scope._container.cancelViewCallback) {
                        var realCallBackFn = scope._container.cancelViewCallback + '(_container.current, _container.master)';
                        scope.$eval(realCallBackFn);
                    }
                    scope._container.mode = 'view';
                    scope._container.modelForm.$pristine = true;

                    // refresh list of items (cancel could change the items collection)
                    scope._container.items = $parse(scope._container.itemsExp)(scope);
                    scope._container.assignItems(scope._container.selectedDate);
                };


                // evaluate conditions to enable schedule change action
                function canScheduleChanges(item) {
                    if (item === null || scope._container.items.length === 0) return false;

                    // check is the item last in the collection
                    if (scope._container.items[scope._container.items.length - 1].EffectiveDate.valueOf() != item.EffectiveDate.valueOf()) {
                        return false;
                    }

                    // check that item is currently active (effective date for the item is in the past)
                    return (item.EffectiveDate.valueOf() < (new Date().valueOf()));
                }

                // evaluate conditions to calculate minimum effective date for the item
                function calculateMinEffectiveDate(item) {
                    var result = null;
                    if (item === null || scope._container.items.length === 0) return null;

                    var index = scope._container.items.indexOf(item);
                    if (index == scope._container.items.length - 1) {
                        // current item is a last one
                        if (index > 0) {
                            // exist previous item
                            var prevItem = scope._container.items[index - 1];
                            result = angular.copy(prevItem.EffectiveDate);
                            result = result.add({ days: 1 });
                        }
                        else {
                            result = angular.copy(item.EffectiveDate);
                        }
                    }

                    return result;
                }

                scope._container.saveActionCallback = function (finalMode) {
                    if (finalMode) scope._container.mode = finalMode;
                };
            }
        };
    }]);


})(Phoenix.Directives);