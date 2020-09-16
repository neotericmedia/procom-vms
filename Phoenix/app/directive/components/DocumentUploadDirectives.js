/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />

(function (services) {
    'use strict';

    services.factory('DocumentUploadConfigService', ['$rootScope', function ($rootScope) {

        function DocumentUploadConfigService() {
        }

        DocumentUploadConfigService.prototype.config =
                    {
                        holderId: '',
                        url: '',
                        maxFileSize: 0,
                        limitMultiFileUploads: 0,
                        acceptFileTypes: '',
                        documentTypeIdDefault: 0,
                        documentTypeIdSingle: -1,
                        workflowPendingTaskId: -1,
                        documentHeaderTextCustom: '',
                        objectExpiryDate: null,
                        objectComment: null,
                    };

        DocumentUploadConfigService.prototype.entity =
                   {
                       typeId: 0,
                       id: 0,
                       funcCallbackOnDone: ''
                   };

        return new DocumentUploadConfigService();
    }]);
}(Phoenix.Services));

(function (directives) {
    'use strict';
    /**
        @name directives.ptDocumentUpload
        @description
        Used as FileUpload extension
        Attributes:
             
             data-holder-id                 - html holder id
             data-upload-controller-url     - relative upload controller url (= attrs.uploadControllerUrl || '/api/document/Post')
             data-entity-type-id            - (int) "ApplicationConstants.EntityType.TimeSheet" or entity type id (parent table  id to choose related document Type IDs)
             data-entity-id                 - (int) entity.Id
             data-show-description-input    - (bool) identify flag to show description input field
             data-enable-image-resize       - (bool) identify flag to enable image resize
             data-max-file-size             - (int) max file size in bytes
             data-accept-file-types         - (= attrs.acceptFileTypes || '/(\.|\/)(gif|jpe?g|png|pdf)$/i')
             data-file-picker-types         - (= attrs.filePickerTypes || if(acceptFileTypes===/(\.|\/)(gif|jpe?g|png|pdf)$/i){return "application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png, image/bmp, image/tiff";} || null)
             data-limit-multi-file-uploads  - (int) max number of uploaded files in time
             data-func-callback-on-done     - callback function name. Function signature: function(item){} there item - is selected item.
             data-func-validation           - validation function name. Function signature: function(queue){} where queue is $scope.queue. Returns array of validation messages, or empty array
             data-header-text               - html header text
             data-suppress-document-types   - array of document types to hide in UI (if any)

        example:   
        <div data-pt-document-upload=""
                         data-holder-id="documentUpload-timesheetinfo"  
                         data-upload-controller-url="/api/document/post"
                         data-entity-type-id="ApplicationConstants.EntityType.TimeSheet"
                         data-entity-id="model.entity.Id"
                         data-object-custom="{OrganizationIdClient = model.organizationidclient, OrganizationidInternal = model.organizationidclient}"
                         data-show-description-input="true"
                         data-enable-image-resize="false"
                         data-max-file-size="20971520"
                         data-accept-file-types="/(\.|\/)(csv)$/i"
                         data-file-picker-types=".csv"
                         data-limit-multi-file-uploads="5"
                         data-func-callback-on-done="documentUploadCallbackOnDone"
                         data-header-text="Upload a supporting document to your timesheet"
                         data-content-text1="Accepted file types: PNG, JPG, JPEG, TIF, BMP, PDF, DOC, DOCX"
                         data-content-text2="20 MB file size limit"
                         data-suppress-document-types="[ApplicationConstants.DocumentTypes.TimesheetPrint]"
                        >
                    </div>
    **/

    //directives.directive('ptDocumentUpload', ['$http', '$filter', '$window', function ($http, $filter, $window) {
    directives.directive('ptDocumentUpload', ['common', function (common) {
        return {
            restrict: 'A',
            scope: true,
            transclude: true,
            templateUrl: '/Phoenix/templates/Template/Components/Document/DocumentUpload.html',

            controller: ['$state', '$location', '$scope', '$attrs', 'DocumentUploadConfigService', 'CodeValueService', 'phoenixapi', 'UtilityService', function ($state, $location, $scope, $attrs, DocumentUploadConfigService, CodeValueService, phoenixapi, UtilityService) {

                // initialize lists
                $scope.lists = { documentTypeList: [] };

                // initialize config
                $scope.config =
                {
                    showDescriptionInput: false,
                    enableImageResize: false,
                    documentTypeIdSingle: null,
                    objectExpiryDate: null,
                    objectComment: null,
                };

                // identify flag to show description input field
                if ($attrs.showDescriptionInput) {
                    if (angular.isString($attrs.showDescriptionInput)) {
                        $scope.config.showDescriptionInput = ($attrs.showDescriptionInput.toLowerCase() == 'true');
                    } else {
                        $scope.config.showDescriptionInput = $attrs.showDescriptionInput;
                    }
                }

                // identify flag to enable image resize
                if ($attrs.enableImageResize) {
                    if (angular.isString($attrs.enableImageResize)) {
                        $scope.config.enableImageResize = ($attrs.enableImageResize.toLowerCase() == 'true');
                    } else {
                        $scope.config.enableImageResize = $attrs.enableImageResize;
                    }
                }

                $scope.isInt = function (value) {
                    var er = /^[0-9]+$/;
                    return (er.test(value)) ? true : false;
                };

                if ($attrs.workflowPendingTaskId) {
                    if (parseInt($attrs.workflowPendingTaskId)) {
                        DocumentUploadConfigService.workflowPendingTaskId = parseInt($attrs.workflowPendingTaskId);
                    } else if ($scope.isInt($scope.$eval($attrs.workflowPendingTaskId))) {
                        DocumentUploadConfigService.workflowPendingTaskId = parseInt($scope.$eval($attrs.workflowPendingTaskId));
                    } else {
                        DocumentUploadConfigService.workflowPendingTaskId = -1;
                    }
                }

                if ($attrs.documentTypeIdSingle) {
                    if (parseInt($attrs.documentTypeIdSingle)) {
                        $scope.config.documentTypeIdSingle = parseInt($attrs.documentTypeIdSingle);
                    } else if ($scope.isInt($scope.$eval($attrs.documentTypeIdSingle))) {
                        $scope.config.documentTypeIdSingle = parseInt($scope.$eval($attrs.documentTypeIdSingle));
                    } else {
                        $scope.config.documentTypeIdSingle = -1;
                    }
                }

                if ($attrs.objectExpiryDate) {
                    $scope.config.objectExpiryDate = $scope.$eval($attrs.objectExpiryDate);
                }
                if ($attrs.objectComment) {
                    $scope.config.objectComment = $scope.$eval($attrs.objectComment);
                }
                // header - text
                $scope.headerText = $attrs.headerText || '';

                $scope.contentText2 = $attrs.contentText2 || '';

                if ($attrs.contentText1) {
                    try {
                        $scope.contentText1 = $scope.$eval($attrs.contentText1);
                    }
                    catch (err) {
                        $scope.contentText1 = $attrs.contentText1 || '';
                    }
                    //if (typeof $attrs.contentText1 === 'object') {
                    //    $scope.contentText1 = $scope.$eval($attrs.contentText1);
                    //}
                    //else if (typeof $attrs.contentText1 === 'string') {
                    //    $scope.contentText1 = $attrs.contentText1;
                    //}
                    //else {
                    //    $scope.contentText1 = '';
                    //}
                }

                // acceptFileTypes
                if ($attrs.acceptFileTypes) {
                    var acceptFileTypes = /(\.|\/)(pdf|jpe?g|tif?f|bmp|png|doc|docx)$/i;
                    try {
                        acceptFileTypes = $scope.$eval($attrs.acceptFileTypes);
                    }
                    catch (err) {
                        acceptFileTypes = $attrs.acceptFileTypes || '';
                    }
                    acceptFileTypes = acceptFileTypes.toString();
                    var flags = acceptFileTypes.replace(/.*\/([gimy]*)$/, '$1');
                    var pattern = acceptFileTypes.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                    DocumentUploadConfigService.config.acceptFileTypes = new RegExp(pattern, flags);
                }
                else {
                    DocumentUploadConfigService.config.acceptFileTypes = /(\.|\/)(pdf|jpe?g|tif?f|bmp|png|doc|docx)$/i;
                }
                if ($attrs.filePickerTypes) {
                    $scope.filePickerTypes = $attrs.filePickerTypes;
                } else if (common.regexEqual(DocumentUploadConfigService.config.acceptFileTypes, /(\.|\/)(pdf|jpe?g|tif?f|bmp|png|doc|docx)$/i)) {
                    $scope.filePickerTypes = "application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png, image/bmp, image/tiff";
                }

                if ($attrs.documentHeaderTextCustom) {
                    DocumentUploadConfigService.documentHeaderTextCustom = $scope.$eval($attrs.documentHeaderTextCustom);
                    $scope.headerText = DocumentUploadConfigService.documentHeaderTextCustom;
                }

                $scope.$watch('documentCategoryId', function (newValue, oldValue) {

                    if (newValue) {
                        $scope.lists.documentTypeList = CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, newValue, CodeValueGroups.DocumentType);
                    }
                });

                if ($attrs.entityTypeId) {
                    if (parseInt($attrs.entityTypeId)) {
                        DocumentUploadConfigService.entity.typeId = parseInt($attrs.entityTypeId);
                        $scope.lists.documentTypeList = CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, DocumentUploadConfigService.entity.typeId, CodeValueGroups.EntityType);
                    } else if ($scope.isInt($scope.$eval($attrs.entityTypeId))) {
                        DocumentUploadConfigService.entity.typeId = parseInt($scope.$eval($attrs.entityTypeId));
                        $scope.lists.documentTypeList = CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, DocumentUploadConfigService.entity.typeId, CodeValueGroups.EntityType);
                    } else {
                        DocumentUploadConfigService.entity.typeId = 0;
                        $scope.lists.documentTypeList = [];
                    }
                    if ($scope.lists.documentTypeList.length > 0) {
                        if ($scope.config.documentTypeIdSingle > 0) {
                            $scope.lists.documentTypeList = _.filter($scope.lists.documentTypeList, function (item) {
                                return $scope.config.documentTypeIdSingle == item.id;
                            });
                            DocumentUploadConfigService.config.documentTypeIdDefault = $scope.config.documentTypeIdSingle;
                        }
                        else {
                            DocumentUploadConfigService.config.documentTypeIdDefault = $scope.lists.documentTypeList[0].id;
                        }
                    }
                }

                if ($attrs.suppressDocumentTypes) {
                    var sourceList = [];
                    if (angular.isArray($attrs.suppressDocumentTypes)) {
                        sourceList = $attrs.suppressDocumentTypes;
                    } else if (angular.isArray($scope.$eval($attrs.suppressDocumentTypes))) {
                        sourceList = $scope.$eval($attrs.suppressDocumentTypes);
                    }
                    var validSuppressList = _.chain(sourceList).filter(function (item) {
                        return parseInt(item) || $scope.isInt($scope.$eval(item));
                    }).map(function (item) {
                        if (parseInt(item)) {
                            return parseInt(item);
                        } else if ($scope.isInt($scope.$eval(item))) {
                            return parseInt($scope.$eval(item));
                        }
                    }).value();
                    $scope.lists.documentTypeList = _.filter($scope.lists.documentTypeList, function (item) {
                        return !_.find(validSuppressList, function (suppress) {
                            return suppress == item.id;
                        });
                    });
                }

                //  entity.id
                if ($attrs.entityId) {
                    if (parseInt($attrs.entityId)) {
                        DocumentUploadConfigService.entity.id = parseInt($attrs.entityId);
                    } else if ($scope.isInt($scope.$eval($attrs.entityId))) {
                        DocumentUploadConfigService.entity.id = parseInt($scope.$eval($attrs.entityId));
                    } else {
                        DocumentUploadConfigService.entity.id = 0;
                    }
                }

                $scope.$watch($attrs.entityId, function (newVal, oldVal) {
                    if (parseInt($attrs.entityId)) {
                        DocumentUploadConfigService.entity.id = parseInt($attrs.entityId);
                    } else if ($scope.isInt($scope.$eval($attrs.entityId))) {
                        DocumentUploadConfigService.entity.id = parseInt($scope.$eval($attrs.entityId));
                    } else {
                        DocumentUploadConfigService.entity.id = 0;
                    }
                });


                //  customId1
                if ($attrs.customId1) {
                    if (parseInt($attrs.customId1)) {
                        DocumentUploadConfigService.customId1 = parseInt($attrs.customId1);
                    } else if ($scope.isInt($scope.$eval($attrs.customId1))) {
                        DocumentUploadConfigService.customId1 = parseInt($scope.$eval($attrs.customId1));
                    } else {
                        DocumentUploadConfigService.customId1 = 0;
                    }
                }

                $scope.$watch($attrs.customId1, function (newVal, oldVal) {
                    if (parseInt($attrs.customId1)) {
                        DocumentUploadConfigService.customId1 = parseInt($attrs.customId1);
                    } else if ($scope.isInt($scope.$eval($attrs.customId1))) {
                        DocumentUploadConfigService.customId1 = parseInt($scope.$eval($attrs.customId1));
                    } else {
                        DocumentUploadConfigService.customId1 = 0;
                    }
                });

                //  customId2
                if ($attrs.customId2) {
                    if (parseInt($attrs.customId2)) {
                        DocumentUploadConfigService.customId2 = parseInt($attrs.customId2);
                    } else if ($scope.isInt($scope.$eval($attrs.customId2))) {
                        DocumentUploadConfigService.customId2 = parseInt($scope.$eval($attrs.customId2));
                    } else {
                        DocumentUploadConfigService.customId2 = 0;
                    }
                }

                $scope.$watch($attrs.customId2, function (newVal, oldVal) {
                    if (parseInt($attrs.customId2)) {
                        DocumentUploadConfigService.customId2 = parseInt($attrs.customId2);
                    } else if ($scope.isInt($scope.$eval($attrs.customId2))) {
                        DocumentUploadConfigService.customId2 = parseInt($scope.$eval($attrs.customId2));
                    } else {
                        DocumentUploadConfigService.customId2 = 0;
                    }
                });


                $scope.$watch($attrs.customMethodata, function (newVal, oldVal) {
                    DocumentUploadConfigService.customMethodata = parseInt($scope.$eval($attrs.customMethodata));
                });

                if ($attrs.holderId && $attrs.holderId.length > 0) {
                    DocumentUploadConfigService.config.holderId = $attrs.holderId;
                }

                //  max File Size
                if ($attrs.maxFileSize && $scope.isInt($attrs.maxFileSize) && parseInt($attrs.maxFileSize) > 0) {
                    DocumentUploadConfigService.config.maxFileSize = parseInt($attrs.maxFileSize);
                }

                //  limit Multi File Uploads
                if ($attrs.limitMultiFileUploads && $scope.isInt($attrs.limitMultiFileUploads) && parseInt($attrs.limitMultiFileUploads) > 0) {
                    DocumentUploadConfigService.config.limitMultiFileUploads = parseInt($attrs.limitMultiFileUploads);
                }

                //create new batch id if we then send another batch of files
                DocumentUploadConfigService.config.multiDocumentUploadBatchId = UtilityService.createUuid();

                DocumentUploadConfigService.config.url = phoenixapi.urlwithroom($attrs.uploadControllerUrl || api2Url + 'api/command/postfile', DocumentUploadConfigService.config.multiDocumentUploadBatchId);

                // extract callback functions
                if ($attrs.funcCallbackOnDone) {
                    DocumentUploadConfigService.entity.funcCallbackOnDone = $scope.$eval($attrs.funcCallbackOnDone);
                    $scope.funcCallbackOnDone = DocumentUploadConfigService.entity.funcCallbackOnDone;
                }

                if ($attrs.funcValidation) {
                    DocumentUploadConfigService.entity.funcValidation = $scope.$eval($attrs.funcValidation);
                    $scope.funcValidation = DocumentUploadConfigService.entity.funcValidation;
                }

                $scope.fileUploadClose = function () {
                    if (DocumentUploadConfigService.config.holderId.length > 0) {
                        angular.element('#' + DocumentUploadConfigService.config.holderId).removeClass('in');
                        angular.element('#' + DocumentUploadConfigService.config.holderId).addClass('collapse');
                    }
                    if ($scope.funcCallbackOnDone) {
                        $scope.funcCallbackOnDone({
                        }, 'fileUploadClose');
                    }
                };

                function routeChange(event, newUrl) {
                    if (DocumentUploadConfigService.config.holderId.length > 0 && $('#' + DocumentUploadConfigService.config.holderId).hasClass('in')) {
                        //http://weblogs.asp.net/dwahlin/archive/2013/11/07/cancelling-route-navigation-in-angularjs-controllers.aspx
                        $scope.fileUploadClose();
                        onRouteChangeOff();
                        event.preventDefault();
                        return;
                    }
                    return;
                }
                var onRouteChangeOff = $scope.$on('$locationChangeStart', routeChange);

            }],

            link: function (scope, element, attrs) { }

        };
    }
    ]);
})(Phoenix.Directives);

angular.module('blueimpFileupload', ['blueimp.fileupload'])
     .config(['$httpProvider', 'fileUploadProvider', function ($httpProvider, fileUploadProvider) {
         delete $httpProvider.defaults.headers.common['X-Requested-With'];
         fileUploadProvider.defaults.redirect = window.location.href.replace(
             /\/[^\/]*$/,
             '/cors/result.html?%s'
         );
     }
     ])
    .controller('fileUploadController', ['$scope', '$rootScope', '$http', '$filter', '$window', '$timeout', 'common', 'DocumentUploadConfigService',
    function ($scope, $rootScope, $http, $filter, $window, $timeout, common, DocumentUploadConfigService) {

        common.setControllerName('fileUploadController');

        if (DocumentUploadConfigService.entity.funcCallbackOnDone) {
            $scope.funcCallbackOnDone = DocumentUploadConfigService.entity.funcCallbackOnDone;
        }

        $scope.options = {
            url: DocumentUploadConfigService.config.url,
            maxFileSize: DocumentUploadConfigService.config.maxFileSize,
            limitMultiFileUploads: DocumentUploadConfigService.config.limitMultiFileUploads,
            acceptFileTypes: DocumentUploadConfigService.config.acceptFileTypes,
            autoUpload: false,
            sequentialUploads: true,
            showDescriptionInput: false,

            done: function (e, data) {
                $scope.validationMessages = [];
                var dataResult = angular.copy(data.result);

                if (data.result.publicId == "00000000-0000-0000-0000-000000000000") {
                    common.logError("Exception on upload document. The documents list will be refreshed");
                }

                if ($scope.numFilesUploading === 1) {
                    $scope.queue = [];
                    data.files = null;
                    $rootScope.$broadcast('event:refresh-documents-list');

                    if (DocumentUploadConfigService.config.holderId.length > 0) {
                        angular.element('#' + DocumentUploadConfigService.config.holderId).removeClass('in');
                        angular.element('#' + DocumentUploadConfigService.config.holderId).addClass('collapse');
                    }
                }

                if (DocumentUploadConfigService.entity.funcCallbackOnDone) {
                    $scope.funcCallbackOnDone(!!data ? data.result : {}, e.type, dataResult);
                }
            }
        };

        $scope.loadingFiles = false;

        $scope.specialSubmit = function (context, baseSubmit) {
            $scope.validationMessages = [];
            if ($scope.funcValidation) {
                $scope.validationMessages = $scope.funcValidation($scope.queue);
            }

            angular.forEach($scope.queue, function (file, index) {
                if ($scope.config.documentTypeIdSingle > 0) {
                    file.DocumentTypeId = $scope.config.documentTypeIdSingle;
                }
                if (typeof file.DocumentTypeId === 'undefined' || file.DocumentTypeId === null) {
                    $scope.validationMessages.push('The File[' + (index + 1).toString() + '] "' + file.name + '" must have Document Type');
                }
            });

            if ($scope.validationMessages !== null && typeof $scope.validationMessages !== 'undefined' && $scope.validationMessages.length > 0) {
                return;
            }
            if (typeof baseSubmit === "function") {
                baseSubmit.call(context);
            }
        };

        $scope.onCancel = function () {
            if ($scope.config.objectExpiryDate !== null) {
                $scope.config.objectExpiryDate.value = null;
            }
            if ($scope.config.objectComment !== null) {
                $scope.config.objectComment.value = null;
            }
        };

        $scope.$on('fileuploadadd', function (event, data) {
            $('#fileUploadTable').focus();
        });
        $scope.numFilesUploading = 0;
        $scope.isUploading = false;

        $scope.$on('fileuploadsubmit', function (event, data) {
            if ($scope.numFilesUploading === 0) {
                $scope.isUploading = true;
            }

            $scope.numFilesUploading++;

            //https://github.com/blueimp/jQuery-File-Upload/wiki/How-to-submit-additional-form-data
            var description = '';
            var documentTypeId = '';
            var customDateTime = null;
            var customComment = null;

            if ($scope.config.objectExpiryDate !== null && $scope.config.objectExpiryDate.value !== null) {
                customDateTime = $scope.config.objectExpiryDate.value;
            }
            if ($scope.config.objectComment !== null && $scope.config.objectComment.value !== null) {
                customComment = $scope.config.objectComment.value;
            }

            $.each($scope.queue, function (indexQueue, fileQueue) {
                if (fileQueue.$$hashKey == data.files[0].$$hashKey) {
                    description = fileQueue.Description;
                    if ($scope.config.documentTypeIdSingle > 0) {
                        documentTypeId = $scope.config.documentTypeIdSingle;
                    }
                    else {
                        documentTypeId = fileQueue.DocumentTypeId;
                    }
                }
            });

            data.formData = {
                'WorkflowPendingTaskId': DocumentUploadConfigService.config.workflowPendingTaskId,
                'multiDocumentUploadBatchId': DocumentUploadConfigService.config.multiDocumentUploadBatchId,
                'entityTypeId': DocumentUploadConfigService.entity.typeId,
                'entityId': DocumentUploadConfigService.entity.id,
                'customId1': DocumentUploadConfigService.customId1,
                'customId2': DocumentUploadConfigService.customId2,
                'customDateTime': customDateTime,
                'customComment': customComment,
                'customMethodata': DocumentUploadConfigService.customMethodata,
                'description': description || '',
                'documentTypeId': documentTypeId
            };

        });

        $scope.$on('fileuploadalways', function (event, data) {
            $scope.numFilesUploading--;
            if ($scope.numFilesUploading === 0) {
                if ($scope.$root && $scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $timeout(function () {
                        $scope.isUploading = false;
                    }, 0);
                }
            }
        });

        //var browserInfo = navigator.userAgent.toLowerCase();

        //if (browserInfo.indexOf("msie") > -1) {

        //    var fileUploadInputChanged = function (event) {
        //        var filePath = event.target.value;
        //        var fso = new ActiveXObject("Scripting.FileSystemObject");
        //        if (fso) {
        //            var thefile = fso.getFile(filePath);
        //            var fileSize = thefile.size;
        //            if (!event.target.files) {
        //                angular.extend(event.target, { files: [{ name: event.target.value.replace(/^.*\\/, ''), size: fileSize }] });
        //            }
        //        }                
        //    };

        //    angular.element(".fileUploadInputElement").on("change", fileUploadInputChanged);    
        //}

        $scope.$on('fileuploadfail', function (event, data) {
            var error = data.errorThrown && data.errorThrown === "Internal Server Error";
            if (error) {
                var file = data.files.length > 0 ? data.files[0] : {};
                if (file.$cancel) {
                    file.$cancel = function () {
                        $scope.queue = _.filter($scope.queue, function (f) {
                            return f.$$hashKey !== file.$$hashKey;
                        });
                    };
                }
            }
        });
    }])
    .controller('fileDestroyController', ['$scope', '$http', function ($scope, $http) {
        var file = $scope.file,
            state;
        if (file.url) {
            file.$state = function () {
                return state;
            };
            file.$destroy = function () {
                state = 'pending';
                return $http({
                    url: file.deleteUrl,
                    method: file.deleteType
                }).then(
                    function () {
                        state = 'resolved';
                        $scope.clear(file);
                    },
                    function () {
                        state = 'rejected';
                    }
                );
            };
        } else if (!file.$cancel && !file._index) {
            file.$cancel = function () {
                $scope.clear(file);
            };
        }
    }]);