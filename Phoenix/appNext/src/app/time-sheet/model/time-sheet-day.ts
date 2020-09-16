import { TimeSheetDetail } from './time-sheet-detail';

export interface TimeSheetDay {

    Id: number;
    Date: Date;
    IsDeleted: boolean;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    IsDraft: boolean;
    IsHoliday: boolean;
    TimeSheetId: number;
    TimeSheetDetails: Array<TimeSheetDetail> | { [guid: string]: TimeSheetDetail };
}
