import { ApiService } from './../../common/services/api.service';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { CommandResponse } from '../../common/model';
declare var oreq: any;

@Injectable()

export class VmsService {
    constructor(
        private apiService: ApiService,
    ) { }

    updateVmsTimesheetProcessedRecordUserNotes(command) {
        return this.apiService.command('VmsTimesheetProcessedRecordUserNotesUpdate', command);
    }
    updateVmsDiscountProcessedRecordUserNotes(command) {
        return this.apiService.command('VmsDiscountProcessedRecordUserNotesUpdate', command);
    }
    updateVmsExpenseProcessedRecordUserNotes(command) {
        return this.apiService.command('VmsExpenseProcessedRecordUserNotesUpdate', command);
    }
    updateVmsCommissionProcessedRecordUserNotes(command) {
        return this.apiService.command('VmsCommissionProcessedRecordUserNotesUpdate', command);
    }
    updateVmsFixedPriceProcessedRecordUserNotes(command) {
        return this.apiService.command('VmsFixedPriceProcessedRecordUserNotesUpdate', command);
    }
    updateVmsUnitedStatesSourceDeductionProcessedRecordUserNotes(command) {
        return this.apiService.command('VmsUnitedStatesSourceDeductionProcessedRecordUserNotesUpdate', command);
    }

    getVmsTimesheetImportedRecord(id: number) {
        return this.apiService.query(`transactionHeader/getVmsTimesheetImportedRecord/${id}`);
    }

    vmsTimesheetImportRecordTypeUpdate(command: any) {
        return this.apiService.command('VmsTimesheetImportRecordTypeUpdate', command);
    }

    vmsTimesheetRevalidateRecords(command: any) {
        return this.apiService.command('VmsTimesheetProcessedRecordAutoResolve', command);
    }

    vmsExpenseImportRecordTypeUpdate(command: any) {
        return this.apiService.command('VmsExpenseImportRecordTypeUpdate', command);
    }

    getVmsExpenseImportedRecord(id: number) {
        return this.apiService.query(`vms/getVmsExpenseImportedRecord/${id}`);
    }

    vmsExpenseRecordSetConflictType(command: any) {
        return this.apiService.command('VmsExpenseProcessedRecordMoveToConflict', command);
    }

    vmsProcessedRecordSetTypeConflict(command: any) {
        return this.apiService.command('VmsTimesheetProcessedRecordMoveToConflict', command);
    }

    vmsCommissionImportRecordTypeUpdate(command: any) {
        return this.apiService.command('VmsCommissionImportRecordTypeUpdate', command);
    }


    vmsFixedPriceImportRecordTypeUpdate(command: any) {
        return (this.apiService.command('VmsFixedPriceImportRecordTypeUpdate', command));
    }

    getVmsCommissionImportedRecord(id: any) {
        return this.apiService.query(`vms/getVmsCommissionImportedRecord/${id}`);
    }

    getVmsFixedPriceImportedRecord(id: any) {
        return this.apiService.query(`vms/getVmsFixedPriceImportedRecord/${id}`);
    }

    vmsCommissionRecordSetConflictType(command: any) {
        return this.apiService.command('VmsCommissionProcessedRecordMoveToConflict', command);
    }

    vmsFixedPriceRecordSetConflictType(command: any) {
        return this.apiService.command('VmsFixedPriceProcessedRecordMoveToConflict', command);
    }

    vmsCommissionRevalidateRecords(command: any) {
        return this.apiService.command('VmsCommissionProcessedRecordAutoResolve', command);
    }

    vmsFixedPriceRevalidateRecords(command: any) {
        return this.apiService.command('VmsFixedPriceProcessedRecordAutoResolve', command);
    }

    //  VmsDiscount

    VmsDiscountRecordSetConflictType(command: any) {
        return this.apiService.command('VmsDiscountProcessedRecordMoveToConflict', command);
    }

    vmsDiscountImportRecordTypeUpdate(command: any) {
        return (this.apiService.command('VmsDiscountImportRecordTypeUpdate', command));
    }

    getUnitedStatesSourceDeductionProcessedRecords(tableState, oDataParams: any, organizationArgs: any[]) {
        const organizationIdInternal = (organizationArgs && organizationArgs[0]) ? organizationArgs[0] : 0;
        const organizationIdClient = (organizationArgs && organizationArgs[1]) ? organizationArgs[1] : 0;
        oDataParams =
            oDataParams ||
            oreq
                .request()
                .withSelect(['Id', 'DisplayName', 'Code'])
                .url();
        return Observable.fromPromise(this.apiService.query(`vms/getUnitedStatesSourceDeductionProcessedRecords/internalOrganization/${organizationIdInternal}/clientOrganization/${organizationIdClient}?` + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
    }

    getVmsUnitedStatesSourceDeductionImportedRecord(id: number) {
        return this.apiService.query(`transactionHeader/getVmsUnitedStatesSourceDeductionImportedRecord/${id}`);
    }

    VmsUnitedStatesSourceDeductionRecordSetConflictType(command: any) {
        return this.apiService.command('VmsUnitedStatesSourceDeductionProcessedRecordMoveToConflict', command);
    }

    getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization(organizationIdInternal: any, organizationIdClient: any, oDataParams: any) {
        return this.apiService.query(`transactionHeader/getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization/${organizationIdInternal}/${organizationIdClient}?` + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
    }

    getVmsDiscountImportedRecord(id: any) {
        return (this.apiService.query(`transactionHeader/getVmsDiscountImportedRecord/${id}`));
    }

    vmsUnitedStatesSourceDeductionImportRecordTypeUpdate(command: any) {
        return this.apiService.command('VmsUnitedStatesSourceDeductionImportRecordTypeUpdate', command);
    }

    getVmsAllItems(oDataParams) {
        return this.apiService.query('vms/getVmsAllItems' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
    }

    public preProcessFile(EntityTypeId: number, EntityId: number) {
        const payload = {
            EntityTypeId: EntityTypeId,
            EntityIds: [EntityId]
        };
        const commandName = 'VmsDocumentProcess';
        return new Promise((resolve, reject) => {
            this.apiService.command(commandName, payload)
                .then((response: any) => {
                    if (!response.IsValid) {
                        reject(response.ValidationMessages);
                    } else {
                        resolve(response);
                    }
                })
                .catch(ex => {
                    reject(ex);
                });
        });
    }

    public rejectFile(EntityTypeId: number, EntityId: number) {
        const payload = {
            EntityTypeId: EntityTypeId,
            EntityIds: [EntityId]
        };
        const commandName = 'VmsDocumentDiscard';
        return new Promise((resolve, reject) => {
            this.apiService.command(commandName, payload)
                .then((response: any) => {
                    if (!response.IsValid) {
                        reject(response.ValidationMessages);
                    } else {
                        resolve(response);
                    }
                })
                .catch(ex => {
                    reject(ex);
                });
        });
    }

    public executeStateCommand(commandName: string, payload: any) {
        return new Promise((resolve, reject) => {
            this.apiService.command(commandName, payload)
                .then((response: CommandResponse) => {
                    if (!response.IsValid) {
                        reject(response.ValidationMessages);
                    } else {
                        resolve(response);
                    }
                })
                .catch(ex => {
                    reject(ex);
                });
        });
    }

    public createTransactions(command) {
        return (this.apiService.command(command.CommandName, command));
    }
}

