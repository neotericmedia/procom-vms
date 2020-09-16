import { Injectable } from '@angular/core';

@Injectable()
export class ToastrService {

    constructor() { }

    logDebug(message, data, source, showToast) {
        console.log('showToast is?', showToast);
        this.logIt(message, data, source, (showToast === undefined) ? false : showToast, 'error');
    }

    logInfo(message, data, source, showToast) {
        this.logIt(message, data, source, showToast, 'info');
    }

    logWarning(message, data, source, showToast) {
        this.logIt(message, data, source, showToast, 'warning');
    }

    logSuccess(message, data, source, showToast) {
        this.logIt(message, data, source, showToast, 'success');
    }

    logError(message, data, source, showToast) {
        this.logIt(message, data, source, showToast, 'error');
    }

    logIt(message, data, source, showToast, toastType) {
        // var write = (toastType === 'error') ? $log.error : $log.log;
        source = source ? '[' + source + '] ' : '';
        // write(source, message, data);
        if (showToast) {
            (<any>window).toastr.options = { positionClass: 'toast-bottom-right' };
            if (toastType === 'error') {
                (<any>window).toastr.error(message);
            } else if (toastType === 'warning') {
                (<any>window).toastr.warning(message);
            } else if (toastType === 'success') {
                (<any>window).toastr.success(message);
            } else {
                (<any>window).toastr.info(message);
            }
        }
    }
}
