import { WindowRefService } from './WindowRef.service';
import { Injectable, Inject } from '@angular/core';
import { CookieService as NgxCookieService } from 'ngx-cookie';
import { PhxConstants } from '../model/phx-constants';
import { environment } from '../../../environments/environment';
import { CodeValueGroups } from '../model/phx-code-value-groups';
import { ToastrService } from './toastr.service';
import * as _ from 'lodash';

import { saveAs } from 'file-saver';

@Injectable()
export class CommonService {

    private _moduleName; // used for logging

    constructor(
        private winRef: WindowRefService,
        private cookieService: NgxCookieService,
        private toastService: ToastrService
    ) {

    }
    get window(): any {
        return this.winRef.nativeWindow;
    }

    set moduleName(module: string) {
        this._moduleName = module || '';
    }

    get ApplicationConstants(): typeof PhxConstants {
        return PhxConstants;
    }

    get CodeValueGroups(): any {
        return CodeValueGroups;
    }

    get api2Url(): any {
        return environment.apiUrl;
    }

    get browserLocale(): string {

        return (
            this.winRef.nativeWindow.navigator.languages
                ? navigator.language[0]
                : this.winRef.nativeWindow.navigator.language || this.winRef.nativeWindow.navigator.userLanguage
        ) || 'en-CA';

    }

    get browserInfo(): { name: string, version: string } {
        const ua = navigator.userAgent;
        let tem;
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE ', version: (tem[1] || '') };
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/);
            if (tem !== null) { return { name: 'Opera', version: tem[1] }; }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) !== null) { M.splice(1, 1, tem[1]); }
        return {
            name: M[0],
            version: M[1]
        };
    }


    public bearerToken(): string {
        return this.cookieService.get('BearerToken');
    }

    public logError(message: string, data?: any, showToast: boolean = true): void {
        this.toastService.logError(message, data, this._moduleName, showToast);
    }

    public logSuccess(message: string, data?: any, showToast: boolean = true): void {
        this.toastService.logSuccess(message, data, this._moduleName, showToast);
    }

    public logWarning(message: string, data?: any, showToast: boolean = true): void {
        this.toastService.logWarning(message, data, this._moduleName, showToast);
    }

    public logInfo(message: string, data?: any, showToast: boolean = true): void {
        this.toastService.logInfo(message, data, this._moduleName, showToast);
    }

    public logDebug(message: string, data?: any, showToast: boolean = true): void {
        this.toastService.logDebug(message, data, this._moduleName, showToast);
    }


    public parseResponseError(responseError: any, overloadPropertyName?: string): Array<{ PropertyName: string, Message: string }> {
        return this.responseErrorMessages(responseError, overloadPropertyName);
    }


    getObjectValues(obj) {
        if (obj && obj != null && typeof obj === 'object') {
            return Object.keys(obj).map(function (e) {
                return obj[e];
            });
        } else {
            return [];
        }
    }

    public getObjectKeyByValue(collection, value) {
        const kArray = Object.keys(collection);                 // Creating array of keys
        const vArray = this.getObjectValues(collection);        // Creating array of values
        const vIndex = vArray.indexOf(value);                   // Finding value index

        return kArray[vIndex];                                  // Returning key by value index
    }

    public logValidationMessages(validationMessages: any) {
        // this.$common.logValidationMessages(validationMessages);
        const newLine = '\r\n';
        let logErrorMessage = '';
        if (!this.isEmptyObject(validationMessages)) {
            validationMessages.forEach(function (validationMessage) {
                logErrorMessage += newLine + validationMessage.PropertyName + ': ' + validationMessage.Message;
            });
        }
        if (logErrorMessage.length > 0) {
            // fix me
            // this.toastService.logError(logErrorMessage);
        }
    }

    public calculateAge(startDateString: Date, endDateString: string) {
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);
        let age = endDate.getUTCFullYear() - startDate.getUTCFullYear();

        if (endDate.getUTCMonth() < startDate.getUTCMonth() ||
            (endDate.getUTCMonth() === startDate.getUTCMonth()
                && endDate.getUTCDate() < startDate.getUTCDate())) {
            age--;
        }

        return age;
    }

    public base64FileSaveAs(base64FileStreamOrString: string, fileContentType: string, fileCharset: string, fileName: string): void {
        const blob = this.base64ToBlob(base64FileStreamOrString, fileContentType, fileCharset);
        saveAs(blob, fileName);
    }

    private base64ToBlob(base64FileStreamOrString: string, fileContentType: string, fileCharset?: string) {
        fileContentType = fileCharset ? fileContentType + ';charset=' + fileCharset + ';' : fileContentType;
        const binary = atob(base64FileStreamOrString);
        const buf = new ArrayBuffer(binary.length);
        const arr = new Uint8Array(buf);
        for (let i = 0; i < binary.length; i++) {
            arr[i] = binary.charCodeAt(i);
        }
        return new Blob([buf], { type: fileContentType });
    }


    public getUrlParams(prop: string) {
        prop = prop.toLowerCase();
        const params = {};
        const search = window.location.href.slice(window.location.href.indexOf('?') + 1);
        const definitions = search.split('&');

        definitions.forEach(function (val, key) {
            const parts = val.split('=', 2);
            params[parts[0].toLowerCase()] = decodeURIComponent(parts[1]);
        });

        return (prop && prop in params) ? params[prop] : params;
    }

    public compareFnToSortObjects(key, order = 'asc') {
        return function (a, b) {
            let comparison = 0;

            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                return comparison;
            }

            const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
            const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }

            return order === 'desc' ? comparison * -1 : comparison;
        };
    }

    public setMask(value: number) {
        let mask = {};
        switch (value) {
            case PhxConstants.Country.CA:
                mask = { mask: PhxConstants.Mask.CA };
                break;
            case PhxConstants.Country.US:
                mask = { mask: PhxConstants.Mask.US };
                break;
            case PhxConstants.Country.MX:
                mask = { mask: PhxConstants.Mask.MX };
                break;
            case PhxConstants.Country.DE:
                mask = { mask: PhxConstants.Mask.DE };
                break;
            default:
                mask = { mask: false };
                break;
        }
        return mask;
    }

    public getUserProfileTypeSufix(rowdata: any): String {
        switch (rowdata.UserProfileTypeId) {
            case PhxConstants.UserProfileType.Organizational:
                return 'organizational';
            case PhxConstants.UserProfileType.Internal:
                return 'internal';
            case PhxConstants.UserProfileType.WorkerTemp:
                return 'workertemp';
            case PhxConstants.UserProfileType.WorkerCanadianSp:
                return 'workercanadiansp';
            case PhxConstants.UserProfileType.WorkerCanadianInc:
                return 'workercanadianinc';
            case PhxConstants.UserProfileType.WorkerSubVendor:
                return 'workersubvendor';
            case PhxConstants.UserProfileType.WorkerUnitedStatesW2:
                return 'workerunitedstatesw2';
            case PhxConstants.UserProfileType.WorkerUnitedStatesLLC:
                return 'workerunitedstatesllc';
        }
    }

    isEmptyObject(obj) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    }

    responseErrorMessages(responseError, overloadPropertyName) {
        let validationMessages = [];
        const newLine = '\r\n';

        if (responseError && responseError !== undefined && responseError !== null && !this.isEmptyObject(responseError)) {
            let logErrorMessage = '';
            if (!this.isEmptyObject(responseError.ModelState)) {
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

                    if (responseErrorValue.Errors) {
                        _.each(responseErrorValue.Errors, function (errorValue, errorKey) {
                            validationMessages.push({
                                PropertyName: responseErrorKey, Message: errorValue.ErrorMessage
                            });
                        });
                    } else if (Object.prototype.toString.call(responseErrorValue) === '[object Array]') {
                        _.each(responseErrorValue, function (errorValue, errorKey) {
                            validationMessages.push({
                                PropertyName: responseErrorKey, Message: errorValue
                            });
                        });
                    } else {
                        validationMessages.push({
                            PropertyName: responseErrorKey, Message: responseErrorValue
                        });
                    }
                }); // end of _.each

                if (validationMessages.length > 0) {
                    let message;
                    if (validationMessages.length === 1) {
                        message = (<any>window).PhxTranslations.common.generic.oneValidationErrorMessage;
                    } else {
                        message = (<any>window).PhxTranslations.common.generic.multipleValidationErrorMessage;
                    }
                    logErrorMessage += message.replace(/\{0\}/g, validationMessages.length);
                }
            } else {
                let message;
                // if (!isEmptyObject(responseError) && responseError.CommandName) {
                //    logErrorMessage += responseError.CommandName ? newLine + 'CommandName: ' + responseError.CommandName : '';
                // }
                if (!this.isEmptyObject(responseError.ValidationMessages)) {
                    validationMessages = responseError.ValidationMessages;
                    if (validationMessages.length === 1) {
                        message = (<any>window).PhxTranslations.common.generic.oneValidationErrorMessage;
                    } else {
                        message = (<any>window).PhxTranslations.common.generic.multipleValidationErrorMessage;
                    }

                    logErrorMessage += message.replace(/\{0\}/g, validationMessages.length);
                }

                // Don't show status: 500 toast error for Concurrency exception, its handled by phoenixapi-service.js
                logErrorMessage += responseError.status && responseError.status !== 400 && !responseError.isConcurrencyException ? newLine + 'status: ' + responseError.status : '';

                if (!this.isEmptyObject(responseError.InnerException) && !this.isEmptyObject(responseError.InnerException.InnerException)) {
                    logErrorMessage += responseError.InnerException.InnerException.Message ? newLine + responseError.InnerException.InnerException.Message + newLine : '';
                    logErrorMessage += responseError.InnerException.InnerException.ExceptionType ? newLine + 'ExceptionType: ' + responseError.InnerException.InnerException.ExceptionType : '';
                    logErrorMessage += responseError.InnerException.InnerException.ExceptionMessage ? newLine + 'ExceptionMessage: ' + responseError.InnerException.InnerException.ExceptionMessage : '';
                    // logErrorMessage += responseError.InnerException.InnerException.StackTrace ? newLine + 'StackTrace: ' + responseError.InnerException.InnerException.StackTrace : '';
                }
                if (!this.isEmptyObject(responseError.InnerException)) {
                    logErrorMessage += responseError.InnerException.Message ? newLine + responseError.InnerException.Message + newLine : '';
                    logErrorMessage += responseError.InnerException.ExceptionType ? newLine + 'ExceptionType: ' + responseError.InnerException.ExceptionType : '';
                    logErrorMessage += responseError.InnerException.ExceptionMessage ? newLine + 'ExceptionMessage: ' + responseError.InnerException.ExceptionMessage : '';
                    // logErrorMessage += responseError.InnerException.StackTrace ? newLine + 'StackTrace:' + responseError.InnerException.StackTrace : '';
                }
                if (!this.isEmptyObject(responseError) && responseError.Message) {
                    logErrorMessage += responseError.Message ? newLine + responseError.Message + newLine : '';
                }
                if (!this.isEmptyObject(responseError) && responseError.ExceptionType) {
                    logErrorMessage += responseError.ExceptionType ? newLine + 'ExceptionType: ' + responseError.ExceptionType : '';
                }
                if (!this.isEmptyObject(responseError) && responseError.ExceptionMessage) {
                    logErrorMessage += responseError.ExceptionMessage ? newLine + 'ExceptionMessage: ' + responseError.ExceptionMessage : '';
                }
            }

            if (logErrorMessage.length > 0) {
                // fix me
                // this.toastService.logError(logErrorMessage);
            }
        }
        return validationMessages;
    }
}
