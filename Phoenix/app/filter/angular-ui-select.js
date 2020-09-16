/*global Phoenix: false, console: false*/

(function (filters) {
    'use strict';
    filters.filter('uiSelectChoicesFilter', function () {
        return function (itemCollection, selectSearchValue, selectLookupProperty1, selectLookupProperty2, selectLookupProperty3, selectLookupProperty4, selectLookupProperty5, selectLookupProperty6, selectLookupProperty7, selectLookupProperty8) {
            var out = [];
            selectSearchValue = selectSearchValue.toLowerCase();

            function getSubObjectResult(lookupProperty, lookupObj) {
                var subObject = '';
                if (lookupProperty && lookupProperty.length > 0) {
                    subObject = lookupObj;
                    if (lookupProperty.indexOf('.') > 0) {
                        angular.forEach(lookupProperty.split('.'), function (val) {
                            subObject = subObject[val];
                        });
                    } else {
                        subObject = subObject[lookupProperty];
                    }
                }
                return subObject ? subObject : '';
            }

            if (angular.isArray(itemCollection) && itemCollection.length > 0 && selectSearchValue && selectSearchValue.length > 0) {
                angular.forEach(itemCollection, function (item) {
                    var itemIsMatchToSearch = false;

                    var itemValue1 = selectLookupProperty1 ? getSubObjectResult(selectLookupProperty1, item).toString().toLowerCase() : null;
                    var itemValue2 = selectLookupProperty2 ? getSubObjectResult(selectLookupProperty2, item).toString().toLowerCase() : null;
                    var itemValue3 = selectLookupProperty3 ? getSubObjectResult(selectLookupProperty3, item).toString().toLowerCase() : null;
                    var itemValue4 = selectLookupProperty4 ? getSubObjectResult(selectLookupProperty4, item).toString().toLowerCase() : null;
                    var itemValue5 = selectLookupProperty5 ? getSubObjectResult(selectLookupProperty5, item).toString().toLowerCase() : null;
                    var itemValue6 = selectLookupProperty6 ? getSubObjectResult(selectLookupProperty6, item).toString().toLowerCase() : null;
                    var itemValue7 = selectLookupProperty7 ? getSubObjectResult(selectLookupProperty7, item).toString().toLowerCase() : null;
                    var itemValue8 = selectLookupProperty8 ? getSubObjectResult(selectLookupProperty8, item).toString().toLowerCase() : null;

                    if ((itemValue1 && itemValue1.indexOf(selectSearchValue) !== -1) ||
                        (itemValue2 && itemValue2.indexOf(selectSearchValue) !== -1) ||
                        (itemValue3 && itemValue3.indexOf(selectSearchValue) !== -1) ||
                        (itemValue4 && itemValue4.indexOf(selectSearchValue) !== -1) ||
                        (itemValue5 && itemValue5.indexOf(selectSearchValue) !== -1) ||
                        (itemValue6 && itemValue6.indexOf(selectSearchValue) !== -1) ||
                        (itemValue7 && itemValue7.indexOf(selectSearchValue) !== -1) ||
                        (itemValue8 && itemValue8.indexOf(selectSearchValue) !== -1)
                        ) {
                        itemIsMatchToSearch = true;
                    }
                    if (itemIsMatchToSearch) {
                        out.push(item);
                    }
                });
            } else {
                out = itemCollection;
            }
            return out;
        };
    });

    filters.filter('uiSelectChoicesFilteredByUsage', function () {
        return function (itemCollection, selectSearchValue, entityCollectionToCompareUsage, currentEntityToExcludeFromCompare, entityPropertyToCompare, itemPropertyToCompare, selectLookupProperty1, selectLookupProperty2, selectLookupProperty3, selectLookupProperty4, selectLookupProperty5, selectLookupProperty6, selectLookupProperty7, selectLookupProperty8) {
            var out = [];
            selectSearchValue = selectSearchValue.trim().toLowerCase();

            function getSubObjectResult(lookupProperty, lookupObj) {
                var subObject = '';
                if (lookupProperty && lookupProperty.length > 0) {
                    subObject = lookupObj;
                    if (lookupProperty.indexOf('.') > 0) {
                        angular.forEach(lookupProperty.split('.'), function (val) {
                            subObject = subObject[val];
                        });
                    } else {
                        subObject = subObject[lookupProperty];
                    }
                }
                return subObject ? subObject : '';
            }

            if (angular.isArray(itemCollection) && itemCollection.length > 0) {
                angular.forEach(itemCollection, function (item) {
                    var itemIsUsed = false;
                    var itemValueToCompare = itemPropertyToCompare ? getSubObjectResult(itemPropertyToCompare, item).toString().toLowerCase() : null;
                    var currentEntityValue = entityPropertyToCompare ? getSubObjectResult(entityPropertyToCompare, currentEntityToExcludeFromCompare).toString().toLowerCase() : null;

                    angular.forEach(entityCollectionToCompareUsage, function (entity) {
                        var entityValueToCompare = entityPropertyToCompare ? getSubObjectResult(entityPropertyToCompare, entity).toString().toLowerCase() : null;
                        if (entityValueToCompare == itemValueToCompare && entityValueToCompare != currentEntityValue) {
                            itemIsUsed = true;
                        }
                    });

                    var itemIsMatchToSearch = false;
                    if (!itemIsUsed && selectSearchValue && selectSearchValue.length > 0) {

                        var itemValue1 = selectLookupProperty1 ? getSubObjectResult(selectLookupProperty1, item).toString().toLowerCase() : null;
                        var itemValue2 = selectLookupProperty2 ? getSubObjectResult(selectLookupProperty2, item).toString().toLowerCase() : null;
                        var itemValue3 = selectLookupProperty3 ? getSubObjectResult(selectLookupProperty3, item).toString().toLowerCase() : null;
                        var itemValue4 = selectLookupProperty4 ? getSubObjectResult(selectLookupProperty4, item).toString().toLowerCase() : null;
                        var itemValue5 = selectLookupProperty5 ? getSubObjectResult(selectLookupProperty5, item).toString().toLowerCase() : null;
                        var itemValue6 = selectLookupProperty6 ? getSubObjectResult(selectLookupProperty6, item).toString().toLowerCase() : null;
                        var itemValue7 = selectLookupProperty7 ? getSubObjectResult(selectLookupProperty7, item).toString().toLowerCase() : null;
                        var itemValue8 = selectLookupProperty8 ? getSubObjectResult(selectLookupProperty8, item).toString().toLowerCase() : null;

                        if ((itemValue1 && itemValue1.indexOf(selectSearchValue) !== -1) ||
                            (itemValue2 && itemValue2.indexOf(selectSearchValue) !== -1) ||
                            (itemValue3 && itemValue3.indexOf(selectSearchValue) !== -1) ||
                            (itemValue4 && itemValue4.indexOf(selectSearchValue) !== -1) ||
                            (itemValue5 && itemValue5.indexOf(selectSearchValue) !== -1) ||
                            (itemValue6 && itemValue6.indexOf(selectSearchValue) !== -1) ||
                            (itemValue7 && itemValue7.indexOf(selectSearchValue) !== -1) ||
                            (itemValue8 && itemValue8.indexOf(selectSearchValue) !== -1)
                            ) {
                            itemIsMatchToSearch = true;
                        }
                        //if (itemIsMatchToSearch) {
                        //    out.push(item);
                        //}
                    }

                    //if (!itemIsUsed) {
                    //    out.push(item);
                    //}

                    if (!itemIsUsed && (itemIsMatchToSearch || selectSearchValue.length === 0)) {
                        out.push(item);
                    }

                });
            } else {
                out = itemCollection;
            }
            return out;
        };
    });

})(Phoenix.Filters);