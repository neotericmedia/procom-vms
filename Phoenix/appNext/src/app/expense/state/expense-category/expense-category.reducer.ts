import { expenseCategoryActions } from './expense-category.action';
import { expenseCategoryInitial } from './expense-category.initial';
import { ExpenseCategoryState } from './expense-category.interface';

export const expenseCategoryReducer = (
    currState: ExpenseCategoryState = expenseCategoryInitial,
    action: { type: string, payload?: any }) => {

    const newState: ExpenseCategoryState = JSON.parse(JSON.stringify(currState));
    const payload = JSON.parse(JSON.stringify(action.payload));

    switch (action.type) {

        // expense Category actions
        case expenseCategoryActions.expenseCategories.loadList:
            newState.expenseCategories = payload;
            break;

        default:
    }

    return newState;
};


