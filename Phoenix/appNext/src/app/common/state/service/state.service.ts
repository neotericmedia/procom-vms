import { Injectable, EventEmitter } from '@angular/core';
import { NgRedux, DevToolsExtension, Comparator, Selector } from '@angular-redux/store';
import { combineReducers, AnyAction, Middleware } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { property } from '../../utility/property';
import { rootActions } from '../root.actions';
import { BaseComponentActionContainer } from '../epics/base-component-action-container';
import { IAppState, rootReducerInitializer } from '../epics/root.reducer';
import { EpicDefinition } from '../epics/epics';
import { routerReducer } from '../router/reducer';

// fix me
import { NgReduxRouter } from '../router/router';
// import { NgReduxRouter } from '@angular-redux/router';

@Injectable()
export class StateService {

  get value() {
    return this.rx.getState();
  }

  onSelect = new EventEmitter<{ path: string, observable: any }>(false);
  private subjects: { [name: string]: BehaviorSubject<any> } = {};

  constructor(private rx: NgRedux<any>,
    private devTools: DevToolsExtension,
    private ngReduxRouter: NgReduxRouter) {

  }

  /** Initialize redux store.
   * @param reducers Reducer object { root}
   * @param initial {any} Initial value of the state.
   * @param useDevTools {boolean} Start with redux dev tools enabled.
  */
  public init(
    reducers: { [reducerRootPath: string]: (state: any, action?: any) => void },
    initial: any,
    middleware: any[],
    useDevTools: boolean) {

    let enhancers = [];
    if (useDevTools && this.devTools.isEnabled()) {
      enhancers = [...enhancers, this.devTools.enhancer()];
    }

    const combined = Object.assign({}, reducers);
    combined.router = routerReducer;
    const appReducer = combineReducers(combined);

    const rootReducer = (state, action) => {
      if (action.type === rootActions.logout) {
        state = undefined;
      }
      return appReducer(state, action);
    };

    this.rx.configureStore(rootReducer, initial, [this.actionToPlainObject, ...middleware, createEpicMiddleware(this.rootEpic)], enhancers);
    this.ngReduxRouter.initialize();
  }

  dispatch(type: string, payload?: any) {
    this.rx.dispatch({ type: type, payload: payload });
  }

  select<T>(path: string): BehaviorSubject<T> {
    // console.log('redux path: ' + path);
    const existing = this.subjects[path];
    if (existing) { return existing; }

    let last = null;
    const bs = new BehaviorSubject<T>(property.get(this.value, path));
    this.subjects[path] = bs;

    const observable = this.rx
      .select<T>(path.split('.'))
      .subscribe(val => {
        if (JSON.stringify(val) === last) {
          return;
        }
        last = JSON.stringify(val);
        bs.next(val);
      });

    this.onSelect.emit({ path, observable });
    return bs;

  }

  subscribe<T>(path: string, fn: (state: T) => void): Subscription {
    return this.select<T>(path).subscribe((o: T) => fn(o));
  }



  private actionToPlainObject: Middleware = store => next => action => {
    if (this.isObjectLike(action)) {
      return next({ ...(action as any) });
    }
    throw new Error(`action must be an object: ${JSON.stringify(action)}`);
  }

  private isObjectLike(val: any): val is {} {
    return this.isPresent(val) && typeof val === 'object';
  }

  private isPresent(obj: any) {
    return obj !== undefined && obj !== null;
  }

  private asyncReducers = {};

  private callbackMap: { [actionName: string]: Array<(action: any) => void> } = {};

  private epic$ = new BehaviorSubject(combineEpics(action$ => action$.ignoreElements()));
  public rootEpic = (action$, store) => this.epic$.mergeMap(epic => epic(action$, store));
  public registerEpic(otherEpics: EpicDefinition | Array<EpicDefinition>) {
    if (Array.isArray(otherEpics)) {
      otherEpics.forEach(e => this.epic$.next(e));
    } else {
      this.epic$.next(otherEpics);
    }
  }

  public registerReducer(name: string, reducer) {
    this.asyncReducers[name] = reducer;
    this.rx.replaceReducer(rootReducerInitializer(this.asyncReducers));
  }

  public subscribeOnAction<T>(path: string, fn: (state: T) => void): Subscription {
    return this.select<T>(path).subscribe((o: T) => fn(o));
  }

  public dispatchOnAction(action: AnyAction) {
    // console.log(`StateService.dispatchOnAction action: `, action);
    this.rx.dispatch(action);
  }

  selectOnAction<T>(selector?: Selector<IAppState, T>, comparator?: Comparator): Observable<T> {
    return this.rx.select(selector, comparator);
  }

  public observeOnAction(component: BaseComponentActionContainer, actionName: string | Array<string>): Observable<any> {
    // console.log(`StateService.observeOnAction(component: ${component.constructor.name}, actionName: ${actionName})`);
    if (!component || !component.isDestroyed$) {
      throw new Error('Invalid initialization of `observeOnAction`!');
    }
    const actionNames = typeof actionName === 'string' ? [actionName] : actionName as Array<string>;
    return Observable.create(observer => {
      this.registerEpic((action$) => {
        return action$.ofType(actionName)
          .takeUntil(component.isDestroyed$)
          .do(action => {
            observer.next(action);
          })
          .ignoreElements();
      });
    });
  }

  public delegateOnAction(component: BaseComponentActionContainer, actionName: string | Array<string>, callback: () => void) {
    // console.log(`StateService.delegateOnAction(component: ${component.constructor.name}, actionName: ${actionName})`);
    if (!component || !component.isDestroyed$ || typeof callback !== 'function') {
      throw new Error('Invalid initialization of `delegateOnAction`!');
    }
    this.observeOnAction(component, actionName).subscribe(() => {
      callback();
    });
  }

}
