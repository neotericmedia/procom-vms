import { TimeSheet, TimeSheetHeader, TimeSheetSearch, TimeSheetLineManagement } from '../../model';

export interface TimeSheetState {
    lineManagement: TimeSheetLineManagement;
    timeSheets: {
        [name: string]: TimeSheet;
    };
    headers: {
        Items?: TimeSheetHeader[];
    };
};
