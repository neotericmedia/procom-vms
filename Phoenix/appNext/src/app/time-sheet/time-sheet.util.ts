import { TimeSheetDetail, TimeSheetDay, TimeSheetCapsuleConfiguration, TimeSheetCapsuleStyle, UnitInput } from './model/index';
import { CodeValue } from './../common/model/index';
import { Project } from '../project/model';
import { PhxConstants } from '../common';

export namespace TimeSheetUtil {
  export function timeSheetDetailsAsList(timesheetDetailObj: { [id: number]: TimeSheetDetail } | Array<TimeSheetDetail>) {
    if (Array.isArray(timesheetDetailObj)) {
      return timesheetDetailObj;
    }
    const timeSheetDetailList: Array<TimeSheetDetail> = [];
    if (timesheetDetailObj) {
      for (const key of Object.keys(timesheetDetailObj)) {
        timeSheetDetailList.push(timesheetDetailObj[key]);
      }
    }
    return timeSheetDetailList;
  }

  export function timeSheetDetailsAsObj(timesheetDetailList: { [id: number]: TimeSheetDetail } | Array<TimeSheetDetail>) {
    if (Array.isArray(timesheetDetailList)) {
      const timeSheetDetailObj = {};
      timesheetDetailList.forEach((detail: TimeSheetDetail) => {
        timeSheetDetailObj[detail.Guid] = detail;
      });
      return timeSheetDetailObj;
    } else {
      return timesheetDetailList;
    }
  }

  export function timeSheetDaysAsList(timesheetDayObj: { [id: number]: TimeSheetDay } | Array<TimeSheetDay>) {
    if (Array.isArray(timesheetDayObj)) {
      return timesheetDayObj;
    }
    const timeSheetDaysList: Array<TimeSheetDay> = [];
    if (timesheetDayObj) {
      for (const key of Object.keys(timesheetDayObj)) {
        timeSheetDaysList.push(timesheetDayObj[key]);
      }
    }
    return timeSheetDaysList;
  }

  export function timeSheetDaysAsObj(timesheetDayList: { [id: number]: TimeSheetDay } | Array<TimeSheetDay>) {
    if (Array.isArray(timesheetDayList)) {
      const timeSheetDayObj = {};
      timesheetDayList.forEach((day: TimeSheetDay) => {
        timeSheetDayObj[day.Id] = day;
      });
      return timeSheetDayObj;
    } else {
      return timesheetDayList;
    }
  }

  export function sortTimeSheetDetailList(timeSheetDetailList: Array<TimeSheetDetail>, rateTypes: Array<CodeValue>) {
    const asc: boolean = true;
    if (timeSheetDetailList) {
      timeSheetDetailList.sort((a: TimeSheetDetail, b: TimeSheetDetail) => {
        let aProject = '';
        let bProject = '';

        if (a.Project) {
          const projectVersionA = a.ProjectVersionIdAtSubmission && a.Project ? a.Project.ProjectVersions.find(v => v.Id === a.ProjectVersionIdAtSubmission) : a.Project.ActiveProjectVersion;

          aProject = projectVersionA.Name || '';
        }

        if (b.Project) {
          const projectVersionB = b.ProjectVersionIdAtSubmission && b.Project ? b.Project.ProjectVersions.find(v => v.Id === b.ProjectVersionIdAtSubmission) : b.Project.ActiveProjectVersion;

          bProject = projectVersionB.Name || '';
        }

        aProject = aProject.toUpperCase();
        bProject = bProject.toUpperCase();

        if (aProject > bProject) {
          return asc ? 1 : -1;
        } else if (aProject < bProject) {
          return asc ? -1 : 1;
        } else if (rateTypes) {
          const aRate = rateTypes.find((rate: CodeValue) => rate.id === a.RateTypeId);
          const bRate = rateTypes.find((rate: CodeValue) => rate.id === b.RateTypeId);

          if (aRate.sortOrder > bRate.sortOrder) {
            return 1;
          } else if (aRate.sortOrder < bRate.sortOrder) {
            return -1;
          } else {
            return 0;
          }
        } else {
          return 0;
        }
      });
    }
  }

  export function getTimeSheetDetailStyleId(capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>, capsuleStyleList: Array<TimeSheetCapsuleStyle>, rateTypeId: number, project: Project) {
    const filteredConfigs: Array<TimeSheetCapsuleConfiguration> =
      capsuleConfigurationList && capsuleConfigurationList.length
        ? capsuleConfigurationList.filter((capsuleConfiguration: TimeSheetCapsuleConfiguration) => {
            return capsuleConfiguration.ProjectId === (project ? project.Id : null) && capsuleConfiguration.RateTypeId === rateTypeId;
          })
        : null;

    const filteredStyles: Array<TimeSheetCapsuleStyle> =
      filteredConfigs && filteredConfigs.length && capsuleStyleList && capsuleStyleList.length
        ? capsuleStyleList.filter((style: TimeSheetCapsuleStyle) => {
            return style.Id === filteredConfigs[0].TimeSheetCapsuleStyleId;
          })
        : null;

    return filteredStyles && filteredStyles.length ? filteredStyles[0].Id : null;
  }

  export function calculateMaxMinAndStepForUnitInputByRateUnit(rateUnitId: Number, unitInputProperties: UnitInput) {
    if (rateUnitId === PhxConstants.RateUnit.Shift) {
      unitInputProperties.max = 3;
      unitInputProperties.min = 0.1;
      unitInputProperties.step = 1;
    } else {
      unitInputProperties.max = 24;
      unitInputProperties.min = 0.1;
      unitInputProperties.step = 0.01;
    }
  }
}
