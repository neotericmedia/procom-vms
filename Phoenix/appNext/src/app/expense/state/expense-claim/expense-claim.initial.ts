import { ExpenseClaimState } from './expense-claim.interface';

export const expenseClaimInitial: ExpenseClaimState = {
    expenseClaims: {},
    availableWorkOrdersList: null,
    currentExpenseItem : null,
    documentList: {},
};
