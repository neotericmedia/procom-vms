import { documentTypeReducer } from './document-type.reducer';
import { complianceDocumentReducer } from './compliance-document.reducer';
import { complianceTemplateReducer } from './compliance-template.reducer';

export const complianceReducers = {
  documentType: documentTypeReducer,
  complianceTemplate: complianceTemplateReducer,
  reduxComplianceDocument: complianceDocumentReducer
};

export * from './compliance-document.state';
export * from './document-type.actions';
export * from './document-type.initial';
export * from './document-type.interface';
export * from './document-type.reducer';
export * from './document-type.state-path';

export * from './compliance-template.actions';
export * from './compliance-template.initial';
export * from './compliance-template.interface';
export * from './compliance-template.reducer';
export * from './compliance-template.state-path';
