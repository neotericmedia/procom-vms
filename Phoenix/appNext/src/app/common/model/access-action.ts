import { PhxConstants } from './phx-constants';

export interface AccessAction {
    AccessAction: number;
}

export const EntityAccessActionExists = function (listAvailableEntityAccessAction: Array<AccessAction>, testIfExistsEntityAccessAction: PhxConstants.EntityAccessAction): boolean {
    let isExist = false;
    listAvailableEntityAccessAction.forEach(accessActionInstance => {
        if (accessActionInstance.AccessAction === testIfExistsEntityAccessAction) {
            isExist = true;
            return isExist;
        }
    });
    return isExist;
};
