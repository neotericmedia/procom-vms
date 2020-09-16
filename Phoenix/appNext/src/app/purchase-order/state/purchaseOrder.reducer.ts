// https://github.com/markerikson/redux/blob/structuring-reducers-page/docs/recipes/reducers/09-ImmutableUpdatePatterns.md
// https://github.com/angular-redux/example-app/blob/master/src/app/animals/api/reducer.ts
import { ReducerUtility } from '../../common/state/service/reducer.utility';
import { PurchaseOrderAction } from './purchase-order.action';
import { IPurchaseOrder } from './purchase-order.interface';

interface IPurchaseOrderState {
  purchaseOrders: { [Id: number]: IPurchaseOrder };
  loading: boolean;
  error: any;
}

const purchaseOrderInitials: IPurchaseOrderState = {
  purchaseOrders: {},
  loading: false,
  error: null
};

export const purchaseOrderReducer = (currState: IPurchaseOrderState = purchaseOrderInitials, action: PurchaseOrderAction.action): IPurchaseOrderState => {
  switch (action.type) {
    case PurchaseOrderAction.type.PurchaseOrderLoadStarted: {
      const payload = action as PurchaseOrderAction.PurchaseOrderLoadStarted;
      console.log(`purchaseOrderReducer: type:${payload.type}, purchaseOrderId:${payload.purchaseOrderId}`);
      return currState;
    }
    case PurchaseOrderAction.type.PurchaseOrderLoadError: {
      const payload = action as PurchaseOrderAction.PurchaseOrderLoadError;
      console.log(`purchaseOrderReducer: type:${payload.type}, purchaseOrderId:${payload.purchaseOrderId}, payload:${payload}`);
      return {
        ...currState,
        purchaseOrders: {},
        loading: false,
        error: payload.error
      };
    }
    // purchaseOrder
    case PurchaseOrderAction.type.PurchaseOrderAdd: {
      const payload = action as PurchaseOrderAction.PurchaseOrderAdd;
      console.log(`purchaseOrderReducer: type:${payload.type}, purchaseOrderId:${payload.purchaseOrderId}, purchaseOrder.Id:${payload.purchaseOrder == null ? null : payload.purchaseOrder.Id}`);
      return {
        ...currState,
        purchaseOrders: { ...currState.purchaseOrders, [payload.purchaseOrderId]: payload.purchaseOrder },
        loading: false,
        error: null
      };
    }
    case PurchaseOrderAction.type.PurchaseOrderDelete: {
      const payload = action as PurchaseOrderAction.PurchaseOrderDelete;
      console.log(`purchaseOrderReducer: type:${payload.type}, purchaseOrderId:${payload.purchaseOrderId}`);
      // debugger;
      const orgs = { ...currState.purchaseOrders };
      delete orgs[payload.purchaseOrderId];
      return {
        ...currState,
        purchaseOrders: orgs
      };
    }
    case PurchaseOrderAction.type.PurchaseOrderUpdate: {
      // debugger;
      const payload = action as PurchaseOrderAction.PurchaseOrderUpdate;
      if (!payload.purchaseOrder) {
        return currState;
      }
      console.log(`purchaseOrderReducer: type:${payload.type}, purchaseOrderId:${payload.purchaseOrder.Id}, payload:${payload}`);
      return {
        ...currState,
        purchaseOrders: {
          ...currState.purchaseOrders,
          [payload.purchaseOrder.Id]: payload.purchaseOrder
        }
      };
    }
    default: {
      return currState;
    }
  }
};
