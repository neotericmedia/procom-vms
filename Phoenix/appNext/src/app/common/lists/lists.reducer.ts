import { CommonListsAction } from './lists.action';
import { ICommonListsItem } from './lists.interface';

interface ICommonListsState {
  commonLists: { [listName: string]: Array<ICommonListsItem> };
  isLoading: { [listName: string]: boolean };
}

const commonListsInitials: ICommonListsState = {
  commonLists: {},
  isLoading: {}
};

export const commonListsReducer = (currState: ICommonListsState = commonListsInitials, action: CommonListsAction.action): ICommonListsState => {
  switch (action.type) {
    case CommonListsAction.type.ListLoad: {
      const payload = action as CommonListsAction.ListLoad;
      console.log(`commonListsReducer: type:${payload.type}, listName:${payload.listName}`);
      return {
        ...currState,
        isLoading: {
          ...currState.isLoading,
          [payload.listName]: true
        }
      };
    }
    case CommonListsAction.type.ListAdd: {
      const payload = action as CommonListsAction.ListAdd;
      console.log(`commonListsReducer: type:${payload.type}, listName:${payload.listName}, array.length:${payload.array ? payload.array.length : 0}`);
      return {
        ...currState,
        commonLists: { ...currState.commonLists, [payload.listName]: payload.array },
        isLoading: {
          ...currState.isLoading,
          [payload.listName]: false
        }
      };
    }
    case CommonListsAction.type.ListDelete: {
      const payload = action as CommonListsAction.ListDelete;
      console.log(`commonListsReducer: type:${payload.type}, listName:${payload.listName}`);
      const commonLists = { ...currState.commonLists };
      delete commonLists[payload.listName];
      return {
        ...currState,
        commonLists: commonLists
      };
    }
    case CommonListsAction.type.ListUpdate: {
      const payload = action as CommonListsAction.ListUpdate;
      console.log(`commonListsReducer: type:${payload.type}, listName:${payload.listName}`);
      if (!payload.array) {
        return currState;
      }
      return {
        ...currState,
        commonLists: {
          ...currState.commonLists,
          [payload.listName]: payload.array
        }
      };
    }
    default: {
      return currState;
    }
  }
};
