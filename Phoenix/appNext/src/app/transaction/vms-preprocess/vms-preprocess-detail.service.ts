import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ApiService } from '../../common';

@Injectable()
export class VmsPreprocessDetailService {

    constructor(
        private apiService: ApiService,
    ) { }

    public refreshTotalsSubject = new Subject<string>();

    refreshTotals(value: string) {
        return this.refreshTotalsSubject.next(value);
    }

    updateVmsCommissionImportRecordUserNotes(payload) {
        return this.apiService.command('VmsCommissionImportRecordUserNotesUpdate', payload);
    }

    updateVmsFixedPriceImportRecordUserNotes(payload) {
        return this.apiService.command('VmsFixedPriceImportRecordUserNotesUpdate', payload);
    }

    updateVmsDiscountImportRecordUserNotes(payload) {
        return this.apiService.command('VmsDiscountImportRecordUserNotesUpdate', payload);
    }

    updateVmsExpenseImportRecordUserNotes(payload) {
        return this.apiService.command('VmsExpenseImportRecordUserNotesUpdate', payload);
    }

    updateVmsTimesheetImportRecordUserNotes(payload) {
        return this.apiService.command('VmsTimesheetImportRecordUserNotesUpdate', payload);
    }

    updateVmsUnitedStatesSourceDeductionImportRecordUserNotes(payload) {
        return this.apiService.command('VmsUnitedStatesSourceDeductionImportRecordUserNotesUpdate', payload);
    }
}
