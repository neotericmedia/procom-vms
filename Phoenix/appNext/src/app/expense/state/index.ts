import { expenseClaimReducer } from './expense-claim';
import { expenseCategoryReducer } from './expense-category';

export const expenseReducers = {
    'expenseClaim': expenseClaimReducer,
    'expenseCategory': expenseCategoryReducer,
};
