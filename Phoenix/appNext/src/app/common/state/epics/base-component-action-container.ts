import { BaseComponentOnDestroy } from './base-component-on-destroy';
import { Selector, Comparator } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Action } from 'redux';
import { ServiceLocator } from './service.locator';
import { IAppState } from './root.reducer';
import { StateService } from '../service/state.service';

export abstract class BaseComponentActionContainer extends BaseComponentOnDestroy {
  public modalFabButtons = null; // fix me
  public stateService: StateService;
  constructor() {
    super();
    this.stateService = ServiceLocator.injector.get<StateService>(StateService, null);
  }

  dispatch(action: Action) {
    this.stateService.dispatchOnAction(action);
  }

  select<T>(selector?: Selector<IAppState, T>, comparator?: Comparator): Observable<T> {
    return this.stateService.selectOnAction<T>(selector, comparator).takeUntil(this.isDestroyed$);
  }

  observeOnAction(actionName: string | Array<string>): Observable<any> {
    return this.stateService.observeOnAction(this, actionName);
  }

  delegateOnAction(actionName: string | Array<string>, callback: () => void) {
    this.stateService.delegateOnAction(this, actionName, callback);
  }
}
