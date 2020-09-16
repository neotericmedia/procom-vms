import { DocumentType } from '../shared/index';

export interface DocumentTypeState {
    documentTypes: { [Id: string]: DocumentType };
    uiState: {
        [Id: string]: { editable: boolean }
    };
}
