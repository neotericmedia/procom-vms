if (!('ace' in window)) window['ace'] = {};
(function ($) {
    ace.handle_side_menu = function ($) {
		$('body').on(ace.click_event, '#menu-toggler' , function () {
            
            $('#sidebar').toggleClass('display');
            $(this).toggleClass('display');
            if ($('#menu-toggler').hasClass('active')) {
                $('#menu-toggler').removeClass('active')
            } else {
                $('#menu-toggler').addClass('active')
            }
            if ($('#leftMenu > ul li').hasClass('open')) {
                $('#leftMenu > ul li').removeClass('open');
            }
            return false;
        });
        //mini        
        //$('#sidebar-collapse').on(ace.click_event, function() {
        //    $minimized = $('#sidebar').hasClass('menu-min');
        //    ace.settings.sidebar_collapsed(!$minimized); //@ ace-extra.js
        //});


        $('body').on('mouseenter', '#sidebar', function () {
            ace.settings.sidebar_collapsed(false); ////@ ace-extra.js
        });

        // mouseout does not account for scrollbar.
        //.mouseout(function () {
        //    ace.settings.sidebar_collapsed($minimized); ////@ ace-extra.js
        //});        
    };

    ace.general_things = function ($) {
        $('.nav-list .badge[title], .nav-list .label[title]').tooltip({ 'placement': 'right' });

        $('#btn-scroll-up').on(ace.click_event, function () {
            var duration = Math.min(400, Math.max(100, parseInt($('html').scrollTop() / 3)));
            $('html, body').animate({ scrollTop: 0 }, duration);
            return false;
        });
    };

    // Let's load the jquery stuff here after the root controller is set.,
    jQuery(function ($) {
        //at some places we try to use 'tap' event instead of 'click' if jquery mobile plugin is available
        window['ace'].click_event = $.fn.tap ? "tap" : "click";
        ace.handle_side_menu(jQuery);
        ace.general_things(jQuery);
    });
})(jQuery);

