// This will convert "MMM dd yyyy hh:mm:ss tt" to the yyyyMMddhhmmss (Feb 20 2014 05:44:24 PM -> 20140220174424)
var date_MMMddyyyyhhmmsstt_to_yyyyMMddhhmmss = function (date) {
    "use strict"; //let's avoid tom-foolery in this function

    var b = date.match(/([a-zA-Z]{3}) (\d{1,2}) (\d{2,4}) (\d{1,2}):(\d{1,2}):(\d{1,2}) (am|pm|AM|PM|Am|Pm)/),
           month = b[1],
           day = b[2],
           year = b[3],
           hour = b[4],
           min = b[5],
           sec = b[6],
           ap = b[7];

    month = ($.inArray(month.toUpperCase(), ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]) + 1).toString();

    if (hour == '12') {
        hour = '0';
    }
    if (ap.toString().toLowerCase() == 'pm') {
        hour = parseInt(hour, 10) + 12;
    }
    if (year.length == 2) {
        if (parseInt(year, 10) < 70) {
            year = '20' + year;
        } else {
            year = '19' + year;
        }
    }
    if (month.length == 1) {
        month = '0' + month;
    }
    if (day.length == 1) {
        day = '0' + day;
    }
    if (hour.length == 1) {
        hour = '0' + hour;
    }
    if (min.length == 1) {
        min = '0' + min;
    }
    if (sec.length == 1) {
        sec = '0' + sec;
    }

    var tt = year + month + day + hour + min + sec;
    return tt;
};

// This will convert "MMM dd yyyy" to the yyyyMMdd (Feb 20 2014  ->  20140220)
var date_MMMddyyyy_to_yyyyMMdd = function (date) {
    "use strict";

    var b = date.match(/([a-zA-Z]{3}) (\d{1,2}) (\d{2,4})/),
           month = b[1],
           day = b[2],
           year = b[3];

    month = ($.inArray(month.toUpperCase(), ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]) + 1).toString();

    if (year.length == 2) {
        if (parseInt(year, 10) < 70) {
            year = '20' + year;
        } else {
            year = '19' + year;
        }
    }
    if (month.length == 1) {
        month = '0' + month;
    }
    if (day.length == 1) {
        day = '0' + day;
    }

    var tt = year + month + day;
    return tt;
};

jQuery.extend(jQuery.fn.dataTableExt.oSort, {

    "date-MMM-dd-yyyy-hh-mm-ss-tt-asc": function (a, b) {
        "use strict";
        var ordA = date_MMMddyyyyhhmmsstt_to_yyyyMMddhhmmss(a),
            ordB = date_MMMddyyyyhhmmsstt_to_yyyyMMddhhmmss(b);
        return (ordA < ordB) ? -1 : ((ordA > ordB) ? 1 : 0);
    },

    "date-MMM-dd-yyyy-hh-mm-ss-tt-desc": function (a, b) {
        "use strict";
        var ordA = date_MMMddyyyyhhmmsstt_to_yyyyMMddhhmmss(a),
            ordB = date_MMMddyyyyhhmmsstt_to_yyyyMMddhhmmss(b);
        return (ordA < ordB) ? 1 : ((ordA > ordB) ? -1 : 0);
    },

    "date-MMM-dd-yyyy-asc": function (a, b) {
        "use strict";
        var ordA = date_MMMddyyyy_to_yyyyMMdd(a),
            ordB = date_MMMddyyyy_to_yyyyMMdd(b);
        return (ordA < ordB) ? -1 : ((ordA > ordB) ? 1 : 0);
    },

    "date-MMM-dd-yyyy-desc": function (a, b) {
        "use strict";
        var ordA = date_MMMddyyyy_to_yyyyMMdd(a),
            ordB = date_MMMddyyyy_to_yyyyMMdd(b);
        return (ordA < ordB) ? 1 : ((ordA > ordB) ? -1 : 0);
    }
});