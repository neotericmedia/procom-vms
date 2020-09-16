// https://github.com/markerikson/redux/blob/structuring-reducers-page/docs/recipes/reducers/09-ImmutableUpdatePatterns.md
// https://github.com/angular-redux/example-app/blob/master/src/app/animals/api/reducer.ts
import { ReducerUtility } from '../../common/state/service/reducer.utility';
import { CommissionRateAction } from './commission-rate.action';
import { ICommissionRate } from './commission-rate.interface';

interface ICommissionRateState {
  commissionRates:  { [Id: number]: ICommissionRate };
  loading: boolean;
  error: any;
}

const CommissionRateInitials: ICommissionRateState = {
  commissionRates: {},
  loading: false,
  error: null
};

export const CommissionRateReducer = (currState: ICommissionRateState = CommissionRateInitials, action: CommissionRateAction.action): ICommissionRateState | any => {
  switch (action.type) {
    case CommissionRateAction.type.CommissionRateLoadStarted: {
      const payload = action as CommissionRateAction.CommissionRateLoadStarted;
      console.log(`CommissionRateReducer: type:${payload.type}, Id:${payload.Id}`);
      return currState;
    }
    case CommissionRateAction.type.CommissionRateLoadError: {
      const payload = action as CommissionRateAction.CommissionRateLoadError;
      console.log(`CommissionRateReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        commissionRates: {},
        loading: false,
        error: payload.error
      };
    }
    case CommissionRateAction.type.CommissionRateAdd: {
      const payload = action as CommissionRateAction.CommissionRateAdd;
      console.log(`CommissionRateReducer: type:${payload.type}, Id:${payload.Id}, organization.Id:${payload.CommissionRate == null ? null : 1}`);
      return {
        ...currState,
        commissionRates: { ...currState.commissionRates, [payload.Id]: payload.CommissionRate },
        loading: false,
        error: null
      };
    }
    case CommissionRateAction.type.CommissionRateDelete: {
      const payload = action as CommissionRateAction.CommissionRateDelete;
      console.log(`CommissionRateReducer: type:${payload.type}, Id:${payload.Id}`);
      const commissionRates = { ...currState.commissionRates };
      delete commissionRates[payload.Id];
      return {
        ...currState,
        commissionRates: commissionRates
      };
    }
    case CommissionRateAction.type.CommissionRateUpdate: {
      const payload = action as CommissionRateAction.CommissionRateUpdate;
      if (!payload.CommissionRate) {
        return currState;
      }
      console.log(`CommissionRateReducer: type:${payload.type}, Id:${payload.CommissionRate.Id}, payload:${payload}`);
      return {
        ...currState,
        commissionRates: {
          ...currState.commissionRates,
          [payload.Id]: payload.CommissionRate
        }
      };
    }
    case CommissionRateAction.type.CommissionRateValidationErrorAdd: {
      const payload = action as CommissionRateAction.CommissionRateValidationErrorAdd;
      console.log(`CommissionRateReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        commissionRates: {
          ...currState.commissionRates,
          [payload.Id]: {
            ...currState.commissionRates[payload.Id],
            CommissionRateValidationErrors: payload.validationMessages
          }
        }
      };
    }
    case CommissionRateAction.type.CommissionRateValidationErrorDelete: {
      const payload = action as CommissionRateAction.CommissionRateValidationErrorDelete;
      console.log(`CommissionRateReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        commissionRates: {
          ...currState.commissionRates,
          [payload.Id]: {
            ...currState.commissionRates[payload.Id],
            CommissionRateValidationErrors: []
          }
        }
      };
    }
    default: {
      return currState;
    }
  }
};
