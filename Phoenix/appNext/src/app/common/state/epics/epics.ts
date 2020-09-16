import { IAppState } from './root.reducer';
import { AnyAction } from 'redux';
import { Observable } from 'rxjs/Observable';
import { Epic } from 'redux-observable';

export type EpicDefinition = Epic<AnyAction, IAppState>;

export interface IEpic<T extends AnyAction> { getEpics(): Array<Epic<T, IAppState>>; }
