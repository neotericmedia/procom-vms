(function (services) {
    'use strict';
    services.factory('UtilityService', [function () {
        function UtilityService() { }

        UtilityService.prototype = {
            createUuid: function () {
                // http://www.ietf.org/rfc/rfc4122.txt
                var s = [];
                var hexDigits = "0123456789abcdef";
                for (var i = 0; i < 36; i++) {
                    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
                s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
                s[8] = s[13] = s[18] = s[23] = "-";

                var uuid = s.join("");
                return uuid;
            },
            isEffectiveDateInfinite: function (entity) {
                if (!entity) return false;

                var date = entity.ExpiryDate;
                if (!date) return true;

                return ((date.valueOf() == (new Date(1900, 1 - 1, 1).valueOf())) ||
                    (date.valueOf() == -62135578800000) ||
                    (date.valueOf() == (new Date(9999, 12 - 1, 31)).valueOf()));
            },
            isValid: function(entity) {
                var result = true;
                for (var property in entity.BrokenRules) {
                    if (entity.BrokenRules[property].length > 0) {
                        result = false;
                    }
                }
                return result;
            }
        };
        return new UtilityService();
    }]);
}(Phoenix.Services));