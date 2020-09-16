
import { Pipe, PipeTransform, Inject } from '@angular/core';

@Pipe({
  name: 'filterSelectChoicesByUsage'
})

export class FilterSelectChoicesByUsage implements PipeTransform {

  constructor(

  ) { }

  transform(itemCollection: Array<any>, entityCollectionToCompareUsage: any,
    currentEntityToExcludeFromCompare: any, entityPropertyToCompare: any, itemPropertyToCompare: any,
    selectLookupProperty1: string, selectLookupProperty2: string, selectLookupProperty3: string,
    selectLookupProperty4: string, selectLookupProperty5: string, selectLookupProperty6: string,
    selectLookupProperty7: string, selectLookupProperty8: string): any {

    let out = [];

    function getSubObjectResult(lookupProperty, lookupObj) {
      let subObject: any = null;
      if (lookupProperty && lookupProperty.length > 0) {
        subObject = lookupObj;
        if (lookupProperty.indexOf('.') > 0) {
          const lookupPropertyList = lookupProperty.split('.');
          for (let i = 0; i < lookupPropertyList.length; i++) {
            subObject = lookupPropertyList[i];
          }
        } else {
          if (subObject && subObject.hasOwnProperty(lookupProperty)) {
            subObject = subObject[lookupProperty];
          }
        }
      }
      return subObject ? subObject : '';
    }

    if (Array.isArray(itemCollection) && itemCollection.length > 0) {
      itemCollection.forEach(item => {
        let itemIsUsed = false;
        const itemValueToCompare = itemPropertyToCompare ? getSubObjectResult(itemPropertyToCompare, item).toString().toLowerCase() : null;
        const currentEntityValue = entityPropertyToCompare ? getSubObjectResult(entityPropertyToCompare, currentEntityToExcludeFromCompare).toString().toLowerCase() : null;

        entityCollectionToCompareUsage.forEach(entity => {
          const entityValueToCompare = entityPropertyToCompare ? getSubObjectResult(entityPropertyToCompare, entity).toString().toLowerCase() : null;
          if (entityValueToCompare === itemValueToCompare && entityValueToCompare !== currentEntityValue) {
            itemIsUsed = true;
          }
        });

        let itemIsMatchToSearch = false;
        if (!itemIsUsed) {

          const itemValue1 = selectLookupProperty1 ? getSubObjectResult(selectLookupProperty1, item).toString().toLowerCase() : null;
          const itemValue2 = selectLookupProperty2 ? getSubObjectResult(selectLookupProperty2, item).toString().toLowerCase() : null;
          const itemValue3 = selectLookupProperty3 ? getSubObjectResult(selectLookupProperty3, item).toString().toLowerCase() : null;
          const itemValue4 = selectLookupProperty4 ? getSubObjectResult(selectLookupProperty4, item).toString().toLowerCase() : null;
          const itemValue5 = selectLookupProperty5 ? getSubObjectResult(selectLookupProperty5, item).toString().toLowerCase() : null;
          const itemValue6 = selectLookupProperty6 ? getSubObjectResult(selectLookupProperty6, item).toString().toLowerCase() : null;
          const itemValue7 = selectLookupProperty7 ? getSubObjectResult(selectLookupProperty7, item).toString().toLowerCase() : null;
          const itemValue8 = selectLookupProperty8 ? getSubObjectResult(selectLookupProperty8, item).toString().toLowerCase() : null;

          if ((itemValue1) ||
            (itemValue2) ||
            (itemValue3) ||
            (itemValue4) ||
            (itemValue5) ||
            (itemValue6) ||
            (itemValue7) ||
            (itemValue8)
          ) {
            itemIsMatchToSearch = true;
          }
        }
        if (!itemIsUsed && (itemIsMatchToSearch)) {
          out.push(item);
        }
      });
    } else {
      out = itemCollection;
    }
    return out;
  }
}
