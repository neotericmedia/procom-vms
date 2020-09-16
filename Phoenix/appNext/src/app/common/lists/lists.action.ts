import { Action } from 'redux';
import { ICommonListsItem } from './lists.interface';
export namespace CommonListsAction {
  export enum type {
    // need to use <any> because of implements Action: export interface Action { type: any; }
    ListLoad = <any>'@phoenix/ListLoad',
    ListAdd = <any>'@phoenix/ListAdd',
    ListDelete = <any>'@phoenix/ListDelete',
    ListUpdate = <any>'@phoenix/ListUpdate'
  }

  export type action = ListLoad | ListDelete | ListUpdate;

  export class ListLoad implements Action {
    public readonly type = type.ListLoad;
    constructor(public listName: string) {}
  }
  export class ListAdd implements Action {
    public readonly type = type.ListAdd;
    constructor(public listName: string, public array: Array<ICommonListsItem>) {}
  }
  export class ListDelete implements Action {
    public readonly type = type.ListDelete;
    constructor(public listName: string) {}
  }
  export class ListUpdate implements Action {
    public readonly type = type.ListUpdate;
    constructor(public listName: string, public array: Array<ICommonListsItem>) {}
  }
}
