import { AccessAction } from './../../common/model/access-action';
import { Invoice } from './invoice';
import { InvoiceRecipient, CourtesyCopyProfile, InvoiceBillingTransaction } from './index';
import { PhxConstants } from '../../common/PhoenixCommon.module';
import * as _ from 'lodash';

export class InvoiceExtension {
    public static findRecipientIndex(invoice: Invoice, recipient: InvoiceRecipient): number {
        return InvoiceExtension.findRecipientIndexInCollection(invoice.InvoiceRecipients, recipient);
    }

    public static findClientRecipientIndex(invoice: Invoice, recipient: InvoiceRecipient): number {
        let itemIndex: number;

        if (recipient.InvoiceRecipientTypeId === PhxConstants.InvoiceRecipientType.ClientCC) {
            itemIndex = InvoiceExtension.findRecipientIndexInCollection(invoice.ClientCourtesyCopies, recipient);
        }

        return itemIndex;
    }

    public static findInternalRecipientIndex(invoice: Invoice, recipient: InvoiceRecipient): number {
        let itemIndex: number;

        if (recipient.InvoiceRecipientTypeId === PhxConstants.InvoiceRecipientType.InternalCC) {
            itemIndex = InvoiceExtension.findRecipientIndexInCollection(invoice.InternalCourtesyCopies, recipient);
        }

        return itemIndex;
    }

    private static findRecipientIndexInCollection(recipients: InvoiceRecipient[], recipient: InvoiceRecipient) {
        let itemIndex: number;

        if (recipient.TemporaryGuid && recipient.TemporaryGuid !== '') {
            itemIndex = recipients.findIndex(x => x.TemporaryGuid === recipient.TemporaryGuid);
        } else {
            itemIndex = recipients.findIndex(x => x.Id === recipient.Id);
        }

        return itemIndex;
    }

    public static getAllClientCourtesyCopyProfiles(invoice: Invoice): Array<CourtesyCopyProfile> {
        const allClientCCProfiles = invoice.InvoiceBillingTransactions
            .map((ibt: InvoiceBillingTransaction) => ibt.CourtesyCopyProfiles)
            .reduce((a: Array<CourtesyCopyProfile>, b: Array<CourtesyCopyProfile>) => {
                return (a || []).concat(b || []);
            }, []);

        const allUniqueClientCCProfiles = allClientCCProfiles.reduce((a, b) => a.findIndex(e => e.Id === b.Id) < 0 ? [...a, b] : a, []);

        return allUniqueClientCCProfiles
            .filter(a => a.Id != null)
            .sort((a: CourtesyCopyProfile, b: CourtesyCopyProfile) => {
                if (a.Name < b.Name) {
                    return -1;
                }
                if (a.Name > b.Name) {
                    return 1;
                }
                return 0;
            });
    }

    public static getAllInvoiceToProfiles(invoice: Invoice): Array<CourtesyCopyProfile> {
        const allInvoiceToProfiles = invoice.InvoiceBillingTransactions
            .map(bt => {
                return [{
                    Id: bt.InvoiceToProfileId,
                    Name: bt.InvoiceToName
                }];
            })
            .reduce((a: Array<CourtesyCopyProfile>, b: Array<CourtesyCopyProfile>) => {
                return (a || []).concat(b || []);
            }, []);

        const allUniqueInvoiceToProfiles = allInvoiceToProfiles.reduce((a, b) => a.findIndex(e => e.Id === b.Id) < 0 ? [...a, b] : a, []);

        return allUniqueInvoiceToProfiles
            .filter(a => a.Id != null)
            .sort((a: CourtesyCopyProfile, b: CourtesyCopyProfile) => {
                if (a.Name < b.Name) {
                    return -1;
                }
                if (a.Name > b.Name) {
                    return 1;
                }
                return 0;
            });
    }

    public static recalculatePropertyValuesOnTransactionRemoved(invoice: Invoice,
        payload: any) {
        const isHeaderTermExistInList = invoice.InvoiceBillingTransactions
            .findIndex(n => n.BillingInvoiceTermId === invoice.BillingInvoiceTermId);
        const isHeaderTemplateExistInList = invoice.InvoiceBillingTransactions
            .findIndex(n => n.BillingInvoiceTemplateId === invoice.BillingInvoiceTemplateId);
        if (isHeaderTermExistInList === -1) {
            invoice.BillingInvoiceTermId = null;
        }
        if (isHeaderTemplateExistInList === -1) {
            invoice.BillingInvoiceTemplateId = null;
        }
        invoice.Total -= payload.TotalAmount;
        invoice.Tax -= payload.Tax;
        invoice.Subtotal -= payload.Subtotal;
    }

    public static getCurrentlySelectedInternalCC(invoice: Invoice): Array<number> {
        return InvoiceExtension.getCurrentlySelectedCC(invoice.InternalCourtesyCopies);
    }

    private static getCurrentlySelectedCC(recipients: InvoiceRecipient[]): Array<number> {
        return recipients
            .filter(i => i.InvoiceRecipientUserProfileId != null)
            .map(i => i.InvoiceRecipientUserProfileId);
    }

    public static isEditable(invoice: Invoice, forceEdit: boolean) {
        if (!invoice) {
            return false;
        } else {
            return invoice.AccessActions.some((action: AccessAction) => action.AccessAction === PhxConstants.EntityAccessAction.InvoiceEdit) && (invoice.StatusId === PhxConstants.InvoiceStatus.Draft || forceEdit);
        }
    }

    public static getBillingTransactionNotes(invoice: Invoice, noteProperty: string): Array<string> {
        const noteItems = [];
        const notes = invoice.InvoiceBillingTransactions
            .map((bt: InvoiceBillingTransaction) => {
                if (noteItems.indexOf(bt[noteProperty]) < 0 && bt[noteProperty] && bt[noteProperty].trim() !== '') {
                    noteItems.push(bt[noteProperty]);
                }
            });
        return noteItems.sort();
    }

    public static getSelectedDeliverToProfiles(invoice: Invoice) {
        const recipients: InvoiceRecipient[] = invoice.InvoiceRecipients;
        const profileId = invoice.InvoiceTo.InvoiceRecipientUserProfileId;
        if (recipients) {
            const profiles = recipients.filter(x => x.DeliveryMethodId === PhxConstants.DeliveryMethod.InternalProfile && x.InvoiceRecipientUserProfileId === profileId).map(r => {
                return {
                    Id: r.DeliverToUserProfileId,
                    Name: r.DeliverToUserProfileName
                };
            });

            return _.uniqBy(profiles, 'Id');
        } else {
            return [];
        }
    }
}
