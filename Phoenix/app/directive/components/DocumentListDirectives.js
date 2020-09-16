/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
(function (directives) {
    'use strict';
    /**
        @name directives.ptDocumentList
        @description
        Used as FileUpload extension
        
        To reload document list call        - $rootScope.$broadcast('event:refresh-documents-list');
        
        Attributes:

             data-entity-type-id                    - (int) "ApplicationConstants.EntityType.TimeSheet" or entity type id (parent table  id to choose related document Type IDs)
             data-entity-id                         - (int) entity.Id
             data-func-get-documents-length         - callback function name to pass (int) documentsLength, (int) entityTypeId, (int) entityId
             data-func-get-document-id-to-preview   - callback function name to pass (int) pdfDocumentIdToPreview, (int) entityTypeId, (int) entityId
             data-template-url                      - template url path

        example:   
         <div data-pt-document-list=""
             data-entity-type-id="ApplicationConstants.EntityType.TimeSheet"
             data-entity-id="model.entity.Id"
             data-func-get-documents-length="getDocumentsLength"
             data-func-get-document-id-to-preview="getDocumentIdToPreview"
             data-template-url="/Phoenix/templates/Template/Components/Document/DocumentListDefault.html"
             >
         </div>
    **/

    directives.directive('ptDocumentList', ['$templateCache', '$parse', '$compile', '$q', '$http', function ($templateCache, $parse, $compile, $q, $http) {
        var getTemplate = function (templateUrl) {
            return $http.get(templateUrl, { cache: $templateCache });
        };
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                entityTypeId: "=",
                entityId: "=",
                documents: "=?",
                funcGetDocumentsLength: "&?",
                funcGetDocumentsUploadedTypes: "&?",
                funcOnDocumentDeleteException: "&?",
                accessValidateCheck: "=?",
                funcGetDocumentIdToPreview: "&?",
                templateUrl: "@?"
            },
            controller: ['$scope', '$rootScope', '$attrs', '$sce', 'common', 'dialogs', 'DocumentApiService', 'CodeValueService', '$q', 'phoenixapi',
                function ($scope, $rootScope, $attrs, $sce, common, dialogs, DocumentApiService, CodeValueService, $q, phoenixapi) {
                    //$scope.check = $parse($attrs.accessValidateCheck);
                    $scope.check = $scope.accessValidateCheck;

                    // initialize lists
                    $scope.lists = { documentTypeList: [] };
                    
                    $scope.ValidationMessages = [];

                    $scope.pdfDocumentIdToPreview = 0;

                    $scope.isInt = function (value) {
                        var er = /^[0-9]+$/;
                        return (er.test(value)) ? true : false;
                    };

                    if ($scope.entityTypeId > 0) {
                        //$scope.lists.documentTypeList = CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, $scope.entityTypeId, CodeValueGroups.EntityType);
                        $scope.lists.documentTypeList = CodeValueService.getCodeValues(CodeValueGroups.DocumentType, true);
                    }

                    $scope.$watch('entityId', function (newVal, oldVal) {
                        $scope.getEntityDocuments();
                    });

                    $scope.excludeDocumentTypeIds = [];

                    $scope.getDocumentUrl = function (pdfDocumentIdToPreview) {
                        //http://helpx.adobe.com/x-productkb/multi/swf-file-ignores-stacking-order.html
                        return $sce.trustAsResourceUrl($scope.getPdfStreamByPublicId(pdfDocumentIdToPreview) + '&wmode=transparent');
                    };

                    $scope.setDocumentIdToPreview = function (pdfDocumentIdToPreview) {
                        $scope.pdfDocumentIdToPreview = pdfDocumentIdToPreview;
                        if ($scope.funcGetDocumentIdToPreview) {
                            var fn = $scope.funcGetDocumentIdToPreview();
                            if (fn) {
                                fn($scope.pdfDocumentIdToPreview, $scope.entityTypeId, $scope.entityId);
                            }
                        }
                    };

                    $scope.getPdfStreamByPublicId = function (publicId) {
                        return DocumentApiService.getPdfStreamByPublicId(publicId);
                    };


                    if (typeof $scope.viewLoading == "undefined" || typeof $scope.stopSpinning == "undefined")
                        $scope.viewLoading = false;
                    else
                        $scope.stopSpinning();

                    $scope.selectedCount = 0;
                    $scope.totalItemCount = 0;



                    $scope.model = $scope.model || {};
                    $scope.model.search = '';

                    $scope.currentPage = 1;
                    $scope.totalItems = 0;
                    $scope.pageSize = 11;
                    $scope.pageCount = 1;
                    $scope.items = [];
                    $scope.isLoading = true;

                    $scope.loadItemsPromise = null;

                    $scope.getEntityDocumentsST = function (tableState) {
                        $scope.ValidationMessages = [];

                        if (!tableState && !$scope._tableState) {
                            getAllDocuments();
                            return;
                        }

                        if (tableState) {
                            $scope._tableState = tableState;
                            tableState.sort.predicate = tableState.sort.predicate === "FullName" ? "UploadedByContactFirstName" : tableState.sort.predicate;


                            if (tableState.search.predicateObject) {
                                if (tableState.search.predicateObject.FullName) {
                                    var fullName = tableState.search.predicateObject.FullName.replace(/'/g, "");
                                    var nameVals = fullName.split(" ");
                                    delete tableState.search.predicateObject.FullName;
                                    tableState.search.predicateObject.UploadedByContactFirstName = "'" + nameVals[0] + "'";
                                    if (nameVals.length > 1) {
                                        tableState.search.predicateObject.UploadedByContactLastName = "'" + nameVals[1] + "'";
                                    }
                                } else {
                                    delete tableState.search.predicateObject.UploadedByContactFirstName;
                                    delete tableState.search.predicateObject.UploadedByContactLastName;
                                }

                            }

                        }
                        else {
                            tableState = $scope._tableState;
                        }
                        $scope.setDocumentIdToPreview(0);
                        $scope.currentPage = $scope.currentPage || 1;

                        var isPaging = false;

                        // full refresh
                        if (tableState.pagination.start === 0) {
                            angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                            isPaging = false;
                            $scope.currentPage = 0;
                        }
                            // pagination
                        else {
                            $scope.currentPage++;
                            isPaging = true;
                        }

                        tableState.pagination.currentPage = $scope.currentPage;
                        tableState.pagination.pageSize = $scope.pageSize;

                        var promise = DocumentApiService.getEntityDocumentsST($scope.entityTypeId, $scope.entityId, tableState).then(
                            function (responseSuccess) {

                                if (isPaging === true) {
                                    $scope.documents = $scope.documents.concat(responseSuccess.Items);
                                    $scope.totalItemCount = responseSuccess.Count;
                                } else {
                                    $scope.currentPage = 1;
                                    $scope.totalItemCount = responseSuccess.Count;
                                    $scope.documents = responseSuccess.Items;
                                }

                                angular.forEach($scope.documents, function (document, index) {
                                    document.canDelete = false;
                                    if (typeof $scope.accessValidateCheck === 'undefined') {
                                        document.canDelete = true;
                                    } else if (typeof $scope.accessValidateCheck === 'function') {
                                        $scope.accessValidateCheck(document).then(function (response) {
                                            document.canDelete = response;
                                        });
                                    }
                                });

                                $scope.loadItemsPromise = null;

                                var newDocumentList = [];

                                if ($scope.documents.length > 0) {

                                    // remove excluded documents
                                    angular.forEach($scope.documents, function (document, index) {
                                        if ($scope.excludeDocumentTypeIds && $scope.excludeDocumentTypeIds.indexOf(document.DocumentTypeId) === -1) {
                                            newDocumentList.push(document);
                                        }
                                    });

                                    if (newDocumentList.length > 0) {
                                        $scope.setDocumentIdToPreview(newDocumentList[0].PdfDocumentPublicId);
                                    }

                                }

                                $scope.documents = newDocumentList;

                                if ($scope.funcGetDocumentsLength) {
                                    if (typeof $scope.funcGetDocumentsLength() === "function") {
                                        $scope.funcGetDocumentsLength()(newDocumentList.length, $scope.entityTypeId, $scope.entityId);
                                    }
                                }

                                if ($scope.funcGetDocumentsUploadedTypes) {
                                    if (typeof $scope.funcGetDocumentsUploadedTypes() === "function") {
                                        var documentsUploadedTypes = _.map(newDocumentList, function (newDocument) { return _.pick(newDocument, "DocumentTypeId"); });
                                        $scope.funcGetDocumentsUploadedTypes()(documentsUploadedTypes, $scope.entityTypeId, $scope.entityId);
                                    }
                                }

                            },
                            function (responseException) {
                                var e = responseException;
                            });
                        $scope.loadItemsPromise = promise;

                    };

                    $scope.getEntityDocuments = $scope.getEntityDocumentsST;
                    var getAllDocuments = function () {
                        $scope.setDocumentIdToPreview(0);
                        DocumentApiService.getEntityDocuments($scope.entityTypeId, $scope.entityId).then(function success(response) {
                            $scope.documents = response.Items;
                            angular.forEach($scope.documents, function (document, index) {
                                document.canDelete = false;
                                if (typeof $scope.accessValidateCheck === 'undefined') {
                                    document.canDelete = true;
                                } else if (typeof $scope.accessValidateCheck === 'function') {
                                    $scope.accessValidateCheck(document).then(function (response) {
                                        document.canDelete = response;
                                    });
                                }


                            });


                            var newDocumentList = [];

                            if ($scope.documents.length > 0) {

                                // remove excluded documents
                                angular.forEach($scope.documents, function (document, index) {
                                    if ($scope.excludeDocumentTypeIds && $scope.excludeDocumentTypeIds.indexOf(document.DocumentTypeId) === -1) {
                                        newDocumentList.push(document);
                                    }
                                });

                                if (newDocumentList.length > 0) {
                                    $scope.setDocumentIdToPreview(newDocumentList[0].PdfDocumentPublicId);
                                }

                            }

                            $scope.documents = newDocumentList;

                            if ($scope.funcGetDocumentsLength) {
                                if (typeof $scope.funcGetDocumentsLength() === "function") {
                                    $scope.funcGetDocumentsLength()(newDocumentList.length, $scope.entityTypeId, $scope.entityId);
                                }
                            }

                            if ($scope.funcGetDocumentsUploadedTypes) {
                                if (typeof $scope.funcGetDocumentsUploadedTypes() === "function") {
                                    var documentsUploadedTypes = _.map(newDocumentList, function (newDocument) { return _.pick(newDocument, "DocumentTypeId"); });
                                    $scope.funcGetDocumentsUploadedTypes()(documentsUploadedTypes, $scope.entityTypeId, $scope.entityId);
                                }
                            }

                        });
                    };


                    $scope.getEntityDocuments();



                    $scope.documentDelete = function (document) {
                        var dlg = dialogs.confirm('Document Delete', 'This document will be deleted. Continue?');
                        dlg.result.then(function (btn) {
                            var result = 'Confirmed';
                            DocumentApiService.deleteDocumentByPublicId(document.PublicId).then(
                                function (responseSucces) {
                                    $scope.getEntityDocuments();
                                },
                                function (responseError) {
                                    $scope.getEntityDocuments();
                                    if ($scope.funcOnDocumentDeleteException) {
                                        if (typeof $scope.funcOnDocumentDeleteException() === "function") {
                                            $scope.funcOnDocumentDeleteException()(responseError, $scope.entityTypeId, $scope.entityId);
                                        }
                                    }
                                    else {
                                        $scope.ValidationMessages = common.responseErrorMessages(responseError);
                                    }
                                }
                            );
                        }, function (btn) {
                            var result = 'Not Confirmed';
                        });
                    };

                    var refreshDocumentsListHandler = $rootScope.$on('event:refresh-documents-list', function () {
                        $scope.getEntityDocuments();
                    });

                    $scope.$on("$destroy", function () {
                        refreshDocumentsListHandler();
                    });


                    $scope.getDocumentTypeName = function (documenTypeId) {
                        return CodeValueService.getCodeValue(documenTypeId, CodeValueGroups.DocumentType).text;
                    };

                }],
            link: function (scope, el, attrs) {
                if (!attrs.templateUrl) {
                    attrs.templateUrl = '/Phoenix/templates/Template/Components/Document/DocumentListDefault.html';
                }
                var obtainEmptyContainer = function () {
                    // We don't want to replace element but instead change the content 
                    // this is done by adding a container if one doesn't exist yet
                    var container = el.children()[0] || el.append("<div></div>");
                    $(container).html(""); // clear content
                    return $(container).append("<div></div>");
                };

                // When the templateUrl attribute of the directive changes,
                attrs.$observe('templateUrl', function (newVal, oldVal) {
                    // get the new template
                    var template = getTemplate(newVal);
                    // and the container
                    var container = obtainEmptyContainer();

                    template.success(function (html) {
                        // set the container to the uncompiled template
                        container.html(html);
                    }).then(function (response) {
                        // compile (render) and replace the container
                        container.replaceWith($compile(container.html())(scope));
                    });
                });
            }
        };
    }
    ]);
})(Phoenix.Directives);