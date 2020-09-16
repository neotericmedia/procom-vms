import { Observable } from 'rxjs/Rx';
import { Injectable, EventEmitter, Output } from '@angular/core';

import { CommonService, ApiService, LoadingSpinnerService, WorkflowService } from '../../common/index';
import { StateService } from '../../common/state/state.module';
import {
    Invoice,
    InvoiceGrouped,
    InvoiceBillingTransaction,
    InvoiceRecipient,
    BillingTransactionGrouped,
} from './index';
import { InvoiceStatePath, invoiceActions } from '../state/index';

import { EntityList, CommandResponse } from '../../common/model/index';
import { PhxConstants } from '../../common/PhoenixCommon.module';
import { UserProfile } from '../../common/model/user';
import { AuthService } from '../../common/services/auth.service';
declare var oreq: any;

@Injectable()
export class InvoiceService {

    constructor(
        private apiService: ApiService,
        private commonService: CommonService,
        private workflowService: WorkflowService,
        private state: StateService,
        private loadingSpinnerService: LoadingSpinnerService,
        private authService: AuthService
    ) { }

    private param(oDataParams) {
        return oDataParams
            ? `?${oDataParams}`
            : '';
    }

    private getByIdUrl(id: number, oDataParams = null): string {
        return `invoice/${id}${this.param(oDataParams)}`;
    }

    public getInvoiceFromApi(id: number, oDataParams = null): Promise<Invoice> {
        return new Promise<Invoice>((resolve, reject) => {
            this.apiService.query(this.getByIdUrl(id, oDataParams))
                .then((response: Invoice) => {
                    resolve(response);
                    this.updateState(response);
                    this.updateUiStateEditable(id, false);
                })
                .catch((err) => reject(err));
        });
    }

    public getInvoice(id: number, oDataParams = null, forceGet = false) {

        const state = this.state.value;
        const targetValue = state && state.invoice && state.invoice.invoices && state.invoice.invoices[id];

        if (targetValue === null || targetValue === undefined || forceGet) {
            this.getInvoiceFromApi(id, oDataParams);
        }

        return this.state.select<Invoice>(InvoiceStatePath.invoice.invoices.byId(id).instance);
    }

    public executeCommand(commandName: string, payload?: any, oDataParams = null, updateState: boolean = true) {
        // show extra spinner to prevent flickering between executing action and query
        this.loadingSpinnerService.show();

        return new Promise((resolve, reject) => {
            this.apiService.command(commandName, payload)
                .then((r: CommandResponse) => {

                    if (!r.IsValid) {
                        this.loadingSpinnerService.hideAll();
                        reject(r.ValidationMessages);
                        return;
                    }

                    const entityTypeId = this.commonService.ApplicationConstants.EntityType.Invoice;
                    return this.workflowService.setWatchConfigOnWorkflowEvent('/next/', entityTypeId, entityTypeId, r.EntityId)
                        .then(() => {
                            const url = this.getByIdUrl(r.EntityId, oDataParams);
                            this.apiService.query(url)
                                .then((response: Invoice) => {
                                    if (updateState === true) {
                                        this.updateState(response);
                                        this.updateUiStateEditable(r.EntityId, false);
                                    }
                                    this.loadingSpinnerService.hide();
                                    resolve(r.EntityId);
                                })
                                .catch(ex => {
                                    console.error(url, ex);
                                    this.loadingSpinnerService.hideAll();
                                    reject(ex);
                                });
                        });
                })
                .catch(ex => {
                    console.error(commandName, payload, ex);
                    this.loadingSpinnerService.hideAll();
                    reject(ex);
                });

        });
    }

    public executeInvoiceTransactionDocumentUpdateStatusCommand(
        InvoiceId: number,
        InvoiceTransactionId: number,
        InvoiceTransactionDocumentIds: number[],
        InvoiceTransactionDocumentStatusId: number,
        LastModifiedDatetime: Date,
        updateState: boolean = true
    ) {

        this.loadingSpinnerService.show();

        return new Promise((resolve, reject) => {
            this.apiService.command('InvoiceTransactionDocumentUpdateStatus', {
                InvoiceTransactionId: InvoiceTransactionId,
                InvoiceTransactionDocumentIds: InvoiceTransactionDocumentIds,
                InvoiceTransactionDocumentStatusId: InvoiceTransactionDocumentStatusId,
                LastModifiedDatetime: LastModifiedDatetime,
            })
                .then((r: CommandResponse) => {

                    if (!r.IsValid) {
                        this.loadingSpinnerService.hideAll();
                        reject(r.ValidationMessages);
                        return;
                    }

                    const url = `invoice/invoiceTransactionDocuments/${r.EntityId}`;
                    this.apiService.query(url)
                        .then((response: any) => {
                            if (response && response.Items && updateState) {
                                const data = {
                                    InvoiceId: InvoiceId,
                                    InvoiceTransactionId: r.EntityId,
                                    InvoiceTransactionDocuments: response.Items
                                };
                                this.state.dispatch(invoiceActions.invoices.updateTransactionDocumentsState, data);
                            }
                            this.loadingSpinnerService.hide();
                            resolve(r.EntityId);
                        })
                        .catch(ex => {
                            console.error(url, ex);
                            this.loadingSpinnerService.hideAll();
                            reject(ex);
                        });

                })
                .catch(ex => {
                    console.error('InvoiceTransactionDocumentUpdateStatus', ex);
                    this.loadingSpinnerService.hideAll();
                    reject(ex);
                });

        });
    }

    public updateState(invoice: Invoice) {
        this.state.dispatch(invoiceActions.invoices.updateState, invoice);
    }

    public updateRecipientState(recipient: InvoiceRecipient) {
        if (recipient.DeliveryMethodId == null || recipient.DeliveryMethodId === PhxConstants.DeliveryMethod.Suppressed) {
            recipient.DeliveryMethodId = PhxConstants.DeliveryMethod.SoftCopy;
        }

        this.state.dispatch(invoiceActions.invoices.updateRecipientState, recipient);

        if (recipient.InvoiceRecipientTypeId === PhxConstants.InvoiceRecipientType.ClientCC) {
            this.state.dispatch(invoiceActions.invoices.updateClientRecipientState, recipient);
        } else if (recipient.InvoiceRecipientTypeId === PhxConstants.InvoiceRecipientType.InternalCC) {
            this.state.dispatch(invoiceActions.invoices.updateInternalRecipientState, recipient);
        } else if (recipient.InvoiceRecipientTypeId === PhxConstants.InvoiceRecipientType.To) {
            this.state.dispatch(invoiceActions.invoices.updateInvoiceToState, recipient);
        }
    }

    public removeInvoiceBillingTransaction(invoiceBillingTransaction: InvoiceBillingTransaction) {
        this.state.dispatch(invoiceActions.invoices.removeBillingTransactionFromState, invoiceBillingTransaction);
    }

    public removeRecipientFromState(recipient: InvoiceRecipient) {
        this.state.dispatch(invoiceActions.invoices.removeRecipientFromState, recipient);

        if (recipient.InvoiceRecipientTypeId === PhxConstants.InvoiceRecipientType.ClientCC) {
            this.state.dispatch(invoiceActions.invoices.removeClientRecipientFromState, recipient);
        } else if (recipient.InvoiceRecipientTypeId === PhxConstants.InvoiceRecipientType.InternalCC) {
            this.state.dispatch(invoiceActions.invoices.removeInternalRecipientFromState, recipient);
        }
    }

    public getPendingReleaseGrouped(): Observable<EntityList<InvoiceGrouped>> {
        return Observable.fromPromise(this.apiService.query('invoice/pendingReleaseGrouped'));
    }

    public updateInvoiceClearingCounts(organizationIdInternal: number) {
        this.apiService.query('invoice/pendingReleaseGrouped/internalorganization/' + organizationIdInternal)
            .then((response: any) => {
                if (response && response.Items && response.Items.length === 1) {
                    this.state.dispatch(invoiceActions.invoiceClearingCounts.updateState, response.Items[0]);
                } else {
                    this.state.dispatch(invoiceActions.invoiceClearingCounts.resetCounts, organizationIdInternal);
                }
            });
    }

    public getInternalOrganizationPendingReleaseGrouped(organizationIdInternal: number, forceGet: boolean = false) {
        const state = this.state.value;
        const targetValue = state && state.invoice && state.invoice.invoiceClearingCounts && state.invoice.invoiceClearingCounts[organizationIdInternal];

        if (targetValue == null || forceGet) {
            this.updateInvoiceClearingCounts(organizationIdInternal);
        }

        return this.state.select<InvoiceGrouped>(InvoiceStatePath.invoice.invoiceClearingCounts.byId(organizationIdInternal).instance);
    }

    public getBillingTransactionGrouped(): Observable<EntityList<BillingTransactionGrouped>> {
        return Observable.fromPromise(this.apiService.query('billingTransaction/grouped'));
    }

    public getInternalProfiles(): Promise<Array<{ Id: number, Name: string }>> {
        return new Promise((resolve, reject) => {
            let result: Array<{ Id: number, Name: string }> = [];
            const filter = oreq.filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.Active).or()
                .filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.PendingChange);

            const oDataParams = oreq
                .request()
                .withExpand(['Contact'])
                .withSelect(['Id', 'Contact/FullName'])
                .withFilter(filter)
                .withOrderby(['Contact/FullName asc'])
                .url();

            this.apiService.query<EntityList<any>>(`UserProfile/getListUserProfileInternal?${oDataParams}`, false)
                .then((response) => {
                    if (response && response.Items) {
                        result = response.Items.map(item => {
                            return { Id: item.Id, Name: item.Contact.FullName };
                        });
                    }
                    resolve(result);
                })
                .catch((err) => reject(err));
        });
    }

    public getInvoiceEditMode(id: number) {
        const state = this.state.value;

        return this.state.select<boolean>(InvoiceStatePath.invoice.uiState.byId(id).editable.instance);
    }

    public updateUiStateEditable(id: number, editable: boolean) {
        this.state.dispatch(invoiceActions.uiState.setEditMode,
            {
                id: id,
                editable: editable
            });
    }

    public isCurrentUserHasClientRelatedRoles(): Observable<boolean> {
        return this.authService.getCurrentProfile()
            .map((profile: UserProfile) => {
                const rolesIndex = profile.FunctionalRoles.findIndex(item =>
                    item.FunctionalRoleId === this.commonService.ApplicationConstants.FunctionalRole.OrganizationalRole
                    || item.FunctionalRoleId === this.commonService.ApplicationConstants.FunctionalRole.Worker
                );
                return rolesIndex > -1;
            });
    }

    public getBillingTransactionClientList(organizationIdInternal: number, invoiceTypeId: number): Observable<any> {
        return Observable.fromPromise(this.apiService.query(`BillingTransaction/grouped/internalorganization/${organizationIdInternal}/billinginvoicepresentationstyle/${invoiceTypeId}`));
    }

    public updateBillingTransactionClearingCounts(organizationIdInternal: number) {
        this.apiService.query('BillingTransaction/grouped/internalorganization/' + organizationIdInternal)
            .then((response: any) => {
                if (response && response.Items && response.Items.length === 1) {
                    this.state.dispatch(invoiceActions.billingTransactionClearingCounts.updateState, response.Items[0]);
                } else {
                    this.state.dispatch(invoiceActions.billingTransactionClearingCounts.resetCounts, organizationIdInternal);
                }
            });
    }

    public getInternalOrganizationBillingTransactionGrouped(organizationIdInternal: number, forceGet: boolean = false) {
        const state = this.state.value;
        const targetValue = state && state.invoice && state.invoice.billingTransactionClearingCounts
            && state.invoice.billingTransactionClearingCounts[organizationIdInternal];

        if (targetValue == null || forceGet) {
            this.updateBillingTransactionClearingCounts(organizationIdInternal);
        }
        return this.state.select<BillingTransactionGrouped>
            (InvoiceStatePath.invoice.billingTransactionClearingCounts.byId(organizationIdInternal).instance);
    }

    public anyUnpaidBillingTransactions(invoiceId: number) {
        return this.apiService.query<boolean>(`invoice/${invoiceId}/anyUnpaidBillingTransactions`);
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
}

