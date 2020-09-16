export const invoiceActions = {
    invoices: {
        updateState: '@phoenix/invoice:update state',
        removeBillingTransactionFromState: '@phoenix/invoice:remove billing transactions from store',
        updateRecipientState: '@phoenix/invoice:update recipient',
        removeRecipientFromState: '@phoenix/invoice:remove recipient',
        updateInvoiceToState: '@phoenix/invoice:update invoiceto recipient',
        updateInternalRecipientState: '@phoenix/invoice:update internal recipient',
        removeInternalRecipientFromState: '@phoenix/invoice:remove internal recipient',
        updateClientRecipientState: '@phoenix/invoice:update client recipient',
        removeClientRecipientFromState: '@phoenix/invoice:remove client recipient',
        updateTransactionDocumentsState: '@phoenix/invoice:update transactionDocument',
    },
    uiState: {
        setEditMode: '@phoenix/invoice ui State:set edit mode',
    },
    invoiceClearingCounts: {
        updateState: '@phoenix/invoice clearing counts:update state',
        resetCounts: '@phoenix/invoice clearing counts:reset counts',
    },
    billingTransactionClearingCounts: {
        updateState: '@phoenix/billing transaction clearing counts:update state',
        resetCounts: '@phoenix/billing transaction counts:reset counts',
    }
};
