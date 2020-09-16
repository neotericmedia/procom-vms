// angular
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// common
import { getRouterState } from '../../common/state/router/reducer';
import { PhxConstants, CommonService, WorkflowService } from '../../common';
import { ApiService } from '../../common/services/api.service';
import { StateService } from '../../common/state/service/state.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { WorkflowAction } from '../../common/model/workflow-action';
import { IRouterState } from './../../common/state/router/reducer';
// transaction
import { TransactionAction } from './transaction.action';
import { transactionState } from './transaction.state';

@Injectable()
export class TransactionObservableService {
  workflowAvaialbleActions: Array<WorkflowAction>;
  readOnlyStorage: Readonly<any>;

  constructor(private apiService: ApiService, private workflowService: WorkflowService, private stateService: StateService, public commonService: CommonService) {
    console.log(this.constructor.name + '.constructor');
  }

  private muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();

  private getObservableTransaction_from_Server$ = (routerParams: any, showLoader: boolean, oDataParams?: any): Observable<any> =>
    Observable.create(observer => {
      console.log(`====apiService.Request==== ${this.constructor.name}.getObservableWorkorder_from_Server: apiService.query('assignment/getByWorkOrderId/' + Id`);

      Promise.all([
        this.apiService.query('transactionHeader/' + Number(routerParams.transactionHeaderId) + (oDataParams || ''), showLoader),
        this.workflowService.getAvailableStateActions(PhxConstants.EntityType.TransactionHeader, Number(routerParams.transactionHeaderId))
      ])
        .then((result: Array<any>) => {
          const transaction = { ...result[0] };
          const filteredAvailableStateActions = result[1].filter(x => x.EntityStatusId === transaction.TransactionHeaderStatusId);
          transaction.AvailableStateActions = filteredAvailableStateActions.length > 0 ? filteredAvailableStateActions[0].AvailableStateActions : [];
          transaction.isTransactionCalculation = true;
          transaction.IsDebounce = false;
          transaction.GroupedTransactionLinesByLineNumber = [];

          observer.next(transaction);
          observer.complete();
        })
        .catch(responseError => {
          observer.next(responseError);
          observer.complete();
          this.commonService.logError(responseError.Message);
        });
    });

  private getObservableTransaction_from_Store = (Id: number): string => {
    return transactionState.reduxTransaction.getTransactionByTransactionHeaderId(Id).transactionInstance;
  };

  private getObservableTransaction$ = (routerParams: any, showLoader: boolean): Observable<any> =>
    this.stateService
      .select(this.getObservableTransaction_from_Store(Number(routerParams.transactionHeaderId)))
      .map(trn => !trn)
      .filter(needtrn => needtrn)
      .filter(() => !this.stateService.select(transactionState.reduxTransaction.isLoading).getValue())
      .do(() => this.stateService.dispatchOnAction(new TransactionAction.TransactionLoad(Number(routerParams.versionId))))
      .switchMap(() => this.getObservableTransaction_from_Server$(routerParams, showLoader))
      .do((transaction: any) => {
        this.stateService.dispatchOnAction(new TransactionAction.TransactionAdd(transaction.Id, transaction));
      })
      .share();

  public tranaction$ = (component: BaseComponentOnDestroy, routerParams: any, showLoader: boolean = true, isFromServer: boolean = true, transaction?: any): Observable<any> => {
    return this.muteFirst(this.getObservableTransaction$(routerParams, showLoader).startWith(null), this.stateService.select(this.getObservableTransaction_from_Store(Number(routerParams.transactionHeaderId)))).takeUntil(
      component.isDestroyed$
    );
  };

  public transactionOnRouteChange$ = (component: BaseComponentOnDestroy, showLoader: boolean = true): Observable<any> => {
    return this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerState: IRouterState) => {
        return routerState.params.transactionHeaderId ? this.tranaction$(component, routerState.params, showLoader) : Observable.of(null);
      })
      .takeUntil(component.isDestroyed$);
  };
}
