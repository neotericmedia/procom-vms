import { ExpenseClaim } from './../../model/expense-claim';
import { expenseClaimActions } from './expense-claim.action';
import { expenseClaimInitial } from './expense-claim.initial';
import { ExpenseClaimState } from './expense-claim.interface';
import { ExpenseItem } from '../../model/index';

export const expenseClaimReducer = (
    currState: ExpenseClaimState = expenseClaimInitial,
    action: { type: string, payload?: any }) => {

    const newState: ExpenseClaimState = JSON.parse(JSON.stringify(currState));
    const payload = JSON.parse(JSON.stringify(action.payload));

    switch (action.type) {

        // expense claim actions
        case expenseClaimActions.expenseClaims.updateState:
            newState.expenseClaims[payload.Id] = payload;
            break;

        case expenseClaimActions.expenseClaims.updateItemsState:
            newState.expenseClaims[payload.expenseClaimId].ExpenseItems = payload.expenseClaimItems;
            break;

        case expenseClaimActions.expenseClaims.setAvailableWorkOrders:
            newState.availableWorkOrdersList = payload;
            break;

        // expense items actions
        case expenseClaimActions.expenseItems.updateState:
            let itemIndex: number;
            if (payload.expenseItem.Id && payload.expenseItem.Id > 0) {
                itemIndex = newState.expenseClaims[payload.expenseClaimId].ExpenseItems
                    .findIndex(x => x.Id === payload.expenseItem.Id);
            }

            if (itemIndex != null && itemIndex !== -1) {
                newState.expenseClaims[payload.expenseClaimId].ExpenseItems[itemIndex] = payload.expenseItem;
            } else {
                newState.expenseClaims[payload.expenseClaimId].ExpenseItems.push(payload.expenseItem);
            }
            break;

        case expenseClaimActions.expenseItems.removeFromState:
            let itemToRemove: number;
            if (payload.expenseItem.Id && payload.expenseItem.Id > 0) {
                itemToRemove = newState.expenseClaims[payload.expenseClaimId].ExpenseItems
                    .findIndex(x => x.Id === payload.expenseItem.Id);
            }

            if (itemToRemove != null && itemToRemove !== -1) {
                newState.expenseClaims[payload.expenseClaimId].ExpenseItems.splice(itemToRemove, 1);
            }
            break;

        case expenseClaimActions.expenseItems.updateCurrentItemState:
            newState.currentExpenseItem = payload;
            break;

        case expenseClaimActions.expenseItems.clearValidationErrors:
            const items = newState.expenseClaims[payload.expenseClaimId].ExpenseItems;
            if (items) {
                items.forEach((item) => {
                    item.IsValid = true;
                    item.ValidationErrors = [];
                });
            }
            break;

        case expenseClaimActions.expenseItems.setValidationErrors:
            {
                const index = newState.expenseClaims[payload.expenseClaimId].ExpenseItems.findIndex(x => x.Id === payload.itemId);
                if (index !== -1) {
                    const item = newState.expenseClaims[payload.expenseClaimId].ExpenseItems[index];
                    item.IsValid = false;
                    item.ValidationErrors = payload.validationErrors;
                }
            }
            break;

        case expenseClaimActions.expenseItems.addValidationErrors:
            {
                const index = newState.expenseClaims[payload.expenseClaimId].ExpenseItems.findIndex(x => x.Id === payload.itemId);
                if (index !== -1) {
                    const item = newState.expenseClaims[payload.expenseClaimId].ExpenseItems[index];
                    item.IsValid = false;
                    item.ValidationErrors = (item.ValidationErrors || []).concat(payload.validationErrors);
                }
            }
            break;

        // expense claim document actions
        case expenseClaimActions.documentList.load:
            newState.documentList[payload.Id] = payload.Items;
            break;
        case expenseClaimActions.documentList.remove:
            let documentToRemove: number;
            documentToRemove = newState.documentList[payload.expenseClaimId]
                .findIndex(x => x.PublicId === payload.publicId);
            if (documentToRemove != null && documentToRemove !== -1) {
                newState.documentList[payload.expenseClaimId].splice(documentToRemove, 1);
            }
            break;
        case expenseClaimActions.documentList.add:
            if (newState.documentList[payload.expenseClaimId] == null) {
                newState.documentList[payload.expenseClaimId] = [];
            }
            newState.documentList[payload.expenseClaimId].push(payload.document);
            break;
    }

    return newState;
};


