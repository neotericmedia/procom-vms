(function (directives) {
    'use strict';

    directives.directive('ptMainSideMenu', ['$rootScope', 'NavigationService', 'phoenixauth', function ($rootScope, NavigationService, phoenixauth) {
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            scope: true,
            templateUrl: '/Phoenix/templates/Template/Components/SideMenu/MainSideMenu.html',
            controller: ['$scope', controller],
            link: link
        };

        return directive;

        function controller($scope) {
        }

        function link(scope, elem, attr, ngModel) {
            scope._component = {};
            scope._component.items = [];

            scope._component.id = 0;
            scope._component.Children = [];

            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                scope._component.items = ngModel.$viewValue;

                scope._component.ParentId = null;
                scope._component.Id = null;
                scope._component.Children = ngModel.$viewValue;

                phoenixauth.getCurrentProfile().then(function (profile) {
                    NavigationService.getUserProfileNavigationHistoryLastNavigationId(profile.Id).then(function (response) {

                            var myItem;

                            var navigationIdPath = [];
                            var id = response.NavigationId;

                            if (!id)
                                return;

                            do {
                                navigationIdPath.push(id);
                                myItem = scope.findItem(scope._component, id);
                                id = myItem ? myItem.ParentId : null;
                            } while (myItem && id);

                            navigationIdPath = navigationIdPath.reverse();

                            for (var i = 0; i < navigationIdPath.length; i++) {
                                myItem = scope.findItem(scope._component, navigationIdPath[i]);
                                if (myItem) {
                                    if (myItem.ParentId)
                                        scope.toggleExpanded(myItem, false);
                                    else
                                        scope.itemClick(myItem, false);
                                }
                            }
                        });
                })
                ;               
            };

            scope.findItem = function (item, id) {                
                if (item.Id === id) {
                    return item;
                }
                else if (item.Children != null) {
                    var result = null;

                    for (var i = 0; result == null && i < item.Children.length; i++) {
                        result = scope.findItem(item.Children[i], id);
                    }
                    return result;
                }
            
                return null;
            }

            scope.menuItemClick = function () {
                if ($(window).width() < 960) {
                    if ($('#sidebar').hasClass('display')) {
                        $('#sidebar').removeClass('display');
                        $('#menu-toggler').removeClass('active');
                    }
                }
            }

            scope.toggleExpanded = function (item, saveNavigation) {

                var link_element = $('#' + item.Code).closest('a');                

                if (link_element.find('.arrow').hasClass('arrowExpanded')) {
                    link_element.find('.arrow').removeClass('arrowExpanded');
                    if (saveNavigation) {
                        NavigationService.saveUserProfileNavigationHistory(item.ParentId);
                    }                    
                } else {
                    link_element.find('.arrow').addClass('arrowExpanded');
                    if (saveNavigation) {
                        NavigationService.saveUserProfileNavigationHistory(item.Id);  
                    }                    
                }

                $('.arrowExpanded').not(this).removeClass('.arrowExpanded');

                if (!link_element || link_element.length === 0) return; //if not clicked inside a link element

                var $minimized = $('#sidebar').hasClass('menu-min');

                if (!link_element.hasClass('dropdown-toggle')) { //it doesn't have a submenu return
                    //just one thing before we return
                    //if sidebar is collapsed(minimized) and we click on a first level menu item
                    //and the click is on the icon, not on the menu text then let's cancel event and cancel navigation
                    //Good for touch devices, that when the icon is tapped to see the menu text, navigation is cancelled
                    //navigation is only done when menu text is tapped
                    if ($minimized && ace.click_event == "tap" &&
                        link_element.get(0).parentNode.parentNode == this /*.nav-list*/)//i.e. only level-1 links
                    {
                        var text = link_element.find('.menu-text').get(0);
                        if (e.target != text && !$.contains(text, e.target))//not clicking on the text or its children
                            return false;
                    }

                    return;
                }
                //
                var sub = link_element.next().get(0);

                //if we are opening this submenu, close all other submenus except the ".active" one
                if (!$(sub).is(':visible')) { //if not open and visible, let's open it and make it visible

                    var parent_ul = $(sub.parentNode).closest('ul');
                    if ($minimized && parent_ul.hasClass('nav-list') && saveNavigation) return;

                    parent_ul.find('.open > .submenu').each(function () {
                        //close all other open submenus except for the active one
                        if (this != sub && !$(this.parentNode).hasClass('active')) {
                            $(this).parent().find('.dropdown-toggle > .arrow').removeClass('arrowExpanded');
                            $(this).slideUp(200).parent().removeClass('open');

                            //uncomment the following line to close all submenus on deeper levels when closing a submenu
                            //$(this).find('.open > .submenu').slideUp(0).parent().removeClass('open');
                        }
                    });
                } else {
                    //uncomment the following line to close all submenus on deeper levels when closing a submenu
                    //$(sub).find('.open > .submenu').slideUp(0).parent().removeClass('open');
                }

                if ($minimized && $(sub.parentNode.parentNode).hasClass('nav-list') && saveNavigation) return false;

                $(sub).slideToggle(200).parent().toggleClass('open');

                return false;

            }

            scope.itemClick = function (item, saveNavigation) {

                $('.arrowExpanded').removeClass("arrowExpanded");

                //check to see if we have clicked on an element which is inside a .dropdown-toggle element?!
                //if so, it means we should toggle a submenu
                var link_element = $('#' + item.Code).closest('a');

                if (!link_element || link_element.length === 0) return; //if not clicked inside a link element

                var $minimized = $('#sidebar').hasClass('menu-min');

                if (!link_element.hasClass('dropdown-toggle')) { //it doesn't have a submenu return
                    //just one thing before we return
                    //if sidebar is collapsed(minimized) and we click on a first level menu item
                    //and the click is on the icon, not on the menu text then let's cancel event and cancel navigation
                    //Good for touch devices, that when the icon is tapped to see the menu text, navigation is cancelled
                    //navigation is only done when menu text is tapped
                    if ($minimized && ace.click_event == "tap" &&
                        link_element.get(0).parentNode.parentNode == this /*.nav-list*/)//i.e. only level-1 links
                    {
                        var text = link_element.find('.menu-text').get(0);
                        if (e.target != text && !$.contains(text, e.target))//not clicking on the text or its children
                            return false;
                    }

                    return;
                }
                //
                var sub = link_element.next().get(0);

                //if we are opening this submenu, close all other submenus except the ".active" one
                if (!$(sub).is(':visible')) { //if not open and visible, let's open it and make it visible
                    var parent_ul = $(sub.parentNode).closest('ul');
                    if (($minimized && parent_ul.hasClass('nav-list')) && saveNavigation) return;

                    parent_ul.find('.open > .submenu').each(function () {
                        //close all other open submenus except for the active one
                        if (this != sub && !$(this.parentNode).hasClass('active')) {
                            $(this).slideUp(200).parent().removeClass('open');

                            //uncomment the following line to close all submenus on deeper levels when closing a submenu
                            //$(this).find('.open > .submenu').slideUp(0).parent().removeClass('open');
                        }
                    });                    
                    
                    if (saveNavigation) {
                        NavigationService.saveUserProfileNavigationHistory(item.Id);
                    }
                } else {
                    //uncomment the following line to close all submenus on deeper levels when closing a submenu
                    //$(sub).find('.open > .submenu').slideUp(0).parent().removeClass('open');                    
                    if (saveNavigation) {
                        NavigationService.saveUserProfileNavigationHistory(item.ParentId);
                    }                        
                }

                if (($minimized && $(sub.parentNode.parentNode).hasClass('nav-list')) && saveNavigation) return false;

                $(sub).slideToggle(200).parent().toggleClass('open');
                return false;
            };
        }
    }]);

})(Phoenix.Directives);