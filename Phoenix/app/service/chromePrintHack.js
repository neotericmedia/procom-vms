
(function (services) {
    'use strict';
    // temporary 'hacky' fix for chrome printing issue. If long running ajax request or SignalR is running, calling window.print();
    // from javascript stops working.
    var serviceId = 'chromePrintHack';
    services.factory(serviceId, ['$timeout',chromePrintHack]);
   
    function chromePrintHack($timeout) {
        var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        if (isChrome) {
            // 
            //window.oldPrint = window.print;
            //window.print = function () {

            //    var print_window = window.open();
            //    print_window.document.write('<link id="timesheetPrint" rel="stylesheet" href="/Content/less/print.less" type="text/css" media="all"><style>@media screen { .ugh { display: none; } } @media print { .ugh {display: block; } }</style><div class="ugh">' + $(".main-container").html() + "</DIV></html>");
            //    print_window.document.close();
            //    print_window.focus();
            //    print_window.print();
            //    $timeout(function () {
            //        print_window.close();
            //    }, 100);

            //};
        }
        return null;
    }

}(Phoenix.Services));

