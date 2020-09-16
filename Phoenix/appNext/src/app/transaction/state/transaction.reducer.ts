// https://github.com/markerikson/redux/blob/structuring-reducers-page/docs/recipes/reducers/09-ImmutableUpdatePatterns.md
// https://github.com/angular-redux/example-app/blob/master/src/app/animals/api/reducer.ts
import { ReducerUtility } from '../../common/state/service/reducer.utility';
import { TransactionAction } from './transaction.action';

interface ITransactionState {
  transaction: any; // { [Id: number]: IWorkOrder };
  loading: boolean;
  error: any;
}

const workorderInitials: ITransactionState = {
  transaction: {},
  loading: false,
  error: null
};

export const transactionReducer = (currState: ITransactionState = workorderInitials, action: TransactionAction.action): ITransactionState => {
  switch (action.type) {
    case TransactionAction.type.TransactionLoad: {
      const payload = action as TransactionAction.TransactionLoad;
      console.log(`transactionReducer: type:${payload.type}, Id:${payload.Id}`);
      return {
        ...currState,
        loading: true,
      };
    }
    case TransactionAction.type.TransactionLoadStarted: {
      const payload = action as TransactionAction.TransactionLoadStarted;
      console.log(`transactionReducer: type:${payload.type}, Id:${payload.Id}`);
      return currState;
    }
    case TransactionAction.type.TransactionLoadError: {
      const payload = action as TransactionAction.TransactionLoadError;
      console.log(`transactionReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        transaction: {},
        loading: false,
        error: payload.error
      };
    }
    // Transaction Add
    case TransactionAction.type.TransactionAdd: {
      const payload = action as TransactionAction.TransactionAdd;
      console.log(`transactionReducer: type:${payload.type}, Id:${payload.Id}, organization.Id:${payload.transation == null ? null : 1}`);
      return {
        ...currState,
        transaction: { ...currState.transaction, [payload.Id]: payload.transation },
        loading: false,
        error: null
      };
    }
    case TransactionAction.type.TransactionDelete: {
      const payload = action as TransactionAction.TransactionDelete;
      console.log(`transactionReducer: type:${payload.type}, Id:${payload.Id}`);
      // debugger;
      const transactionDetails = { ...currState.transaction };
      delete transactionDetails[payload.Id];
      return {
        ...currState,
        transaction: transactionDetails
      };
    }
    case TransactionAction.type.TransactionUpdate: {
      const payload = action as TransactionAction.TransactionUpdate;
      if (!payload.transaction) {
        return currState;
      }
      console.log(`transactionReducer: type:${payload.type}, Id:${payload.transaction.Id}, payload:${payload}`);
      return {
        ...currState,
        transaction: {
          ...currState.transaction,
          [payload.transaction.Id]: payload.transaction
        }
      };
    }
    case TransactionAction.type.TransactionValidationErrorAdd: {
      const payload = action as TransactionAction.TransactionValidationErrorAdd;
      console.log(`transactionReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        transaction: {
          ...currState.transaction,
          [payload.Id]: {
            ...currState.transaction[payload.Id],
            WorkorderValidationErrors: payload.validationMessages
          }
        }
      };
    }
    case TransactionAction.type.TransactionValidationErrorDelete: {
      const payload = action as TransactionAction.TransactionValidationErrorDelete;
      console.log(`transactionReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        transaction: {
          ...currState.transaction,
          [payload.Id]: {
            ...currState.transaction[payload.Id],
            WorkorderValidationErrors: []
          }
        }
      };
    }
    default: {
      return currState;
    }
  }
};
