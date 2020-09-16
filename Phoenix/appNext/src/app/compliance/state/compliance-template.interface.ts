import { ComplianceTemplate } from '../shared/index';

export interface ComplianceTemplateState {
    complianceTemplates: { [Id: string]: ComplianceTemplate };
    uiState: {
        [Id: string]: { editable: boolean }
    };
}
