/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
/// <reference path="~/Content/libs/underscore/underscore.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />


(function (services) {
    'use strict';

    services.factory('CodeValueService', ['$q', 'phoenixapi', function ($q, phoenixapi) {

        var getCodeValues = function (groupName, required) {
            if (!groupName) {
                console.error('CodeValueService.getCodeValues groupName is empty');
            }

            var codeValues = PhoenixCodeValues;
            var result = [];

            if (required === false) {
                // add first empty item
                result.push({ id: null, text: '   ', value: null });
            }

            if (codeValues) {
                angular.forEach(codeValues, function (item) {
                    if (item.groupName == groupName) {
                        result.push(item);
                    }
                });
            }

            return result;
        };

        var getRelatedCodeValues = function (groupName, parentId, parentGroup) {
            var result = [];

            if (!groupName) {
                console.error('CodeValueService.getRelatedCodeValues groupName is empty');
            }

            var codeValues = PhoenixCodeValues;
            if (codeValues) {
                angular.forEach(codeValues, function (item) {
                    if (item.groupName == groupName) {
                        if (item.parentId == parentId && item.parentGroup == parentGroup) {
                            result.push(item);
                        }
                    }
                });
            }

            return result;
        };

        var getParentId = function (groupName, id) {
            if (!groupName) {
                console.error('CodeValueService.getParentId groupName is empty');
            }
            var parentId = 0;
            var codeValues = PhoenixCodeValues;
            if (codeValues) {
                angular.forEach(codeValues, function (item) {
                    if (item.groupName == groupName && item.id == id) {
                        parentId = item.parentId;
                    }
                });
            }
            return parentId;
        };

        var getCodeValue = function (id, groupName) {
            var result = null;

            var codeValues = PhoenixCodeValues;
            if (codeValues) {
                var search = _.filter(codeValues, { id: parseInt(id), groupName: groupName });
                if (search.length > 0) {
                    var item = search[0];
                    result = item;
                }
            }
            return result;
        };

        var getCodeValueText = function (id, groupName) {
            var result = '';

            var codeValue = getCodeValue(id, groupName);
            if (codeValue && codeValue.text) {
                result = codeValue.text;
            }

            return result;
        };

        var getCodeValueCode = function (id, groupName) {
            var result = '';

            var codeValue = getCodeValue(id, groupName);
            if (codeValue && codeValue.code) {
                result = codeValue.code;
            }

            return result;
        };

        function CodeValueService() {
        }

        CodeValueService.prototype =
            {
                getCodeValues: getCodeValues,
                getRelatedCodeValues: getRelatedCodeValues,
                getCodeValue: getCodeValue,
                getCodeValueText: getCodeValueText,
                getParentId: getParentId,
                getCodeValueCode: getCodeValueCode
            };

        return new CodeValueService();
    }]);

}(Phoenix.Services));