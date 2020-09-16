import { TimeSheetDetail } from './index';
import { TimeSheetCapsuleStyle } from './index';

export interface TimeSheetCapsule {
    guid: string;
    rateName: string;
    rateSortOrder: number;
    preFill: number;
    preFillSlideState: string;
    infoSlideState: string;
    timeSheetDetail: TimeSheetDetail;
    style: TimeSheetCapsuleStyle;
    isActive: boolean;
}
