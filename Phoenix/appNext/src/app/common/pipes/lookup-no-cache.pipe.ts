import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lookupNoCache'
})

export class LookupNoCachePipe implements PipeTransform {
  transform(inputValue: String, inputList: String, id: String, description1: String, description2: String, description3: String): any {
    let result = inputValue;
    function getSubObjectResult(description, lookupObj, prefix) {
        let subObject = '';
        if (description && description.length > 0) {
            subObject = lookupObj;
            if (description.indexOf('.') > 0) {
                const descriptionList = description.split('.');
                for (let i = 0; i < descriptionList.length; i++) {
                    subObject = subObject[descriptionList[i]];
                }
            } else {
                subObject = subObject[description];
            }
        }
        return subObject ? prefix + subObject : '';
    }

    if (inputList && inputList.length > 0) {
        const key: any = id || 'id';
        description1 = description1 || 'text';
        description2 = description2 || '';
        description3 = description3 || '';

        for (let index = 0; index < inputList.length; index++) {
            if (inputList[index][key] === inputValue) {
                result = '' +
                    getSubObjectResult(description1, inputList[index], '') +
                    getSubObjectResult(description2, inputList[index], ' - ') +
                    getSubObjectResult(description3, inputList[index], ' - ')
                ;
            }
        };
    }
    return result;
  }
}
