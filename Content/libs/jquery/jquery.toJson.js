/*!
 * jQuery.parseJSON() extension (supports ISO & Asp.net date conversion)
 *
 * Version 1.0 (13 Jan 2011)
 *
 * Copyright (c) 2011 Robert Koritnik
 * Licensed under the terms of the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */
(function ($) {

    // JSON RegExp
    var rvalidchars = /^[\],:{}\s]*$/;
    var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
    var dateISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.,]\d+)?Z/i;
    var dateISO8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(\.(\d{1,3}))?(?:Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
    var dateNet = /\/Date\((\d+)(?:-\d+)?\)\//i;

    // replacer RegExp
    var replaceISO = /"(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:[.,](\d+))?Z"/i;
    var replaceNet = /"\\\/Date\((\d+)(?:-\d+)?\)\\\/"/i;

    // determine JSON native support
    var nativeJSON = (window.JSON && window.JSON.parse) ? true : false;
    var extendedJSON = nativeJSON && window.JSON.parse('{"x":9}', function (k, v) { return "Y"; }) === "Y";

    var dateISO8601Converter = function (value) {
        //http://stackoverflow.com/questions/5802461/javascript-which-browsers-support-parsing-of-iso-8601-date-string-with-date-par
        var d = window.Date, regexIso8601 = dateISO8601, lOff, lHrs, lMin;
        if (d.parse('2011-11-29T15:52:30.5') !== 1322599950500 ||
            d.parse('2011-11-29T15:52:30.52') !== 1322599950520 ||
            d.parse('2011-11-29T15:52:18.867') !== 1322599938867 ||
            d.parse('2011-11-29T15:52:18.867Z') !== 1322581938867 ||
            d.parse('2011-11-29T15:52:18.867-03:30') !== 1322594538867 ||
            d.parse('2011-11-29') !== 1322524800000 ||
            d.parse('2011-11') !== 1320105600000 ||
            d.parse('2011') !== 1293840000000) {

            d.__parse = d.parse;

            lOff = -(new Date().getTimezoneOffset());
            lHrs = Math.floor(lOff / 60);
            lMin = lOff % 60;

            d.parse = function (v) {

                var m = regexIso8601.exec(v);

                if (m) {
                    var dateUtc = Date.UTC(
                        m[1],
                        (m[2] || 1) - 1,
                        m[3] || 1,
                        m[4] - (m[8] ? m[9] ? m[9] + m[10] : 0 : lHrs) || 0,
                        m[5] - (m[8] ? m[9] ? m[9] + m[11] : 0 : lMin) || 0,
                        m[6] || 0,
                        ((m[8] || 0) + '00').substr(0, 3)
                        //((m[7] || 0) + '00').substr(0, 3)
                    );
                    return dateUtc;
                }

                return d.__parse.apply(this, arguments);

            };
        }

        d.__fromString = d.fromString;

        d.fromString = function (v) {

            if (!d.__fromString || regexIso8601.test(v)) {
                return new d(d.parse(v));
            }

            return d.__fromString.apply(this, arguments);
        };

        return Date.fromString(value);
    };

    var jsonDateConverter = function (key, value) {
        if (typeof (value) === "string") {
            //if (dateISO8601.test(value)) {
            //    var parsedDate = dateISO8601Converter(value);
            //    return parsedDate;
            //}
            if (dateISO.test(value)) {
                var parsedDate = new Date(value);
                return parsedDate;
            }
            if (dateNet.test(value)) {
                return new Date(parseInt(dateNet.exec(value)[1], 10));
            }
        }
        return value;
    };

    var JSONparse = window.JSON.parse;

    $.extend({
        parseJSON: function (data, convertDates) {
            /// <summary>Takes a well-formed JSON string and returns the resulting JavaScript object.</summary>
            /// <param name="data" type="String">The JSON string to parse.</param>
            /// <param name="convertDates" optional="true" type="Boolean">Set to true when you want ISO/Asp.net dates to be auto-converted to dates.</param>

            if (typeof data !== "string" || !data) {
                return null;
            }

            if (!convertDates) {
                convertDates = true;
            }

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            data = $.trim(data);

            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if (rvalidchars.test(data
                .replace(rvalidescape, "@")
                .replace(rvalidtokens, "]")
                .replace(rvalidbraces, ""))) {
                // Try to use the native JSON parser
                if (extendedJSON || (nativeJSON && convertDates !== true)) {
                    var newdata = JSONparse(data, convertDates === true ? jsonDateConverter : undefined);
                    return newdata;
                }
                else {
                    data = convertDates === true ?
                        data.replace(replaceISO, "new Date(parseInt('$1',10),parseInt('$2',10)-1,parseInt('$3',10),parseInt('$4',10),parseInt('$5',10),parseInt('$6',10),(function(s){return parseInt(s,10)||0;})('$7'))")
                            .replace(replaceNet, "new Date($1)") :
                        data;
                    return (new Function("return " + data))();
                }
            } else {
                $.error("Invalid JSON: " + data);
            }
        }
    });

    JSON.parse = $.parseJSON;
})(jQuery);
