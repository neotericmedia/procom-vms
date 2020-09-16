import { CustomFieldValue, CodeValue } from './../../../common/model/index';
import { ReducerUtility } from './../../../common/state/service/reducer.utility';
import { uuid } from '../../../common/PhoenixCommon.module';
import { Project } from '../../../project/model/index';

import { timeSheetInitial } from './time-sheet.initial';
import { TimeSheetAction } from './time-sheet.action';
import { TimeSheetState } from './time-sheet.interface';
import {
  TimeSheet,
  TimeSheetDetail,
  TimeSheetDay,
  TimeSheetCapsule,
  TimeSheetCapsuleConfiguration,
  TimeSheetCapsuleStyle,
  TimeSheetActiveCapsule,
  TimeSheetRate,
  TimeSheetSpotLightMode,
  TimeSheetLineManagementSortMode,
  TimeSheetLineManagement,
  TimeSheetError
} from '../../model';
import { TimeSheetUtil } from './../../time-sheet.util';

export const timeSheetReducer = (currState: TimeSheetState = timeSheetInitial, action: TimeSheetAction.action): TimeSheetState => {
  switch (action.type) {
    case TimeSheetAction.type.TimeSheetAdd: {
      const payload = action as TimeSheetAction.TimeSheetAdd;
      let timeSheet: TimeSheet = payload.timeSheet;
      const timeSheetId: number = timeSheet ? timeSheet.Id : 0;
      const lineManagement: TimeSheetLineManagement = payload.lineManagement ? payload.lineManagement : currState.lineManagement;
      const capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration> = lineManagement ? lineManagement.capsuleConfigurationList : null;
      const capsuleStyleList: Array<TimeSheetCapsuleStyle> = lineManagement ? lineManagement.capsuleStyleList : null;
      const projectList: Array<Project> = payload.projectList;
      const rateTypes: Array<CodeValue> = payload.rateTypes;

      if (timeSheet) {
        const projectIds: Array<number> = [];
        let timeSheetDaysList: Array<TimeSheetDay> = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
        timeSheetDaysList = timeSheetDaysList.map((day: TimeSheetDay, index: number) => {
          let timeSheetDetailsList: Array<TimeSheetDetail> = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
          timeSheetDetailsList = timeSheetDetailsList.map((detail: TimeSheetDetail, index2: number) => {
            let project: Project = detail.Project;
            if (detail.ProjectId) {
              if (projectIds.indexOf(detail.ProjectId) === -1) {
                projectIds.push(detail.ProjectId);
              }
              if (projectList) {
                project = projectList.find((p: Project) => p.Id === detail.ProjectId);
              }
            }

            return {
              ...detail,
              Project: project,
              styleId: TimeSheetUtil.getTimeSheetDetailStyleId(capsuleConfigurationList, capsuleStyleList, detail.RateTypeId, project)
            };
          });
          TimeSheetUtil.sortTimeSheetDetailList(timeSheetDetailsList, rateTypes);

          return {
            ...day,
            TimeSheetDetails: TimeSheetUtil.timeSheetDetailsAsObj(timeSheetDetailsList)
          };
        });

        timeSheet = {
          ...timeSheet,
          TimeSheetDays: TimeSheetUtil.timeSheetDaysAsObj(timeSheetDaysList),
          AvailableProjectList: timeSheet.IsTimeSheetUsesProjects ? projectIds : timeSheet.AvailableProjectList
        };
      }

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: timeSheet
        },
        lineManagement: {
          ...lineManagement
        }
      };
    }

    case TimeSheetAction.type.TimeSheetUpdate: {
      const payload = action as TimeSheetAction.TimeSheetUpdate;
      let timeSheet: TimeSheet = payload.timeSheet;
      const timeSheetId: number = timeSheet.Id;

      if (timeSheet) {
        let timeSheetDaysList: Array<TimeSheetDay> = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
        timeSheetDaysList = timeSheetDaysList.map((day: TimeSheetDay, index: number) => {
          return {
            ...day,
            TimeSheetDetails: TimeSheetUtil.timeSheetDetailsAsObj(TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails))
          };
        });
        timeSheet = {
          ...timeSheet,
          TimeSheetDays: TimeSheetUtil.timeSheetDaysAsObj(timeSheetDaysList)
        };
      }

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: timeSheet
        }
      };
    }

    case TimeSheetAction.type.TimeSheetUpdateProperty: {
      const payload = action as TimeSheetAction.TimeSheetUpdateProperty;
      const timeSheetId: number = payload.timeSheetId;
      const property: string = payload.property;
      const value: any = payload.value;

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            [property]: value
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetSetAvailableProjectList: {
      const payload = action as TimeSheetAction.TimeSheetSetAvailableProjectList;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];
      const projectIds: Array<number> = [];

      if (timeSheet && timeSheet.IsTimeSheetUsesProjects) {
        const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays);
        timeSheetDaysList.forEach((day: TimeSheetDay) => {
          const timeSheetDetailsList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
          timeSheetDetailsList.forEach((detail: TimeSheetDetail) => {
            if (detail.ProjectId) {
              if (projectIds.indexOf(detail.ProjectId) === -1) {
                projectIds.push(detail.ProjectId);
              }
            }
          });
        });
      }

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            AvailableProjectList: projectIds
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetSetError: {
      const payload = action as TimeSheetAction.TimeSheetSetError;
      const timeSheetId: number = payload.timeSheetId;
      const errorType: string = payload.errorType;
      const errorDetail: any = payload.errorDetail;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];
      const timeSheetDayErrors = {};

      if (errorType === 'TimeSheetDays') {
        timeSheet.Errors.errorType[errorType][errorDetail.date] = errorDetail;
        const timeSheetDateList: Array<string> = Object.keys(timeSheet.Errors.errorType[errorType]).sort((a, b) => {
          return new Date(a).getTime() - new Date(b).getTime();
        });
        for (const datekey of timeSheetDateList) {
          timeSheetDayErrors[datekey] = timeSheet.Errors.errorType[errorType][datekey];
        }
      }

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            showError: true,
            Errors: {
              ...currState.timeSheets[timeSheetId].Errors,
              errorType: {
                ...currState.timeSheets[timeSheetId].Errors.errorType,
                TimeSheetDays: timeSheetDayErrors
              }
            }
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetClearError: {
      const payload = action as TimeSheetAction.TimeSheetClearError;
      const timeSheetId: number = payload.timeSheetId;
      const errorType: string = payload.errorType;
      const errorDetail: any = payload.errorDetail;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];
      const timeSheetError: TimeSheetError = timeSheet ? timeSheet.Errors : null;
      let errorTypeObj = timeSheetError && timeSheetError.errorType ? { ...timeSheetError.errorType[errorType] } : {};

      if (errorType === 'TimeSheetDays') {
        if (errorDetail) {
          delete errorTypeObj[errorDetail.date];
        } else {
          errorTypeObj = {};
        }
      }

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            showError: Object.keys(errorTypeObj).length === 0 ? false : true,
            Errors: {
              ...currState.timeSheets[timeSheetId].Errors,
              errorType: {
                ...currState.timeSheets[timeSheetId].Errors.errorType,
                [errorType]: errorTypeObj
              }
            }
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetSetServerError: {
      const payload = action as TimeSheetAction.TimeSheetSetServerError;
      const timeSheetId: number = payload.timeSheetId;

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            ServerError: payload.serverError
          }
        }
      };
    }

    case TimeSheetAction.type.LineManagementUpdate: {
      const payload = action as TimeSheetAction.LineManagementUpdate;
      return {
        ...currState,
        lineManagement: payload.lineManagement
      };
    }

    case TimeSheetAction.type.LineManagementSetProjectData: {
      const payload = action as TimeSheetAction.LineManagementSetProjectData;
      const timeSheetId: number = payload.timeSheetId;
      const projectList: Array<Project> = payload.projectList;
      const rateTypes: Array<CodeValue> = payload.rateTypes;
      const timeSheet = timeSheetId ? currState.timeSheets[timeSheetId] : null;
      const timeSheetDays = timeSheet ? timeSheet.TimeSheetDays : null;
      let timeSheetDaysList = timeSheetDays ? TimeSheetUtil.timeSheetDaysAsList(timeSheetDays) : null;
      const lineManagement: TimeSheetLineManagement = currState.lineManagement;
      const capsuleConfigurationList = lineManagement ? lineManagement.capsuleConfigurationList : null;
      const capsuleStyleList = lineManagement ? lineManagement.capsuleStyleList : null;
      let capsuleList: Array<TimeSheetCapsule> = lineManagement ? lineManagement.capsuleList : null;
      const projectIds = [];

      if (capsuleList) {
        capsuleList = capsuleList.map((capsule: TimeSheetCapsule, index: number) => {
          if (capsule.timeSheetDetail && capsule.timeSheetDetail.Project) {
            const project = projectList.find((prj: Project) => {
              return prj.Id === capsule.timeSheetDetail.Project.Id;
            });
            return {
              ...capsule,
              timeSheetDetail: {
                ...capsule.timeSheetDetail,
                Project: project
              }
            };
          } else {
            return capsule;
          }
        });
      }

      timeSheetDaysList = timeSheetDaysList.map((day: TimeSheetDay, index: number) => {
        let timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
        timeSheetDetailList = timeSheetDetailList.map((detail: TimeSheetDetail, index2: number) => {
          if (detail.ProjectId) {
            if (projectIds.indexOf(detail.ProjectId) === -1) {
              projectIds.push(detail.ProjectId);
            }
          }
          const project: Project = projectList.find((p: Project) => p.Id === detail.ProjectId);
          return {
            ...detail,
            styleId: TimeSheetUtil.getTimeSheetDetailStyleId(capsuleConfigurationList, capsuleStyleList, detail.RateTypeId, project),
            Project: project
          };
        });
        TimeSheetUtil.sortTimeSheetDetailList(timeSheetDetailList, rateTypes);

        return {
          ...day,
          TimeSheetDetails: TimeSheetUtil.timeSheetDetailsAsObj(timeSheetDetailList)
        };
      });

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            timeSheetDays: TimeSheetUtil.timeSheetDaysAsObj(timeSheetDaysList),
            AvailableProjectList: timeSheet.IsTimeSheetUsesProjects ? projectIds : currState.timeSheets[timeSheetId].AvailableProjectList
          }
        },
        lineManagement: {
          ...currState.lineManagement,
          capsuleList: capsuleList
        }
      };
    }

    case TimeSheetAction.type.LineManagementUpdateProjectData: {
      const payload = action as TimeSheetAction.LineManagementUpdateProjectData;
      const projectList: Array<Project> = payload.projectList;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          capsuleList: currState.lineManagement.capsuleList.map((capsule: TimeSheetCapsule, index: number) => {
            if (capsule.timeSheetDetail.Project) {
              const project = projectList.find((prj: Project) => {
                return prj.Id === capsule.timeSheetDetail.Project.Id;
              });
              return {
                ...capsule,
                timeSheetDetail: {
                  ...capsule.timeSheetDetail,
                  Project: project
                }
              };
            } else {
              return capsule;
            }
          })
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetActiveRate: {
      const payload = action as TimeSheetAction.LineManagementSetActiveRate;
      const timeSheetId: number = payload.timeSheetId;
      const lineManagement: TimeSheetLineManagement = currState.lineManagement;

      const rateTypeId = payload.rate ? payload.rate.RateTypeId : null;
      const projectId = lineManagement.activeProject ? lineManagement.activeProject.Id : null;

      const filteredStyles = lineManagement.capsuleConfigurationList.filter((capsuleConfiguration: TimeSheetCapsuleConfiguration) => {
        return capsuleConfiguration.ProjectId === projectId && capsuleConfiguration.RateTypeId === rateTypeId && capsuleConfiguration.IsActive;
      });

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          activeRate: payload.rate,
          enableAdd: filteredStyles.length === 0 && rateTypeId > 0
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetActiveProject: {
      const payload = action as TimeSheetAction.LineManagementSetActiveProject;
      const timeSheetId: number = payload.timeSheetId;
      const lineManagement: TimeSheetLineManagement = currState.lineManagement;

      const rateTypeId = lineManagement.activeRate ? lineManagement.activeRate.RateTypeId : null;
      const projectId = payload.project ? payload.project.Id : null;

      const filteredStyles = lineManagement.capsuleConfigurationList.filter((capsuleConfiguration: TimeSheetCapsuleConfiguration) => {
        return capsuleConfiguration.ProjectId === projectId && capsuleConfiguration.RateTypeId === rateTypeId && capsuleConfiguration.IsActive;
      });

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          activeProject: payload.project,
          enableAdd: filteredStyles.length === 0 && rateTypeId > 0
        }
      };
    }

    case TimeSheetAction.type.LineManagementClearActiveProjectRate: {
      const payload = action as TimeSheetAction.LineManagementClearActiveProjectRate;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          activeProject: null,
          activeRate: timeSheet && timeSheet.Rates && timeSheet.Rates.length > 1 ? null : currState.lineManagement.activeRate,
          enableAdd: false
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetCapsuleList: {
      const payload = action as TimeSheetAction.LineManagementSetCapsuleList;
      const timeSheetId: number = payload.timeSheetId;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          capsuleList: payload.capsuleList
        }
      };
    }

    case TimeSheetAction.type.LineManagementAddCapsule: {
      const payload = action as TimeSheetAction.LineManagementAddCapsule;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          capsuleList: ReducerUtility.InsertEntityToArray(currState.lineManagement.capsuleList, payload.capsule),
          activeProject: null,
          activeRate: timeSheet && timeSheet.Rates && timeSheet.Rates.length > 1 ? null : currState.lineManagement.activeRate,
          enableAdd: false
        }
      };
    }

    case TimeSheetAction.type.LineManagementUpdateCapsule: {
      const payload = action as TimeSheetAction.LineManagementUpdateCapsule;
      const guid = payload && payload.capsule ? payload.capsule.guid : null;
      const capsuleList = currState && currState.lineManagement && currState.lineManagement.capsuleList ? currState.lineManagement.capsuleList : [];
      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          capsuleList: capsuleList.map((capsule: TimeSheetCapsule, index: number) => {
            if (capsule.guid === guid) {
              return {
                ...payload.capsule,
              };
            } else {
              return capsule;
            }
          })
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetCapsuleSortMode: {
      const payload = action as TimeSheetAction.LineManagementSetCapsuleSortMode;
      const sortMode: TimeSheetLineManagementSortMode = payload.sortMode != null ? payload.sortMode : currState.lineManagement.sortMode;
      const asc: boolean = payload && payload.asc != null ? payload.asc : currState.lineManagement.sortAsc;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          sortMode: sortMode,
          sortAsc: asc
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetCapsuleFilter: {
      const payload = action as TimeSheetAction.LineManagementSetCapsuleFilter;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          filterText: payload.filterText
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetCapsuleStyleList: {
      const payload = action as TimeSheetAction.LineManagementSetCapsuleStyleList;
      const timeSheetId: number = payload.timeSheetId;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          capsuleStyleList: payload.capsuleStyleList
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetCapsuleConfigurationList: {
      const payload = action as TimeSheetAction.LineManagementSetCapsuleConfigurationList;
      const timeSheetId: number = payload.timeSheetId;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          capsuleConfigurationList: payload.capsuleConfigurationList
        }
      };
    }

    case TimeSheetAction.type.LineManagementAddCapsuleConfiguration: {
      const payload = action as TimeSheetAction.LineManagementAddCapsuleConfiguration;
      const timeSheetId: number = payload.timeSheetId;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          capsuleConfigurationList: ReducerUtility.InsertEntityToArray(currState.lineManagement.capsuleConfigurationList, payload.capsuleConfiguration)
        }
      };
    }

    case TimeSheetAction.type.LineManagementUpdateCapsuleConfiguration: {
      const payload = action as TimeSheetAction.LineManagementUpdateCapsuleConfiguration;
      const guid = payload && payload.capsuleConfiguration ? payload.capsuleConfiguration.Guid : null;
      const capsuleConfigurationList = currState && currState.lineManagement && currState.lineManagement.capsuleConfigurationList ? currState.lineManagement.capsuleConfigurationList : [];
      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          capsuleConfigurationList: capsuleConfigurationList.map((capsuleConfiguration: TimeSheetCapsuleConfiguration, index: number) => {
            if (capsuleConfiguration.Guid === guid) {
              return {
                ...payload.capsuleConfiguration,
              };
            } else {
              return capsuleConfiguration;
            }
          })
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetSpotLightRate: {
      const payload = action as TimeSheetAction.LineManagementSetSpotLightRate;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          spotLightMode: TimeSheetSpotLightMode.rate,
          spotLightRateId: payload.spotLightRateId,
          spotLightProjectId: null
        }
      };
    }

    case TimeSheetAction.type.LineManagementSetSpotLightCapsuleConfig: {
      const payload = action as TimeSheetAction.LineManagementSetSpotLightCapsuleConfig;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          spotLightMode: TimeSheetSpotLightMode.capsuleConfig,
          spotLightRateId: payload.spotLightRateId,
          spotLightProjectId: payload.spotLightProjectId
        }
      };
    }

    case TimeSheetAction.type.LineManagementClearSpotLight: {
      const payload = action as TimeSheetAction.LineManagementClearSpotLight;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          spotLightMode: null,
          spotLightRateId: null,
          spotLightProjectId: null
        }
      };
    }

    case TimeSheetAction.type.LineManagementToggleAddMenu: {
      const payload = action as TimeSheetAction.LineManagementToggleAddMenu;

      return {
        ...currState,
        lineManagement: {
          ...currState.lineManagement,
          showAddMenu: payload.showAddMenu
        }
      };
    }

    case TimeSheetAction.type.LineManagementReset: {
      const payload = action as TimeSheetAction.LineManagementReset;

      return {
        ...currState,
        lineManagement: timeSheetInitial.lineManagement
      };
    }

    case TimeSheetAction.type.ActiveCapsuleSetActiveCapsule: {
      const payload = action as TimeSheetAction.ActiveCapsuleSetActiveCapsule;
      const timeSheetId: number = payload.timeSheetId;

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            ActiveCapsule: {
              ...currState.timeSheets[timeSheetId].ActiveCapsule,
              detail: payload.detail,
              openModal: payload.openModal ? payload.openModal : false,
              isSubmitted: payload.showErrorOnLoad
            }
          }
        }
      };
    }

    case TimeSheetAction.type.ActiveCapsuleClearActiveCapsule: {
      const payload = action as TimeSheetAction.ActiveCapsuleSetActiveCapsule;
      const timeSheetId: number = payload.timeSheetId;

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            ActiveCapsule: {
              ...currState.timeSheets[timeSheetId].ActiveCapsule,
              detail: null,
              project: null,
              openModal: false,
              isSubmitted: false
            }
          }
        }
      };
    }

    case TimeSheetAction.type.ActiveCapsuleSetDetailProperty: {
      const payload = action as TimeSheetAction.ActiveCapsuleSetDetailProperty;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];
      const lineManagement: TimeSheetLineManagement = currState.lineManagement;
      const capsuleConfigurationList = lineManagement ? lineManagement.capsuleConfigurationList : null;
      const capsuleStyleList = lineManagement ? lineManagement.capsuleStyleList : null;

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            ActiveCapsule: {
              ...currState.timeSheets[timeSheetId].ActiveCapsule,
              detail: {
                ...currState.timeSheets[timeSheetId].ActiveCapsule.detail,
                [payload.propertyName]: payload.propertyName === 'UnitAmount' ? Number(payload.newValue) : payload.newValue,
                styleId: TimeSheetUtil.getTimeSheetDetailStyleId(capsuleConfigurationList, capsuleStyleList, currState.timeSheets[timeSheetId].ActiveCapsule.detail.RateTypeId, currState.timeSheets[timeSheetId].ActiveCapsule.detail.Project)
              }
            }
          }
        }
      };
    }

    case TimeSheetAction.type.ActiveCapsuleUpdateCustomFieldValue: {
      const payload = action as TimeSheetAction.ActiveCapsuleUpdateCustomFieldValue;
      const timeSheetId: number = payload.timeSheetId;
      const newValue: CustomFieldValue = payload.newValue;

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            ActiveCapsule: {
              ...currState.timeSheets[timeSheetId].ActiveCapsule,
              detail: {
                ...currState.timeSheets[timeSheetId].ActiveCapsule.detail,
                CustomFieldValues: currState.timeSheets[timeSheetId].ActiveCapsule.detail.CustomFieldValues.map((customFieldValue: CustomFieldValue, index: number) => {
                  if (customFieldValue.CustomFieldConfigurationId === newValue.CustomFieldConfigurationId) {
                    return newValue;
                  } else {
                    return customFieldValue;
                  }
                })
              }
            }
          }
        }
      };
    }

    case TimeSheetAction.type.HeadersUpdate: {
      const payload = action as TimeSheetAction.HeadersUpdate;

      return {
        ...currState,
        headers: {
          ...currState.headers,
          Items: payload.headersItemList
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailCreate: {
      const payload = action as TimeSheetAction.TimeSheetDetailCreate;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheetDayId: number = payload.timeSheetDayId;
      const timeSheetDetail: TimeSheetDetail = {
        Guid: uuid.create(),
        Id: 0,
        RateTypeId: null,
        RateUnitId: null,
        UnitAmount: 0,
        TimeSheetDayId: timeSheetDayId,
        Note: null,
        ProjectId: null,
        CustomFieldValues: null
      };

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: {
              ...currState.timeSheets[timeSheetId].TimeSheetDays,
              [timeSheetDayId]: {
                ...currState.timeSheets[timeSheetId].TimeSheetDays[timeSheetDayId],
                TimeSheetDetails: {
                  ...currState.timeSheets[timeSheetId].TimeSheetDays[timeSheetDayId].TimeSheetDetails,
                  [timeSheetDetail.Guid]: timeSheetDetail
                }
              }
            }
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailAdd: {
      const payload = action as TimeSheetAction.TimeSheetDetailAdd;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheetDetail: TimeSheetDetail = payload.timeSheetDetail;
      const timeSheetDayId: number = timeSheetDetail.TimeSheetDayId;

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: {
              ...currState.timeSheets[timeSheetId].TimeSheetDays,
              [timeSheetDayId]: {
                ...currState.timeSheets[timeSheetId].TimeSheetDays[timeSheetDayId],
                TimeSheetDetails: {
                  ...currState.timeSheets[timeSheetId].TimeSheetDays[timeSheetDayId].TimeSheetDetails,
                  [timeSheetDetail.Guid]: timeSheetDetail
                }
              }
            }
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailUpdate: {
      const payload = action as TimeSheetAction.TimeSheetDetailAdd;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheetDetail: TimeSheetDetail = payload.timeSheetDetail;
      const timeSheetDayId: number = timeSheetDetail.TimeSheetDayId;

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: {
              ...currState.timeSheets[timeSheetId].TimeSheetDays,
              [timeSheetDayId]: {
                ...currState.timeSheets[timeSheetId].TimeSheetDays[timeSheetDayId],
                TimeSheetDetails: {
                  ...currState.timeSheets[timeSheetId].TimeSheetDays[timeSheetDayId].TimeSheetDetails,
                  [timeSheetDetail.Guid]: timeSheetDetail
                }
              }
            }
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailAddList: {
      const payload = action as TimeSheetAction.TimeSheetDetailAddList;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheetDetailList: Array<TimeSheetDetail> = payload.timeSheetDetailList;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];
      let timeSheetDays = timeSheet ? { ...TimeSheetUtil.timeSheetDaysAsObj(timeSheet.TimeSheetDays) } : {};

      for (const newDetail of timeSheetDetailList) {
        timeSheetDays = {
          ...timeSheetDays,
          [newDetail.TimeSheetDayId]: {
            ...timeSheetDays[newDetail.TimeSheetDayId],
            TimeSheetDetails: {
              ...TimeSheetUtil.timeSheetDetailsAsObj(timeSheetDays[newDetail.TimeSheetDayId].TimeSheetDetails),
              [newDetail.Guid]: newDetail
            }
          }
        };
      }

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: timeSheetDays
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailDelete: {
      const payload = action as TimeSheetAction.TimeSheetDetailDelete;
      const timeSheetId = payload.timeSheetId;
      const timeSheetDetailGuid = payload.timeSheetDetailGuid;
      const timeSheetDayId = payload.timeSheetDayId;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];
      const timeSheetDay: TimeSheetDay = timeSheet && timeSheet.TimeSheetDays ? timeSheet.TimeSheetDays[timeSheetDayId] : null;
      const timeSheetDetails = timeSheetDay ? { ...timeSheetDay.TimeSheetDetails } : {};

      delete timeSheetDetails[timeSheetDetailGuid];

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: {
              ...currState.timeSheets[timeSheetId].TimeSheetDays,
              [timeSheetDayId]: {
                ...currState.timeSheets[timeSheetId].TimeSheetDays[timeSheetDayId],
                TimeSheetDetails: timeSheetDetails
              }
            }
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailDeleteList: {
      const payload = action as TimeSheetAction.TimeSheetDetailDeleteList;
      const timeSheetId = payload.timeSheetId;
      const timeSheetDetailGuidList = payload.timeSheetDetailGuidList;
      const timeSheet: TimeSheet = currState.timeSheets[timeSheetId];
      let timeSheetDays = timeSheet ? { ...TimeSheetUtil.timeSheetDaysAsObj(timeSheet.TimeSheetDays) } : {};

      for (const deleteItem of timeSheetDetailGuidList) {
        if (timeSheetDays[deleteItem.DayId] && timeSheetDays[deleteItem.DayId].TimeSheetDetails) {
          const timeSheetDetails = { ...TimeSheetUtil.timeSheetDetailsAsObj(timeSheetDays[deleteItem.DayId].TimeSheetDetails) };
          delete timeSheetDetails[deleteItem.Guid];
          timeSheetDays = {
            ...timeSheetDays,
            [deleteItem.DayId]: {
              ...timeSheetDays[deleteItem.DayId],
              TimeSheetDetails: timeSheetDetails
            }
          };
        }
      }

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: timeSheetDays
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailClearAllDetails: {
      const payload = action as TimeSheetAction.TimeSheetDetailClearAllDetails;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheet: TimeSheet = timeSheetId ? currState.timeSheets[timeSheetId] : null;
      const timeSheetDaysObj: { [id: number]: TimeSheetDay } = timeSheet ? { ...TimeSheetUtil.timeSheetDaysAsObj(timeSheet.TimeSheetDays) } : {};

      for (const key of Object.keys(timeSheetDaysObj)) {
        timeSheetDaysObj[key] = {
          ...timeSheetDaysObj[key],
          TimeSheetDetails: {}
        };
      }

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: timeSheetDaysObj
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailSortCapsuleList: {
      const payload = action as TimeSheetAction.TimeSheetDetailSortCapsuleList;
      const timeSheetId: number = payload.timeSheetId;
      const rateTypes: Array<CodeValue> = payload.rateTypes;
      const timeSheet: TimeSheet = timeSheetId ? currState.timeSheets[timeSheetId] : null;
      let timeSheetDaysList: Array<TimeSheetDay> = timeSheet ? TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays) : [];

      timeSheetDaysList = timeSheetDaysList.map((day: TimeSheetDay, index: number) => {
        const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
        TimeSheetUtil.sortTimeSheetDetailList(timeSheetDetailList, rateTypes);
        return {
          ...day,
          TimeSheetDetails: TimeSheetUtil.timeSheetDetailsAsObj(timeSheetDetailList)
        };
      });

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: TimeSheetUtil.timeSheetDaysAsObj(timeSheetDaysList)
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailSetProjects: {
      const payload = action as TimeSheetAction.TimeSheetDetailSetProjects;
      const timeSheetId: number = payload.timeSheetId;
      const projectList: Array<Project> = payload.projectList;
      const timeSheet: TimeSheet = timeSheetId ? currState.timeSheets[timeSheetId] : null;
      let timeSheetDaysList: Array<TimeSheetDay> = timeSheet ? TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays) : [];

      timeSheetDaysList = timeSheetDaysList.map((day: TimeSheetDay, index: number) => {
        let timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
        timeSheetDetailList = timeSheetDetailList.map((detail: TimeSheetDetail, index2: number) => {
          return {
            ...detail,
            Project: projectList.find((p: Project) => p.Id === detail.ProjectId)
          };
        });
        return {
          ...day,
          TimeSheetDetails: TimeSheetUtil.timeSheetDetailsAsObj(timeSheetDetailList)
        };
      });

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: TimeSheetUtil.timeSheetDaysAsObj(timeSheetDaysList)
          }
        }
      };
    }

    case TimeSheetAction.type.TimeSheetDetailSetAllStyles: {
      const payload = action as TimeSheetAction.TimeSheetDetailSetAllStyles;
      const timeSheetId: number = payload.timeSheetId;
      const timeSheet: TimeSheet = timeSheetId ? currState.timeSheets[timeSheetId] : null;
      const lineManagement: TimeSheetLineManagement = currState.lineManagement;
      const capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration> = lineManagement ? lineManagement.capsuleConfigurationList : null;
      const capsuleStyleList: Array<TimeSheetCapsuleStyle> = lineManagement ? lineManagement.capsuleStyleList : null;
      let timeSheetDaysList: Array<TimeSheetDay> = timeSheet ? TimeSheetUtil.timeSheetDaysAsList(timeSheet.TimeSheetDays) : [];

      timeSheetDaysList = timeSheetDaysList.map((day: TimeSheetDay, index: number) => {
        let timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
        timeSheetDetailList = timeSheetDetailList.map((detail: TimeSheetDetail, index2: number) => {
          return {
            ...detail,
            styleId: TimeSheetUtil.getTimeSheetDetailStyleId(capsuleConfigurationList, capsuleStyleList, detail.RateTypeId, detail.Project)
          };
        });
        return {
          ...day,
          TimeSheetDetails: TimeSheetUtil.timeSheetDetailsAsObj(timeSheetDetailList)
        };
      });

      return {
        ...currState,
        timeSheets: {
          ...currState.timeSheets,
          [timeSheetId]: {
            ...currState.timeSheets[timeSheetId],
            TimeSheetDays: TimeSheetUtil.timeSheetDaysAsObj(timeSheetDaysList)
          }
        }
      };
    }

    default: {
      return currState;
    }
  }
};
