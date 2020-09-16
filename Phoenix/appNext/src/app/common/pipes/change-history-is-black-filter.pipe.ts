import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({ name: 'changeHistoryFilter', pure: true })
export class ChangeHistoryIsBlackFilterPipe implements PipeTransform {


  constructor() {

  }
  transform(value: any, itemIsBlack: boolean) {
    const retVal = _.filter(value, function(o: any){
      return o.itemIsBlack === itemIsBlack || false;
    });
    return retVal;
  }


}
