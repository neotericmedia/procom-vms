import { ComplianceTemplateState } from './compliance-template.interface';
import { complianceTemplateInitial } from './compliance-template.initial';
import { complianceTemplateActions } from './compliance-template.actions';


export const complianceTemplateReducer = (
    currState: ComplianceTemplateState = complianceTemplateInitial,
    action: { type: string, payload?: any }) => {

    const newState: ComplianceTemplateState = JSON.parse(JSON.stringify(currState));
    const payload = JSON.parse(JSON.stringify(action.payload));

    switch (action.type) {

        case complianceTemplateActions.complianceTemplate.updateState:
            {
                newState.complianceTemplates[payload.Id] = payload;
                break;
            }
        case complianceTemplateActions.uiState.setEditMode: {
            if (newState.uiState[payload.id] == null) {
                newState.uiState[payload.id] = { editable: false };
            }
            newState.uiState[payload.id].editable = payload.editable;
            break;
        }

    }

    return newState;
};



