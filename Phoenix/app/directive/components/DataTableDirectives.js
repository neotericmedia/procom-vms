/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
(function (directives) {
    'use strict';
    /**
        @name directives.ptDataTable
        @description
        Used as DataTable extension
        Attributes:
             data-ng-model           - model.data
             data-ao-column-defs     - is dataTables way of providing fine control over column config
             data-ao-columns         - Tell the dataTables plugin what columns to use. We can either derive them from the dom, or use setup from the controller               
             data-show-action-column - (bool) identify flag to show actions column
             data-show-filter        - (bool) identify flag to show filter
             data-show-pagination    - (bool) identify flag to show pagination
             data-enable-pagination-rows-number - (int) enable pagination when rows number bigger than
             data-row-callback       - row callback function name. Function signature: function(item){} there item - is selected item.
             data-table-callback     - table callback function name. Function signature: function(item){} there item - is selected item.
             data-toolbar-url        - relative tool bar url (= attrs.toolBarUrl || '/template/DataTable/DataTableToolbar')
             data-links-render-callback   - links render callback function name. Function signature: function(mDataProp, item){} there mDataProp-in property name in columnDefs array; item - is selected item.

        example:   
        <div data-pt-data-table="" 
             data-ng-model="model.data" 
             data-ao-column-defs="columnDefs"
             data-show-action-column="true"
             data-show-filter="true"
             data-show-pagination="true"
             data-enable-pagination-rows-number="0"
             data-row-callback="rowCallback"
             data-table-callback="tableCallback"
             data-refresh-event="event:org-roles-refresh"
             data-tool-bar-url="/template/DataTable/DataTableToolbarRole" 
             data-links-render-callback="linksRenderCallback"
        >
        **/
    directives.directive('ptDataTable', ['$http', '$cacheFactory', '$rootScope', '$templateCache', function ($http, $cacheFactory, $rootScope, $templateCache) {
        return {
            restrict: 'A',
            require: '^ngModel',
            scope: true,
            transclude: true,
            templateUrl: '/Template/Components/DataTable/DataTable',
            controller: ['$scope', '$element', '$attrs', '$transclude', '$timeout', function ($scope, $element, $attrs, $transclude, $timeout) {
            }],
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                var cache = $cacheFactory.get('templates');
                if (!cache) {
                    cache = $cacheFactory('templates');
                }

                if (!scope.table) {
                    scope.table = {
                        activeRow: null,
                        activeItem: null,
                        selectedRow: null,
                        selectedItem: null
                    };
                }

                // extract callback functions
                if (attrs.rowCallback) scope.rowCallback = scope.$eval(attrs.rowCallback);
                if (attrs.tableCallback) scope.tableCallback = scope.$eval(attrs.tableCallback);
                if (attrs.linksRenderCallback) scope.linksRenderCallback = scope.$eval(attrs.linksRenderCallback);

                // identify flag to show actions column
                // (actions column is last one)
                scope.table.showActionColumn = false;
                if (attrs.showActionColumn) {
                    if (angular.isString(attrs.showActionColumn)) {
                        scope.table.showActionColumn = (attrs.showActionColumn.toLowerCase() == 'true');
                    }
                    else {
                        scope.table.showActionColumn = attrs.showActionColumn;
                    }
                }

                // identify flag to show create button
                // (actions column is last one)
                scope.table.showCreateButton = false;
                if (attrs.showCreateButton) {
                    if (angular.isString(attrs.showCreateButton)) {
                        scope.table.showCreateButton = (attrs.showCreateButton.toLowerCase() == 'true');
                    }
                    else {
                        scope.table.showCreateButton = attrs.showCreateButton;
                    }
                }

                // identify flag to show create button
                // (actions column is last one)
                scope.table.showSettingsButton = false;
                if (attrs.showSettingsButton) {
                    if (angular.isString(attrs.showSettingsButton)) {
                        scope.table.showSettingsButton = (attrs.showSettingsButton.toLowerCase() == 'true');
                    }
                    else {
                        scope.table.showSettingsButton = attrs.showSettingsButton;
                    }
                }

                // identify flag to show filter
                scope.table.showFilter = true;
                if (attrs.showFilter) {
                    if (angular.isString(attrs.showFilter)) {
                        scope.table.showFilter = (attrs.showFilter.toLowerCase() == 'true');
                    }
                    else {
                        scope.table.showFilter = attrs.showFilter;
                    }
                }

                // identify flag to show Pagination
                scope.table.showPagination = true;
                if (attrs.showPagination && angular.isString(attrs.showPagination) && attrs.showPagination.toLowerCase() == 'false') {
                    scope.table.showPagination = false;
                    $('.dataTables_paginate').hide();
                }

                //#region Define Options

                // apply DataTable options, use defaults if none specified by user
                if (attrs.ptDataTable.length > 0) {
                    scope.table.options = scope.$eval(attrs.ptDataTable);
                } else {
                    scope.table.options = {
                        bStateSave: true,
                        iCookieDuration: 2419200, /* 1 month */
                        bPaginate: scope.table.showPagination,
                        bLengthChange: true,
                        bDeferRender: true,
                        bFilter: scope.table.showFilter,
                        bInfo: scope.table.showPagination,
                        bDestroy: true,
                        Processing: true,
                        bAutoWidth: false,
                        bSortCellsTop: true,
                        oLanguage: {
                            sSearch: "Search: ",
                            sLengthMenu: "Show _MENU_ entries",
                            sZeroRecords: "&nbsp;"
                        },
                        sPaginationType: 'full_numbers',
                        //sDom: "<'panel-heading' <'row' <'col-lg-4'> <'col-lg-8'<'table-reset-wrapper'>f<'table-tool-wrapper'>>>> rt <'panel-footer' <'row' <'col-lg-2'<'form-control-static'l>><'col-lg-4'<'form-control-static'i>> <'col-lg-6'<'pull-right'p>> >>"
                        //sDom: "<'panel-heading' > rt <'panel-footer' <'row' <'col-lg-2'<'form-control-static'l>><'col-lg-4'<'form-control-static'i>> <'col-lg-6'<'pull-right'p>> >>"
                        sDom: "<'panel-heading' > rt <'panel-footer' <'row' <'col-lg-2 paginiation-detail'<'form-control-static'l>><'col-lg-4'<'form-control-static'i>> <'col-lg-6 paginiation-detail'<'pull-right'p>> >>"
                    };
                }

                // Tell the dataTables plugin what columns to use
                // We can either derive them from the dom, or use setup from the controller               
                if (attrs.aoColumns) {
                    scope.table.options.aoColumns = scope.$eval(attrs.aoColumns);
                } else {
                    var explicitColumns = [];
                    var theadrows = element.find('thead > tr');
                    if (theadrows > 0) {
                        $(theadrows[0]).find('th').each(function (index, elem) {
                            explicitColumns.push($(elem).text());
                        });
                    }
                    if (explicitColumns.length > 0) {
                        scope.table.options.aoColumns = explicitColumns;
                    }
                }

                // aoColumnDefs is dataTables way of providing fine control over column config
                if (attrs.aoColumnDefs) {
                    scope.table.options.aoColumnDefs = scope.$eval(attrs.aoColumnDefs);
                }

                scope.table.numberOfColumns = function () {
                    var result = 0;
                    if (scope.table.options.aoColumnDefs) {
                        result = scope.table.options.aoColumnDefs.length;
                    }
                    else if (scope.table.options.aoColumns) {
                        result = scope.table.options.aoColumns.length;
                    }
                    return result;
                };

                //#endregion

                //#region Row Event Handling

                scope.rowAction = function (rowaction) {

                    if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                        $timeout(function() {
                            if (scope.rowCallback) {
                                scope.rowCallback(rowaction, scope.table.activeItem);
                            }
                        }, 0);
                    }

                };

                scope.tableAction = function (tableaction) {

                    if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                        $timeout(function() {
                            if (scope.tableCallback) {
                                scope.tableCallback(tableaction, scope.table.activeItem);
                            }
                        }, 0);
                    }

                };

                scope.doubleClickHandler = function (item, row) {
                    selectItem(item, row);
                    scope.rowAction('dblclick', item);
                };

                scope.clickHandler = function (item, row) {
                    selectItem(item, row);
                    scope.rowAction('click', item);
                };

                scope.hoverHandler = function (item, row) {
                    activateItem(item, row);
                };

                scope.rowRenderCallback = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

                    // add rowlink class
                    $(nRow).addClass('rowlink');

                    // if user specify custom renderer for links
                    if (scope.linksRenderCallback) {

                        var unbindOn = function (scope, aData, nRow) {
                            scope.clickHandler(aData, nRow);
                        };

                        for (var c = 0; c < scope.table.numberOfColumns() ; c++) {
                            var mDataProperty = scope.table.options.aoColumnDefs[c].mDataProp;
                            if (mDataProperty && mDataProperty.length > 0) {
                                var linkHref = scope.linksRenderCallback(mDataProperty, aData);
                                if (linkHref.length > 0) {
                                    var linkValue = aData[scope.table.options.aoColumnDefs[c].mData];
                                    $('td:eq(' + c + ')', nRow).html('<a href="' + linkHref + '">' + linkValue + '</a>');
                                } else {
                                    $('td:eq(' + c + ')', nRow).unbind('click').on('click', unbindOn(scope, aData, nRow));
                                }
                            }
                        }
                    } else {
                        $('td', nRow).unbind('click').on('click', function () {
                            scope.clickHandler(aData, nRow);
                        });
                    }
                    $('td', nRow).unbind('dblclick').on('dblclick', function () {
                        scope.doubleClickHandler(aData, nRow);
                    });
                    $('td', nRow).hover(function () {
                        scope.hoverHandler(aData, nRow);
                    });

                    var colSelector = 'td:eq(' + (scope.table.numberOfColumns() - 1).toString() + ')',
                        actionHtml = [];

                    if (scope.table.showActionColumn === true) {
                        actionHtml.push('<div class="btn-group">' +
                            '<button type="button" class="btn btn-xs btn-clouds btn-row-action" data-action="view" title="View"><i class="fontello-icon-eye-1"></i>&nbsp;</button>' +
                            '</div>');
                    }

                    if (scope.table.showCreateButton) {
                        actionHtml.push('<div class="btn-group">' +
                            '<button type="button" class="btn btn-xs btn-clouds btn-row-action" data-action="create" title="Create"><i class="fontello-icon-edit-1"></i>&nbsp;</button>' +
                            '</div>');
                    }

                    if (scope.table.showSettingsButton) {
                        actionHtml.push('<div class="btn-group">' +
                            '<button type="button" class="btn btn-xs btn-clouds btn-row-action" data-action="settings" title="Settings"><i class="fontello-icon-tools"></i>&nbsp;</button>' +
                            '</div>');
                    }

                    if (actionHtml.length > 0) {
                        $(colSelector, nRow).html(actionHtml.join(''));
                    }
                    return nRow;
                };

                scope.table.options.fnRowCallback = scope.rowRenderCallback;

                //#endregion

                // apply the plugin
                var oTable = element.find('table').dataTable(scope.table.options);

                //function isInt(value) {
                //    var er = /^[0-9]+$/;
                //    return (er.test(value)) ? true : false;
                //}
                //if (attrs.enablePaginationRowsNumber && isInt(attrs.enablePaginationRowsNumber)) {
                //    var RowsNumber1 = oTable.fnGetData().length;
                //    var RowsNumber2 = oTable.fnSettings()._iRecordsTotal;
                //    if (parseInt(attrs.enablePaginationRowsNumber) > RowsNumber1)
                //    {
                //        $('.dataTables_paginate').hide();
                //    }
                //}


                var rows = element.find('thead > tr');
                if (rows.length > 1) {
                    oTable.columnFilter({
                        sPlaceHolder: "head:after"
                    });
                }

                $(element).on("click", ".resetTable", function (event) {
                    oTable.fnFilterClear();
                });

                // toolBarUrl
                var toolbarUrl = attrs.toolbarUrl || '/Template/Components/DataTable/DataTableToolbar';
                if (toolbarUrl) {
                    var toolbarTemplate = $templateCache.get(toolbarUrl);
                    if (!toolbarTemplate) {
                        $http.get(toolbarUrl).then(function (response) {
                            toolbarTemplate = response.data;
                            $(element).parent().find('.table-tool-wrapper').html(toolbarTemplate);
                            $templateCache.put(toolbarUrl, toolbarTemplate);
                        });
                    }
                    else {
                        $(element).parent().find('.table-tool-wrapper').html(toolbarTemplate);
                    }
                }

                // resetToolBarUrl
                var resetToolbarUrl = '/Template/Components/DataTable/DataTableToolbarReset';
                var resetToolbarTemplate = $templateCache.get(resetToolbarUrl);
                if (!resetToolbarTemplate) {
                    $http.get(resetToolbarUrl).then(function (response) {
                        resetToolbarTemplate = response.data;
                        $(element).parent().find('.table-reset-wrapper').html(resetToolbarTemplate);
                        $templateCache.put(resetToolbarUrl, resetToolbarTemplate);
                    });
                }
                else {
                    $(element).parent().find('.table-reset-wrapper').html(resetToolbarTemplate);
                }
                //$(element).parent().find('.table-action-wrapper').load('/template/DataTable/DataTableToolbarActions');
                //$(element).find('select').select2();


                $(element).on("click", ".btn-row-action", function (event) {
                    var action = $(this).data('action');
                    scope.rowAction(action);
                });

                $(element).on("click", ".btn-table-action", function (event) {
                    var action = $(this).data('action');
                    scope.tableAction(action);
                });

                // Handle Model Initialization and Change
                ngModel.$render = function () {
                    var val = ngModel.$viewValue || null;
                    if (val) {
                        oTable.fnClearTable();
                        oTable.fnAddData(val);
                        var oSettings = oTable.fnSettings();

                        if (val.length <= 10) {
                            $(oSettings.nTableWrapper).find(".paginiation-detail").hide();
                        } else {
                            $(oSettings.nTableWrapper).find(".paginiation-detail").show();
                        }



                    }
                };
                ngModel.$render();

                if (attrs.refreshEvent) {
                    // listen for event to retrieve audit info
                    var refreshEventHandler = $rootScope.$on(attrs.refreshEvent, function (event) {
                        var val = ngModel.$viewValue || null;
                        if (val) {
                            oTable.fnClearTable();
                            oTable.fnAddData(val);

                        }

                    });

                    scope.$on("$destroy", function () {
                        refreshEventHandler();
                    });
                }

                //#region Private Methods

                function selectItem(item, row) {
                    if (scope.table.selectedRow) {
                        $(scope.table.selectedRow).removeClass('selected-row');
                    }
                    scope.table.selectedItem = item;
                    scope.table.selectedRow = row;
                    if (scope.table.selectedRow) {
                        $(scope.table.selectedRow).addClass('selected-row');
                    }
                }

                function activateItem(item, row) {
                    if (scope.table.activeRow) {
                        $(scope.table.activeRow).removeClass('active-row');
                    }
                    scope.table.activeItem = item;
                    scope.table.activeRow = row;
                    if (scope.table.activeRow) {
                        $(scope.table.activeRow).addClass('active-row');
                    }
                }

                //#endregion
            }
        };
    }]);

})(Phoenix.Directives);