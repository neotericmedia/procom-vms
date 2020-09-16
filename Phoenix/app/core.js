(function ($, window, document, undefined) {

    //// REMOVE CSS FROM ELEMENT
    //// ------------------------------------------------------------------------------------------------ * --> 
    //$.fn.extend({
    //    removeCss: function (cssName) {
    //        return this.each(function () {
    //            var curDom = $(this);
    //            jQuery.grep(cssName.split(","),

    //            function (cssToBeRemoved) {
    //                curDom.css(cssToBeRemoved, '');
    //            });
    //            return curDom;
    //        });
    //    }
    //});

    //// SIDEBAR RESIZE - CONVERT NAV
    //// ------------------------------------------------------------------------------------------------
    //$(window).resize(function () {
    //    if ($(window).width() < 767) {
    //        $('.sidebar').addClass('collapse');
    //        $('.sidebar, .footer-sidebar').removeCss('display');
    //    }
    //    if ($(window).width() > 767) {
    //        $('.sidebar').removeClass('collapse');
    //        $('.sidebar').removeCss('height');

    //        if (!$('body').hasClass('sidebar-hidden')) {
    //            $('.sidebar, .footer-sidebar').css({
    //                'display': 'block'
    //            });
    //        } else {
    //            $('.sidebar, .footer-sidebar').css({
    //                'display': 'none'
    //            });
    //        }
    //    }
    //});
    //$(function () {
    //    if ($(window).width() < 767) {
    //        $('.sidebar').addClass('collapse');
    //    }
    //    if ($(window).width() > 767) {
    //        $('.sidebar').removeClass('collapse');
    //        $('.sidebar').removeCss('height');
    //    }
    //});

  
    // SCROLL - NICESCROLL
    // ------------------------------------------------------------------------------------------------
    
    // scroll left side bar
    //$("#main-sidebar").niceScroll({
    //    cursoropacitymin: 0.1,
    //    cursoropacitymax: 0.4,
    //    cursorcolor: "#adafb5",
    //    cursorwidth: "10px",
    //    cursorborder: "",
    //    cursorborderradius: "10px",
    //    usetransition: 600,
    //    background: "",
    //    railoffset: { top: 10, bottom: 50, left: -1 },
    //    bouncescroll: true
    //});

 
})(jQuery, this, document);