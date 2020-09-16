import { timeSheetReducer } from './time-sheet';
import { timeSheetDocumentReducer } from './time-sheet-document';

export const timeSheetReducers = {
    'timeSheet': timeSheetReducer,
    'timeSheetDocument': timeSheetDocumentReducer,
};
