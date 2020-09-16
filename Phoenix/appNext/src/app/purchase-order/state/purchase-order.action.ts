import { Injectable } from '@angular/core';
import { Action } from 'redux';
import { dispatch } from '@angular-redux/store';
import {
  IPurchaseOrder,
  IPurchaseOrderValidationError
} from './purchase-order.interface';
export namespace PurchaseOrderAction {
  export enum type {
    PurchaseOrderLoad = <any>'@phoenix/PurchaseOrderLoad',
    PurchaseOrderLoadError = <any>'@phoenix/PurchaseOrderLoadError',
    PurchaseOrderLoadStarted = <any>'@phoenix/PurchaseOrderLoadStarted',
    PurchaseOrderAdd = <any>'@phoenix/PurchaseOrderAdd',
    PurchaseOrderDelete = <any>'@phoenix/PurchaseOrderDelete',
    PurchaseOrderUpdate = <any>'@phoenix/PurchaseOrderUpdate',
    PurchaseOrderValidationErrorAdd = <any>'@phoenix/htmlOnClickPurchaseOrderValidationErrorAdd',
    PurchaseOrderValidationErrorDelete = <any>'@phoenix/PurchaseOrderValidationErrorDelete'
  }
  export type action =
    | PurchaseOrderLoad
    | PurchaseOrderLoadError
    | PurchaseOrderLoadStarted
    | PurchaseOrderAdd
    | PurchaseOrderDelete
    | PurchaseOrderUpdate
    | PurchaseOrderValidationErrorAdd
    | PurchaseOrderValidationErrorDelete;
  export class PurchaseOrderLoad implements Action {
    public readonly type = type.PurchaseOrderLoad;
    constructor(public purchaseOrderId: number, public oDataParams?: any) {}
  }
  export class PurchaseOrderLoadError implements Action {
    public readonly type = type.PurchaseOrderLoadError;
    constructor(public purchaseOrderId: number, public purchaseOrder: IPurchaseOrder, public error) {}
  }
  export class PurchaseOrderLoadStarted implements Action {
    public readonly type = type.PurchaseOrderAdd;
    constructor(public purchaseOrderId: number) {}
  }
  export class PurchaseOrderAdd implements Action {
    public readonly type = type.PurchaseOrderAdd;
    constructor(public purchaseOrderId: number, public purchaseOrder: IPurchaseOrder) {}
  }
  export class PurchaseOrderDelete implements Action {
    public readonly type = type.PurchaseOrderDelete;
    constructor(public purchaseOrderId: number) {}
  }
  export class PurchaseOrderUpdate implements Action {
    public readonly type = type.PurchaseOrderUpdate;
    constructor(public purchaseOrder: IPurchaseOrder) {}
  }
  export class PurchaseOrderValidationErrorAdd implements Action {
    public readonly type = type.PurchaseOrderValidationErrorAdd;
    constructor(public purchaseOrderId: number, public validationMessages: Array<IPurchaseOrderValidationError>) {}
  }
  export class PurchaseOrderValidationErrorDelete implements Action {
    public readonly type = type.PurchaseOrderValidationErrorDelete;
    constructor(public purchaseOrderId: number) {}
  }
}
