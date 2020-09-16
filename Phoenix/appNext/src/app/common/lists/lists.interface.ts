import { EntityList } from '../model/entity-list';

export interface ICommonListsItem {
  Id: number;
  DisplayText: string;
  Data?: any;
}

export interface ICommonListsAction {
  ListName: string;
  ApiQueryPath: string;
  oDataParams?: any;
  MappingFunction: (items: EntityList<any>) => Array<ICommonListsItem>;
}
