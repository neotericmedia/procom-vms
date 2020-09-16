import { Action } from 'redux';
import {
  ICommissionRate,
  ICommissionRateValidationError
} from './commission-rate.interface';

export namespace CommissionRateAction {
  export enum type {
    CommissionRateLoad = <any>'@phoenix/CommissionRateLoad',
    CommissionRateLoadError = <any>'@phoenix/CommissionRateLoadError',
    CommissionRateLoadStarted = <any>'@phoenix/CommissionRateLoadStarted',
    CommissionRateAdd = <any>'@phoenix/CommissionRateAdd',
    CommissionRateDelete = <any>'@phoenix/CommissionRateDelete',
    CommissionRateUpdate = <any>'@phoenix/CommissionRateUpdate',
    CommissionRateValidationErrorAdd = <any>'@phoenix/htmlOnClickCommissionRateValidationErrorAdd',
    CommissionRateValidationErrorDelete = <any>'@phoenix/CommissionRateValidationErrorDelete'
  }

  export type action =
    | CommissionRateLoad
    | CommissionRateLoadError
    | CommissionRateLoadStarted
    | CommissionRateAdd
    | CommissionRateDelete
    | CommissionRateUpdate
    | CommissionRateValidationErrorDelete;
  export class CommissionRateLoad implements Action {
    public readonly type = type.CommissionRateLoad;
    // constructor(public Id: number, public isForceRefresh: boolean, public oDataParams?: any) { }
    constructor(public Id: number, public oDataParams?: any) {}
  }

  export class CommissionRateLoadError implements Action {
    public readonly type = type.CommissionRateLoadError;
    constructor(public Id: number, public CommissionRate: ICommissionRate, public error) {}
  }
  export class CommissionRateLoadStarted implements Action {
    public readonly type = type.CommissionRateLoadStarted;
    constructor(public Id: number) {}
  }
  export class CommissionRateAdd implements Action {
    public readonly type = type.CommissionRateAdd;
    constructor(public Id: number, public CommissionRate: ICommissionRate) {
    }
  }
  export class CommissionRateDelete implements Action {
    public readonly type = type.CommissionRateDelete;
    constructor(public Id: number) {}
  }
  export class CommissionRateUpdate implements Action {
    public readonly type = type.CommissionRateUpdate;
    constructor(public Id: number, public CommissionRate: ICommissionRate) {}
  }
  export class CommissionRateValidationErrorAdd implements Action {
    public readonly type = type.CommissionRateValidationErrorAdd;
    constructor(public Id: number, public validationMessages: Array<ICommissionRateValidationError>) {}
  }
  export class CommissionRateValidationErrorDelete implements Action {
    public readonly type = type.CommissionRateValidationErrorDelete;
    constructor(public Id: number) {}
  }
}

