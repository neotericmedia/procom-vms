import { Invoice, InvoiceGrouped, BillingTransactionGrouped } from '../shared/index';

export interface InvoiceState {
    invoices: { [Id: number]: Invoice };
    uiState: {
        [Id: string]: { editable: boolean }
    };
    invoiceClearingCounts: {
        [OrganizationIdInternal: number]: InvoiceGrouped
    };
    billingTransactionClearingCounts: {
        [OrganizationIdInternal: number]: BillingTransactionGrouped
    };
}
