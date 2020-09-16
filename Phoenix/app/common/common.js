(function () {
    'use strict';

    // Define the common module 
    // Contains services:
    //  - common
    //  - logger
    //  - spinner
    var commonModule = angular.module('common', []);

    // Must configure the common service and set its 
    // events via the commonConfigProvider
    commonModule.provider('commonConfig', function () {
        this.config = {
            // These are the properties we need to set
            //controllerActivateSuccessEvent: '',
            //spinnerToggleEvent: ''
        };

        this.$get = function () {
            return {
                config: this.config
            };
        };
    });

    commonModule.factory('common', ['$q', '$rootScope', '$timeout', 'commonConfig', 'logger', common]);

    function common($q, $rootScope, $timeout, commonConfig, logger) {
        var throttles = {};

        var controllerName = '';

        var getLogFn = logger.getLogFn;
        //var log = getLogFn(controllerId);
        var logError = getLogFn(controllerName, 'error');
        var logSuccess = getLogFn(controllerName, 'success');
        var logWarning = getLogFn(controllerName, 'warning');
        var logInfo = getLogFn(controllerName, 'info');

        var service = {
            // common angular dependencies
            $broadcast: $broadcast,
            $q: $q,
            $timeout: $timeout,
            $rootScope: $rootScope,

            setControllerName: setControllerName,

            activateController: activateController,
            scopeApply: scopeApply,

            logger: logger, // for accessibility
            logError: logError,
            logSuccess: logSuccess,
            logWarning: logWarning,
            logInfo: logInfo,
            logValidationMessages: logValidationMessages,

            isEmptyObject: isEmptyObject,
            textContains: textContains,
            isNumber: isNumber,
            floatApplyTwoDecimalPlaces: floatApplyTwoDecimalPlaces,
            floatApplySpecifiedNumberOfDecimalPlaces: floatApplySpecifiedNumberOfDecimalPlaces,
            floatApply: floatApply,
            findDiff: findDiff,

            responseErrorMessages: responseErrorMessages,
            responseSuccessMessages: responseSuccessMessages,

            isJson: isJson,
            regexEqual: regexEqual,

            hasFunctionalOperation: hasFunctionalOperation,

            RefreshCodeValues: RefreshCodeValues,

            base64FileSaveAs: base64FileSaveAs,
            calculateAge: calculateAge,

            ArrayExtend: ArrayExtend,

            GetObjectKeyByValue: GetObjectKeyByValue,

            validator: {
                result: { isValid: true },
                ValidatorOnString: function (value, minSize, maxSize) {
                    minSize = minSize ? minSize : 0;
                    maxSize = maxSize ? maxSize : 256;
                    return typeof (value) !== 'undefined' && value !== null && typeof value === 'string' && value.length >= minSize && value.length <= maxSize;
                },
                ValidatorOnEmail: function (value) {
                    return typeof (value) !== 'undefined' && value !== null && typeof value === 'string' && value.length >= 6 && value.length <= 128 && ApplicationConstants.Regex.Email.test(value);
                },
                ValidatorOnBoolean: function (value) {
                    return typeof (value) !== 'undefined' && value !== null && typeof value === 'boolean' && (value === true || value === false);
                },
                ValidatorOnId: function (value) {
                    return typeof (value) !== 'undefined' && value !== null && typeof value === 'number' && value > 0;
                },
                ValidatorOnNumber: function (value) {
                    return typeof (value) !== 'undefined' && value !== null && (typeof value === 'number' || (typeof value === 'string' && typeof parseFloat(value) === 'number')) && value > 0;
                },
                ValidatorOnArray: function (value) {
                    return typeof (value) !== 'undefined' && value !== null && typeof value === 'object' && value instanceof Array && value.length > 0;
                },
                ValidatorOnPostalCode: function (value) {
                    return typeof (value) !== 'undefined' && value !== null && typeof value === 'string' && value.length > 0;
                },
                onValidatorResultIsValidToValidate__String: function (value, minSize, maxSize) {
                    if (service.validator.result.isValid) {
                        service.validator.result.isValid = service.validator.ValidatorOnString(value, minSize, maxSize);
                    }
                },
                onValidatorResultIsValidToValidate___Email: function (value) {
                    if (service.validator.result.isValid) {
                        service.validator.result.isValid = service.validator.ValidatorOnEmail(value);
                    }
                },
                onValidatorResultIsValidToValidate_Boolean: function (value) {
                    if (service.validator.result.isValid) {
                        service.validator.result.isValid = service.validator.ValidatorOnBoolean(value);
                    }
                },
                onValidatorResultIsValidToValidate______Id: function (value) {
                    if (service.validator.result.isValid) {
                        service.validator.result.isValid = service.validator.ValidatorOnId(value);
                    }
                },
                onValidatorResultIsValidToValidate__Number: function (value) {
                    if (service.validator.result.isValid) {
                        service.validator.result.isValid = service.validator.ValidatorOnNumber(value);
                    }
                },
                onValidatorResultIsValidToValidate___Array: function (value) {
                    if (service.validator.result.isValid) {
                        service.validator.result.isValid = service.validator.ValidatorOnArray(value);
                    }
                },
                onValidatorResultIsValidToValidate_ZipCode: function (value) {
                    if (service.validator.result.isValid) {
                        service.validator.result.isValid = service.validator.ValidatorOnPostalCode(value);
                    }
                },
            }
        };

        return service;

        //Signature of (destArray,...srcArrays,comparisonFn||comparisonPropName)
        function ArrayExtend(list1) {
            if (arguments.length < 2) {
                return list1;
            }
            var compFn;
            var comp = arguments[arguments.length - 1];
            if (typeof comp === 'function') {
                compFn = comp;
            } else if (typeof comp === 'string') {
                compFn = function (a, b) {
                    return a[comp] === b[comp];
                };
            } else {
                throw 'No valid comparison provided as last argument to ArrayExtend';
            }
            //skip first and last arguments (destArray, and comparison)
            for (var i = 1, ii = arguments.length - 1; i < ii; i++) {
                for (var j = 0, jj = list1.length; j < jj; j++) {
                    var idx = _.findIndex(arguments[i], function (item) { return compFn(list1[j], item); })
                    if (idx > -1) {
                        list1[j] = arguments[i][idx];
                    }
                }
                var newVals = _.filter(arguments[i], function (item2) { return !_.some(list1, function (item1) { return compFn(item1, item2); }) });
                for (var j = 0, jj = newVals.length; j < jj; j++) {
                    list1.push(newVals[j]);
                }
            }
            return list1;
        }

        function hasFunctionalOperation(functionalOperation) {
            return $rootScope.CurrentProfile && $rootScope.CurrentProfile.FunctionalOperations && $rootScope.CurrentProfile.FunctionalOperations.length > 0 && _.includes($rootScope.CurrentProfile.FunctionalOperations, functionalOperation);
        }

        function isJson(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        function logValidationMessages(validationMessages) {
            var newLine = '\r\n';
            var logErrorMessage = '';
            if (!isEmptyObject(validationMessages)) {
                angular.forEach(validationMessages, function (validationMessage) {
                    logErrorMessage += newLine + validationMessage.PropertyName + ': ' + validationMessage.Message;
                });
            }
            if (logErrorMessage.length > 0) {
                logError(logErrorMessage);
            }
        }

        function setControllerName(controllerName) {
            controllerName = controllerName || '';
        }

        function activateController(promises, controllerId) {
            return $q.all(promises).then(function (eventArgs) {
                var data = { controllerId: controllerId };
                $broadcast(commonConfig.config.controllerActivateSuccessEvent, data);
            });
        }

        function scopeApply(scope, val) {
            setTimeout(function () {
                if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    if (val) {
                        scope.$apply(val);
                    }
                    else {
                        scope.$apply();
                    }
                }
                else {
                    if (val) {
                        scope.$eval(val);
                    }
                    else {
                        scope.$eval();
                    }
                }
            });
        }

        function $broadcast() {
            return $rootScope.$broadcast.apply($rootScope, arguments);
        }


        function isEmptyObject(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    return false;
            }
            return true;
        }

        function textContains(text, searchText) {
            return text && -1 !== text.toLowerCase().indexOf(searchText.toLowerCase());
        }

        function isNumber(val) {
            // negative or positive
            return /^[-]?\d+$/.test(val);
        }

        function floatApplyTwoDecimalPlaces(c) {
            if (isNaN(c) || c === null) {
                return null;
            }
            return parseFloat(c).toFixed(2);
        }

        function floatApplySpecifiedNumberOfDecimalPlaces(c, n) {
            if (isNaN(c) || c === null) {
                return null;
            }
            if (isNaN(n) || n === null) {
                n = 2;
            }
            return parseFloat(c).toFixed(n);
        }

        function floatApply(c) {
            if (isNaN(c) || c === null) {
                return null;
            }
            return parseFloat(c);
        }

        function findDiff(objOld, objNew, excludeList) {
            var diffObjects = [];
            if (objOld || objNew) {

                var toContinue = false;

                var forEachExcludeList = function (i, excludeItem) {
                    if (i == excludeItem.name) {
                        toContinue = true;
                    }
                };
                for (var i in objOld) {

                    if (i == '$$hashKey') {
                        continue;
                    }
                    if (!objOld.hasOwnProperty(i)) {
                        continue;
                    }

                    toContinue = false;
                    angular.forEach(excludeList, forEachExcludeList.bind(null, i));
                    if (toContinue) {
                        continue;
                    }

                    //if (i == 'WorkOrderVersions') {
                    //    var ss = i;
                    //}


                    //if (i == '2') {
                    //    var ss = i;
                    //}

                    if (typeof objOld[i] == 'object') {
                        if (objOld[i] && objNew[i]) {
                            if (typeof objOld[i].getMonth === 'function') {
                                if (objOld[i].toString() != objNew[i].toString()) {
                                    diffObjects.push({ name: i, oldType: typeof objOld[i], oldValue: objOld[i], newType: typeof objNew[i], newValue: objNew[i] });
                                }
                            } else {
                                if (objOld[i].constructor === Array || objNew[i].constructor === Array) {
                                    if (objOld[i].length != objNew[i].length && i != 'WorkOrderVersions') {
                                        diffObjects.push({ name: i, oldType: 'Array', oldValue: objOld[i].length, newType: 'Array', newValue: objNew[i].length });
                                    }
                                }
                                diffObjects = diffObjects.concat(findDiff(objOld[i], objNew[i], excludeList));
                            }
                        } else if ((objOld[i] === null || objOld[i] === undefined) && (objNew[i] === null || objNew[i] === undefined)) {
                            // todo
                        } else {
                            diffObjects.push({ name: i, oldType: typeof objOld[i], oldValue: objOld[i], newType: typeof objNew[i], newValue: objNew[i] });
                        }

                    } else {
                        if (!angular.equals(objOld[i], objNew[i])) {
                            if (((typeof objOld[i] == 'number' || typeof objNew[i] == 'number')) && floatApply(objOld[i]) == floatApply(objNew[i])) {
                                continue;
                            }
                            try {
                                if (!angular.equals(objOld[i].toString(), objNew[i].toString())) {
                                    diffObjects.push({ name: i, oldType: typeof objOld[i], oldValue: objOld[i], newType: typeof objNew[i], newValue: objNew[i] });
                                }
                            } catch (e) {
                                diffObjects.push({ name: i, oldType: typeof objOld[i], oldValue: objOld[i], newType: typeof objNew[i], newValue: objNew[i] });
                            }
                        }
                    }
                }
            }
            return diffObjects;
        }

        function responseSuccessMessages(responseSuccess) {
            responseErrorMessages(responseSuccess);
        }
        function responseErrorMessages(responseError, overloadPropertyName) {
            var validationMessages = [];
            var newLine = '\r\n';

            if (responseError && responseError !== undefined && responseError !== null && !isEmptyObject(responseError)) {
                var logErrorMessage = '';
                if (!isEmptyObject(responseError.ModelState)) {
                    _.each(responseError.ModelState, function (responseErrorValue, responseErrorKey) {

                        if (responseErrorKey.indexOf('Validation Summary') >= 0 ||
                            responseErrorKey.indexOf('ValidationSummary') >= 0 ||
                            responseErrorKey.indexOf('Hide Property Name') >= 0 ||
                            responseErrorKey.indexOf('HidePropertyName') >= 0) {
                            responseErrorKey = '';
                        }

                        if (typeof overloadPropertyName !== 'undefined' && overloadPropertyName !== null && overloadPropertyName.length > 0) {
                            responseErrorKey = overloadPropertyName;
                        }
                        if ((Object.prototype.toString.call(responseErrorValue) === '[object Array]' && responseErrorKey.indexOf('ConcurrencyNotifyEvent') >= 0) ||
                            (!isEmptyObject(responseError.CommandName) && responseError.CommandName === 'ConcurrencyNotifyEvent') ||
                            (!isEmptyObject(responseError.ModelState) && !isEmptyObject(responseError.ModelState['command.ConcurrencyNotifyEvent']))) {
                            //Do nothing, its handled by phoenixapi-service.js
                        }
                        else if (responseErrorValue.Errors) {
                            _.each(responseErrorValue.Errors, function (errorValue, errorKey) {
                                validationMessages.push({
                                    PropertyName: responseErrorKey, Message: errorValue.ErrorMessage
                                });
                            });
                        }
                        else if (Object.prototype.toString.call(responseErrorValue) === '[object Array]') {
                            _.each(responseErrorValue, function (errorValue, errorKey) {
                                validationMessages.push({
                                    PropertyName: responseErrorKey, Message: errorValue
                                });
                            });
                        }
                        else {
                            validationMessages.push({
                                PropertyName: responseErrorKey, Message: responseErrorValue
                            });
                        }

                    });
                    if (validationMessages.length > 0) {
                        var message;
                        if(validationMessages.length == 1) {
                            message = window.PhxTranslations.common.generic.oneValidationErrorMessage;
                        } else {
                            message = window.PhxTranslations.common.generic.multipleValidationErrorMessage
                        }
                        
                        logErrorMessage +=  message.replace(/\{0\}/g, validationMessages.length);
                    }
                } else {

                    //if (!isEmptyObject(responseError) && responseError.CommandName) {
                    //    logErrorMessage += responseError.CommandName ? newLine + 'CommandName: ' + responseError.CommandName : '';
                    //}
                    if (!isEmptyObject(responseError.ValidationMessages)) {
                        validationMessages = responseError.ValidationMessages;
                        if(validationMessages.length == 1) {
                            message = window.PhxTranslations.common.generic.oneValidationErrorMessage;
                        } else {
                            message = window.PhxTranslations.common.generic.multipleValidationErrorMessage
                        }
                        
                        logErrorMessage +=  message.replace(/\{0\}/g, validationMessages.length);
                    }

                    // Don't show status: 500 toast error for Concurrency exception, its handled by phoenixapi-service.js
                    logErrorMessage += responseError.status && responseError.status != 400 && !responseError.isConcurrencyException ? newLine + 'status: ' + responseError.status : '';
                    
                    if (!isEmptyObject(responseError.InnerException) && !isEmptyObject(responseError.InnerException.InnerException)) {
                        logErrorMessage += responseError.InnerException.InnerException.Message ? newLine + responseError.InnerException.InnerException.Message + newLine : '';
                        logErrorMessage += responseError.InnerException.InnerException.ExceptionType ? newLine + 'ExceptionType: ' + responseError.InnerException.InnerException.ExceptionType : '';
                        logErrorMessage += responseError.InnerException.InnerException.ExceptionMessage ? newLine + 'ExceptionMessage: ' + responseError.InnerException.InnerException.ExceptionMessage : '';
                        //logErrorMessage += responseError.InnerException.InnerException.StackTrace ? newLine + 'StackTrace: ' + responseError.InnerException.InnerException.StackTrace : '';
                    }
                    if (!isEmptyObject(responseError.InnerException)) {
                        logErrorMessage += responseError.InnerException.Message ? newLine + responseError.InnerException.Message + newLine : '';
                        logErrorMessage += responseError.InnerException.ExceptionType ? newLine + 'ExceptionType: ' + responseError.InnerException.ExceptionType : '';
                        logErrorMessage += responseError.InnerException.ExceptionMessage ? newLine + 'ExceptionMessage: ' + responseError.InnerException.ExceptionMessage : '';
                        //logErrorMessage += responseError.InnerException.StackTrace ? newLine + 'StackTrace:' + responseError.InnerException.StackTrace : '';
                    }
                    if (!isEmptyObject(responseError) && responseError.Message) {
                        logErrorMessage += responseError.Message ? newLine + responseError.Message + newLine : '';
                    }
                    if (!isEmptyObject(responseError) && responseError.ExceptionType) {
                        logErrorMessage += responseError.ExceptionType ? newLine + 'ExceptionType: ' + responseError.ExceptionType : '';
                    }
                    if (!isEmptyObject(responseError) && responseError.ExceptionMessage) {
                        logErrorMessage += responseError.ExceptionMessage ? newLine + 'ExceptionMessage: ' + responseError.ExceptionMessage : '';
                    }
                }

                if (logErrorMessage.length > 0) {
                    logError(logErrorMessage);
                }
            }
            return validationMessages;
        }
        function regexEqual(x, y) {
            return (x instanceof RegExp) && (y instanceof RegExp) &&
                (x.source === y.source) && (x.global === y.global) &&
                (x.ignoreCase === y.ignoreCase) && (x.multiline === y.multiline);
        }


        function RefreshCodeValues() {
            // If phoenixapi is injected directly at the module instanciation, it causes a circular reference in some other module.
            var injector = angular.injector(['ng', 'phoenixapi.service']);
            var phoenixapi = injector.get('phoenixapi');
            return phoenixapi.query('code')
                .then(
                function (responseSuccess) {
                    window.PhoenixCodeValues = responseSuccess.Items;
                },
                function (responseError) {
                    onErrorResponse(responseError, 'Failed to refresh CodeValues.');
                }
                );
        }

        function base64FileSaveAs(base64FileStreamOrString, fileContentType, fileCharset, fileName) {

            var saveAs = saveAs
                // IE 10+ (native saveAs)
                || (typeof navigator !== "undefined" &&
                    navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))
                // Everyone else
                || (function (view) {
                    "use strict";
                    // IE <10 is explicitly unsupported
                    if (typeof navigator !== "undefined" &&
                        /MSIE [1-9]\./.test(navigator.userAgent)) {
                        return;
                    }
                    var
                        doc = view.document
                        // only get URL when necessary in case Blob.js hasn't overridden it yet
                        , get_URL = function () {
                            return view.URL || view.webkitURL || view;
                        }
                        , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
                        , can_use_save_link = !view.externalHost && "download" in save_link
                        , click = function (node) {
                            var event = doc.createEvent("MouseEvents");
                            event.initMouseEvent(
                                "click", true, false, view, 0, 0, 0, 0, 0
                                , false, false, false, false, 0, null
                            );
                            node.dispatchEvent(event);
                        }
                        , webkit_req_fs = view.webkitRequestFileSystem
                        , req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
                        , throw_outside = function (ex) {
                            (view.setImmediate || view.setTimeout)(function () {
                                throw ex;
                            }, 0);
                        }
                        , force_saveable_type = "application/octet-stream"
                        , fs_min_size = 0
                        , deletion_queue = []
                        , process_deletion_queue = function () {
                            var i = deletion_queue.length;
                            while (i--) {
                                var file = deletion_queue[i];
                                if (typeof file === "string") { // file is an object URL
                                    get_URL().revokeObjectURL(file);
                                } else { // file is a File
                                    file.remove();
                                }
                            }
                            deletion_queue.length = 0; // clear queue
                        }
                        , dispatch = function (filesaver, event_types, event) {
                            event_types = [].concat(event_types);
                            var i = event_types.length;
                            while (i--) {
                                var listener = filesaver["on" + event_types[i]];
                                if (typeof listener === "function") {
                                    try {
                                        listener.call(filesaver, event || filesaver);
                                    } catch (ex) {
                                        throw_outside(ex);
                                    }
                                }
                            }
                        }
                        , FileSaver = function (blob, name) {
                            // First try a.download, then web filesystem, then object URLs
                            var
                                filesaver = this
                                , type = blob.type
                                , blob_changed = false
                                , object_url
                                , target_view
                                , get_object_url = function () {
                                    var object_url = get_URL().createObjectURL(blob);
                                    deletion_queue.push(object_url);
                                    return object_url;
                                }
                                , dispatch_all = function () {
                                    dispatch(filesaver, "writestart progress write writeend".split(" "));
                                }
                                // on any filesys errors revert to saving with object URLs
                                , fs_error = function () {
                                    // don't create more object URLs than needed
                                    if (blob_changed || !object_url) {
                                        object_url = get_object_url(blob);
                                    }
                                    if (target_view) {
                                        target_view.location.href = object_url;
                                    } else {
                                        window.open(object_url, "_blank");
                                    }
                                    filesaver.readyState = filesaver.DONE;
                                    dispatch_all();
                                }
                                , abortable = function (func) {
                                    return function () {
                                        if (filesaver.readyState !== filesaver.DONE) {
                                            return func.apply(this, arguments);
                                        }
                                    };
                                }
                                , create_if_not_found = { create: true, exclusive: false }
                                , slice
                                ;
                            filesaver.readyState = filesaver.INIT;
                            if (!name) {
                                name = "download";
                            }
                            if (can_use_save_link) {
                                object_url = get_object_url(blob);
                                save_link.href = object_url;
                                save_link.download = name;
                                click(save_link);
                                filesaver.readyState = filesaver.DONE;
                                dispatch_all();
                                return;
                            }
                            // Object and web filesystem URLs have a problem saving in Google Chrome when
                            // viewed in a tab, so I force save with application/octet-stream
                            // http://code.google.com/p/chromium/issues/detail?id=91158
                            if (view.chrome && type && type !== force_saveable_type) {
                                slice = blob.slice || blob.webkitSlice;
                                blob = slice.call(blob, 0, blob.size, force_saveable_type);
                                blob_changed = true;
                            }
                            // Since I can't be sure that the guessed media type will trigger a download
                            // in WebKit, I append .download to the filename.
                            // https://bugs.webkit.org/show_bug.cgi?id=65440
                            if (webkit_req_fs && name !== "download") {
                                name += ".download";
                            }
                            if (type === force_saveable_type || webkit_req_fs) {
                                target_view = view;
                            }
                            if (!req_fs) {
                                fs_error();
                                return;
                            }
                            fs_min_size += blob.size;
                            req_fs(view.TEMPORARY, fs_min_size, abortable(function (fs) {
                                fs.root.getDirectory("saved", create_if_not_found, abortable(function (dir) {
                                    var save = function () {
                                        dir.getFile(name, create_if_not_found, abortable(function (file) {
                                            file.createWriter(abortable(function (writer) {
                                                writer.onwriteend = function (event) {
                                                    target_view.location.href = file.toURL();
                                                    deletion_queue.push(file);
                                                    filesaver.readyState = filesaver.DONE;
                                                    dispatch(filesaver, "writeend", event);
                                                };
                                                writer.onerror = function () {
                                                    var error = writer.error;
                                                    if (error.code !== error.ABORT_ERR) {
                                                        fs_error();
                                                    }
                                                };
                                                "writestart progress write abort".split(" ").forEach(function (event) {
                                                    writer["on" + event] = filesaver["on" + event];
                                                });
                                                writer.write(blob);
                                                filesaver.abort = function () {
                                                    writer.abort();
                                                    filesaver.readyState = filesaver.DONE;
                                                };
                                                filesaver.readyState = filesaver.WRITING;
                                            }), fs_error);
                                        }), fs_error);
                                    };
                                    dir.getFile(name, { create: false }, abortable(function (file) {
                                        // delete file if it already exists
                                        file.remove();
                                        save();
                                    }), abortable(function (ex) {
                                        if (ex.code === ex.NOT_FOUND_ERR) {
                                            save();
                                        } else {
                                            fs_error();
                                        }
                                    }));
                                }), fs_error);
                            }), fs_error);
                        }
                        , FS_proto = FileSaver.prototype
                        , saveAs = function (blob, name) {
                            return new FileSaver(blob, name);
                        }
                        ;
                    FS_proto.abort = function () {
                        var filesaver = this;
                        filesaver.readyState = filesaver.DONE;
                        dispatch(filesaver, "abort");
                    };
                    FS_proto.readyState = FS_proto.INIT = 0;
                    FS_proto.WRITING = 1;
                    FS_proto.DONE = 2;

                    FS_proto.error =
                        FS_proto.onwritestart =
                        FS_proto.onprogress =
                        FS_proto.onwrite =
                        FS_proto.onabort =
                        FS_proto.onerror =
                        FS_proto.onwriteend =
                        null;

                    view.addEventListener("unload", process_deletion_queue, false);
                    saveAs.unload = function () {
                        process_deletion_queue();
                        view.removeEventListener("unload", process_deletion_queue, false);
                    };
                    return saveAs;
                }(
                    typeof self !== "undefined" && self
                    || typeof window !== "undefined" && window
                    || this.content
                    ));


            //  http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
            var byteCharacters = atob(base64FileStreamOrString);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], { type: fileContentType + ";charset=" + fileCharset + ";" });
            saveAs(blob, fileName);

            //var save = function (filename, buffer) {
            //    var blob = new Blob(buffer);
            //    var URL = (window.webkitURL || window.URL);
            //    if (URL && URL.createObjectURL) {
            //        var url = URL.createObjectURL(blob);
            //        var a = document.createElement('a');
            //        a.setAttribute('href', url);
            //        a.setAttribute('download', filename);
            //        a.click();
            //        URL.revokeObjectURL(url);
            //    } else {
            //        throw ("DataStream.save: Can't create object URL.");
            //    }
            //};
        }

        function calculateAge(startDateString, endDateString) {
            var startDate = new Date(startDateString)
            var endDate = new Date(endDateString)
            var age = endDate.getUTCFullYear() - startDate.getUTCFullYear();

            if (endDate.getUTCMonth() < startDate.getUTCMonth() || (endDate.getUTCMonth() == startDate.getUTCMonth() && endDate.getUTCDate() < startDate.getUTCDate()))
                age--;

            return age;
        }

        function GetObjectKeyByValue(collection, value) {
            

            var getObjectValues = function(obj){       
                if(obj && obj != null && typeof obj === 'object' ) {
                    return Object.keys(obj).map(function(e) {
                        return obj[e];
                    });
                } else {
                    return [];
                }
            }

            const kArray = Object.keys(collection);                 // Creating array of keys
            const vArray = getObjectValues(collection);             // Creating array of values
            const vIndex = vArray.indexOf(value);                   // Finding value index

            return kArray[vIndex];                                  // Returning key by value index
        }

    }
})();


//$scope.findDiff = function (objOld, objNew, excludeList) {
//    var diffObjects = [];
//    if (objOld || objNew) {
//        for (var i in objOld) {

//            if (i == '$$hashKey') {
//                continue;
//            }
//            if (!objOld.hasOwnProperty(i)) {
//                continue;
//            }

//            var toContinue = false;
//            angular.forEach(excludeList, function (excludeItem) {
//                if (i == excludeItem.name) {
//                    toContinue = true;
//                }
//            });
//            if (toContinue) {
//                continue;
//            }

//            //if (i == 'WorkOrderVersions') {
//            //    var ss = i;
//            //}


//            //if (i == '2') {
//            //    var ss = i;
//            //}

//            if (typeof objOld[i] == 'object') {
//                if (objOld[i] && objNew[i]) {
//                    if (typeof objOld[i].getMonth === 'function') {
//                        if (objOld[i].toString() != objNew[i].toString()) {
//                            diffObjects.push({ name: i, oldType: typeof objOld[i], oldValue: objOld[i], newType: typeof objNew[i], newValue: objNew[i] });
//                        }
//                    } else {
//                        if (objOld[i].constructor === Array || objNew[i].constructor === Array) {
//                            if (objOld[i].length != objNew[i].length && i != 'WorkOrderVersions') {
//                                diffObjects.push({ name: i, oldType: 'Array', oldValue: objOld[i].length, newType: 'Array', newValue: objNew[i].length });
//                            }
//                        }
//                        diffObjects = diffObjects.concat(findDiff(objOld[i], objNew[i], excludeList));
//                    }
//                } else if ((objOld[i] == null || objOld[i] == undefined) && (objNew[i] == null || objNew[i] == undefined)) {
//                        ;
//                } else {
//                    diffObjects.push({ name: i, oldType: typeof objOld[i], oldValue: objOld[i], newType: typeof objNew[i], newValue: objNew[i] });
//                }

//            } else {
//                if (!angular.equals(objOld[i], objNew[i])) {
//                    if (((typeof objOld[i] == 'number' || typeof objNew[i] == 'number')) && floatApply(objOld[i]) == floatApply(objNew[i])) {
//                        continue;
//                    }
//                    try {
//                        if (!angular.equals(objOld[i].toString(), objNew[i].toString())) {
//                            diffObjects.push({ name: i, oldType: typeof objOld[i], oldValue: objOld[i], newType: typeof objNew[i], newValue: objNew[i] });
//                        }
//                    } catch (e) {
//                        diffObjects.push({ name: i, oldType: typeof objOld[i], oldValue: objOld[i], newType: typeof objNew[i], newValue: objNew[i] });
//                    }
//                }
//            }
//        }
//    }
//    return diffObjects;
//};
