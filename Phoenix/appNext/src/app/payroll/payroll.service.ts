import { ApiService } from './../common/services/api.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { RemittanceBatch } from './model';
import { CommonService } from '../common';
declare var oreq: any;

@Injectable()
export class PayrollService {

    remittanceBatch$: Observable<RemittanceBatch>;

    constructor(
        private apiService: ApiService,
        private commonService: CommonService,
    ) { }

    public getListPendingRemittanceTransaction(oDataParams): Observable<any> {
        oDataParams = oDataParams || oreq.request().withSelect(['Id', 'WorkflowPendingTaskId', 'OrganizationIdInternal', 'OrganizationInternalLegalName', 'OrganizationInternalLegalName', 'SourceDeductionTypeId', 'CurrencyId']).url();
        return Observable.fromPromise(this.apiService.query('Payroll/getListPendingRemittanceTransaction?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
    }

    public getOrganizationName(organizationIdInternal: number): Observable<any> {
        let oDataParams: string;

        oDataParams = oreq.request().withSelect(['LegalName']).withFilter(oreq.filter('Id').eq(organizationIdInternal)).url();
        return Observable.fromPromise(this.apiService.query('org/getOrganizations?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
    }

    public getRemittanceBatches(organizationIdInternal: number, oDataParams): Observable<Array<RemittanceBatch>> {
        return Observable.fromPromise(this.apiService.query('Payroll/getRemittanceBatch/' + organizationIdInternal + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
    }

    public getRemittanceBatchById(organizationIdInternal: number, batchId: number): Observable<RemittanceBatch> {
        this.remittanceBatch$ = Observable.fromPromise(this.apiService.query('payroll/getRemittanceBatchById/' + organizationIdInternal + '/' + batchId));
        return this.remittanceBatch$;
    }

    public getAllWorkerCompensations(): Observable<any> {
        return Observable.fromPromise(this.apiService.query('Payroll/getAllWorkerCompensations'));
    }

    public getListPendingPaymentTransactionRemittancePayroll(oDataParams): Observable<any> {
        return Observable.fromPromise(this.apiService.query('Payroll/getListPendingPaymentTransactionRemittancePayroll?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
    }

    public getListPendingPaymentTransactionRemittanceWorkerSafety(oDataParams): Observable<any> {
        return Observable.fromPromise(this.apiService.query('Payroll/getListPendingPaymentTransactionRemittanceWorkerSafety?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
    }

    public getListPendingPaymentTransactionRemittanceHealthTax(oDataParams): Observable<any> {
        return Observable.fromPromise(this.apiService.query('Payroll/getListPendingPaymentTransactionRemittanceHealthTax?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
    }

    public SubmitPaymentTransactionsForRemittance(paymentTransactionIds: number[], remittanceType: string, remittanceDate: any): Observable<any> {
        let remittanceTypeId: number;

        switch (remittanceType) {
            case 'payroll-deduction':
                remittanceTypeId = this.commonService.ApplicationConstants.RemittanceType.Payroll;
                break;
            case 'wcb':
                remittanceTypeId = this.commonService.ApplicationConstants.RemittanceType.WorkerSafety;
                break;
            case 'health-tax':
                remittanceTypeId = this.commonService.ApplicationConstants.RemittanceType.HealthTax;
                break;
            default:
                remittanceTypeId = 0;
        }
        const command = {
            EntityIds: paymentTransactionIds,
            RemittanceType: remittanceTypeId,
            RemittanceDate: remittanceDate,
            EntityTypeId:this.commonService.ApplicationConstants.EntityType.PaymentTransaction
        };
        return Observable.fromPromise(this.apiService.command('RemittanceTransactionRemit', command));
    }

    public getProvincialTaxHeaderByProvincialTaxVersionId(provincialTaxVersionId: number): Observable<any> {
        return Observable.fromPromise(this.apiService.query(`Payroll/getProvincialTaxHeaderByProvincialTaxVersionId/${provincialTaxVersionId}`));
    }

    public executeAction(command: string, data: any) {
        return Observable.fromPromise(this.apiService.command(command, data, true));
    }

    public getFederalTaxHeaderByFederalTaxVersionId(federalTaxVersionId: number): Observable<any> {
        return Observable.fromPromise(this.apiService.query('Payroll/getFederalTaxHeaderByFederalTaxVersionId/' + federalTaxVersionId));
    }

    getWorkflowAvailableActions(EntityTypeId: string, VersionId: number) {
        return Observable.fromPromise(this.apiService.query('task/getTasksAvailableActionsByTargetEntity/targetEntityTypeId/' + EntityTypeId + '/targetEntityId/' + VersionId));
    }

    public actionExecute(currentVersion, federalTaxHeaderId, countryId, actionCommandName) {
        const command = {
            WorkflowPendingTaskId: (actionCommandName === 'FederalTaxHeaderNew') ? -1 : currentVersion.WorkflowPendingTaskId,
            CommandName: actionCommandName,
            Id: federalTaxHeaderId,
            CountryId: countryId,
            FederalTaxVersion: currentVersion,
        };
        return Observable.fromPromise(this.apiService.command(actionCommandName, command));
    }
}
