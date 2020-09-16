import { Action } from 'redux';
// tslint:disable-next-line:max-line-length
import {
  IAssignmentDto,
  IWorkOrder,
  IWorkorderValidationError,
} from './workorder.interface';

export namespace WorkorderAction {
  export enum type {
    // need to use <any> because of implements Action: export interface Action { type: any; }
    WorkorderLoad = <any>'@phoenix/WorkorderLoad',
    WorkorderLoadError = <any>'@phoenix/WorkorderLoadError',
    WorkorderLoadStarted = <any>'@phoenix/WorkorderLoadStarted',
    // Organization
    WorkorderAdd = <any>'@phoenix/WorkorderAdd',
    WorkorderRefresh = <any>'@phoenix/WorkorderRefresh',
    WorkorderUpdate = <any>'@phoenix/WorkorderUpdate',
    WorkorderReload = <any>'@phoenix/WorkorderReload',
    // WorkorderValidationError
    WorkorderValidationErrorAdd = <any>'@phoenix/htmlOnClickWorkorderValidationErrorAdd',
    WorkorderValidationErrorDelete = <any>'@phoenix/WorkorderValidationErrorDelete'
  }

  export type action =
    | WorkorderLoad
    | WorkorderLoadError
    | WorkorderLoadStarted
    // Workorder
    | WorkorderAdd
    | WorkorderRefresh
    | WorkorderUpdate
    | WorkorderReload

    // ValidationError
    // | WorkorderValidationErrorAdd
    | WorkorderValidationErrorDelete;

  export class WorkorderLoad implements Action {
    public readonly type = type.WorkorderLoad;
    // constructor(public Id: number, public isForceRefresh: boolean, public oDataParams?: any) { }
    constructor(public Id: number, public oDataParams?: any) {}
  }

  export class WorkorderLoadError implements Action {
    public readonly type = type.WorkorderLoadError;
    constructor(public Id: number, public workorder: IAssignmentDto, public error) {}
  }
  export class WorkorderLoadStarted implements Action {
    public readonly type = type.WorkorderLoadStarted;
    constructor(public Id: number) {}
  }
  export class WorkorderAdd implements Action {
    public readonly type = type.WorkorderAdd;
    constructor(public Id: number, public workorder: IWorkOrder) {
    }
  }
  export class WorkorderRefresh implements Action {
    public readonly type = type.WorkorderRefresh;
    constructor(public Id: number) {}
  }
  export class WorkorderUpdate implements Action {
    public readonly type = type.WorkorderUpdate;
    constructor(public workorder: IWorkOrder) {}
  }
  export class WorkorderReload implements Action {
    public readonly type = type.WorkorderReload;
    constructor() {}
  }
  export class WorkorderValidationErrorAdd implements Action {
    public readonly type = type.WorkorderValidationErrorAdd;
    constructor(public Id: number, public validationMessages: Array<IWorkorderValidationError>) {}
  }
  export class WorkorderValidationErrorDelete implements Action {
    public readonly type = type.WorkorderValidationErrorDelete;
    constructor(public Id: number) {}
  }
}

