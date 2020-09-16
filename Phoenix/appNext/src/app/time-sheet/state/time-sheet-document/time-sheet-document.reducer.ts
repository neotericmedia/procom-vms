import { timeSheetDocumentInitial } from './time-sheet-document.initial';
import { TimeSheetDocumentState } from './time-sheet-document.interface';
import { timeSheetDocumentActions } from './time-sheet-document.action';

export const timeSheetDocumentReducer = (
    currState: TimeSheetDocumentState = timeSheetDocumentInitial,
    action: { type: string, payload?: any }) => {

    const newState = JSON.parse(JSON.stringify(currState));
    const payload = JSON.parse(JSON.stringify(action.payload));

        switch (action.type) {

            case timeSheetDocumentActions.documentList.load : {

                newState.documentList = action.payload;

            }
            break;

            case timeSheetDocumentActions.documentList.delete: {

                newState.documentList = newState.documentList.filter( doc => doc.PublicId !== action.payload.PublicId  );

            }
            break;

            case  timeSheetDocumentActions.documentList.add: {

                newState.documentList.push(action.payload);

            }
            break;

        }

        return newState;

    };
