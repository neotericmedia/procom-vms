import { TimeSheetDay } from './time-sheet-day';

export interface TimeSheetWeek {
    Id: number;
    TimeSheetDays: Array<TimeSheetDay>;
}
