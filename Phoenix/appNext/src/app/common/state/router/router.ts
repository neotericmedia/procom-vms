// fix me: router.ts is custom version of https://github.com/angular-redux/router/blob/v7.0.0/src/router.ts based on "@angular/common": 5
import { map } from 'rxjs/operators/map';
import { filter } from 'rxjs/operators/filter';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { Injectable, ApplicationRef } from '@angular/core';
import { Location } from '@angular/common';
import {
  Router,
  NavigationEnd,
  NavigationCancel,
  DefaultUrlSerializer,
  RoutesRecognized,
  ActivatedRouteSnapshot
} from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { UPDATE_LOCATION } from './actions';
import { RouterAction, defaultRouterState, IRouterState } from './reducer';

@Injectable()
export class NgReduxRouter {
  private initialized = false;
  private currentLocation: string;
  private initialLocation: string;

  private selectRouterState: (state: any) => IRouterState = state =>
    state.router;
  private urlState: Observable<IRouterState>;

  private urlStateSubscription: ISubscription;
  private reduxSubscription: ISubscription;

  constructor(
    private router: Router,
    private ngRedux: NgRedux<any>,
    private applicationRef: ApplicationRef,
    private location: Location
  ) {}

  /**
   * Destroys the bindings between @angular-redux/router and @angular/router.
   * This method unsubscribes from both @angular-redux/router and @angular router, in case
   * your app needs to tear down the bindings without destroying Angular or Redux
   * at the same time.
   */
  destroy() {
    if (this.urlStateSubscription) {
      this.urlStateSubscription.unsubscribe();
    }

    if (this.reduxSubscription) {
      this.reduxSubscription.unsubscribe();
    }

    this.initialized = false;
  }

  /**
   * Initialize the bindings between @angular-redux/router and @angular/router
   *
   * This should only be called once for the lifetime of your app, for
   * example in the constructor of your root component.
   *
   *
   * @param {(state: any) => string} selectRouterState Optional: If your
   * router state is in a custom location, supply this argument to tell the
   * bindings where to find the router state object in the state.
   * @param {Observable<string>} urlState$ Optional: If you have a custom setup
   * when listening to router changes, or use a different router than @angular/router
   * you can supply this argument as an Observable of the current url state.
   */
  initialize( selectRouterState: (state: any) => IRouterState = state => state.router,
  urlState$: Observable<IRouterState> | undefined = undefined): void {
    if (this.initialized) {
      throw new Error('@angular-redux/router already initialized! If you meant to re-initialize, call destroy first.');
    }

    this.selectRouterState = selectRouterState;

    this.urlState = urlState$ || this.getDefaultUrlStateObservable();

    this.listenToRouterChanges();
    this.listenToReduxChanges();

    this.initialized = true;
  }
  getDefaultUrlStateObservable(): Observable<IRouterState> {
    return this.router.events
      .filter(x => x instanceof RoutesRecognized)
      .switchMap((x: RoutesRecognized) => this.router.events.filter(y => y instanceof NavigationEnd).map(() => this.getRouteState(x.state.root)))
      .distinctUntilChanged();
  }

  /**
   * Recursively walks the ActivatedRouteSnapshot tree,
   * gets params, queryParams and data from each snapshot and merges it together into one object.
   *
   * @param {ActivatedRouteSnapshot} route The current route snapshot.
   * @param {IRouterState} state The current state. Used only for recursion.
   * @returns {IRouterState}
   */
  private getRouteState(route: ActivatedRouteSnapshot, state: IRouterState = {} as IRouterState): IRouterState {
    state.params = Object.assign(state.params || {}, route.params);
    state.queryParams = Object.assign(state.queryParams || {}, route.queryParams);
    state.data = Object.assign(state.data || {}, route.data);

    if (route.firstChild) {
      return this.getRouteState(route.firstChild, state);
    }

    state.location = this.location.path();

    return state;
  }

  private getLocationFromStore(useInitial: boolean = false) {
    return (
      this.selectRouterState(this.ngRedux.getState()).location ||
      (useInitial ? this.initialLocation : '')
    );
  }

  private listenToRouterChanges() {
    const handleLocationChange = (routerState: IRouterState) => {
      if (this.currentLocation === routerState.location) {
        // Dont dispatch changes if we haven't changed location.
        return;
      }

      this.currentLocation = routerState.location;
      if (this.initialLocation === undefined) {
        this.initialLocation = routerState.location;

        // Fetch initial location from store and make sure
        // we dont dispath an event if the current url equals
        // the initial url.
        const locationFromStore = this.getLocationFromStore();
        if (locationFromStore === this.currentLocation) {
          return;
        }
      }

      this.ngRedux.dispatch(<RouterAction>{
        type: UPDATE_LOCATION,
        router: routerState
      });
    };

    this.urlStateSubscription = this.urlState.subscribe(handleLocationChange);
  }

  private listenToReduxChanges() {
    const handleLocationChange = (routerState: IRouterState) => {
      if (this.initialLocation === undefined) {
        // Wait for router to set initial location.
        return;
      }

      const locationInStore = this.getLocationFromStore(true);
      if (this.currentLocation === locationInStore) {
        // Dont change router location if its equal to the one in the store.
        return;
      }

      this.currentLocation = routerState.location;
      this.router.navigateByUrl(routerState.location);
    };

    this.reduxSubscription = this.ngRedux
      .select(routerState => this.selectRouterState(routerState))
      .pipe(distinctUntilChanged())
      .subscribe(handleLocationChange);
  }
}
