export const InvoiceStatePath = {
    invoice: {
        invoices: {
            instance: `invoice.invoices`,
            byId: (Id: number) => {
                return {
                    instance: `invoice.invoices.${Id}`
                };
            },
        },
        uiState: {
            instance: `invoice.uiState`,
            byId: (Id: number) => {
                return {
                    instance: `invoice.uiState.${Id}`,
                    editable: {
                        instance: `invoice.uiState.${Id}.editable`,
                    }
                };
            },
        },
        invoiceClearingCounts: {
            instance: `invoice.invoiceClearingCounts`,
            byId: (OrganizationIdInternal: number) => {
                return {
                    instance: `invoice.invoiceClearingCounts.${OrganizationIdInternal}`
                };
            },
        },
        billingTransactionClearingCounts: {
            instance: `invoice.billingTransactionClearingCounts`,
            byId: (OrganizationIdInternal: number) => {
                return {
                    instance: `invoice.billingTransactionClearingCounts.${OrganizationIdInternal}`
                };
            },
        },
    },
};
