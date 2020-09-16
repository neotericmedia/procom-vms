import { PhxLocalizationService } from './../../common/services/phx-localization.service';
import { TimeSheetUnitsByRateType } from './../model/time-sheet-units-by-rate-type';
import { Http } from '@angular/http';
import { AccessAction, WorkflowAction, PhxDocument, ConcurrencyError, CodeValue, CustomFieldVersion, CustomFieldValue } from './../../common/model/index';
import { Injectable } from '@angular/core';
import {
  TimeSheet,
  TimeSheetHeader,
  TimeSheetDay,
  TimeSheetDetail,
  TimeSheetRate,
  TimeSheetCapsule,
  TimeSheetCapsuleStyle,
  TimeSheetCapsuleConfiguration,
  TimeSheetLineManagement,
  TimeSheetWeek,
  TimeSheetDetailConflictType,
  TimeSheetDetailConflict,
  TimeSheetLineManagementSortMode,
  TimeSheetCapsuleSummary
} from '../model';
import { uuid, PhxConstants } from '../../common/PhoenixCommon.module';
import { StateService } from '../../common/state/state.module';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs/Rx';
import * as moment from 'moment';
import { Project } from '../../project/model/index';
import { ProjectService } from '../../project/service/project.service';
import { CommonService, ApiService, LoadingSpinnerService, CodeValueService, WorkflowService, CustomFieldService, DialogService } from '../../common/index';
import { timeSheetState, TimeSheetAction } from '../state/time-sheet/index';
import { DocumentService } from '../../common/services/document.service';
import { TimeSheetUiService } from './time-sheet-ui.service';
import { TimeSheetUtil } from './../time-sheet.util';
import { UrlData } from '../../common/services/urlData.service';
import * as _ from 'lodash';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Injectable()
export class TimeSheetService {
  private workflowUpdatedSubject = new Subject<boolean>();
  private isSavingSubject = new Subject<boolean>();
  private isTimeSheetLoading: boolean = false;
  private bearerToken: string;
  private timeSheetPrintPreviewUrl = 'api/TimeSheet/printPreview/';
  private redirectToPreviousUrlCommands: string[] = ['TimesheetApprove', 'TimesheetDecline'];

  constructor(
    private apiService: ApiService,
    private state: StateService,
    private document: DocumentService,
    private commonService: CommonService,
    private workflowService: WorkflowService,
    private codeValueService: CodeValueService,
    private customFieldService: CustomFieldService,
    private loadingSpinnerService: LoadingSpinnerService,
    private projectService: ProjectService,
    private uiService: TimeSheetUiService,
    private http: Http,
    private router: Router,
    private localizationService: PhxLocalizationService,
    private urlData: UrlData
  ) {
    this.apiService.OnConcurrencyError.subscribe((data: ConcurrencyError) => {
      if (data.TargetEntityTypeId === commonService.ApplicationConstants.EntityType.TimeSheet && data.GroupingEntityId > 0) {
        this.loadingSpinnerService.hideAll();
        this.getTimeSheetById(data.GroupingEntityId, null, true);
        this.getTimeSheetHeaders(null, true);
      }
    });
  }

  private param(oDataParams) {
    return oDataParams ? `?${oDataParams}` : '';
  }

  workflowUpdated(): void {
    this.workflowUpdatedSubject.next(true);
  }

  workflowUpdated$(): Observable<boolean> {
    return this.workflowUpdatedSubject.asObservable();
  }

  isTimeSheetSaving(): Observable<any> {
    return this.isSavingSubject.asObservable().distinctUntilChanged();
  }

  /**
   * Returns the Id of the latest timesheet
   * The first unsubmitted timesheet is returned if any, else last timesheet
   */
  findLatestTimeSheetId(timeSheets: Array<TimeSheetHeader>, assignmentId: number = null): number {
    let available: Array<TimeSheetHeader> = timeSheets.sort((a, b) => {
      return a.TimesheetStartDate.getTime() - b.TimesheetStartDate.getTime();
    });

    if (assignmentId) {
      available = available.filter((header: TimeSheetHeader) => header.AssignmentId === assignmentId);
    }

    if (!available.length) {
      return null;
    }

    const earliestUnsubmitted: TimeSheetHeader = available.filter((item: TimeSheetHeader) => item.IsDraft)[0]; // value or undefined

    if (earliestUnsubmitted) {
      return earliestUnsubmitted.TimeSheetId; // First unsubmitted timesheet
    } else {
      return available[available.length - 1].TimeSheetId; // Last timesheet
    }
  }

  /**
   * Returns an observable of the timeSheet headers from the state.
   * Retrieves the from the server if it does not exist.
   */
  public getTimeSheetHeaders(oDataParams: any = null, forceGet = false, showLoader = true) {
    // only call load if the value has not been retrieved or forceGet is true
    const state = this.state.value;
    const targetValue = state && state.timeSheet && state.timeSheet.headers && state.timeSheet.headers.Items;
    if (targetValue === null || targetValue === undefined || forceGet) {
      // Only select Manual Timesheets (Temp)
      const filterByType = `TimesheetTypeId eq ${this.commonService.ApplicationConstants.TimeSheetType.Manual}`;
      if (oDataParams && oDataParams.includes('$filter')) {
        oDataParams = oDataParams.replace(/\$filter=([^&]*)(&?)/, '$filter=(' + filterByType + ') and ($1)$2');
      } else {
        oDataParams += '&$filter=' + filterByType;
      }

      this.apiService.query(`timeSheet/getTimesheetsAndWorkOrdersSummaryByCurrentUser${this.param(oDataParams)}`, showLoader).then((response: any) => {
        // transform
        response.Items.forEach((header: TimeSheetHeader) => {
          header.TimesheetStartDate = moment(header.TimesheetStartDate, 'YYYY-MM-DD').toDate();
          header.TimesheetEndDate = moment(header.TimesheetEndDate, 'YYYY-MM-DD').toDate();
        });

        this.state.dispatchOnAction(new TimeSheetAction.HeadersUpdate(response.Items));
      });

      // subscribe to the value
    }
    return this.state.select<{ Items: TimeSheetHeader[] }>(timeSheetState.timeSheet.headers).asObservable();
  }

  /**
   * Returns an observable of the timeSheet by id from the state.
   * Retrieves the from the server if it does not exist.
   */
  public getTimeSheetById(timeSheetId: number, oDataParams: any = null, forceGet = false, showLoader = true) {
    // only call load if the value has not been retrieved or forceGet is true
    const state = this.state.value;
    const targetValue = state && state.timeSheet && state.timeSheet.timeSheets && state.timeSheet.timeSheets[timeSheetId];
    if ((!this.isTimeSheetLoading && !targetValue) || forceGet) {
      this.isTimeSheetLoading = true;

      Promise.all([
        this.apiService.query(`timeSheet/getTimesheetAndWorkOrdersDetailByTimeSheetId/${timeSheetId}${this.param(oDataParams)}`, showLoader)
        // this.workflowService.getAvailableActions(this.commonService.ApplicationConstants.EntityType.TimeSheet, timeSheetId, showLoader)
      ])
        // this.apiService.query(`timeSheet/getTimesheetAndWorkOrdersDetailByTimeSheetId/${timeSheetId}${this.param(oDataParams)}`)
        .then((result: Array<any>) => {
          const timeSheet: TimeSheet = result[0];
          // const workflowAvaialbleActions: Array<WorkflowAction> = result[1];

          // workflowAvaialbleActions.forEach((action: WorkflowAction) => {
          //   if (action.CommandName.includes('Submit')) {
          //     action.checkValidation = true;
          //   }
          // });
          // timeSheet.WorkflowAvailableActions = workflowAvaialbleActions;

          timeSheet.IsEditable = timeSheet.IsDraft && timeSheet.AccessActions.some((action: AccessAction) => action.AccessAction === this.commonService.ApplicationConstants.EntityAccessAction.TimeSheetSave);
          timeSheet.IsWorkflowRunning = false;
          timeSheet.ExpandAllDays = false;

          timeSheet.StartDate = moment(timeSheet.StartDate, 'YYYY-MM-DD').toDate();
          timeSheet.EndDate = moment(timeSheet.EndDate, 'YYYY-MM-DD').toDate();

          const timeSheetDays = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

          timeSheetDays.forEach(day => {
            day.Date = moment(day.Date, 'YYYY-MM-DD').toDate();
            const timeSheetDetails = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
            timeSheetDetails.forEach(detail => {
              detail.TimeSheetDayId = detail.TimeSheetDayId || day.Id;
              detail.styleId = null;
              detail.CustomFieldValues = this.customFieldService.mergeTransformCustomFieldValues(timeSheet.CustomFieldVersion, detail.CustomFieldValues);
            });
          });

          timeSheet.PrimaryRateUnitId = timeSheet.Rates.find((rate: TimeSheetRate) => rate.RateTypeId === PhxConstants.RateType.Primary).RateUnitId; // TODO: find better way to get RateType.Primary

          timeSheet.Rates.forEach((rate: TimeSheetRate) => {
            rate.Display = this.codeValueService.getCodeValueText(rate.RateTypeId, this.commonService.CodeValueGroups.RateType);
          });

          timeSheet.ActiveCapsule = {
            detail: null,
            openModal: false,
            project: null,
            isSubmitted: false
          };

          timeSheet.Errors = {
            errorType: {
              TimeSheetDays: {}
            },
            showErrors: false
          };

          timeSheet.ServerError = null;

          return this.projectService.getProjectListAsPromise(timeSheet.AssignmentId).then((projectList: Array<Project>) => {
            this.getLineManagementByAssignmentId(timeSheet.AssignmentId, timeSheet, projectList, showLoader);
          });
        })
        .catch(ex => {
          this.isTimeSheetLoading = false;
          if (ex && ex.status === 404) {
            this.router.navigate(['/next', 'timesheet', 'not-found']);
          } else {
            console.log(ex);
          }
        });
    }

    return this.state.select<TimeSheet>(timeSheetState.timeSheet.timeSheets.byId(timeSheetId).instance);
  }

  public getLineManagementByAssignmentIdFromState(assignmentId: number) {
    // todo use assignmentId when assignment level added to redux
    return this.state.select<TimeSheetLineManagement>(timeSheetState.lineManagement.instance).asObservable();
  }

  public getLineManagementByAssignmentId(assignmentId: number, timeSheet: TimeSheet, projectList: Array<Project>, showLoader: boolean = true) {
    const capsuleStyleSubscription = Observable.forkJoin([this.getTimeSheetCapsuleStyles(assignmentId, showLoader), this.getTimeSheetCapsuleStylesByAssignmentId(assignmentId, showLoader)]).subscribe(resoponseList => {
      const capsuleStyleList = resoponseList[0] as Array<TimeSheetCapsuleStyle>;
      const capsuleConfigurationList = resoponseList[1] as Array<TimeSheetCapsuleConfiguration>;
      const capsuleList: Array<TimeSheetCapsule> = [];

      for (const capsuleConfiguration of capsuleConfigurationList) {
        const rate: TimeSheetRate = timeSheet.Rates.find((rt: TimeSheetRate) => rt.RateTypeId === capsuleConfiguration.RateTypeId);
        const project: Project = capsuleConfiguration.ProjectId
          ? projectList.find((prj: Project) => {
            return prj.Id === capsuleConfiguration.ProjectId;
          })
          : null;

        if (rate && (project || !capsuleConfiguration.ProjectId)) {
          capsuleList.push(this.createLineManagementCapsule(timeSheet, rate, project, capsuleConfigurationList, capsuleStyleList));
        }
      }

      const capsuleSummaryList: TimeSheetCapsuleSummary[] = this.uiService.getTimeSheetCapsuleSummaryList(timeSheet, capsuleList);

      const lm: TimeSheetLineManagement = {
        activeProject: null,
        activeRate: timeSheet.Rates && timeSheet.Rates.length === 1 ? timeSheet.Rates[0] : null,
        capsuleList: capsuleList,
        capsuleStyleList: capsuleStyleList,
        capsuleConfigurationList: capsuleConfigurationList,
        enableAdd: capsuleList.length === 0 && timeSheet.Rates.length === 1 ? true : false,
        hasLoaded: false,
        sortAsc: true,
        sortMode: TimeSheetLineManagementSortMode.ProjectName,
        showAddMenu: true,
        spotLightMode: null,
        spotLightRateId: null,
        spotLightProjectId: null,
        filterText: ''
      };

      this.updateTimeSheetState(timeSheet, lm, projectList);

      this.isTimeSheetLoading = false;
      capsuleStyleSubscription.unsubscribe();
    });
  }

  resetLineManagement() {
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementReset());
  }

  public updateLineManagementProjectData(timeSheetId: number, filterText: string, projectList: Array<Project>) {
    const rateTypes: Array<CodeValue> = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RateType, true);
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementSetProjectData(timeSheetId, projectList, rateTypes));
  }

  public setLineManagementSortMode(sortMode?: TimeSheetLineManagementSortMode, asc?: boolean) {
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementSetCapsuleSortMode(sortMode, asc));
  }

  public setLineManagementFilter(filterText?: string) {
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementSetCapsuleFilter(filterText));
  }

  public toggleAddMenu(showAddMenu: boolean) {
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementToggleAddMenu(showAddMenu));
  }

  public getTimeSheetCapsuleStyles(timeSheetId: number, showLoader: boolean = true) {
    return new Promise((resolve, reject) => {
      this.apiService
        .query(`timeSheet/getTimeSheetCapsuleStyles`, showLoader)
        .then((response: any) => {
          resolve(response.Items);
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public getTimeSheetCapsuleStylesByAssignmentId(assignmentId: number, showLoader: boolean = true) {
    return new Promise((resolve, reject) => {
      this.apiService
        .query(`timeSheet/getTimeSheetCapsuleConfiguration/${assignmentId}`, showLoader)
        .then((response: any) => {
          resolve(response.Items);
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  /**
   * Returns the time sheet day by date
   */
  public getTimeSheetDayByDate(timeSheet: TimeSheet, date: Date) {
    const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
    return timeSheetDaysList.filter(day => day.Date === date)[0];
  }

  /**
   * Returns the time sheet day by id
   */
  public getTimeSheetDayById(timeSheet: TimeSheet, id: number) {
    const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
    return timeSheetDaysList.filter(day => day.Id === id)[0];
  }

  /**
   * Returns the time sheet detail by day and rate type id
   */
  public getTimeSheetDetailByRateTypeId(timeSheet: TimeSheet, date: Date, rateTypeId: number) {
    const day = this.getTimeSheetDayByDate(timeSheet, date);

    const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
    return day && timeSheetDetailList.filter(detail => detail.RateTypeId === rateTypeId)[0];
  }

  /**
   * Returns the time sheet detail by id
   */
  public getTimeSheetDetailById(timeSheet: TimeSheet, timeSheetDetailId: number | string) {
    if (!timeSheet.TimeSheetDays) {
      return null;
    }

    const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
    for (const day of timeSheetDaysList) {
      if (!day.TimeSheetDetails) {
        continue;
      }
      const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
      for (const detail of timeSheetDetailList) {
        if (detail.Id === timeSheetDetailId || detail.Guid === timeSheetDetailId) {
          return detail;
        }
      }
    }
    return null;
  }

  public getTimeSheetDayByIdFromState(timeSheetId: number, timeSheetDayId: number) {
    return this.state.select<TimeSheetDay>(timeSheetState.timeSheet.timeSheets.byId(timeSheetId).timeSheetDays.byId(timeSheetDayId).instance);
  }

  public getTimeSheetDetailsDayByIdFromState(timeSheetId: number, timeSheetDayId: number) {
    return this.state.select<TimeSheetDetail>(timeSheetState.timeSheet.timeSheets.byId(timeSheetId).timeSheetDays.byId(timeSheetDayId).timeSheetDetails.instance);
  }

  public getTimeSheetDetailByIdFromState(timeSheetId: number, timeSheetDayId: number, timeSheetDetailGuid: string) {
    return this.state.select<TimeSheetDetail>(
      timeSheetState.timeSheet.timeSheets
        .byId(timeSheetId)
        .timeSheetDays.byId(timeSheetDayId)
        .timeSheetDetails.byGuid(timeSheetDetailGuid)
    );
  }

  public sortTimeSheetDetails(timeSheetId: number) {
    const rateTypes = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RateType, true);
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailSortCapsuleList(timeSheetId, rateTypes));
  }

  /**
   * Create an empty time sheet detail with a random id and default day id
   */
  public createEmptyTimeSheetDetail(timeSheetDayId: number, customFieldVersion: CustomFieldVersion) {
    return <TimeSheetDetail>{
      Guid: uuid.create(),
      Id: 0,
      RateTypeId: null,
      RateUnitId: null,
      UnitAmount: 0,
      TimeSheetDayId: timeSheetDayId,
      Note: null,
      ProjectId: null,
      CustomFieldValues: this.customFieldService.mergeTransformCustomFieldValues(customFieldVersion, [])
    };
  }

  public addTimeSheetDetail(timeSheet: TimeSheet, timeSheetDetail: TimeSheetDetail, timeSheetLineManagement: TimeSheetLineManagement, rate: TimeSheetRate, project: Project) {
    timeSheetDetail.styleId = this.getAndReserveStyleId(timeSheet, timeSheetDetail, timeSheetLineManagement, rate, project);
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailAdd(timeSheet.Id, timeSheetDetail));
    this.saveDetailList(timeSheet.Id, [timeSheetDetail]);
    this.setAvailableProjectList(timeSheet.Id);
  }

  public updateTimeSheetDetail(timeSheet: TimeSheet, timeSheetDetail: TimeSheetDetail, timeSheetLineManagement: TimeSheetLineManagement, rate: TimeSheetRate, project: Project) {
    const capsule = this.addLineManagementCapsule(timeSheet, timeSheetLineManagement, rate, project);
    timeSheetDetail.styleId = capsule.style.Id;

    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailUpdate(timeSheet.Id, timeSheetDetail));
    this.saveDetailList(timeSheet.Id, [timeSheetDetail]);
    this.setAvailableProjectList(timeSheet.Id);
  }

  public updateTimeSheetDetailNoteAndSave(timeSheetId: number, timeSheetDetail: TimeSheetDetail) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailUpdate(timeSheetId, timeSheetDetail));
    this.saveDetailList(timeSheetId, [timeSheetDetail]);
  }

  public addTimeSheetDetailList(timeSheet: TimeSheet, timeSheetDetailList: Array<TimeSheetDetail>) {
    const timeSheetId = timeSheet.Id;
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailAddList(timeSheetId, timeSheetDetailList));
    this.saveDetailList(timeSheetId, timeSheetDetailList);
    this.setAvailableProjectList(timeSheetId);
    this.sortTimeSheetDetails(timeSheetId);
  }

  public saveTimeSheetNote(timeSheet: TimeSheet): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .command('SaveTimeSheetNotes', {
          TimeSheetId: timeSheet.Id,
          NoteBackOffice: timeSheet.NoteBackOffice,
          NoteClientApprover: timeSheet.NoteClientApprover
        })
        .then(response => {
          this.isSavingSubject.next(false);
          resolve();
        })
        .catch(ex => {
          this.isSavingSubject.next(false);
          reject(ex);
        });
    });
  }

  public deleteTimeSheetDetail(timeSheetId: number, timeSheetDayId: number, timeSheetDetailGuid: string) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailDelete(timeSheetId, timeSheetDayId, timeSheetDetailGuid));
    this.deleteDetailList(timeSheetId, [{ Guid: timeSheetDetailGuid }]);
    this.setAvailableProjectList(timeSheetId);
  }

  public deleteTimeSheetDetailList(timeSheetId: number, guidList: Array<{ Guid: string; DayId: number }>) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailDeleteList(timeSheetId, guidList));

    if (guidList && guidList.length > 0) {
      this.deleteDetailList(timeSheetId, guidList);
    }
  }

  public clearTimeSheetDetailsByCapsule(timeSheet: TimeSheet, capsule: TimeSheetCapsule) {
    const detailGuidList: Array<{ Guid: string; DayId: number }> = [];

    const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

    for (const day of timeSheetDayList) {
      if (day.Id) {
        const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);

        for (const detail of timeSheetDetailList) {
          if (capsule.timeSheetDetail.RateTypeId === detail.RateTypeId && capsule.timeSheetDetail.ProjectId === (detail.Project ? detail.Project.Id : null)) {
            detailGuidList.push({ Guid: detail.Guid, DayId: day.Id });
          }
        }
      }
    }

    this.deleteTimeSheetDetailList(timeSheet.Id, detailGuidList);
  }

  public quickFillDayCapusules(timeSheet: TimeSheet, capsule: TimeSheetCapsule) {
    const detailList: Array<TimeSheetDetail> = [];

    const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

    for (const day of timeSheetDayList) {
      if (day.Id && this.isBusinessDay(day)) {
        const detail = this.createEmptyTimeSheetDetail(day.Id, timeSheet.CustomFieldVersion);
        detail.RateTypeId = capsule.timeSheetDetail.RateTypeId;
        detail.UnitAmount = capsule.preFill;
        detail.RateUnitId = capsule.timeSheetDetail.RateUnitId;
        detail.Project = capsule.timeSheetDetail.Project;
        detail.ProjectId = capsule.timeSheetDetail.ProjectId;
        detail.styleId = capsule.style.Id;
        detailList.push(detail);
      }
    }

    this.addTimeSheetDetailList(timeSheet, detailList);
  }

  isBusinessDay(day: TimeSheetDay) {
    const weekdayIndex = moment(day.Date, 'YYYY-MM-DD')
      .toDate()
      .getDay();
    return weekdayIndex !== 0 && weekdayIndex !== 6 && !day.IsHoliday;
  }

  public clearAllDetails(timeSheet: TimeSheet) {
    const guidList: Array<{ Guid: string }> = [];
    const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
    for (const day of timeSheetDaysList) {
      const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
      for (const detail of timeSheetDetailList) {
        guidList.push({ Guid: detail.Guid });
      }
    }
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailClearAllDetails(timeSheet.Id));

    if (guidList && guidList.length > 0) {
      this.deleteDetailList(timeSheet.Id, guidList);
    }
  }

  public validateCommand(commandName: string, timeSheet: TimeSheet, dialogService: DialogService): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

      switch (commandName) {
        case 'TimesheetSubmit':
          // Validation errors on TimeSheet Days
          this.setDayValidation(timeSheet);
          // if (timeSheet.Errors.showErrors) {

          //   this.windowRef.nativeWindow.scrollTo(0, 0);

          //   return false;

          // }

          // Hours entered on a holiday
          if (
            timeSheetDaysList.filter(
              x => (x.Date.getDay() % 6 === 0 || x.IsHoliday === true) && TimeSheetUtil.timeSheetDetailsAsList(x.TimeSheetDetails).filter(y => y.UnitAmount > 0).length > 0 && Object.keys(x.TimeSheetDetails).length > 0
            ).length > 0
          ) {
            // show confirm dialog
            const message = this.uiService.getMessage('submitHoursHoliday');

            dialogService
              .confirm(message.title, message.body)
              .then(button => {
                resolve(true);
              })
              .catch(e => {
                console.log(e);
                reject(e);
              });
            return;
          }

          // Zero hours on a timesheet
          if (timeSheetDaysList.filter(x => Object.keys(x.TimeSheetDetails).length > 0).length === 0) {
            // show confirm dialog
            const message = this.uiService.getMessage('submitZeroHours');

            dialogService
              .confirm(message.title, message.body)
              .then(button => {
                resolve(true);
              })
              .catch(e => {
                console.log(e);
                reject(e);
              });

            return;
          }

          // no erros, still show confirm dialog
          const messageNoerror = this.uiService.getMessage('submitNoError');
          dialogService
            .confirm(messageNoerror.title, messageNoerror.body)
            .then(button => {
              resolve(true);
            })
            .catch(e => {
              console.log(e);
              reject(e);
            });

          return;

        case 'TimesheetApprove':
          // Hours entered on a holiday
          if (
            timeSheetDaysList.filter(
              x => (x.Date.getDay() % 6 === 0 || x.IsHoliday === true) && TimeSheetUtil.timeSheetDetailsAsList(x.TimeSheetDetails).filter(y => y.UnitAmount > 0).length > 0 && Object.keys(x.TimeSheetDetails).length > 0
            ).length > 0
          ) {
            // show confirm dialog
            const message = this.uiService.getMessage('approveHoliday');

            dialogService
              .confirm(message.title, message.body)
              .then(button => {
                resolve(true);
              })
              .catch(e => {
                console.log(e);
                reject(e);
              });

            return;
          }

          resolve(true);
          break;
        default:
          resolve(true);
      }
    });
  }

  public executeCommand(commandName: string, workflowComments: string, timeSheet: TimeSheet) {
    const command: any = {
      TimeSheetId: timeSheet.Id
    };
    if (workflowComments) {
      command.Comment = workflowComments;
    }

    return new Promise((resolve, reject) => {
      this.apiService
        .command(commandName, command)
        .then(r => {
          this.loadingSpinnerService.hideAll();

          if (!r.IsValid) {
            reject(r.ValidationMessages);
            return;
          }

          this.commonService.logSuccess(this.localizationService.translate('timesheet.messages.workflowActionSuccessMessage', /*workflowAction.Name*/ commandName));
          this.updateTimeSheetProperty(r.EntityId, 'IsWorkflowRunning', true);
          this.updateTimeSheetProperty(r.EntityId, 'IsEditable', false);

          const redirectUrl = this.redirectToPreviousUrlCommands.includes(commandName) ? this.urlData.getUrl() : null;

          if (redirectUrl) {
            this.router.navigateByUrl(redirectUrl);

          } else if (r.EntityIdRedirect) {
            this.router.navigate(['/next', 'timesheet', r.EntityIdRedirect]);
          } else {
            combineLatest(this.getTimeSheetById(timeSheet.Id, null, true, true), this.getTimeSheetHeaders(null, true, false))
              .take(1)
              .subscribe(
                ([ts]) => {
                  this.updateTimeSheetState(ts);
                  resolve(timeSheet.Id);
                },
                ex => {
                  console.error(ex);
                  reject(ex);
                }
              );
          }
        })
        .catch(ex => {
          console.error(ex);
          reject(ex);
        });
    });
  }

  public executeRemoveDocument(document: PhxDocument) {
    const command: any = {
      TimeSheetId: document.EntityId,
      PublicId: document.PublicId
    };

    return new Promise((resolve, reject) => {
      this.apiService
        .command('TimesheetRemoveDocument', command)
        .then(r => {
          if (!r.IsValid) {
            reject(r);
            return;
          }

          // const action = this.localizationService.translate(workflowAction.CommandName.includes('Delete') ? 'common.generic.discard' : 'common.phxDocumentFileUpload.defaultAction');
          const action = this.localizationService.translate('common.generic.discard');
          this.commonService.logSuccess(this.localizationService.translate('timesheet.messages.supportingDocumentActionSuccessMessage', action));

          this.workflowService.setWatchConfigOnWorkflowEvent('/next/', document.EntityTypeId, document.EntityTypeId, r.EntityId).then(() => {
            this.getTimeSheetById(document.EntityId, null, true);
          });

          if (resolve) {
            resolve(r);
          }
        })
        .catch(ex => reject(ex));
    });
  }

  public updateTimeSheetState(timeSheet: TimeSheet, lineManagement?: TimeSheetLineManagement, projectList?: Array<Project>) {
    this.setCalendar(timeSheet);
    const rateTypes = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RateType, true);
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetAdd(timeSheet, lineManagement, projectList, rateTypes));
  }

  public updateTimeSheetProperty(timeSheetId: number, prop: string, value: any) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetUpdateProperty(timeSheetId, prop, value));
  }

  /** Assign the timesheet day to this.calendar */
  private setCalendar(timeSheet: TimeSheet): void {
    if (!timeSheet) {
      return;
    }

    const daysMap: { [date: string]: TimeSheetDay } = this.timeSheetDaysMappedByDate(timeSheet, PhxConstants.DateFormat.API_Date);

    const calendar: Array<TimeSheetWeek> = [];
    let weekId: number = 0;

    let start = timeSheet.StartDate;
    while (start && start <= timeSheet.EndDate) {
      const row: (TimeSheetDay | null)[] = [];
      const startIndex = start.getDay();

      let next: Date;
      for (let i = 0; i <= 7; i++) {
        next = new Date(start);
        next.setDate(next.getDate() + i - startIndex);
        if (i === 7) {
          break;
        }

        const day = daysMap[moment(next).format(PhxConstants.DateFormat.API_Date)];

        if (next > timeSheet.EndDate || next < start || day == null) {
          // TODO: indicate missing day on UI?
          row.push(this.getDummyTimeSheetDay(timeSheet, next));
        } else {
          row.push(day);
        }
      }

      calendar.push({
        Id: weekId++,
        TimeSheetDays: row
      });
      start = next;
    }

    timeSheet.Calendar = calendar;
  }

  private timeSheetDaysMappedByDate(timeSheet: TimeSheet, format: string) {
    let arrayTimeSheetDays: TimeSheetDay[] = [];
    if (Array.isArray(timeSheet.TimeSheetDays)) {
      arrayTimeSheetDays = <TimeSheetDay[]>timeSheet.TimeSheetDays;
    } else {
      arrayTimeSheetDays = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
    }

    const map: { [date: string]: TimeSheetDay } = {};
    arrayTimeSheetDays.forEach(day => {
      const dateString = moment(day.Date).format(format);
      map[dateString] = day;
    });

    return map;
  }

  private getDummyTimeSheetDay(timeSheet: TimeSheet, next: Date): TimeSheetDay {
    const dummyTimeSheetDay: TimeSheetDay = Object.assign({}, timeSheet.TimeSheetDays[0]);
    dummyTimeSheetDay.Date = next;
    dummyTimeSheetDay.Id = null;

    return dummyTimeSheetDay;
  }

  private saveTimeSheetTransform(timeSheet: TimeSheet) {
    // transform
    const copy: TimeSheet = JSON.parse(JSON.stringify(timeSheet));
    const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(copy.TimeSheetDays).filter(day => !!day.Id);

    timeSheetDaysList.map((day: TimeSheetDay) => {
      day.TimeSheetDetails = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
    });

    copy.TimeSheetDays = timeSheetDaysList;

    return copy;
  }

  public saveDetailList(timeSheetId: number, detailList: Array<TimeSheetDetail>): Promise<any> {
    this.isSavingSubject.next(true);

    return new Promise((resolve, reject) => {
      this.apiService
        .command('TimesheetSaveTimesheetDetail', { TimeSheetId: timeSheetId, TimeSheetDetails: detailList }, false)
        .then(response => {
          this.isSavingSubject.next(false);
          resolve();
        })
        .catch(ex => {
          this.isSavingSubject.next(false);
          this.setServerError(timeSheetId, ex || {});
          reject(ex);
        });
    });
  }

  public deleteDetailList(timeSheetId: number, guidList: Array<{ Guid: string }>): Promise<any> {
    this.isSavingSubject.next(true);
    return new Promise((resolve, reject) => {
      this.apiService
        .command(
          'TimesheetDeleteTimesheetDetail',
          {
            TimeSheetId: timeSheetId,
            TimeSheetDetailsToDelete: guidList.map(g => g.Guid)
          },
          false
        )
        .then(response => {
          this.isSavingSubject.next(false);
          resolve();
        })
        .catch(ex => {
          this.isSavingSubject.next(false);
          reject(ex);
        });
    });
  }

  public createCapsuleConfiguration(capsuleConfiguration: TimeSheetCapsuleConfiguration): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .command('NewTimeSheetCapsuleConfiguration', capsuleConfiguration, false)
        .then(response => {
          resolve();
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public setLineManagementActiveRate(timeSheetId: number, rate: TimeSheetRate) {
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementSetActiveRate(timeSheetId, rate));
  }

  public setLineManagementActiveProject(timeSheetId: number, project: Project) {
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementSetActiveProject(timeSheetId, project));
  }

  public clearLineManagementActiveProjectRate(timeSheetId: number) {
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementClearActiveProjectRate(timeSheetId));
  }

  public setTimeSheetCapsuleStyles(timeSheetId: number) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailSetAllStyles(timeSheetId));
  }

  public isCapsuleStyleReservedRequired(projectId: number, rateTypeId: number, capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>) {
    const filteredStyles = capsuleConfigurationList.filter((capsuleConfiguration: TimeSheetCapsuleConfiguration) => {
      return capsuleConfiguration.ProjectId === projectId && capsuleConfiguration.RateTypeId === rateTypeId;
    });

    return filteredStyles.length === 0;
  }

  getAndReserveStyleId(timeSheet: TimeSheet, timeSheetDetail: TimeSheetDetail, timeSheetLineManagement: TimeSheetLineManagement, rate: TimeSheetRate, project: Project) {
    const capsule = this.addLineManagementCapsule(timeSheet, timeSheetLineManagement, rate, project);
    return capsule.style.Id;
  }

  public getCapsuleStyle(timeSheetId: number, assignmentId: number, timeSheetDetail: TimeSheetDetail, capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>, capsuleStyleList: Array<TimeSheetCapsuleStyle>) {
    let nextStyle: TimeSheetCapsuleStyle = null;

    const filteredStyles = capsuleConfigurationList.filter((capsuleConfiguration: TimeSheetCapsuleConfiguration) => {
      return capsuleConfiguration.ProjectId === (timeSheetDetail.Project ? timeSheetDetail.Project.Id : null) && capsuleConfiguration.RateTypeId === timeSheetDetail.RateTypeId;
    });

    if (filteredStyles.length) {
      nextStyle = capsuleStyleList.filter((capsuleStyle: TimeSheetCapsuleStyle) => capsuleStyle.Id === filteredStyles[0].TimeSheetCapsuleStyleId)[0];
    } else {
      nextStyle = this.getNextCapsuleStyle(timeSheetId, assignmentId, timeSheetDetail, capsuleConfigurationList, capsuleStyleList);
    }

    return nextStyle;
  }

  private getParentCapsuleStyleId(capsuleStyleList: Array<TimeSheetCapsuleStyle>, capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>, projectId?: number): number {
    let parentCapsuleStypeId: number = null;

    const filteredStylesByProject = capsuleConfigurationList.filter((capsuleConfiguration: TimeSheetCapsuleConfiguration) => {
      return capsuleConfiguration.ProjectId === projectId;
    });

    if (filteredStylesByProject.length) {
      const parentCapsule = capsuleStyleList.filter((capsuleStyle: TimeSheetCapsuleStyle) => {
        return capsuleStyle.Id === filteredStylesByProject[0].TimeSheetCapsuleStyleId;
      })[0];

      parentCapsuleStypeId = parentCapsule.ParentTimeSheetCapsuleStyleId;
    }

    return parentCapsuleStypeId;
  }

  private getNextCapsuleStyle(timeSheetId: number, assignmentId: number, timeSheetDetail: TimeSheetDetail, capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>, capsuleStyleList: Array<TimeSheetCapsuleStyle>) {
    const parentCapsuleStypeId: number = this.getParentCapsuleStyleId(capsuleStyleList, capsuleConfigurationList, timeSheetDetail.Project ? timeSheetDetail.Project.Id : null);

    let nextStyle: TimeSheetCapsuleStyle = null;

    const capsuleStyleListByParent = this.findCapsuleStyleShadesByParentId(capsuleConfigurationList, capsuleStyleList, parentCapsuleStypeId);

    nextStyle = this.findCapsuleStyleByRateTypeId(capsuleStyleListByParent, timeSheetDetail.RateTypeId);

    return nextStyle || { Id: 1, FontColor: '#000', BackgroundColor: '#FFF', TimeSheetCapsuleStyleShadeId: 5 };
  }

  private findCapsuleStyleByRateTypeId(filteredCapsuleStyleListbyParent: Array<TimeSheetCapsuleStyle>, rateTypeId: number): TimeSheetCapsuleStyle {
    const shades = this.codeValueService.getCodeValues('timesheet.CodeTimeSheetCapsuleStyleShade', true).filter((shade: CodeValue) => shade.parentId === rateTypeId);
    if (shades.length) {
      const capsules = filteredCapsuleStyleListbyParent.filter((capsuleStyle: TimeSheetCapsuleStyle) => capsuleStyle.TimeSheetCapsuleStyleShadeId === shades[0].id);
      if (capsules.length) {
        return capsules[0];
      } else {
        console.error(`No time sheet capsule style is found for shade id ${shades[0].id}`);
        return null;
      }
    } else {
      console.error(`No record is associated with rate type ${rateTypeId} in timesheet.CodeTimeSheetCapsuleStyleShade table`);
      return null;
    }
  }

  private findCapsuleStyleShadesByParentId(capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>, capsuleStyleList: Array<TimeSheetCapsuleStyle>, parentId?: number): Array<TimeSheetCapsuleStyle> {
    let result: Array<TimeSheetCapsuleStyle> = [];

    if (parentId == null) {
      let capsuleConfigurationWithParentId: Array<{ projectId: number; rateTypeId: number; parentId: number }> = [];

      // finding ParentTimeSheetCapsuleStyleId of all existing configuration
      capsuleConfigurationWithParentId = capsuleConfigurationList.map((capsuleConfiguration: TimeSheetCapsuleConfiguration) => {
        const capsuleStyle = capsuleStyleList.filter(style => style.Id === capsuleConfiguration.TimeSheetCapsuleStyleId)[0];

        return {
          projectId: capsuleConfiguration.ProjectId,
          rateTypeId: capsuleConfiguration.RateTypeId,
          parentId: capsuleStyle ? capsuleStyle.ParentTimeSheetCapsuleStyleId : null
        };
      });

      // finding unique combination of project and parent (main style)
      const capsuleConfigurationSets = capsuleConfigurationWithParentId.reduce((prev, current) => ((prev[`${current.projectId}|${current.parentId}`] = current), prev), {});
      const distinctCapsuleConfigurations = Object.keys(capsuleConfigurationSets).map(key => capsuleConfigurationSets[key]);

      // making a dictionary of [styleId,numberOfUsage]
      const parents = {};
      capsuleStyleList.filter((item: TimeSheetCapsuleStyle) => item.ParentTimeSheetCapsuleStyleId == null).map(item => (parents[item.Id] = 0));
      distinctCapsuleConfigurations.reduce((prev, current) => ((parents[current.parentId] = (parents[current.parentId] || 0) + 1), prev), {});

      // finding first id with min usage
      const newParentId = Object.keys(parents).reduce((prev, current) => (parents[prev] <= parents[current] ? prev : current), null);

      parentId = +newParentId;
    }

    result = capsuleStyleList.filter((capsuleStyle: TimeSheetCapsuleStyle) => capsuleStyle.ParentTimeSheetCapsuleStyleId === parentId);

    return result;
  }

  private reserveCapsuleStyle(timeSheetId: number, assignmentId: number, newStyleId: number, timeSheetDetail: TimeSheetDetail, capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>, capsuleStyleList: Array<TimeSheetCapsuleStyle>) {
    const capsuleConfiguration: TimeSheetCapsuleConfiguration = {
      Id: 0,
      Guid: uuid.create(),
      IsActive: true,
      AssignmentId: assignmentId,
      ProjectId: timeSheetDetail.Project ? timeSheetDetail.Project.Id : null,
      RateUnitId: timeSheetDetail.RateUnitId,
      RateTypeId: timeSheetDetail.RateTypeId,
      TimeSheetCapsuleStyleId: newStyleId
    };

    this.state.dispatchOnAction(new TimeSheetAction.LineManagementAddCapsuleConfiguration(timeSheetId, capsuleConfiguration));

    this.createCapsuleConfiguration(capsuleConfiguration);
  }

  public updateCapsuleIsActiveStatus(timesheetId: number, capsuleListCapsuleGuid: string, lineManagement: TimeSheetLineManagement, isActiveStatus: boolean) {
    const capsuleList: Array<TimeSheetCapsule> = lineManagement ? lineManagement.capsuleList : [];
    const capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration> = lineManagement ? lineManagement.capsuleConfigurationList : [];

    const capsule: TimeSheetCapsule = _.find(capsuleList, (item: TimeSheetCapsule) => {
      return item.guid === capsuleListCapsuleGuid && item.isActive !== isActiveStatus;
    });

    const timeSheetDetail: TimeSheetDetail = capsule ? capsule.timeSheetDetail : null;
    const projectId = timeSheetDetail ? timeSheetDetail.ProjectId : null;
    const rateTypeId = timeSheetDetail ? timeSheetDetail.RateTypeId : null;

    const capsuleConfiguration: TimeSheetCapsuleConfiguration = _.find(capsuleConfigurationList, (item: TimeSheetCapsuleConfiguration) => {
      return capsule ? item.ProjectId === projectId && item.RateTypeId === rateTypeId && item.IsActive !== isActiveStatus : false;
    });

    if (capsule) {
      capsule.isActive = isActiveStatus;
      this.state.dispatchOnAction(new TimeSheetAction.LineManagementUpdateCapsule(timesheetId, capsule));
    }
    if (capsuleConfiguration) {
      capsuleConfiguration.IsActive = isActiveStatus;
      this.state.dispatchOnAction(new TimeSheetAction.LineManagementUpdateCapsuleConfiguration(timesheetId, capsuleConfiguration));
      this.createCapsuleConfiguration(capsuleConfiguration);
    }
  }

  public createLineManagementCapsule(timeSheet: TimeSheet, rate: TimeSheetRate, project: Project, capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>, capsuleStyleList: Array<TimeSheetCapsuleStyle>): TimeSheetCapsule {
    const detail = this.createEmptyTimeSheetDetail(null, timeSheet.CustomFieldVersion);
    detail.RateTypeId = rate.RateTypeId;
    detail.RateUnitId = rate.RateUnitId;
    detail.Project = project ? project : null;
    detail.ProjectId = project ? project.Id : null;

    const newStyle = this.getCapsuleStyle(timeSheet.Id, timeSheet.AssignmentId, detail, capsuleConfigurationList, capsuleStyleList);

    const capsuleConfiguration: TimeSheetCapsuleConfiguration = _.find(capsuleConfigurationList, (item: TimeSheetCapsuleConfiguration) => {
      return item ? item.ProjectId === detail.ProjectId && item.RateTypeId === detail.RateTypeId : false;
    });

    detail.styleId = newStyle.Id;

    const capsule: TimeSheetCapsule = {
      guid: uuid.create(),
      rateName: this.codeValueService.getCodeValueText(rate.RateTypeId, this.commonService.CodeValueGroups.RateType),
      rateSortOrder: this.codeValueService.getCodeValue(rate.RateTypeId, this.commonService.CodeValueGroups.RateType)['sortOrder'],
      preFill: 0,
      preFillSlideState: 'hide',
      infoSlideState: 'show',
      timeSheetDetail: detail,
      style: newStyle,
      isActive: capsuleConfiguration ? capsuleConfiguration.IsActive : true
    };

    return capsule;
  }

  public addLineManagementCapsule(timeSheet: TimeSheet, lineManagement: TimeSheetLineManagement, rate: TimeSheetRate, project?: Project): TimeSheetCapsule {
    const capsuleList: Array<TimeSheetCapsule> = lineManagement ? lineManagement.capsuleList : [];
    const rateTypeId = rate ? rate.RateTypeId : null;
    const projectId = project ? project.Id : null;
    let capsule: TimeSheetCapsule = _.find(capsuleList, (item: TimeSheetCapsule) => {
      return item && item.timeSheetDetail ? item.timeSheetDetail.ProjectId === projectId && item.timeSheetDetail.RateTypeId === rateTypeId : false;
    });

    if (capsule) {
      this.updateCapsuleIsActiveStatus(timeSheet.Id, capsule.guid, lineManagement, true);
    } else {
      capsule = this.createLineManagementCapsule(timeSheet, rate, project, lineManagement.capsuleConfigurationList, lineManagement.capsuleStyleList);
      const callReserve: boolean = this.isCapsuleStyleReservedRequired(capsule.timeSheetDetail.ProjectId, capsule.timeSheetDetail.RateTypeId, lineManagement.capsuleConfigurationList);

      if (callReserve) {
        this.reserveCapsuleStyle(timeSheet.Id, timeSheet.AssignmentId, capsule.style.Id, capsule.timeSheetDetail, lineManagement.capsuleConfigurationList, lineManagement.capsuleStyleList);
      }

      this.state.dispatchOnAction(new TimeSheetAction.LineManagementAddCapsule(timeSheet.Id, capsule));
    }

    return capsule;
  }

  public setSpotLightRate(rateId: number, timeSheetId: number) {
    this.updateTimeSheetProperty(timeSheetId, 'ExpandAllDays', true);
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementSetSpotLightRate(rateId));
  }

  public setSpotLightCapsuleConfig(rateId: number, projectId: number, timeSheetId: number) {
    this.updateTimeSheetProperty(timeSheetId, 'ExpandAllDays', true);
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementSetSpotLightCapsuleConfig(rateId, projectId));
  }

  public clearSpotLight(timeSheetId: number) {
    this.updateTimeSheetProperty(timeSheetId, 'ExpandAllDays', false);
    this.state.dispatchOnAction(new TimeSheetAction.LineManagementClearSpotLight());
  }

  public setActiveCapsule(timeSheetId: number, detail: TimeSheetDetail, openModal: boolean, showErrorOnLoad: boolean) {
    if (detail) {
      this.state.dispatchOnAction(new TimeSheetAction.ActiveCapsuleSetActiveCapsule(timeSheetId, detail, openModal, showErrorOnLoad));
    }
  }

  public clearActiveCapsule(timeSheetId: number) {
    this.state.dispatchOnAction(new TimeSheetAction.ActiveCapsuleClearActiveCapsule(timeSheetId));
  }

  public setActiveCapsuleDetailProperty(timeSheetId: number, propertyName: string, newValue: any) {
    this.state.dispatchOnAction(new TimeSheetAction.ActiveCapsuleSetDetailProperty(timeSheetId, propertyName, newValue));
  }

  public updateCustomFieldValue(timeSheetId: number, newValue: CustomFieldValue) {
    this.state.dispatchOnAction(new TimeSheetAction.ActiveCapsuleUpdateCustomFieldValue(timeSheetId, newValue));
  }

  public printTimeSheet(timeSheet: TimeSheet) {
    const timezoneOffset = new Date().getTimezoneOffset();
    const url = `${this.commonService.api2Url}${this.timeSheetPrintPreviewUrl}${timeSheet.Id}?access_token=${this.commonService.bearerToken()}&timezoneOffset=${timezoneOffset}`;

    const isSafariNonDesktop = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS') && !!navigator.userAgent.match(/(iPad|iPhone)/);
    // const isIE = window.navigator && window.navigator.msSaveOrOpenBlob;
    const isSamsungBrowser = window.navigator && navigator.userAgent && !!navigator.userAgent.match('SamsungBrowser');

    /*
    var link = document.createElement("a");
    //link.download = name;
    link.href = url;
    link.click();
    */

    if (isSafariNonDesktop || isSamsungBrowser) {
      window.open(url + '&attachment=false', '_blank');
    } else {
      window.open(url + '&attachment=true', '_parent');
    }

    /*if (isIE || isSafari || isSamsungBrowser) {
      window.open(url, '_blank');
    } else {
      this.loadingSpinnerService.show();
      return new Promise((resolve, reject) => {
        this.http.get(url, { responseType: ResponseContentType.Blob })
          .subscribe(
          (response) => {
            this.loadingSpinnerService.hide();
            resolve(new Blob([response.blob()], { type: 'application/pdf' }));
          });
      });
    } */
  }

  public setAvailableProjectList(timeSheetId: number) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetSetAvailableProjectList(timeSheetId));
  }

  public setTimeSheetError(timeSheetId: number, errorType: string, errorDetail: any) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetSetError(timeSheetId, errorType, errorDetail));
  }

  public clearTimeSheetError(timeSheetId: number, errorType: string, errorDetail: any) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetClearError(timeSheetId, errorType, errorDetail));
  }

  public setServerError(timeSheetId: number, serverError: any) {
    this.state.dispatchOnAction(new TimeSheetAction.TimeSheetSetServerError(timeSheetId, serverError));
  }

  public getTimeSheetWorkorderConflicts(timeSheet: TimeSheet) {
    const detailConflictList: Array<any> = [];

    const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

    timeSheetDayList.forEach(timeSheetDay => {
      const detailWorkorderConflicts = this.getDetailWorkorderConflicts(timeSheet, timeSheetDay);
      if (detailWorkorderConflicts.length > 0) {
        detailConflictList.push(detailWorkorderConflicts);
      }
    });

    return detailConflictList;
  }

  public getDetailWorkorderConflicts(timeSheet: TimeSheet, day: TimeSheetDay) {
    const detailConflictList: Array<any> = [];
    const timeSheetDetails = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
    timeSheetDetails.forEach(detail => {
      const detailConflict: TimeSheetDetailConflict = {
        timeSheetDetail: JSON.parse(JSON.stringify(detail)),
        conflictTypes: []
      };

      const timeSheetRateForDetail = timeSheet.Rates.find((rate: TimeSheetRate) => rate.RateTypeId === detail.RateTypeId);

      if (!timeSheet.IsTimeSheetUsesProjects && detail.ProjectId) {
        detailConflict.conflictTypes.push(TimeSheetDetailConflictType.projectId);
      }

      if (!timeSheetRateForDetail) {
        detailConflict.conflictTypes.push(TimeSheetDetailConflictType.rateTypeId);
      }

      if (timeSheetRateForDetail && timeSheetRateForDetail.RateUnitId !== detail.RateUnitId) {
        detailConflict.conflictTypes.push(TimeSheetDetailConflictType.rateUnitId);
      }

      if (detailConflict.conflictTypes.length > 0) {
        detailConflictList.push(detailConflict);
      }
    });

    return detailConflictList;
  }

  public updateDetailsWithConflict(timeSheet: TimeSheet, lineManagement: TimeSheetLineManagement) {
    const timeSheetDetailsForUpdate: Array<TimeSheetDetail> = [];
    const timeSheetDetailsForDelete: Array<{ Guid: string }> = [];

    const timeSheetWorkOrderConflicts = this.getTimeSheetWorkorderConflicts(timeSheet);

    timeSheetWorkOrderConflicts.forEach(conflictDay => {
      conflictDay.forEach(conflict => {
        const detail = JSON.parse(JSON.stringify(conflict.timeSheetDetail));

        if (conflict.conflictTypes.indexOf(TimeSheetDetailConflictType.rateTypeId) > -1) {
          this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailDelete(timeSheet.Id, detail.TimeSheetDayId, detail.Guid));
          timeSheetDetailsForDelete.push({ Guid: detail.Guid });

          return;
        }

        const rate = timeSheet.Rates.find((rt: TimeSheetRate) => {
          return rt.RateTypeId === detail.RateTypeId;
        });

        if (conflict.conflictTypes.indexOf(TimeSheetDetailConflictType.rateUnitId) > -1 && rate) {
          detail.RateUnitId = rate.RateUnitId;
        }

        if (conflict.conflictTypes.indexOf(TimeSheetDetailConflictType.projectId) > -1 && rate) {
          detail.ProjectId = null;
          detail.Project = null;
          detail.styleId = this.getAndReserveStyleId(timeSheet, detail, lineManagement, rate, null);
        }

        const updatePayload = {
          timeSheetId: timeSheet.Id,
          timeSheetDetail: detail
        };

        this.state.dispatchOnAction(new TimeSheetAction.TimeSheetDetailUpdate(timeSheet.Id, detail));
        timeSheetDetailsForUpdate.push(detail);
      });
    });

    const promiseList = [];

    if (timeSheetDetailsForUpdate.length > 0) {
      promiseList.push(this.saveDetailList(timeSheet.Id, timeSheetDetailsForUpdate));
    }

    if (timeSheetDetailsForDelete.length > 0) {
      promiseList.push(this.deleteDetailList(timeSheet.Id, timeSheetDetailsForDelete));
    }

    Promise.all([promiseList]).catch(() => {
      console.error(`Failed to resolve timesheet conflicts`);
    });
  }

  public setDayValidation(timeSheet: TimeSheet) {
    const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

    timeSheetDayList.forEach(timeSheetDay => {
      this.setSpecificDayValidation(timeSheet, timeSheetDay);
    });
  }

  public setSpecificDayValidation(timeSheet: TimeSheet, timeSheetDay: TimeSheetDay) {
    if (timeSheet.Rates[0].RateUnitId === PhxConstants.RateUnit.Shift) {
      const shiftMsg = {
        dayId: timeSheetDay.Id,
        date: timeSheetDay.Date,
        message: this.localizationService.translate('timesheet.messages.totalGreaterThan3ShiftsMessage')
      };
      if (this.uiService.sumTimeUnitesByDayAndShift(timeSheetDay) > 3) {
        this.setTimeSheetError(timeSheet.Id, 'TimeSheetShift', shiftMsg);
      } else {
        this.clearTimeSheetError(timeSheet.Id, 'TimeSheetShift', shiftMsg);
      }
    } else {
      const dayMsg = {
        dayId: timeSheetDay.Id,
        date: timeSheetDay.Date,
        message: this.localizationService.translate('timesheet.messages.totalGreaterThan24Hoursmessage')
      };
      if (this.uiService.sumTimeUnitesByDayAndRateUnitId(timeSheetDay, timeSheet.HoursPerDay) > 24) {
        this.setTimeSheetError(timeSheet.Id, 'TimeSheetDays', dayMsg);
      } else {
        this.clearTimeSheetError(timeSheet.Id, 'TimeSheetDays', dayMsg);
      }
    }
  }

  public getTimeSheetUnitsByRateType(timeSheet: TimeSheet) {
    const unitsByRateTypeArray = Array<TimeSheetUnitsByRateType>();

    if (timeSheet != null && timeSheet.TimeSheetDays != null) {
      const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
      timeSheetDayList.map(day => {
        const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
        for (let i = 0; i < timeSheetDetailList.length; i++) {
          const instance = unitsByRateTypeArray.find(x => x.RateTypeId === timeSheetDetailList[i].RateTypeId);
          if (instance === undefined) {
            unitsByRateTypeArray.push({
              RateTypeId: timeSheetDetailList[i].RateTypeId,
              UnitAmount: Number(timeSheetDetailList[i].UnitAmount),
              UnitId: timeSheetDetailList[i].RateUnitId,
              DisplayName: `${this.codeValueService.getCodeValueText(timeSheetDetailList[i].RateTypeId, this.commonService.CodeValueGroups.RateType)}`
            });
          } else {
            instance.UnitAmount = Number(instance.UnitAmount) + Number(timeSheetDetailList[i].UnitAmount);
          }
        }
      });
    }

    return this.getSortedTotalsWithGrandTotal(unitsByRateTypeArray, timeSheet);
  }

  public getTimeSheetUnitsForImported(timeSheet: TimeSheet) {
    const totalHoursPerRate: TimeSheetUnitsByRateType[] = [];
    timeSheet.ImportedDetails.forEach(detail => {
      let acum = totalHoursPerRate.find(x => {
        return x.RateTypeId === detail.RateTypeId;
      });
      if (acum) {
        acum.UnitAmount += detail.UnitAmount;
      } else {
        acum = detail;
        acum.DisplayName = `${this.codeValueService.getCodeValueText(acum.RateTypeId, this.commonService.CodeValueGroups.RateType)}`;
        acum.UnitId = detail.RateUnitId;
        totalHoursPerRate.push(acum);
      }
    });

    return this.getSortedTotalsWithGrandTotal(totalHoursPerRate, timeSheet);
  }

  public sortTimesheetByProject(timeSheet: TimeSheet) {
    if (timeSheet != null && timeSheet.TimeSheetDays != null) {
      const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);

      let timeSheetDetailList = Array<TimeSheetDetail>();
      const timeSheetDetailDateMap = [];

      timeSheetDayList.map(day => {
        const detailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
        timeSheetDetailList = timeSheetDetailList.concat(detailList);

        detailList.forEach((val, index) => {
          timeSheetDetailDateMap.push({ DayId: day.Id, DetailId: val.Id });
        });
      });

      timeSheetDetailList = timeSheetDetailList.sort((a: TimeSheetDetail, b: TimeSheetDetail) => {
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
          return 1;
        } else if (aProject < bProject) {
          return -1;
        } else {
          if (timeSheetDetailDateMap.find(x => x.DetailId === a.Id).DayId > timeSheetDetailDateMap.find(x => x.DetailId === b.Id).DayId) {
            return 1;
          } else if (timeSheetDetailDateMap.find(x => x.DetailId === a.Id).DayId < timeSheetDetailDateMap.find(x => x.DetailId === b.Id).DayId) {
            return -1;
          } else {
            if (a.RateTypeId > b.RateTypeId) {
              return 1;
            } else if (a.RateTypeId < b.RateTypeId) {
              return -1;
            } else {
              return 0;
            }
          }
        }
      });

      return timeSheetDetailList;
    }
  }

  public groupedTimeSheetDetails(timeSheetDetailList: Array<TimeSheetDetail>, groupKey: string) {
    const groupBy = function (xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key] != null ? x[key] : '---'] = rv[x[key] != null ? x[key] : '---'] || []).push(x);
        return rv;
      }, {});
    };

    return groupBy(timeSheetDetailList, groupKey);
  }

  private getSortedTotalsWithGrandTotal(unitsByRateTypeArray: TimeSheetUnitsByRateType[], timeSheet: TimeSheet) {
    unitsByRateTypeArray = unitsByRateTypeArray.sort(this.sortTimeSheetByRateTypeSortOrder());
    const totalPrimary: TimeSheetUnitsByRateType = this.calculateTotalUnitsForPrimaryRateUnits(timeSheet, unitsByRateTypeArray);
    unitsByRateTypeArray.push(totalPrimary);
    return unitsByRateTypeArray;
  }

  private sortTimeSheetByRateTypeSortOrder(): (a: TimeSheetUnitsByRateType, b: TimeSheetUnitsByRateType) => number {
    return (a: TimeSheetUnitsByRateType, b: TimeSheetUnitsByRateType) => {
      const aRate = this.codeValueService.getCodeValue(a.RateTypeId, this.commonService.CodeValueGroups.RateType);
      const bRate = this.codeValueService.getCodeValue(b.RateTypeId, this.commonService.CodeValueGroups.RateType);

      if (aRate.sortOrder > bRate.sortOrder) {
        return 1;
      } else if (aRate.sortOrder < bRate.sortOrder) {
        return -1;
      } else {
        return 0;
      }
    };
  }

  private calculateTotalUnitsForPrimaryRateUnits(timeSheet: TimeSheet, unitsByRateTypeArray: TimeSheetUnitsByRateType[]) {
    const primaryRate = timeSheet.Rates.find((rate: TimeSheetRate) => rate.RateUnitId === timeSheet.PrimaryRateUnitId);
    const totalPrimary: TimeSheetUnitsByRateType = {
      RateTypeId: primaryRate.RateTypeId,
      UnitAmount: 0,
      UnitId: primaryRate.RateUnitId,
      DisplayName: this.localizationService.translate('common.generic.total')
    };
    for (const totalByRate of unitsByRateTypeArray) {
      if (totalByRate.UnitId === timeSheet.PrimaryRateUnitId) {
        totalPrimary.UnitAmount = Number(totalPrimary.UnitAmount) + Number(totalByRate.UnitAmount);
      }
    }
    return totalPrimary;
  }
}
