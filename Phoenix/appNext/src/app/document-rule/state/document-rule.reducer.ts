import { DocumentRuleActions } from './document-rule.action';
import { IDocumentRule } from './document-rule.interface';

interface IDocumentRuleState {
    documentRules: { [Id: number]: IDocumentRule };
    loading: boolean;
    error: any;
}

const profileInitials: IDocumentRuleState = {
    documentRules: {},
    loading: false,
    error: null
};

export const documentsRulesReducer = (currState: IDocumentRuleState = profileInitials, action: DocumentRuleActions.action): IDocumentRuleState => {
    switch (action.type) {
        case DocumentRuleActions.type.DocumentRuleLoadStarted: {
            const payload = action as DocumentRuleActions.DocumentRuleLoadStarted;
            console.log(`documentsRulesReducer: type:${payload.type}, Id:${payload.Id}`);
            return currState;
        }
        case DocumentRuleActions.type.DocumentRuleLoadError: {
            const payload = action as DocumentRuleActions.DocumentRuleLoadError;
            console.log(`documentsRulesReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
            return {
                ...currState,
                documentRules: {},
                loading: false,
                error: payload.error
            };
        }

        case DocumentRuleActions.type.DocumentRuleAdd: {
            const payload = action as DocumentRuleActions.DocumentRuleAdd;
            console.log(`documentsRulesReducer: type:${payload.type}, Id:${payload.Id}, organization.Id:${payload.documentRule == null ? null : 1}`);
            return {
                ...currState,
                documentRules: { ...currState.documentRules, [payload.Id]: payload.documentRule },
                loading: false,
                error: null
            };
        }
        case DocumentRuleActions.type.DocumentRuleDelete: {
            const payload = action as DocumentRuleActions.DocumentRuleDelete;
            console.log(`documentsRulesReducer: type:${payload.type}, Id:${payload.Id}`);
            const documentRules = { ...currState.documentRules };
            delete documentRules[payload.Id];
            return {
                ...currState,
                documentRules: documentRules
            };
        }
        case DocumentRuleActions.type.DocumentRuleUpdate: {
            const payload = action as DocumentRuleActions.DocumentRuleUpdate;
            if (!payload.documentRule) {
                return currState;
            }
            console.log(`documentsRulesReducer: type:${payload.type}, Id:${payload.documentRule.Id}, payload:${payload}`);
            return {
                ...currState,
                documentRules: {
                    ...currState.documentRules,
                    [payload.documentRule.Id]: payload.documentRule
                }
            };
        }
        default: {
            return currState;
        }
    }
};
