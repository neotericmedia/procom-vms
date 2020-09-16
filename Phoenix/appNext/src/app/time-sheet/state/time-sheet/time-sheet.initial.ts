import { TimeSheetState } from './time-sheet.interface';


export const timeSheetInitial: TimeSheetState = {
    timeSheets: {},
    headers: {},
    lineManagement: {
        activeRate: null,
        activeProject: null,
        capsuleList: [],
        capsuleStyleList: [],
        capsuleConfigurationList: [],
        enableAdd: false,
        hasLoaded: false,
        sortMode: null,
        sortAsc: true,
        filterText: null,
        showAddMenu: true,
        spotLightMode: null,
        spotLightRateId: null,
        spotLightProjectId: null
    }
};

