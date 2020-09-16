import { TimeSheetDetail, TimeSheetDetailConflictType } from './index';

export interface TimeSheetDetailConflict {
    timeSheetDetail: TimeSheetDetail;
    conflictTypes: Array<TimeSheetDetailConflictType>;
}
