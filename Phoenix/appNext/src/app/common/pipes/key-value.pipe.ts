import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyValue'
})
export class KeyValuePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const keyValuePairs = [];
    if (!value) {
      return keyValuePairs;
    }

    for (const key of Object.keys(value)) {
      keyValuePairs.push({ key: key, value: value[key] });
    }
    return keyValuePairs;
  }

}
