import { composeReducers, defaultFormReducer } from '@angular-redux/form';
import { combineReducers } from 'redux';
import { IRouterState } from '../router/reducer';

export const rootReducerInitializer = (asyncReducers: any = null) =>
  composeReducers(
    defaultFormReducer(),
    combineReducers({
      ...asyncReducers
    })
  );


export interface IAppState {
  [property: string]: any;
  routes?: any;
  filter?: any;
  feedback?: any;
  router?: IRouterState;
}
