export const commonListsState = {
  reduxCommonLists: {
    commonListsArrayInstance: `reduxCommonLists.commonListsArrayInstance`,
    isLoading: (listName: String) => `reduxCommonLists.isLoading.${listName}`,
    getCommonListsArrayInstanceByListName: (listName: string) => {
      return {
        commonListsArrayInstance: `reduxCommonLists.commonLists.${listName}`
      };
    }
  }
};
