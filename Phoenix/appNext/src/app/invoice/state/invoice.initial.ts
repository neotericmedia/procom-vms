import { InvoiceState } from './invoice.interface';

export const invoiceInitial: InvoiceState = {
    invoices: {},
    uiState: {},
    invoiceClearingCounts: {},
    billingTransactionClearingCounts: {}
};
