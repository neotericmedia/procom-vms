import { IEntityIdAndGuid } from '../../model/entity-guid-interface';

export namespace ReducerUtility {
  // https://redux.js.org/
  // https://github.com/reactjs/redux/blob/master/docs/recipes/reducers/ImmutableUpdatePatterns.md
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
  // https://www.dustinhorne.com/post/2016/06/09/implementing-a-dictionary-in-typescript
  // https://github.com/mweststrate/immer
  // https://github.com/markerikson/redux-ecosystem-links/blob/master/immutable-data.md#immutable-update-utilities
  // https://github.com/debitoor/dot-prop-immutable

  export const IsMapedEntityById = function(entityFromArray: IEntityIdAndGuid, entityToFind: IEntityIdAndGuid) {
    return (
      (entityFromArray.Id && entityFromArray.Id > 0 && entityToFind.Id && entityToFind.Id > 0 && entityFromArray.Id === entityToFind.Id) ||
      (entityFromArray.TemporaryGuid &&
        entityFromArray.TemporaryGuid !== '' &&
        entityToFind.TemporaryGuid &&
        entityToFind.TemporaryGuid !== '' &&
        entityFromArray.TemporaryGuid === entityToFind.TemporaryGuid)
    );
  };

  export const GetEntityIndexInArray = function(array: Array<IEntityIdAndGuid>, entityToFind: IEntityIdAndGuid): number {
    let itemIndex: number;
    if (entityToFind.Id && entityToFind.Id > 0) {
      itemIndex = array.findIndex(x => x.Id === entityToFind.Id);
    } else if (entityToFind.TemporaryGuid && entityToFind.TemporaryGuid !== '') {
      itemIndex = array.findIndex(x => x.TemporaryGuid === entityToFind.TemporaryGuid);
    }
    return itemIndex;
  };

  export const InsertEntityToArray = function<T>(array: Array<T>, entityToAdd: T) {
    return [...array.slice(0, array.length + 1), entityToAdd, ...array.slice(array.length + 1)];
  };

  export const RemoveEntityFromArray = function<T extends IEntityIdAndGuid>(array: Array<T>, entityToRemove: T) {
    const itemIndex: number = ReducerUtility.GetEntityIndexInArray(array, entityToRemove);
    return array.filter((item, index) => index !== itemIndex);
  };
}
