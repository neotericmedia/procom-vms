(function (directives) {

    /// <reference  path="../app.js"/>
    /*global Phoenix:false,$:false */

    'use strict';

    /***
    @name directives.ptFooter
    
    @description
    Manages the footer-bar element of the Phoenix Application, provides the 
    functionality for
    - changing side bar from left to right side
    - hiding side bar
    - changing color scheme 
    */
    directives.directive('ptFooter', function () {
        return {
            restrict: 'A',
            templateUrl: '/Phoenix/templates/Template/Components/Navigation/Footer.html',
            link: function (scope, elem, attrs) {

                function showSidebar() {
                    $('body').removeClass('sidebar-hidden');
                    $.cookie('sidebar-pref', null, {
                        expires: 30
                    });
                }

                function hideSidebar() {
                    $('body').addClass('sidebar-hidden');
                    $.cookie('sidebar-pref', 'sidebar-hidden', {
                        expires: 30
                    });
                }

                $("#btnToggleSidebar").click(function () {
                    $(this).toggleClass('fontello-icon-resize-full-2 ' +
                        'fontello-icon-resize-small-2');
                    $(this).toggleClass('active');
                    $('#main-sidebar, #footer-sidebar').animate({
                        width: 'toggle'
                    }, 0);
                    //$('body').toggleClass('sidebar-display sidebar-hidden');
                    if ($('body').hasClass('sidebar-hidden')) {
                        showSidebar();
                    } else {
                        hideSidebar();
                    }
                });

                $("#btnChangeSidebar").click(function () {
                    $(this).toggleClass('fontello-icon-login fontello-icon-logout');
                    $('body').toggleClass('sidebar-left sidebar-right');
                    $('#mainSideMenu .chevron')
                        .toggleClass('fontello-icon-right-open-3 ' +
                            'fontello-icon-left-open-3');
                    $(this).toggleClass('active');
                });
               
                $("#btnChangeSidebarColor").click(function () {
                    $('#main-sidebar').toggleClass('sidebar-inverse');
                    $('#header  div.navbar').toggleClass('navbar-inverse');
                });

                $("#main-sidebar").niceScroll({
                    cursoropacitymin: 0.4,
                    cursoropacitymax: 1,
                    cursorcolor: "#adafb5",
                    cursorwidth: "10px",
                    cursorborder: "",
                    cursorborderradius: "10px",
                    usetransition: 600,
                    background: "",
                    railoffset: { top: 10, left: -1 },
                    bouncescroll: true
                });

               

            }
        };
    });
})(Phoenix.Directives);