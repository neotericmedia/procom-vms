import { DocumentTypeState } from './document-type.interface';
import { documentTypeInitial } from './document-type.initial';
import { documentTypeActions } from './document-type.actions';


export const documentTypeReducer = (
    currState: DocumentTypeState = documentTypeInitial,
    action: { type: string, payload?: any }) => {

    const newState: DocumentTypeState = JSON.parse(JSON.stringify(currState));
    const payload = JSON.parse(JSON.stringify(action.payload));

    switch (action.type) {

        case documentTypeActions.documentType.updateState:
            {
                newState.documentTypes[payload.Id] = payload;
                break;
            }


        case documentTypeActions.uiState.setEditMode: {
            if (newState.uiState[payload.id] == null) {
                newState.uiState[payload.id] = { editable: false };
            }
            newState.uiState[payload.id].editable = payload.editable;
            break;
        }

    }

    return newState;
};



