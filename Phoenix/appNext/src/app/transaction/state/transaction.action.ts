import { Action } from 'redux';

export namespace TransactionAction {
  export enum type {
    // need to use <any> because of implements Action: export interface Action { type: any; }
    TransactionLoad = <any>'@phoenix/TransactionLoad',
    TransactionLoadError = <any>'@phoenix/TransactionLoadError',
    TransactionLoadStarted = <any>'@phoenix/TransactionLoadStarted',
    // Transaction
    TransactionAdd = <any>'@phoenix/TransactionAdd',
    TransactionDelete = <any>'@phoenix/TransactionDelete',
    TransactionUpdate = <any>'@phoenix/TransactionUpdate',
    // TransactionValidationError
    TransactionValidationErrorAdd = <any>'@phoenix/TransactionValidationErrorAdd',
    TransactionValidationErrorDelete = <any>'@phoenix/TransactionValidationErrorDelete'
  }

  export type action =
    | TransactionLoad
    | TransactionLoadError
    | TransactionLoadStarted
    // Workorder
    | TransactionAdd
    | TransactionDelete
    | TransactionUpdate

    // ValidationError
     | TransactionValidationErrorAdd
    | TransactionValidationErrorDelete;
  export class TransactionLoad implements Action {
    public readonly type = type.TransactionLoad;
    constructor(public Id: number, public oDataParams?: any) {}
  }

  export class TransactionLoadError implements Action {
    public readonly type = type.TransactionLoadError;
    constructor(public Id: number, public transaction: any, public error) {}
  }
  export class TransactionLoadStarted implements Action {
    public readonly type = type.TransactionLoadStarted;
    constructor(public Id: number) {}
  }
  export class TransactionAdd implements Action {
    public readonly type = type.TransactionAdd;
    constructor(public Id: number, public transation: any) {
    }
  }
  export class TransactionDelete implements Action {
    public readonly type = type.TransactionDelete;
    constructor(public Id: number) {}
  }
  export class TransactionUpdate implements Action {
    public readonly type = type.TransactionUpdate;
    constructor(public transaction: any) {}
  }
  export class TransactionValidationErrorAdd implements Action {
    public readonly type = type.TransactionValidationErrorAdd;
    constructor(public Id: number, public validationMessages: Array<any>) {}
  }
  export class TransactionValidationErrorDelete implements Action {
    public readonly type = type.TransactionValidationErrorDelete;
    constructor(public Id: number) {}
  }
}

