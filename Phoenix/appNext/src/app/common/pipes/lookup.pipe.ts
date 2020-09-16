import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lookup'
})

export class LookupPipe implements PipeTransform {

  transform(input: any, sourceArray: Array<any>, id: string, description1: string, description2: string, description3: string): any {
    let result = input;
    if (sourceArray.length > 0) {
      const key = id || 'id';
      description1 = description1 || 'text';
      description2 = description2 || '';
      description3 = description3 || '';
      for (let i = 0; i < sourceArray.length; i++) {
        if (sourceArray[i][key] === input) {
          result = '' +
            ((description1 && description1.length > 0 && sourceArray[i][description1]) ? sourceArray[i][description1] : '') +
            ((description2 && description2.length > 0 && sourceArray[i][description2]) ? ' - ' + sourceArray[i][description2] : '') +
            ((description3 && description3.length > 0 && sourceArray[i][description3]) ? ' - ' + sourceArray[i][description3] : '')
            ;
          break;
        }
      }
    }
    return result;
  }

}

