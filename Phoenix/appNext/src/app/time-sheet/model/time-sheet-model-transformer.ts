import { TimeSheetDetail, TimeSheetDay } from './index';

export const TimeSheetModelTransformer = {

    timeSheetDetailsAsList(timesheetDetailObj: { [id: number]: TimeSheetDetail } | Array<TimeSheetDetail>) {

        if (Array.isArray(timesheetDetailObj)) {
            return timesheetDetailObj;
        }

        const timeSheetDetailList: Array<TimeSheetDetail> = [];

        for (const key of Object.keys(timesheetDetailObj)) {

            timeSheetDetailList.push(timesheetDetailObj[key]);

        }

        return timeSheetDetailList;

    },

    timeSheetDaysAsList(timesheetDayObj: { [id: number]: TimeSheetDay } | Array<TimeSheetDay>) {

        if (Array.isArray(timesheetDayObj)) {
            return timesheetDayObj;
        }

        const timeSheetDaysAsList: Array<TimeSheetDay> = [];

        for (const key of Object.keys(timesheetDayObj)) {

            timeSheetDaysAsList.push(timesheetDayObj[key]);

        }

        return timeSheetDaysAsList;

    }
};
