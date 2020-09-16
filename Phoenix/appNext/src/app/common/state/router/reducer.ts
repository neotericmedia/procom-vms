import { Action } from 'redux';

import { UPDATE_LOCATION } from './actions';

export interface IRouterState {
  params: any;
  queryParams: any;
  data: any;
  location: string;
}

export const defaultRouterState: IRouterState = {
  params: {},
  queryParams: {},
  data: {},
  location: ''
};

export interface RouterAction extends Action {
  router: IRouterState;
}

export function routerReducer(
  state: IRouterState = defaultRouterState,
  action: RouterAction
): IRouterState {
  switch (action.type) {
    case UPDATE_LOCATION: {
      return action.router || defaultRouterState;
    }
    default: {
      return state;
    }
  }
}

export const getRouterState = state => state.router as IRouterState;
