export const timeSheetState = {
    timeSheet: {
        timeSheets: {
            instance: `timeSheet.timeSheets`,
            byId: (timeSheetId: number) => {
                return {
                    instance: `timeSheet.timeSheets.${timeSheetId}`,
                    timeSheetDays: {
                        instance : `timeSheet.timeSheets.${timeSheetId}.TimeSheetDays`,
                        byId: (timeSheetDayId: number) => {
                            return {
                                instance : `timeSheet.timeSheets.${timeSheetId}.TimeSheetDays.${timeSheetDayId}`,
                                timeSheetDetails: {
                                    instance : `timeSheet.timeSheets.${timeSheetId}.TimeSheetDays.${timeSheetDayId}.TimeSheetDetails`,
                                    byGuid: (timeSheetDetailGuid: string) => {
                                        return `timeSheet.timeSheets.${timeSheetId}.TimeSheetDays.${timeSheetDayId}.TimeSheetDetails.${timeSheetDetailGuid}`;
                                    }
                                }
                            };
                        }
                    }
                };
            },
        },
        headers: 'timeSheet.headers',
    },
    lineManagement: {
        instance : `timeSheet.lineManagement`,
        sortMode: `timeSheet.lineManagement.sortMode`,
        sortAsc: `timeSheet.lineManagement.sortAsc`,
        filterText: `timeSheet.lineManagement.filterText`,
        capsuleList: `timeSheet.lineManagement.capsuleList`,
    }
};
