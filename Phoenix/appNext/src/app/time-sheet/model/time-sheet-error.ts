export interface TimeSheetError {
    showErrors: boolean;
    errorType: {
        [name: string]: {
            [name: string]: {
                errorDetail: any;
            };
        };
    };

}
