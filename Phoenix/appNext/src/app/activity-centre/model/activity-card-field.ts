import { ActivityCardFieldType } from './index';

export interface ActivityCardField {
    displayData: any;
    fieldName: string;
    fieldType: ActivityCardFieldType;
    slotId: number;
}
