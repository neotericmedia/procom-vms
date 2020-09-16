import { Observable } from 'rxjs/Observable';
import { ApiService } from '../services/api.service';
import { StateService } from '../state/service/state.service';
import { ICommonListsAction, ICommonListsItem } from './lists.interface';
import { EntityList } from '../model/entity-list';
import { commonListsState } from './lists.state';
import { CommonListsAction } from './lists.action';

export class CommonListsObservables {
  // https://medium.com/@m3po22/stop-using-ngrx-effects-for-that-a6ccfe186399
  static listByCommonListsAction$ = (apiService: ApiService, stateService: StateService, commonListsAction: ICommonListsAction, showLoader: boolean = true): Observable<Array<ICommonListsItem>> => {
    const muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();

    // // If you don't want distinctUntilChanged on b but also don't want updates when a changes, I think this is an alternative:
    const muteFirst_ba = (first$: Observable<Array<ICommonListsItem>>, second$: Observable<Array<ICommonListsItem>>): Observable<Array<ICommonListsItem>> => second$.withLatestFrom(first$, (b, a) => b);

    const getObservableCommonLists_from_Server$ = (): Observable<Array<ICommonListsItem>> =>
      Observable.create(observer => {
        const completeObserver = (resultList = null) => {
          stateService.dispatchOnAction(new CommonListsAction.ListAdd(commonListsAction.ListName, resultList));
          observer.next(resultList);
          observer.complete();
        }
        const oDataParams = commonListsAction.oDataParams;
        apiService
          .query(commonListsAction.ApiQueryPath + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''), showLoader)
          .then((responseSuccess: EntityList<any>) => {
            const resultList = commonListsAction.MappingFunction(responseSuccess);
            completeObserver(resultList);
          })
          .catch(responseError => {
            completeObserver();
          });
      });

    const getObservableCommonLists_from_Store = (): string => commonListsState.reduxCommonLists.getCommonListsArrayInstanceByListName(commonListsAction.ListName).commonListsArrayInstance;

    const isListAlreadyLoading = stateService.select(commonListsState.reduxCommonLists.isLoading(commonListsAction.ListName)).getValue();

    const getObservableCommonLists$ = (): Observable<Array<ICommonListsItem>> =>
      stateService
        .select(getObservableCommonLists_from_Store())
        .map(array => !array)
        .filter(needArray => needArray)
        .filter(() => !isListAlreadyLoading)
        .do(() => stateService.dispatchOnAction(new CommonListsAction.ListLoad(commonListsAction.ListName)))
        .switchMap(() => getObservableCommonLists_from_Server$())
        .share();

    return muteFirst(getObservableCommonLists$().startWith(null), stateService.select(getObservableCommonLists_from_Store()));
  };
}
