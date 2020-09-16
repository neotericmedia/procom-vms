import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../common';

@Injectable()
export class PurchaseOrderService {

  constructor(
    private apiService: ApiService,
  ) { }

  public getWorkorder(Id: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('PurchaseOrder/' + Id));
  }

  public getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParams?: any): Observable<any> {
    oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  }

  public purchaseOrderDiscard(command): Observable<any> {
    return Observable.fromPromise(this.apiService.command('PurchaseOrderDiscard', command));
  }

  public purchaseOrderSave(command): Observable<any> {
    return Observable.fromPromise(this.apiService.command('PurchaseOrderSave', command));
  }

  public getByPurchaseOrderId(purchaseOrderId): Observable<any> {
    return Observable.fromPromise(this.apiService.query('purchaseorder?id=' + purchaseOrderId));
  }

  public purchaseOrderSubmit(command): Observable<any> {
    return Observable.fromPromise(this.apiService.command('PurchaseOrderSubmit', command));
  }

  public PONewlineSave(command) {
    return Observable.fromPromise(this.apiService.command('PurchaseOrderLineSave', command));
  }

   public getByPurchaseOrderLineId(purchaseOrderLineId: number, oDataParams: any): Observable<any> {
   return Observable.fromPromise(this.apiService.query('purchaseorder/getByPurchaseOrderLineId/' + purchaseOrderLineId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
   }

  public getByWorkOrderId(workOrderId: number, oDataParams: any): Observable<any> {
    return Observable.fromPromise(this.apiService.query('assignment/getByWorkOrderId/' + workOrderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
    }

}
