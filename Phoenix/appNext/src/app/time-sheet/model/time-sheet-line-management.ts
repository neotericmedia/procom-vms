import { TimeSheetRate, TimeSheetCapsule, TimeSheetCapsuleStyle, TimeSheetCapsuleConfiguration, TimeSheetSpotLightMode, TimeSheetLineManagementSortMode } from './index';
import { Project } from '../../project/model';

export interface TimeSheetLineManagement {
    activeRate?: TimeSheetRate;
    activeProject?: Project;
    capsuleList: Array<TimeSheetCapsule>;
    capsuleStyleList: Array<TimeSheetCapsuleStyle>;
    capsuleConfigurationList: Array<TimeSheetCapsuleConfiguration>;
    enableAdd: boolean;
    hasLoaded: boolean;
    sortMode: TimeSheetLineManagementSortMode;
    sortAsc: boolean;
    spotLightMode: TimeSheetSpotLightMode;
    spotLightRateId: number;
    spotLightProjectId: number;
    showAddMenu: boolean;
    filterText?: string;
}
