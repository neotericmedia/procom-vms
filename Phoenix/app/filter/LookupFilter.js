/*global Phoenix: false, console: false*/

/*
 Takes an input value, and returns the string name/description.

*/
(function (filters) {
    'use strict';

    filters.filter('lookup', [function () {
        return _.memoize(
            function (input, sourceArray, id, description1, description2, description3) {

                var result = input;
                if (angular.isDefined(sourceArray)) {

                    var key = id || 'id';
                    description1 = description1 || 'text';
                    description2 = description2 || '';
                    description3 = description3 || '';

                    for (var i = 0; i < sourceArray.length; i++) {
                        if (sourceArray[i][key] == input) {
                            result = '' +
                                ((description1 && description1.length > 0 && sourceArray[i][description1]) ? sourceArray[i][description1] : '') +
                                ((description2 && description2.length > 0 && sourceArray[i][description2]) ? ' - ' + sourceArray[i][description2] : '') +
                                ((description3 && description3.length > 0 && sourceArray[i][description3]) ? ' - ' + sourceArray[i][description3] : '')
                            ;
                            break;
                        }
                    }
                }
                return result;
            }, function (input, sourceArray) {
                var key = "";

                if (input == []._ || sourceArray == []._ || sourceArray.length === 0) {
                    key = "empty";
                } else {
                    key = input + "-" + sourceArray[0].groupName;
                }
                return key;
            });
    }]);

    filters.filter('lookupnocache', [function () {
        return function (inputValue, inputList, id, description1, description2, description3) {
            //var result = inputValue;
            //if (inputList && inputList.length > 0) {
            //    var key = id || 'id';
            //    description1 = description1 || 'text';
            //    description2 = description2 || '';
            //    description3 = description3 || '';
            //    angular.forEach(inputList, function (i, index) {
            //        if (inputList[index][key] == inputValue) {
            //            result = ''
            //                + ((description1 && description1.length > 0 && inputList[index][description1]) ? (inputList[index][description1]) : '')
            //                + ((description2 && description2.length > 0 && inputList[index][description2]) ? (' - ' + inputList[index][description2]) : '')
            //                + ((description3 && description3.length > 0 && inputList[index][description3]) ? (' - ' + inputList[index][description3]) : '')
            //            ;
            //        }
            //    });
            //}
            //return result;

            var result = inputValue;
            function getSubObjectResult(description, lookupObj, prefix) {
                var subObject = '';
                if (description && description.length > 0) {
                    subObject = lookupObj;
                    if (description.indexOf('.') > 0) {
                        angular.forEach(description.split('.'), function (val, i) {
                            subObject = subObject[val];
                        });
                    } else {
                        subObject = subObject[description];
                    }
                }
                return subObject ? prefix + subObject : '';
            }
            if (inputList && inputList.length > 0) {
                var key = id || 'id';
                description1 = description1 || 'text';
                description2 = description2 || '';
                description3 = description3 || '';
                angular.forEach(inputList, function (i, index) {
                    if (inputList[index][key] == inputValue) {
                        result = '' +
                            getSubObjectResult(description1, inputList[index], '') +
                            getSubObjectResult(description2, inputList[index], ' - ') +
                            getSubObjectResult(description3, inputList[index], ' - ')
                        ;
                    }
                });
            }
            return result;

        };
    }]);

    filters.filter('lookupTwoArraysByIds', [function () {
        return _.memoize(
            function (inputArray, sourceArray, inputArrayId, sourceArrayId, description1, description2, description3) {
                if (!angular.isArray(inputArray)) {
                    return;
                }
                var resultArray = [];
                if (angular.isDefined(sourceArray)) {

                    var inputArrayKey = inputArrayId || 'id';
                    var sourceArrayKey = sourceArrayId || 'id';
                    
                    description1 = description1 || 'text';
                    description2 = description2 || '';
                    description3 = description3 || '';
                    for (var j = 0; j < inputArray.length; j++) {
                        for (var i = 0; i < sourceArray.length; i++) {
                            if (sourceArray[i][sourceArrayKey] == inputArray[j][inputArrayKey]) {
                                resultArray.push('' +
                                    ((description1 && description1.length > 0 && sourceArray[i][description1]) ? sourceArray[i][description1] : '') +
                                    ((description2 && description2.length > 0 && sourceArray[i][description2]) ? ' - ' + sourceArray[i][description2] : '') +
                                    ((description3 && description3.length > 0 && sourceArray[i][description3]) ? ' - ' + sourceArray[i][description3] : '')
                                );
                                break;
                            }
                        }
                    }
                }
                var result = resultArray.length ? resultArray.join(', ') : inputArray.join(', ');
                return result;
            }, function (input, sourceArray) {
                var key = "";

                if (input == []._ || sourceArray == []._ || sourceArray.length === 0) {
                    key = "empty";
                } else {
                    if (angular.isArray(input)) {
                        key = input.join('+') + "-" + sourceArray[0].groupName;
                    } else {
                        key = input + "-" + sourceArray[0].groupName;
                    }
                }
                return key;
            });
    }]);

    function codeTableSortOrder(inputArray, sortedFieldName, codeTableArray, isDesc) {
        if (!angular.isArray(inputArray) || !angular.isDefined(inputArray) || inputArray.length === 0) {
            return;
        }
        if (!angular.isArray(codeTableArray) || !angular.isDefined(codeTableArray)) {
            return;
        }
        if (typeof sortedFieldName === 'undefined' || sortedFieldName === null || sortedFieldName.length === 0 || typeof inputArray[0][sortedFieldName] === 'undefined' || inputArray[0][sortedFieldName] === null) {
            return;
        }

        function orderBy(obj, orderedFieldName) {
            var array = [];
            Object.keys(obj).forEach(function (key) {
                obj[key].name = key;
                array.push(obj[key]);
            });

            if (isDesc === 1)
            {
                array.sort(function (a, b) {
                    return b[orderedFieldName] - a[orderedFieldName];
                });
            }
            else
            {
                array.sort(function (a, b) {
                    return a[orderedFieldName] - b[orderedFieldName];
                });
            }
                    
            return array;
        }

        var resultArray = [];

        var codeTableArrayOrdered = orderBy(codeTableArray, 'sortOrder');

        for (var j = 0; j < codeTableArrayOrdered.length; j++) {
            for (var i = 0; i < inputArray.length; i++) {
                if (codeTableArrayOrdered[j].id === inputArray[i][sortedFieldName]) {
                    resultArray.push(inputArray[i]);
                    break;
                }
            }
        }
        return resultArray;
    }

    filters.filter('orderByCodeTableSortOrder', [function () {
        return _.memoize(codeTableSortOrder);
    }]);
    filters.filter('orderByCodeTableSortOrderWithoutCache', [function () {
        return codeTableSortOrder;
    }]);


    filters.filter('sumOfValue', [function () {
        return function (data, key) {
            if (angular.isUndefined(data) || angular.isUndefined(key))
                return 0;
            var sum = 0;
            angular.forEach(data, function (value) {
                sum = sum + parseInt(value[key], 10);
            });
            return sum;
        }
    }]);

    filters.filter('abs', function () {
        return function (val) {
            return Math.abs(val);
        }
    });


})(Phoenix.Filters);
