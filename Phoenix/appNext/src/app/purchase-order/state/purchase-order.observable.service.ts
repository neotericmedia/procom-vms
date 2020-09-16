// angular
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// common
import { getRouterState } from '../../common/state/router/reducer';
import { WorkflowService, PhxConstants, CommonService } from '../../common';
import { ApiService } from '../../common/services/api.service';
import { StateService } from '../../common/state/service/state.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { IRouterState } from './../../common/state/router/reducer';
// Purchase Order
import { IPurchaseOrder, IReadOnlyStorage, IWorkflowButton } from './purchase-order.interface';
import { PurchaseOrderAction } from './purchase-order.action';
import { PurchaseOrderState } from './purchase-order.state';
import { WorkflowAction } from '../../common/model/workflow-action';

const isDebugMode: boolean = true;

@Injectable()
export class PurchaseOrderObservableService {
  constructor(private apiService: ApiService, private workflowService: WorkflowService, private stateService: StateService, public commonService: CommonService) {
    console.log(this.constructor.name + '.constructor');
  }
  private muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();
  private muteFirst_ba = (first$: Observable<IPurchaseOrder>, second$: Observable<IPurchaseOrder>): Observable<IPurchaseOrder> => second$.withLatestFrom(first$, (b, a) => b);

  private getObservablePurchaseOrder_from_Server$ = (purchaseOrderId: number, showLoader: boolean, oDataParams?: any): Observable<IPurchaseOrder> =>
    Observable.create(observer => {
      // debugger;
      console.log(`====apiService.Request==== ${this.constructor.name}.getObservablePurchaseOrder_from_Server: apiService.query('purchaseorder?id='${purchaseOrderId})`);
      Promise.all([
        this.apiService.query('purchaseorder?id=' + purchaseOrderId + (oDataParams || ''), showLoader),
        this.workflowService.getAvailableActions(PhxConstants.EntityType.PurchaseOrder, purchaseOrderId, showLoader)
      ])
        .then((result: Array<any>) => {
          const purchaseOrder: IPurchaseOrder = result[0];
          if (purchaseOrder) {
            // purchaseOrder.actionButton = this.workflowButtons(purchaseOrder);
          }
          const workflowAvaialbleActions: Array<WorkflowAction> = result[1];
          if (workflowAvaialbleActions.length > 0) {
            workflowAvaialbleActions.forEach((action: WorkflowAction) => {
              // debugger;
              if (action.CommandName.includes('Submit')) {
                action.checkValidation = true;
              }
            });
          }

          const readOnlyStorage: Readonly<IReadOnlyStorage> = {
            IsDebugMode: isDebugMode,
            IsEditable: purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Draft,
            AccessActions: purchaseOrder.AccessActions
          };
          observer.next({ ...purchaseOrder, ReadOnlyStorage: readOnlyStorage });
          observer.complete();
        });
    });

  private getObservablePurchaseOrder_from_Store = (purchaseOrderId: number): string => PurchaseOrderState.reduxPurchaseOrder.getPurchaseOrderByPurchaseOrderId(purchaseOrderId).purchaseOrderInstance;

  private getObservablePurchaseOrder$ = (purchaseOrderId: number, showLoader: boolean): Observable<IPurchaseOrder> =>
    this.stateService
      .select(this.getObservablePurchaseOrder_from_Store(purchaseOrderId))
      .map(po => !po)
      .filter(needPo => needPo)
      .do(() => this.stateService.dispatchOnAction(new PurchaseOrderAction.PurchaseOrderLoad(purchaseOrderId)))
      .switchMap(() => this.getObservablePurchaseOrder_from_Server$(purchaseOrderId, showLoader))
      .do((purchaseOrder: IPurchaseOrder) => this.stateService.dispatchOnAction(new PurchaseOrderAction.PurchaseOrderAdd(purchaseOrder.Id, purchaseOrder)))
      .share();

  public purchaseOrder$ = (component: BaseComponentOnDestroy, purchaseOrderId: number, showLoader: boolean = true): Observable<IPurchaseOrder> => {
    return this.muteFirst(
      this.getObservablePurchaseOrder$(purchaseOrderId, showLoader).startWith(null),
      this.stateService.select(this.getObservablePurchaseOrder_from_Store(purchaseOrderId))
    ).takeUntil(component.isDestroyed$);
  };

  public purchaseOrderOnRouteChange$ = (component: BaseComponentOnDestroy, showLoader: boolean = true): Observable<IPurchaseOrder> => {
    return this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerState: IRouterState) => {
        const purchaseOrderId: number = routerState.params.purchaseOrderId;
        return purchaseOrderId ? this.purchaseOrder$(component, purchaseOrderId, showLoader) : Observable.of(null);
      })
      .takeUntil(component.isDestroyed$);
  };

  public getByPurchaseOrderLineId(purchaseOrderLineId: number, oDataParams?: any) {
    return Observable.fromPromise(this.apiService.query('purchaseorder/getByPurchaseOrderLineId/' + purchaseOrderLineId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  }

  public getWorkOrderPurchaseOrderLinesByTransactionHeaderId(transactionHeaderId: number, tableState: boolean, oDataParams: any) {
    return Observable.fromPromise(this.apiService.query('purchaseorder/getWorkOrderPurchaseOrderLinesByTransactionHeaderId/' + transactionHeaderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '') + '&' + /*tableStateParams,*/ false));
  }

  public isExistsOrganizationCode(code: string, organizationId: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('org/isExistsOrganizationCode?code=' + code + (organizationId ? '&organizationId=' + organizationId : ''), false));
  }







}
