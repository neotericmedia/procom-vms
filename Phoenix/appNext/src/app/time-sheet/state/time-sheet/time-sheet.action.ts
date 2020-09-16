import { Action } from 'redux';
import { CodeValue, CustomFieldValue } from './../../../common/model/index';
import { Project } from './../../../project/model/index';
import { TimeSheet, TimeSheetLineManagement, TimeSheetRate, TimeSheetCapsule, TimeSheetLineManagementSortMode, TimeSheetCapsuleStyle, TimeSheetCapsuleConfiguration, TimeSheetDetail, TimeSheetHeader } from '../../model/index';

export namespace TimeSheetAction {
  export enum type {
    // Time Sheet
    TimeSheetLoad = <any>'@phoenix/TimeSheetLoad',
    TimeSheetAdd = <any>'@phoenix/TimeSheetAdd',
    TimeSheetDelete = <any>'@phoenix/TimeSheetDelete',
    TimeSheetUpdate = <any>'@phoenix/TimeSheetUpdate',
    TimeSheetUpdateProperty = <any>'@phoenix/TimeSheetUpdateProperty',
    TimeSheetSetAvailableProjectList = <any>'@phoenix/TimeSheetSetAvailableProjectList',
    TimeSheetSetError = <any>'@phoenix/TimeSheetSetError',
    TimeSheetClearError = <any>'@phoenix/TimeSheetClearError',
    TimeSheetSetServerError = <any>'@phoenix/TimeSheetSetServerError',
    // Line Management
    LineManagementUpdate = <any>'@phoenix/LineManagementUpdate',
    LineManagementSetProjectData = <any>'@phoenix/LineManagementSetProjectData',
    LineManagementUpdateProjectData = <any>'@phoenix/LineManagementUpdateProjectData',
    LineManagementSetActiveRate = <any>'@phoenix/LineManagementSetActiveRate',
    LineManagementSetActiveProject = <any>'@phoenix/LineManagementSetActiveProject',
    LineManagementClearActiveProjectRate = <any>'@phoenix/LineManagementClearActiveProjectRate',
    LineManagementSetCapsuleList = <any>'@phoenix/LineManagementSetCapsuleList',
    LineManagementAddCapsule = <any>'@phoenix/LineManagementAddCapsule',
    LineManagementUpdateCapsule = <any>'@phoenix/LineManagementUpdateCapsule',
    LineManagementSetCapsuleSortMode = <any>'@phoenix/LineManagementSetCapsuleSortMode',
    LineManagementSetCapsuleFilter = <any>'@phoenix/LineManagementSetCapsuleFilter',
    LineManagementSetCapsuleStyleList = <any>'@phoenix/LineManagementSetCapsuleStyleList',
    LineManagementSetCapsuleConfigurationList = <any>'@phoenix/LineManagementSetCapsuleConfigurationList',
    LineManagementAddCapsuleConfiguration = <any>'@phoenix/LineManagementAddCapsuleConfiguration',
    LineManagementUpdateCapsuleConfiguration = <any>'@phoenix/LineManagementUpdateCapsuleConfiguration',
    LineManagementSetSpotLightRate = <any>'@phoenix/LineManagementSetSpotLightRate',
    LineManagementSetSpotLightCapsuleConfig = <any>'@phoenix/LineManagementSetSpotLightCapsuleConfig',
    LineManagementClearSpotLight = <any>'@phoenix/LineManagementClearSpotLight',
    LineManagementToggleAddMenu = <any>'@phoenix/LineManagementToggleAddMenu',
    LineManagementReset = <any>'@phoenix/LineManagementReset',
    // Active Capsule
    ActiveCapsuleSetActiveCapsule = <any>'@phoenix/ActiveCapsuleSetActiveCapsule',
    ActiveCapsuleClearActiveCapsule = <any>'@phoenix/ActiveCapsuleClearActiveCapsule',
    ActiveCapsuleSetDetailProperty = <any>'@phoenix/ActiveCapsuleSetDetailProperty',
    ActiveCapsuleUpdateCustomFieldValue = <any>'@phoenix/ActiveCapsuleUpdateCustomFieldValue',
    // Header
    HeadersUpdate = <any>'@phoenix/HeadersUpdate',
    // TimeSheetDetail
    TimeSheetDetailCreate = <any>'@phoenix/TimeSheetDetailCreate',
    TimeSheetDetailAdd = <any>'@phoenix/TimeSheetDetailAdd',
    TimeSheetDetailUpdate = <any>'@phoenix/TimeSheetDetailUpdate',
    TimeSheetDetailAddList = <any>'@phoenix/TimeSheetDetailAddList',
    TimeSheetDetailDelete = <any>'@phoenix/TimeSheetDetailDelete',
    TimeSheetDetailDeleteList = <any>'@phoenix/TimeSheetDetailDeleteList',
    TimeSheetDetailClearAllDetails = <any>'@phoenix/TimeSheetDetailClearAllDetails',
    TimeSheetDetailSortCapsuleList = <any>'@phoenix/TimeSheetDetailSortCapsuleList',
    TimeSheetDetailSetProjects = <any>'@phoenix/TimeSheetDetailSetProjects',
    TimeSheetDetailSetAllStyles = <any>'@phoenix/TimeSheetDetailSetAllStyles'
  }

  export type action =
    // Time Sheet
    | TimeSheetLoad
    | TimeSheetAdd
    | TimeSheetDelete
    | TimeSheetUpdate
    | TimeSheetUpdateProperty
    | TimeSheetSetAvailableProjectList
    | TimeSheetSetError
    | TimeSheetClearError
    | TimeSheetSetServerError
    // Line Management
    | LineManagementUpdate
    | LineManagementSetProjectData
    | LineManagementUpdateProjectData
    | LineManagementSetActiveRate
    | LineManagementSetActiveProject
    | LineManagementClearActiveProjectRate
    | LineManagementSetCapsuleList
    | LineManagementAddCapsule
    | LineManagementUpdateCapsule
    | LineManagementSetCapsuleSortMode
    | LineManagementSetCapsuleFilter
    | LineManagementSetCapsuleStyleList
    | LineManagementSetCapsuleConfigurationList
    | LineManagementAddCapsuleConfiguration
    | LineManagementUpdateCapsuleConfiguration
    | LineManagementSetSpotLightRate
    | LineManagementSetSpotLightCapsuleConfig
    | LineManagementClearSpotLight
    | LineManagementToggleAddMenu
    | LineManagementReset
    // Active Capsule
    | ActiveCapsuleSetActiveCapsule
    | ActiveCapsuleClearActiveCapsule
    | ActiveCapsuleSetDetailProperty
    | ActiveCapsuleUpdateCustomFieldValue
    // Header
    | HeadersUpdate
    // TimeSheetDetail
    | TimeSheetDetailCreate
    | TimeSheetDetailAdd
    | TimeSheetDetailUpdate
    | TimeSheetDetailAddList
    | TimeSheetDetailDelete
    | TimeSheetDetailDeleteList
    | TimeSheetDetailClearAllDetails
    | TimeSheetDetailSortCapsuleList
    | TimeSheetDetailSetProjects
    | TimeSheetDetailSetAllStyles;

  export class TimeSheetLoad implements Action {
    public readonly type = type.TimeSheetLoad;
    constructor(public timeSheetId: number, public oDataParams?: any) {}
  }
  export class TimeSheetAdd implements Action {
    public readonly type = type.TimeSheetAdd;
    constructor(public timeSheet: TimeSheet, public lineManagement: TimeSheetLineManagement = null, public projectList: Array<Project> = null, public rateTypes: Array<CodeValue> = null) {}
  }
  export class TimeSheetDelete implements Action {
    public readonly type = type.TimeSheetDelete;
    constructor(public timeSheetId: number) {}
  }
  export class TimeSheetUpdate implements Action {
    public readonly type = type.TimeSheetUpdate;
    constructor(public timeSheet: TimeSheet) {}
  }
  export class TimeSheetUpdateProperty implements Action {
    public readonly type = type.TimeSheetUpdateProperty;
    constructor(public timeSheetId: number, public property: string, public value: any) {}
  }
  export class TimeSheetSetAvailableProjectList implements Action {
    public readonly type = type.TimeSheetSetAvailableProjectList;
    constructor(public timeSheetId: number) {}
  }
  export class TimeSheetSetError implements Action {
    public readonly type = type.TimeSheetSetError;
    constructor(public timeSheetId: number, public errorType: string, public errorDetail: any) {}
  }
  export class TimeSheetClearError implements Action {
    public readonly type = type.TimeSheetClearError;
    constructor(public timeSheetId: number, public errorType: string, public errorDetail: any) {}
  }
  export class TimeSheetSetServerError implements Action {
    public readonly type = type.TimeSheetSetServerError;
    constructor(public timeSheetId: number, public serverError: any) {}
  }
  export class LineManagementUpdate implements Action {
    public readonly type = type.LineManagementUpdate;
    constructor(public lineManagement: TimeSheetLineManagement) {}
  }
  export class LineManagementSetProjectData implements Action {
    public readonly type = type.LineManagementSetProjectData;
    constructor(public timeSheetId: number, public projectList: Array<Project>, public rateTypes: Array<CodeValue>) {}
  }
  export class LineManagementUpdateProjectData implements Action {
    public readonly type = type.LineManagementUpdateProjectData;
    constructor(public projectList: Array<Project>) {}
  }
  export class LineManagementSetActiveRate implements Action {
    public readonly type = type.LineManagementSetActiveRate;
    constructor(public timeSheetId: number, public rate: TimeSheetRate) {}
  }
  export class LineManagementSetActiveProject implements Action {
    public readonly type = type.LineManagementSetActiveProject;
    constructor(public timeSheetId: number, public project: Project) {}
  }
  export class LineManagementClearActiveProjectRate implements Action {
    public readonly type = type.LineManagementClearActiveProjectRate;
    constructor(public timeSheetId: number) {}
  }
  export class LineManagementSetCapsuleList implements Action {
    public readonly type = type.LineManagementSetCapsuleList;
    constructor(public timeSheetId: number, public capsuleList: Array<TimeSheetCapsule>) {}
  }
  export class LineManagementAddCapsule implements Action {
    public readonly type = type.LineManagementAddCapsule;
    constructor(public timeSheetId: number, public capsule: TimeSheetCapsule) {}
  }
  export class LineManagementUpdateCapsule implements Action {
    public readonly type = type.LineManagementUpdateCapsule;
    constructor(public timeSheetId: number, public capsule: TimeSheetCapsule) {}
  }
  export class LineManagementSetCapsuleSortMode implements Action {
    public readonly type = type.LineManagementSetCapsuleSortMode;
    constructor(public sortMode: TimeSheetLineManagementSortMode = null, public asc: boolean = null) {}
  }
  export class LineManagementSetCapsuleFilter implements Action {
    public readonly type = type.LineManagementSetCapsuleFilter;
    constructor(public filterText: string = '') {}
  }
  export class LineManagementSetCapsuleStyleList implements Action {
    public readonly type = type.LineManagementSetCapsuleStyleList;
    constructor(public timeSheetId: number, public capsuleStyleList: Array<TimeSheetCapsuleStyle>) {}
  }
  export class LineManagementSetCapsuleConfigurationList implements Action {
    public readonly type = type.LineManagementSetCapsuleConfigurationList;
    constructor(public timeSheetId: number, public capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>) {}
  }
  export class LineManagementAddCapsuleConfiguration implements Action {
    public readonly type = type.LineManagementAddCapsuleConfiguration;
    constructor(public timeSheetId: number, public capsuleConfiguration: TimeSheetCapsuleConfiguration) {}
  }
  export class LineManagementUpdateCapsuleConfiguration implements Action {
    public readonly type = type.LineManagementUpdateCapsuleConfiguration;
    constructor(public timeSheetId: number, public capsuleConfiguration: TimeSheetCapsuleConfiguration) {}
  }
  export class LineManagementSetSpotLightRate implements Action {
    public readonly type = type.LineManagementSetSpotLightRate;
    constructor(public spotLightRateId: number) {}
  }
  export class LineManagementSetSpotLightCapsuleConfig implements Action {
    public readonly type = type.LineManagementSetSpotLightCapsuleConfig;
    constructor(public spotLightRateId: number, public spotLightProjectId: number) {}
  }
  export class LineManagementClearSpotLight implements Action {
    public readonly type = type.LineManagementClearSpotLight;
    constructor() {}
  }
  export class LineManagementToggleAddMenu implements Action {
    public readonly type = type.LineManagementToggleAddMenu;
    constructor(public showAddMenu: boolean) {}
  }
  export class LineManagementReset implements Action {
    public readonly type = type.LineManagementReset;
    constructor() {}
  }
  export class ActiveCapsuleSetActiveCapsule implements Action {
    public readonly type = type.ActiveCapsuleSetActiveCapsule;
    constructor(public timeSheetId: number, public detail: TimeSheetDetail, public openModal: boolean, public showErrorOnLoad: boolean) {}
  }
  export class ActiveCapsuleClearActiveCapsule implements Action {
    public readonly type = type.ActiveCapsuleClearActiveCapsule;
    constructor(public timeSheetId: number) {}
  }
  export class ActiveCapsuleSetDetailProperty implements Action {
    public readonly type = type.ActiveCapsuleSetDetailProperty;
    constructor(public timeSheetId: number, public propertyName: string, public newValue: any) {}
  }
  export class ActiveCapsuleUpdateCustomFieldValue implements Action {
    public readonly type = type.ActiveCapsuleUpdateCustomFieldValue;
    constructor(public timeSheetId: number, public newValue: CustomFieldValue) {}
  }
  export class HeadersUpdate implements Action {
    public readonly type = type.HeadersUpdate;
    constructor(public headersItemList: Array<TimeSheetHeader>) {}
  }
  export class TimeSheetDetailCreate implements Action {
    public readonly type = type.TimeSheetDetailCreate;
    constructor(public timeSheetId: number, public timeSheetDayId: number) {}
  }
  export class TimeSheetDetailAdd implements Action {
    public readonly type = type.TimeSheetDetailAdd;
    constructor(public timeSheetId: number, public timeSheetDetail: TimeSheetDetail) {}
  }
  export class TimeSheetDetailUpdate implements Action {
    public readonly type = type.TimeSheetDetailUpdate;
    constructor(public timeSheetId: number, public timeSheetDetail: TimeSheetDetail) {}
  }
  export class TimeSheetDetailAddList implements Action {
    public readonly type = type.TimeSheetDetailAddList;
    constructor(public timeSheetId: number, public timeSheetDetailList: Array<TimeSheetDetail>) {}
  }
  export class TimeSheetDetailDelete implements Action {
    public readonly type = type.TimeSheetDetailDelete;
    constructor(public timeSheetId: number, public timeSheetDayId: number, public timeSheetDetailGuid: string) {}
  }
  export class TimeSheetDetailDeleteList implements Action {
    public readonly type = type.TimeSheetDetailDeleteList;
    constructor(public timeSheetId: number, public timeSheetDetailGuidList: Array<{ Guid: string; DayId: number }>) {}
  }
  export class TimeSheetDetailClearAllDetails implements Action {
    public readonly type = type.TimeSheetDetailClearAllDetails;
    constructor(public timeSheetId: number) {}
  }
  export class TimeSheetDetailSortCapsuleList implements Action {
    public readonly type = type.TimeSheetDetailSortCapsuleList;
    constructor(public timeSheetId: number, public rateTypes: Array<CodeValue>) {}
  }
  export class TimeSheetDetailSetProjects implements Action {
    public readonly type = type.TimeSheetDetailSetProjects;
    constructor(public timeSheetId: number, public projectList: Array<Project>) {}
  }
  export class TimeSheetDetailSetAllStyles implements Action {
    public readonly type = type.TimeSheetDetailSetAllStyles;
    constructor(public timeSheetId: number) {}
  }
}
