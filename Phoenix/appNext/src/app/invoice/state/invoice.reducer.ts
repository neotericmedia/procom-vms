import { InvoiceState } from './invoice.interface';
import { invoiceInitial } from './invoice.initial';
import { invoiceActions } from './invoice.actions';
import { InvoiceExtension } from '../shared/index';


export const invoiceReducer = (
    currState: InvoiceState = invoiceInitial,
    action: { type: string, payload?: any }) => {

    const newState: InvoiceState = JSON.parse(JSON.stringify(currState));
    const payload = JSON.parse(JSON.stringify(action.payload));

    switch (action.type) {

        // payload: Invoice
        case invoiceActions.invoices.updateState:
            newState.invoices[payload.Id] = payload;
            break;

        // payload: InvoiceBillingTransaction
        case invoiceActions.invoices.removeBillingTransactionFromState:
            const targetInvoice = newState.invoices[payload.InvoiceId];
            if (targetInvoice && targetInvoice.InvoiceBillingTransactions.length) {
                const billingTransactionIndex = targetInvoice.InvoiceBillingTransactions.findIndex(bt => bt.Id === payload.Id);
                if (billingTransactionIndex !== -1) {
                    targetInvoice.InvoiceBillingTransactions.splice(billingTransactionIndex, 1);
                    InvoiceExtension.recalculatePropertyValuesOnTransactionRemoved(targetInvoice, payload);
                }
            }
            break;

        // payload: InvoiceRecipient
        case invoiceActions.invoices.updateRecipientState:
            {
                const itemIndex: number = InvoiceExtension.findRecipientIndex(newState.invoices[payload.InvoiceId], payload);
                if (itemIndex != null && itemIndex !== -1) {
                    newState.invoices[payload.InvoiceId].InvoiceRecipients[itemIndex] = payload;
                } else {
                    newState.invoices[payload.InvoiceId].InvoiceRecipients.push(payload);
                }
            }
            break;

        // payload: InvoiceRecipient
        case invoiceActions.invoices.updateClientRecipientState:
            {
                const itemIndex: number = InvoiceExtension.findClientRecipientIndex(newState.invoices[payload.InvoiceId], payload);
                if (itemIndex != null && itemIndex !== -1) {
                    newState.invoices[payload.InvoiceId].ClientCourtesyCopies[itemIndex] = payload;
                } else {
                    newState.invoices[payload.InvoiceId].ClientCourtesyCopies.push(payload);
                }
            }
            break;

        // payload: InvoiceRecipient
        case invoiceActions.invoices.updateInternalRecipientState:
            {
                const itemIndex: number = InvoiceExtension.findInternalRecipientIndex(newState.invoices[payload.InvoiceId], payload);
                if (itemIndex != null && itemIndex !== -1) {
                    newState.invoices[payload.InvoiceId].InternalCourtesyCopies[itemIndex] = payload;
                } else {
                    newState.invoices[payload.InvoiceId].InternalCourtesyCopies.push(payload);
                }
            }
            break;

        // payload: InvoiceRecipient
        case invoiceActions.invoices.updateInvoiceToState:
            {
                newState.invoices[payload.InvoiceId].InvoiceTo = payload;
            }
            break;

        // payload: InvoiceRecipient
        case invoiceActions.invoices.removeRecipientFromState:
            {
                const itemToRemove: number = InvoiceExtension.findRecipientIndex(newState.invoices[payload.InvoiceId], payload);
                if (itemToRemove != null && itemToRemove !== -1) {
                    newState.invoices[payload.InvoiceId].InvoiceRecipients.splice(itemToRemove, 1);
                }
            }
            break;

        // payload: InvoiceRecipient
        case invoiceActions.invoices.removeClientRecipientFromState:
            {
                const itemToRemove: number = InvoiceExtension.findClientRecipientIndex(newState.invoices[payload.InvoiceId], payload);
                if (itemToRemove != null && itemToRemove !== -1) {
                    newState.invoices[payload.InvoiceId].ClientCourtesyCopies.splice(itemToRemove, 1);
                }
            }
            break;

        // payload: InvoiceRecipient
        case invoiceActions.invoices.removeInternalRecipientFromState:
            {
                const itemToRemove: number = InvoiceExtension.findInternalRecipientIndex(newState.invoices[payload.InvoiceId], payload);
                if (itemToRemove != null && itemToRemove !== -1) {
                    newState.invoices[payload.InvoiceId].InternalCourtesyCopies.splice(itemToRemove, 1);
                }
            }
            break;

        case invoiceActions.invoices.updateTransactionDocumentsState:
            {
                const itemIndex = newState.invoices[payload.InvoiceId].InvoiceBillingTransactions.findIndex(x => x.Id === payload.InvoiceTransactionId);
                if (itemIndex != null && itemIndex !== -1) {
                    newState.invoices[payload.InvoiceId].InvoiceBillingTransactions[itemIndex].InvoiceTransactionDocuments = payload.InvoiceTransactionDocuments;
                }
            }
            break;

        // payload {id , editable}
        case invoiceActions.uiState.setEditMode: {
            if (newState.uiState[payload.id] == null) {
                newState.uiState[payload.id] = { editable: false };
            }
            newState.uiState[payload.id].editable = payload.editable;
            break;
        }

        // payload InvoiceGrouped
        case invoiceActions.invoiceClearingCounts.updateState: {
            newState.invoiceClearingCounts[payload.OrganizationIdInternal] = payload;
            break;
        }

        // payload organizationIdInternal
        case invoiceActions.invoiceClearingCounts.resetCounts: {
            Object.assign(newState.invoiceClearingCounts[payload], {
                BillingInvoicePresentationStyles: [],
                Count: 0
            });
            break;
        }

        // payload BillingTransactionGrouped
        case invoiceActions.billingTransactionClearingCounts.updateState: {
            newState.billingTransactionClearingCounts[payload.OrganizationIdInternal] = payload;
            break;
        }

        // payload organizationIdInternal
        case invoiceActions.billingTransactionClearingCounts.resetCounts: {
            Object.assign(newState.billingTransactionClearingCounts[payload], {
                BillingInvoicePresentationStyles: [],
                Count: 0
            });
            break;
        }

    }

    return newState;
};



