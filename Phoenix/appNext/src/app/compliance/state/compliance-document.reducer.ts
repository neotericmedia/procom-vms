import { ComplianceDocumentActions } from './compliance-document.action';
import { IComplianceDocumentDto } from '../shared/compliance-document.model';

interface IComplianceDocumentState {
  complianceDocuments: Array<IComplianceDocumentDto>;
}

const complianceDocumentInitials: IComplianceDocumentState = {
  complianceDocuments: []
};

export const complianceDocumentReducer = (currState: IComplianceDocumentState = complianceDocumentInitials, action: ComplianceDocumentActions.action): IComplianceDocumentState => {
  switch (action.type) {
    case ComplianceDocumentActions.type.ComplianceDocumentLoadList: {
      const payload = action as ComplianceDocumentActions.ComplianceDocumentLoadList;
      return {
        ...currState,
        complianceDocuments: payload.docList
      };
    }
    case ComplianceDocumentActions.type.ComplianceDocumentClearList: {
      return {
        ...currState,
        complianceDocuments: null
      }; // should not be []
    }
    case ComplianceDocumentActions.type.ComplianceDocumentUpdateState: {
      const payload = action as ComplianceDocumentActions.ComplianceDocumentUpdateState;
      const docId = payload && payload.doc ? payload.doc.ComplianceDocumentId : null;
      return {
        ...currState,
        complianceDocuments: currState.complianceDocuments.map(doc => {
          if (doc.ComplianceDocumentId === docId) {
            return {
              ...doc,
              ...payload.doc
            };
          } else {
            return doc;
          }
        })
      };
    }
    case ComplianceDocumentActions.type.ComplianceDocumentUpdateAvailableStateActions: {
      const payload = action as ComplianceDocumentActions.ComplianceDocumentUpdateAvailableStateActions;
      return {
        ...currState,
        complianceDocuments: currState.complianceDocuments.map(doc => {
          if (doc.ComplianceDocumentId === payload.docId) {
            return {
              ...doc,
              AvailableStateActions: payload.availableStateActions
            };
          } else {
            return doc;
          }
        })
      };
    }

    default: {
      return currState;
    }
  }
};
