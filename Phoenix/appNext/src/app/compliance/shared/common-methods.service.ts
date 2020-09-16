import { Injectable } from '@angular/core';
import { PhxConstants } from '../../common/model/phx-constants';

@Injectable()
export class CommonMethodsService {

  constructor() { }

  public EntityAccessActionExists(listAvailableEntityAccessAction: Array<PhxConstants.EntityAccessAction>,
    testIfExistsEntityAccessAction: PhxConstants.EntityAccessAction): boolean {
    let isExist = false;
    listAvailableEntityAccessAction.forEach((accessActionInstance) => {
      if (accessActionInstance === testIfExistsEntityAccessAction) {
        isExist = true;
        return isExist;
      }
    });
    return isExist;
  }


}
