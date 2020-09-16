import { ExpenseClaim, AvailableWorkOrder, ExpenseItem } from './../../model';
import { PhxDocument, EntityList } from '../../../common/model/index';

export interface ExpenseClaimState {
    expenseClaims: { [Id: string]: ExpenseClaim };
    availableWorkOrdersList: Array<AvailableWorkOrder>;
    currentExpenseItem: ExpenseItem;
    documentList: { [Id: string]: Array<PhxDocument>};
};
