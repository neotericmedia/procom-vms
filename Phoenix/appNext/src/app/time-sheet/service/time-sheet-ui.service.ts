import { PhxLocalizationService } from './../../common/services/phx-localization.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { TimeSheetCapsuleStyle } from './../model/time-sheet-capsule-style';
import { Injectable } from '@angular/core';
import { TimeSheet, TimeSheetDay, TimeSheetDetail, TimeSheetRate, TimeSheetCapsule, TimeSheetCapsuleSummary, TimeSheetConfirmationMessage, TimeSheetLineManagementSortMode } from '../model/index';
import * as moment from 'moment';
import { PhxConstants } from '../../common';
import { TimeSheetUtil } from './../time-sheet.util';

@Injectable()
export class TimeSheetUiService {
  private capsuleStyleMapping = {};

  constructor(private codeValueService: CodeValueService, private localizationService: PhxLocalizationService) {}

  public formatCalendarDate(yyymmddDate: string, format: string): string {
    format = format === undefined ? 'MMM D' : format;
    return moment(yyymmddDate, 'YYYY-MM-DD').format(format);
  }

  public sumUnitsByCapsuleConfig(timeSheet: TimeSheet, capsule: TimeSheetCapsule): number {
    const rateTypeId: number = capsule.timeSheetDetail.RateTypeId;
    const projectId: number = capsule.timeSheetDetail.ProjectId;
    let total: number = 0;

    if (timeSheet && timeSheet.TimeSheetDays) {
      const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

      for (const timeSheetDay of timeSheetDayList) {
        const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(timeSheetDay.TimeSheetDetails);

        for (const detail of timeSheetDetailList) {
          if (this.isTimeSheetDetailForCapsule(detail, capsule)) {
            total += Number(detail.UnitAmount);
          }
        }
      }
    }
    return total;
  }

  isTimeSheetDetailForCapsule(detail: TimeSheetDetail, capsule: TimeSheetCapsule) {
    const rateTypeId: number = capsule.timeSheetDetail.RateTypeId;
    const projectId: number = capsule.timeSheetDetail.ProjectId;

    if (rateTypeId === detail.RateTypeId && ((!detail.ProjectId && !projectId) || detail.ProjectId === projectId)) {
      return true;
    } else {
      return false;
    }
  }

  sumUnitsByDayAndRateUnitId(timeSheetDay: TimeSheetDay, rateUnitId: number) {
    if (!timeSheetDay) {
      return 0;
    }

    let total = 0;

    const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(timeSheetDay.TimeSheetDetails);

    for (const detail of timeSheetDetailList) {
      if (detail.RateUnitId === rateUnitId) {
        total += Number(detail.UnitAmount);
      }
    }
    return total;
  }

  public getTimeSheetCapsuleSummaryList(timeSheet: TimeSheet, capsuleList: TimeSheetCapsule[], existingList?: TimeSheetCapsuleSummary[]): TimeSheetCapsuleSummary[] {
    if (timeSheet.IsEditable) {
      return this.getAllTimeSheetCapsuleSummaryList(timeSheet, capsuleList, existingList);
    } else {
      return this.getUsedTimeSheetCapsuleSummaryList(timeSheet, capsuleList);
    }
  }

  public getAllTimeSheetCapsuleSummaryList(timeSheet: TimeSheet, capsuleList: TimeSheetCapsule[], existingList?: TimeSheetCapsuleSummary[]): TimeSheetCapsuleSummary[] {
    const summaryList: TimeSheetCapsuleSummary[] = [];

    for (const capsule of capsuleList) {
      if (timeSheet.IsTimeSheetUsesProjects || capsule.timeSheetDetail.ProjectId == null) {
        const existing = existingList ? existingList.find(x => x.capsule.guid === capsule.guid) : null;
        if (existing) {
          summaryList.push(existing);
        } else {
          summaryList.push({
            capsule: capsule,
            totalUnits: this.sumUnitsByCapsuleConfig(timeSheet, capsule),
            visible: true
          });
        }
      }
    }

    return summaryList;
  }

  public getUsedTimeSheetCapsuleSummaryList(timeSheet: TimeSheet, capsuleList: TimeSheetCapsule[]): TimeSheetCapsuleSummary[] {
    const summary: { [key: string]: TimeSheetCapsuleSummary } = {};

    if (timeSheet && timeSheet.TimeSheetDays) {
      const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

      for (const timeSheetDay of timeSheetDayList) {
        const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(timeSheetDay.TimeSheetDetails);

        for (const detail of timeSheetDetailList) {
          let key = 'rate' + detail.RateTypeId;

          if (detail.ProjectId) {
            key += 'project' + detail.ProjectId;
          }

          if (detail.UnitAmount && detail.UnitAmount > 0) {
            if (summary[key]) {
              summary[key].totalUnits = Number(summary[key].totalUnits) + Number(detail.UnitAmount);
            } else if (detail.UnitAmount > 0) {
              const capsule = capsuleList.find(x => this.isTimeSheetDetailForCapsule(detail, x));

              if (capsule) {
                const capsuleSummary: TimeSheetCapsuleSummary = {
                  capsule: capsule,
                  projectVersionId: detail.ProjectVersionIdAtSubmission,
                  totalUnits: Number(detail.UnitAmount),
                  visible: true
                };
                summary[key] = capsuleSummary;
              }
            }
          }
        }
      }
    }

    const summaryList: Array<TimeSheetCapsuleSummary> = [];

    for (const key of Object.keys(summary)) {
      summaryList.push(summary[key]);
    }

    return summaryList;
  }

  sumTimeUnitesByDayAndShift(timeSheetDay: TimeSheetDay) {
    return this.sumUnitsByDayAndRateUnitId(timeSheetDay, PhxConstants.RateUnit.Shift);
  }

  sumTimeUnitesByDayAndRateUnitId(timeSheetDay: TimeSheetDay, hoursPerDay: number) {
    const hourUnit = PhxConstants.RateUnit.Hour;
    const dayUnit = PhxConstants.RateUnit.Day;

    let total = 0;

    total = this.sumUnitsByDayAndRateUnitId(timeSheetDay, hourUnit);
    total += hoursPerDay * this.sumUnitsByDayAndRateUnitId(timeSheetDay, dayUnit);

    return total;
  }

  public sortTimeSheetCapsuleSummaryList(capsuleList: TimeSheetCapsuleSummary[], sortMode: TimeSheetLineManagementSortMode, asc: boolean): TimeSheetCapsuleSummary[] {
    const sorted: TimeSheetCapsuleSummary[] = capsuleList.sort((a, b) => {
      let aProjectName = '';
      let bProjectName = '';

      if (a.capsule.timeSheetDetail.Project) {
        aProjectName = this.getCapsuleProjectName(a.capsule, a.projectVersionId);
      }

      if (b.capsule.timeSheetDetail.Project) {
        bProjectName = this.getCapsuleProjectName(b.capsule, b.projectVersionId);
      }

      aProjectName = aProjectName.toUpperCase();
      bProjectName = bProjectName.toUpperCase();

      // Alphabetical
      let alphabeticalResult: number = 0;
      if (aProjectName > bProjectName) {
        alphabeticalResult = asc ? 1 : -1;
      } else if (aProjectName < bProjectName) {
        alphabeticalResult = asc ? -1 : 1;
      } else {
        if (a.capsule.rateSortOrder > b.capsule.rateSortOrder) {
          alphabeticalResult = 1;
        } else if (a.capsule.rateSortOrder < b.capsule.rateSortOrder) {
          alphabeticalResult = -1;
        }
      }
      // Sort by Project Name: alphabetical
      if (sortMode === TimeSheetLineManagementSortMode.ProjectName) {
        return alphabeticalResult;
      }

      // Rate Units
      let rateUnitResult: number = 0;
      const aRateUnitValue = this.getRateUnitComparisonValue(a.capsule.timeSheetDetail.RateUnitId);
      const bRateUnitValue = this.getRateUnitComparisonValue(b.capsule.timeSheetDetail.RateUnitId);
      if (aRateUnitValue > bRateUnitValue) {
        rateUnitResult = asc ? 1 : -1;
      } else if (aRateUnitValue < bRateUnitValue) {
        rateUnitResult = asc ? -1 : 1;
      }

      // Total Units
      let totalUnitsResult: number = 0;
      if (a.totalUnits > b.totalUnits) {
        totalUnitsResult = asc ? 1 : -1;
      } else if (a.totalUnits < b.totalUnits) {
        totalUnitsResult = asc ? -1 : 1;
      }

      // Sort by Total Units: rate unit, then total units, then alphabetical asc
      if (sortMode === TimeSheetLineManagementSortMode.TotalUnits) {
        const alphabeticalAsc: number = asc ? alphabeticalResult : alphabeticalResult * -1;
        if (rateUnitResult !== 0) {
          return rateUnitResult;
        } else if (totalUnitsResult !== 0) {
          return totalUnitsResult;
        } else {
          return alphabeticalAsc;
        }
      }

      return 0;
    });
    return sorted;
  }

  private getRateUnitComparisonValue(rateUnitId: number) {
    /*
    * Rate Unit list from greatest to least defined in PBI:
    * http://webdr01:8080/tfs/DefaultCollection/Phoenix_Oppenheimer/_workitems?id=11517&_a=edit
    * */
    switch (rateUnitId) {
      case PhxConstants.RateUnit.Hour:
        return 1;
      case PhxConstants.RateUnit.Day:
        return 2;
      case PhxConstants.RateUnit.Monthly:
        return 3;
      case PhxConstants.RateUnit.Fixed:
        return 4;
      case PhxConstants.RateUnit.Words:
        return 5;
      default:
        return 0;
    }
  }

  public filterTimeSheetCapsuleSummaryList(capsuleList: TimeSheetCapsuleSummary[], filter: string) {
    for (const obj of capsuleList) {
      if (filter.length > 0) {
        const projectName = this.getCapsuleProjectName(obj.capsule, obj.projectVersionId);
        const rateName = obj.capsule.rateName || '';

        obj.visible = rateName.toLowerCase().indexOf(filter.toLowerCase()) !== -1 || projectName.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
      } else {
        obj.visible = true;
      }
    }
  }

  public getSelectAbleRatesForCapsule(rateList: Array<TimeSheetRate> = [], detailList: Array<TimeSheetDetail> = []): Array<TimeSheetRate> {
    return rateList.filter(rate => {
      return !detailList.filter(detail => detail.RateTypeId === rate.RateTypeId).length;
    });
  }

  public getCapsuleStyle(capsule: TimeSheetCapsule) {
    const color = capsule ? capsule.style.BackgroundColor : '#FFFFFF';

    return {
      'border-right': 'solid 15px ' + color
    };
  }

  public getCapsuleStyleById(styleId: number, capsuleStyleList: Array<TimeSheetCapsuleStyle>) {
    const style: TimeSheetCapsuleStyle = capsuleStyleList.filter((styleItem: TimeSheetCapsuleStyle) => {
      return styleItem.Id === styleId;
    })[0];

    return {
      color: style.FontColor,
      'background-color': style.BackgroundColor
    };
  }

  public getLineManagementStyle(capsule: TimeSheetCapsule) {
    const color = capsule ? capsule.style.FontColor : '#FFFFFF';
    const bgColor = capsule ? capsule.style.BackgroundColor : '#333';

    return {
      color: color,
      'background-color': bgColor
    };
  }

  public getCapsuleProjectName(capsule: TimeSheetCapsule, projectVersionId?: number) {
    const project = capsule.timeSheetDetail.Project;
    const projectVersion = project && projectVersionId ? project.ProjectVersions.find(x => x.Id === projectVersionId) : null;
    const projectName = project ? (projectVersion ? projectVersion : project.ActiveProjectVersion).Name : null || '';
    return projectName;
  }

  canDisplayCapsule(timeSheet: TimeSheet, targetCapsule: TimeSheetCapsule) {
    let result = true;

    if (timeSheet.IsTimeSheetUsesProjects && targetCapsule.timeSheetDetail.Project) {
      const project = targetCapsule.timeSheetDetail.Project;

      result = project.IsActive || (!project.IsActive && timeSheet.AvailableProjectList.indexOf(project.Id) > -1);
    }

    if (!targetCapsule.isActive && this.sumUnitsByCapsuleConfig(timeSheet, targetCapsule) === 0) {
      result = false;
    }

    return result;
  }

  public getMessage(messageKey: string, args?: Array<string>): TimeSheetConfirmationMessage {
    const messages = {
      // individual capsule from calendar
      deleteCapsule: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmDeleteCapsule')
      },

      // clear all from calendar toolbar
      clearAllCapsules: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmClearAllCapsules')
      },

      // clear line management capsule type
      clearCapsuleType: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmClearCapsuleType')
      },

      // clear line management capsule type
      clearCapsuleTypeFromList: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmClearCapsuleTypeFromList')
      },

      // notes & attachments detail note
      deleteDetailNote: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmDeleteNote')
      },

      // notes & attachments time sheet leave note
      deleteTimeSheetNote: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmDeleteNote')
      },

      // notes & attachments time sheet document
      deleteDocument: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmDeleteDocument', [args])
      },

      // timesheet workflow
      // submit with units on a holiday
      submitHoursHoliday: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmSubmitHoursHoliday')
      },

      // zero hours
      submitZeroHours: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmSubmitZeroHours')
      },

      // no errors
      submitNoError: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmSubmitNoError')
      },

      // approve
      // approve with units on a holiday
      approveHoliday: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmApproveHoliday')
      },

      // unsubmit timesheet
      unsubmitTimeSheet: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmUnsubmitTimeSheet')
      },

      // return to exception
      returnToException: {
        title: this.localizationService.translate('common.generic.confirm'),
        body: this.localizationService.translate('timesheet.messages.confirmReturnToException')
      },

      // previous timesheet must be submitted warning
      previousTimeSheetMustBeSubmitted: {
        title: this.localizationService.translate('common.generic.information') + '!',
        body: this.localizationService.translate('timesheet.messages.warnPreviousTimeSheetMustBeSubmitted')
      },

      // timesheet validaion errors warning
      validationErrors: {
        title: this.localizationService.translate('common.generic.warning'),
        body: this.localizationService.translate('timesheet.messages.reviewValidationErrors')
      }
    };

    return messages[messageKey];
  }
}
