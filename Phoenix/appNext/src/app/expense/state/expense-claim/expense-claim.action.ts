export const expenseClaimActions = {
    expenseClaims: {
        updateState: '@phoenix/expenseClaim:update expense Claim',
        updateItemsState: '@phoenix/expenseClaim:update expense Claim items',
        setAvailableWorkOrders : '@phoenix/expenseClaim:updateAvailableWorkOrders'
    },
    expenseItems: {
        updateState: '@phoenix/expenseItem:update Item of claim',
        updateCurrentItemState: '@phoenix/expenseItem:update current expense Item ',
        removeFromState: '@phoenix/expenseItem:remove Item from claim',
        clearValidationErrors: '@phoenix/expenseItem:clear Item validation errors',
        setValidationErrors: '@phoenix/expenseItem:set Item validation errors',
        addValidationErrors: '@phoenix/expenseItem:add Item validation errors',
    },
    documentList: {
        load: '@phoenix/expenseClaimDocuments:load all documents',
        remove: '@phoenix/expenseClaimDocuments:remove deleted document from store',
        add: '@phoenix/expenseClaimDocuments:add single document to store',
    }
};
