(function (directives) {
    'use strict';

    directives.directive('ptBookmarkSideMenu', ['$rootScope', '$state', '$location', 'UserProfileBookmarkApiService', 'phxLocalizationService', function ($rootScope, $state, $location, UserProfileBookmarkApiService, phxLocalizationService) {
        var directive = {
            restrict: 'A',
            scope: { eventname: '=eventname' },
            templateUrl: '/Phoenix/app/directive/components/MainSideBookmarkMenu.html',
            //controller: ['$scope', controller],
            link: link
        };
        //{ eventname: '=' }
        return directive;

        //function controller($scope) {
        //}

        function link(scope, elem, attr) {
            scope.localization = {
                noBookmarksMessage          :   'You have no bookmarks',
                editBookmarkTitleLabel      :   'Edit Bookmark Title',
                updateBookmarkTitleLabel    :   'Update Bookmark Title',
                deleteBookmarkLabel         :   'Delete Bookmark',
                titleLabel                  :   'Title',
                dateLabel                   :   'Date',
                typeLabel                   :   'Type'
            };

            Object.keys(scope.localization).forEach(
                function(key, index)
                {
                    scope.localization[key] = phxLocalizationService.translate('navigation.bookmark.' + key);
                });

            scope._component = {};
            scope._component.items = [];
            scope._component.itemsGrouped = [];
            scope._component.count = 0;
            scope.openOptions = "";
            scope.showEditAndDelete = false;
            scope.showAdd = false;
            scope.bookmarkCurrent = {};
            scope.isUpdateBookmarkFormList = [];
            scope.showAddingBookmark = true;
            scope.bookmarked = false;
            scope.stateMinimized = false;
            //scope.updateBookmarkForm = false;
            scope.tempBookmark = false;
            //scope.maxWidthStyle = {};
            //scope.lastSavedItem = {};
            scope.openedDetails = [];
            scope.orderByRepeatReverse = true;
            scope.orderByRepeatProperty = "-title";
            scope.lastHoveredBookmark = "";
            scope.defaultLayout = true;
            scope.firstActiveNoLonger = true;
            //scope.skipWatcherWatch = false;
            //scope.eventName = attr.eventname;

            scope.onLaunch = function () {
                //if (scope.eventName === 'AddToFavourites') {
                //    scope.showAdd = true;
                //} else {
                //    scope.showAdd = false;
                //}
                //scope.eventname === 'AddToFavourites' ? scope.showAdd = true : scope.showAdd = false;
                scope.getBookmarks();
            }

            scope.getBookmarks = function () {
                // request bookmark settings, using the user id, which is found in the assembler
                UserProfileBookmarkApiService.getBookmarkByUser().then(
                    function (responseSuccess) {
                        //scope._component.items.length = 0;
                        scope._component.items = [];
						if (responseSuccess.Items && responseSuccess.Items.length > 0) {
                            var url = $location.$$absUrl;
                            for (var y = 0; y < responseSuccess.Items.length; y++) {
                                var bookmark = {
                                    "id": responseSuccess.Items[y].Id,
                                    "lastModifiedDatetime": responseSuccess.Items[y].LastModifiedDatetime,
                                    "pathName": responseSuccess.Items[y].PathName,
                                    "statePath": responseSuccess.Items[y].StatePath,
                                    "description": responseSuccess.Items[y].Description,
                                    "creationDate": responseSuccess.Items[y].CreationDate,
                                    "title": responseSuccess.Items[y].Title,
                                    "icon": responseSuccess.Items[y].Icon,
                                    "associatedType": responseSuccess.Items[y].AssociatedType,
                                    "tempValue": responseSuccess.Items[y].Title,
                                    "showEditDeleteSaveMenu": false
                                };
                                scope._component.items.push(bookmark);
                                if (url == responseSuccess.Items[y].PathName) {
                                    scope.bookmarked = true;
                                }
                            }
                            if (scope.bookmarked) {
                                scope.showAdd = false;
                                scope.changeFavouriteIconOutsideScope();
                            } else {
                                scope.showAdd = true;
                            }
                            //scope._component.items = responseSuccess.Items;
                            scope._component.count = responseSuccess.Items.length;

                            // Make a new list that has the bookmarks grouped accordingly, and can be grouped in folders
                            // scope.makeGroupedBookmarkList();
                        }
                    },
                    function (responseError) {
                        console.log('getBookmarkByUser', responseError);
                    }
                );
            };

            scope.changeFavouriteIconOutsideScope = function () {
                // search by class 'shortcut-add-bookmark', and replace the innerhtml from 'star_border' to 'star'
                var shortcutAddBookmark = document.getElementsByClassName("shortcut-add-bookmark");
                if (scope.bookmarked) {
                    shortcutAddBookmark[0].innerHTML = 'star';
                    scope.bookmarked = false;
                } else {
                    shortcutAddBookmark[0].innerHTML = 'star_border';
                }
            }

            // scope._component.items + folders -> scope._component.itemsGrouped
            scope.makeGroupedBookmarkList = function () {
                // Idea: scan _component.items and for each unique first part of a StateName(prior to reaching a dot in the State.name),
                // make a new object if it doesnt already exist and shove the bookmark inside.
                scope._component.itemsGrouped.length = 0;
                for (var e = 0; e < scope._component.items.length; e++) {
                    var foundFoldername = false;
                    for (var w = 0; w < scope._component.itemsGrouped.length; w++) {
                        if (scope._component.itemsGrouped[w].folderType == scope._component.items[e].associatedType) {
                            foundFoldername = true;
                            scope._component.itemsGrouped[w].subItems.push(scope._component.items[e]);
                        }
                    }

                    if (foundFoldername === false) {
                        // Create a new folder object, 
                        var subFolder = [];
                        // The folder names are all lower case, therefore make the first letter a capital
                        var folderName = "";
                        var restOfFolderName = "";
                        var folderNameSliced;
                        if (scope._component.items[e].associatedType !== "undefined" && scope._component.items[e].associatedType !== "") {
                            folderNameSliced = scope._component.items[e].associatedType.split("");
                            restOfFolderName = "";
                            for (var i = 1; i < folderNameSliced.length; i++) {
                                restOfFolderName += folderNameSliced[i];
                            }
                            folderName = folderNameSliced[0].toUpperCase() + restOfFolderName;
                        }
                        subFolder.push(scope._component.items[e]);
                        var newfolderObj = {
                            "folderName": folderName,
                            "folderType": scope._component.items[e].associatedType,
                            "subItems": subFolder,
                            "icon": scope._component.items[e].icon,
                            "hasSubItems": true,
                            "code": "BookmarkFolder" + scope._component.items[e].associatedType
                        };

                        // Add folder object to itemsGrouped
                        scope._component.itemsGrouped.push(newfolderObj);
                    }
                }
            };

            scope.onLaunch();

            //Upon hover over booked bookmark, open up arrow below to give the option to see details of the bookmark
            scope.onMouseEnterBookmark = function (bookmarkPathName) {
                scope.lastHoveredBookmark = bookmarkPathName;
            };

            scope.makeFirstOneActive = function () {
                scope.firstActiveNoLonger = true;
            }

            scope.makeFirstOneDeactive = function () {
                scope.firstActiveNoLonger = false;
            }

            scope.redirection = function (url) {
                window.location = url;
            };

            scope.openDetailsAdd = function (uniquePathName) {
                var indexOfItem = 0;
                var isInList = false;
                for (var t = 0; t < scope.openedDetails.length; t++) {
                    if (scope.openedDetails[t] == uniquePathName) {
                        isInList = true;
                        indexOfItem = t;
                    }
                }
                if (isInList) {
                    scope.openedDetails.splice(indexOfItem, 1);
                } else {
                    scope.openedDetails.push(uniquePathName);
                }
            };

            scope.isOpenDetails = function (uniquePathName) {
                for (var t = 0; t < scope.openedDetails.length; t++) {
                    if (scope.openedDetails[t] == uniquePathName) {
                        return true;
                    }
                }
                return false;
            };

            scope.updateBookmarkPrecursor = function (item) {
                //scope.updateBookmarkForm = true;
                //scope.lastSavedItem = item;
                //scope.bookmarkCurrent = {};
                //scope.bookmarkCurrent.title = item.title;
                
                //for (var i = 0; i < scope._component.items.length; i++) {
                //    if (scope._component.items[i].pathName == item.pathName) {
                //        scope._component.items[i].temp
                //    }
                //}

                var isFound = false;
                for (var t = 0; t < scope.isUpdateBookmarkFormList.length; t++) {
                    if (scope.isUpdateBookmarkFormList[t] == item.pathName) {
                        isFound = true;
                    }
                }
                if (!isFound) {
                    scope.isUpdateBookmarkFormList.push(item.pathName);
                }
            };
                //if (lastpathname !== item.pathname && scope.updatebookmarkform === true) {
                //    // remain the update screen open
                //}
                //else if (scope.updatebookmarkform !== true) {
                //    // if its closed then start showing the update screen
                //    scope.updatebookmarkform = true;
                //}
                //else if (scope.updatebookmarkform === true) {
                //    // if open and is the same item that opened it, then close it
                //    scope.updatebookmarkform = false;
                //}
                //lastpathname = item.pathname;

                //if (scope.showaddingbookmark) {
                //    scope.showaddingbookmark = false;
                //}
                //// if update screen is open as a result of running this function, then update the innerhtml of the title and description of those fields with the chosen item
                //if (scope.updatebookmarkform === true) {
                //    // update style on form
                //    scope.maxwidthstyle = { 'max-width': "141px" };

                //    scope.bookmarkcurrent.title = item.title;
                //    scope.bookmarkcurrent.description = item.description;
                //}
            

            //// Revise if this function will be needed later on.
            //scope.updateBookmarkPrecursor = function (item) {
            //    lastSavedItem = item;
            //    if (lastPathName !== item.pathName && scope.updateBookmarkForm === true) {
            //        // remain the update screen open
            //    }
            //    else if (scope.updateBookmarkForm !== true) {
            //        // if its closed then start showing the update screen
            //        scope.updateBookmarkForm = true;
            //    }
            //    else if (scope.updateBookmarkForm === true) {
            //        // if open and is the same item that opened it, then close it
            //        scope.updateBookmarkForm = false;
            //    }
            //    lastPathName = item.pathName;

            //    if (scope.showAddingBookmark) {
            //        scope.showAddingBookmark = false;
            //    }
            //    // if update screen is open as a result of running this function, then update the innerHtml of the title and description of those fields with the chosen item
            //    if (scope.updateBookmarkForm === true) {
            //        // update style on form
            //        scope.maxWidthStyle = { 'max-width': "141px" };

            //        scope.bookmarkCurrent.title = item.title;
            //        scope.bookmarkCurrent.description = item.description;
            //    }
            //};

            scope.$watch('eventname', function (eventValue) {
                //do something with the new time
                //if (scope.bookmarked !== true) {
                //scope.eventname === 'addtofavourites' ? scope.showadd = true : scope.showadd = false;
                //if (scope._component.items.length == 0) {
                //    scope.showAddPreparation();
                //}
                //if (!scope.skipWatcherWatch) {
                //if (scope.bookmarked) {
                scope.changeFavouriteIconOutsideScope();

                if (eventValue === 'AddToFavourites' || eventValue === 'AddToFavouritesA') {
                    scope.showAdd = true;
                    scope.showEditAndDelete = false;
                    scope.showOrderOptions = false;
                    scope.showAddPreparation();
                } else {
                    if (scope._component.items.length !== 0) {
                        scope.showAdd = false;
                        scope.showEditAndDelete = false;
                        scope.showOrderOptions = false;
                    } else {
                        scope.showAdd = true;
                        scope.showAddPreparation();
                    }
                }
                //} else {
                //scope.showAdd = true;
                //}
                //} else {
                //    scope.showAdd = false;
                //    scope.showEditAndDelete = false;
                //    scope.showOrderOptions = false;
                //}
            });

            scope.showAddPreparation = function () {
                // insert default field name
                //var prependTitle = "";
                //var addedFirst = false;
                //var titleFeed = $rootScope.pageTitleDecorators;
                //for (var i = 0; i < titleFeed.length; i++) {
                //    if (titleFeed[i].ShowText) {
                //        if (addedFirst) {
                //            prependTitle += " - " + titleFeed[i].Text;
                //        } else {
                //            prependTitle += titleFeed[i].Text;
                //        }
                //        addedFirst = true;
                //    }
                //}
                var prependTitle = "";
                var titleFeed = $rootScope.pageTitleDecorators;
                if (typeof titleFeed != 'undefined' && titleFeed.length > 0) {
                    prependTitle = titleFeed[titleFeed.length - 1].Text;
                    if (titleFeed.length > 1) {
                        if (!isNaN(prependTitle) || !isNaN(parseInt(prependTitle.charAt(0)))) {
                            // If first character is a number
                            prependTitle = titleFeed[titleFeed.length - 2].Text + ' - ' + prependTitle;
                        }
                    }
                }

                scope.bookmarkCurrent.title = prependTitle;
            }
            
            scope.filterByTitle = function () {
                if (scope.orderByRepeatProperty == '-title') {
                    scope.orderByRepeatReverse = !scope.orderByRepeatReverse;
                } else {
                    scope.orderByRepeatProperty = '-title';
                }
            };

            scope.filterByCreateDate = function () {
                if (scope.orderByRepeatProperty == '-creationDate') {
                    scope.orderByRepeatReverse = !scope.orderByRepeatReverse;
                } else {
                    scope.orderByRepeatProperty = '-creationDate';
                }
            };

            scope.filterByType = function () {
                if (scope.orderByRepeatProperty == '-icon') {
                    scope.orderByRepeatReverse = !scope.orderByRepeatReverse;
                } else {
                    scope.orderByRepeatProperty = '-icon';
                }
            };

            // Redirection Menu function
            scope.itemClick = function (item) {
                //check to see if we have clicked on an element which is inside a .dropdown-toggle element?!
                //if so, it means we should toggle a submenu
                var link_element = $('#' + item.code).closest('a');

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
                    if ($minimized && parent_ul.hasClass('nav-list')) return;

                    parent_ul.find('* > .open > .submenu').each(function () {
                        //close all other open submenus except for the active one
                        if (this != sub && !$(this.parentNode).hasClass('active')) {
                            $(this).slideUp(200).parent().removeClass('open');

                            //uncomment the following line to close all submenus on deeper levels when closing a submenu
                            //$(this).find('.open > .submenu').slideUp(0).parent().removeClass('open');
                        }
                    });
                } else {
                    //uncomment the following line to close all submenus on deeper levels when closing a submenu
                    //$(sub).find('.open > .submenu').slideUp(0).parent().removeClass('open');
                }

                if (scope.$minimized && $(sub.parentNode.parentNode).hasClass('nav-list')) return false;

                $(sub).slideToggle(200).parent().toggleClass('open');
                return false;
            };

            scope.isFoundPathNameInUpdateList = function (item) {
                for (var i = 0; i < scope.isUpdateBookmarkFormList.length; i++) {
                    if (scope.isUpdateBookmarkFormList[i] == item.pathName) {
                        return true;
                    }
                }
                return false;
            }

            scope.bookmarkAdd = function (title) {
                // Take the current page that the user is on, and output an error if the state name and the location name do not match, in the case that the user is currently navigating to different pages.
                // Also use $root.activateGlobalSpinner to avoid disturbance of booking the wrong the page, before the page has loaded.
                // Add the following StateRoutingName and url to the BookmarkList and replace the user's bookmarklist
                // Consider maybe changing the routeName to $scope.$state.$current.url.prefix;
                var StateRoutingName = $state.current.name;
                var url = $location.$$absUrl;
                var assocaitedType = StateRoutingName.split(".")[0];

                // Check to make sure that the route name doesn't already exist
                var foundPathName = scope.doesBookmarkExistInList(url);

                var description = '';
                description = description === '' ? 'No description given.' : description;

                var titleFeed = $rootScope.pageTitleDecorators;
                var setIcon = "";
                if (typeof titleFeed != 'undefined' && titleFeed.length > 0) {
                     setIcon = titleFeed[0].Icon;
                }

                // Add the Statename to be able to href to it, into scope._component.items
                if (!foundPathName && typeof title != 'undefined' && typeof description != 'undefined' && typeof assocaitedType != 'undefined') {
                    // Make subfolders, split State name at dots, base parent/folder upon first name before dot; StateRoutingName
                    var newBookmarkObj = {
                        WorkflowPendingTaskId: -1,
                        "pathName": url,
                        "statePath": StateRoutingName,
                        "description": description,
                        "title": title,
                        "creationDate": new Date(),
                        "icon": setIcon,
                        "associatedType": assocaitedType
                    };
                    scope._component.items.push(newBookmarkObj);
                    UserProfileBookmarkApiService.addUpdateBookmark(newBookmarkObj)
                        .then(function () { scope.getBookmarks(); });
                    scope.bookmarked = true;
                    scope.changeFavouriteIconOutsideScope();
                    scope.showAddingBookmark = false;

                    // Add bookmark to grouped list on the fly
                    var noFolder = true;
                    for (var k = 0; k < scope._component.itemsGrouped.length; k++) {
                        if (scope._component.itemsGrouped[k].folderType === assocaitedType) {
                            noFolder = false;
                            scope._component.itemsGrouped[k].subItems.push(newBookmarkObj);
                            k = scope._component.itemsGrouped.length;
                        }
                    }

                    // Create a new folder if none fits the existing criteria
                    if (noFolder) {
                        var folderNameSliced = assocaitedType.split("");
                        var restOfFolderName = "";
                        for (var i = 1; i < folderNameSliced.length; i++) {
                            restOfFolderName += folderNameSliced[i];
                        }
                        var folderName = folderNameSliced[0].toUpperCase() + restOfFolderName;
                        var subFolder = [];
                        subFolder.push(newBookmarkObj);
                        var newfolderObj = {
                            "folderName": folderName,
                            "folderType": assocaitedType,
                            "subItems": subFolder,
                            "icon": $rootScope.icon,
                            "hasSubItems": true,
                            "code": "BookmarkFolder" + assocaitedType
                        };

                        // Add folder object to itemsGrouped
                        scope._component.itemsGrouped.push(newfolderObj);
                    }
                }
                // else {
                // already bookmarked
                // }

                scope.showAdd = false;  
            };

            scope.bookmarkUpdate = function (item) {
                //var openTitles = document.getElementsByName(item.pathName);
                //var title = document.getElementsByName(item.pathName).value;
                var title = item.tempValue;
                var a = $rootScope;
                var b = $location;
                var c = $state;
                // Check to make sure that the route name doesn't already exist
                var foundPathName = false;
                var indexOfBookmark = 0;
                var description = '';
                description = description === '' ? 'No description given.' : description;
                for (var j = 0; j < scope._component.items.length; j++) {
                    if (scope._component.items[j].pathName == item.pathName) {
                        foundPathName = true;
                        indexOfBookmark = j;
                    }
                }

                if (foundPathName && typeof title != 'undefined' && typeof description != 'undefined') {
                    //item.color = color;
                    scope._component.items[indexOfBookmark].description = description;
                    scope._component.items[indexOfBookmark].title = title;
                    var command = scope._component.items[indexOfBookmark];
                    command.WorkflowPendingTaskId = -1;
                    UserProfileBookmarkApiService.addUpdateBookmark(command)
                        .then(function () { scope.
                            getBookmarks(); });
                    // close update screen
                    for (var r = 0; r < scope.isUpdateBookmarkFormList.length; r++) {
                        if (scope.isUpdateBookmarkFormList[r] == item.pathName) {
                            scope.isUpdateBookmarkFormList.splice(r, 1);
                        }
                    }

                    //scope.updateBookmarkForm = false;
                }
            };

            //scope.bookmarkUpdate = function (item) {

            //};

            //scope.bookmarkEdit = function (item) {
            //    scope.bookmarkCurrent = angular.copy(item);
            //}

            scope.bookmarkDelete = function (item) {
                // scope._component.items and the source of this array, needs to remove the currently selected bookmark.
                // Hence replace the current BookmarkList on the server side

                var url = $location.$$absUrl;
                var foundPathName = false;
                var indexOfBookmark = 0;
                for (var y = 0; y < scope._component.items.length; y++) {
                    if (scope._component.items[y].pathName == item.pathName) {
                        foundPathName = true;
                        indexOfBookmark = y;
                        break;
                    }
                }

                // close update screen
                for (var r = 0; r < scope.isUpdateBookmarkFormList.length; r++) {
                    if (scope.isUpdateBookmarkFormList[r] == item.pathName) {
                        scope.isUpdateBookmarkFormList.splice(r, 1);
                    }
                }

                if (foundPathName) {
                    // Cut item out of scope._component.items
                    var objTemp = {
                        "Id": item.id,
                        "LastModifiedDatetime": item.lastModifiedDatetime,
                        "pathName": item.pathName
                    };
                    UserProfileBookmarkApiService
                        .bookmarkDelete(objTemp)
                        .then(function () {
                            scope._component.items.splice(indexOfBookmark, 1);
                            if (item.pathName == url) {
                                scope.bookmarked = false;
                                scope.changeFavouriteIconOutsideScope();
                                scope.showAdd = false;
                            }

                            var subItemsLength = 0;
                            for (var j = 0; j < scope._component.itemsGrouped.length; j++) {
                                subItemsLength = scope._component.itemsGrouped[j].subItems.length;
                                for (var k = 0; k < subItemsLength; k++) {
                                    if (scope._component.itemsGrouped[j].subItems[k].pathName == item.pathName) {
                                        // get rid of folder
                                        if (scope._component.itemsGrouped[j].subItems.length == 1) {
                                            if (scope._component.itemsGrouped.length == 1) {
                                                // There are no folders
                                                scope._component.itemsGrouped = [];
                                            } else {
                                                // Remove one of the folder
                                                scope._component.itemsGrouped.splice(j, 1);
                                            }
                                        }
                                            // splice one of the bookmarks in the folder
                                        else {
                                            scope._component.itemsGrouped[j].subItems.splice(k, 1);
                                        }
                                        break;
                                    }
                                }
                            }
                        });

                }
                //else{
                // the selected bookmark does not exist
                //}
            };

            // return boolean
            scope.doesBookmarkExistInList = function (pathName) {
                var foundPathName = false;
                for (var j = 0; j < scope._component.items.length; j++) {
                    if (scope._component.items[j].pathName == pathName) {
                        foundPathName = true;
                    }
                }
                return foundPathName;
            };

            // Upon changing state
            scope.$on('$stateChangeSuccess', function () {
                scope.bookmarked = scope.isBookmarked();
                scope.showAddingBookmark = false;
                scope.changeFavouriteIconOutsideScope();
            });

            scope.isBookmarked = function () {
                var result = false;
                var url = $location.$$absUrl;
                for (var t = 0; t < scope._component.items.length; t++) {
                    if (scope._component.items[t].pathName == url) {
                        result = true;
                    }
                }
                return result;
            }

            //if (scope.eventName === 'AddToFavourites') {
            //    scope.showAddingBookmark = !scope.showAddingBookmark && !scope.isBookmarked();
            //    if (scope.showAddingBookmark) {
            //        scope.updateBookmarkForm = false;
            //        // Update style on form
            //        scope.maxWidthStyle = {};
            //        //var additionalNumber = $location.$$url.split('/');
            //        //if (additionalNumber.length > 0 && typeof additionalNumber[additionalNumber.length - 1] === 'number') {
            //        //    scope.bookmarkCurrent.title = $rootScope.title + additionalNumber[additionalNumber.length - 1];
            //        //    scope.bookmarkCurrent.description = $rootScope.title + additionalNumber[additionalNumber.length - 1];
            //        //} else {
            //        scope.bookmarkCurrent.title = $rootScope.title;
            //        scope.bookmarkCurrent.description = $rootScope.title;
            //        //}
            //    }
            //}
            //else if (scope.eventName === 'EditFavourites') {

            //}

            // On eventName change. If the bookmark is already added. then transfer but turn off the addBookmark flag.s




        }
    }]);

})(Phoenix.Directives);
