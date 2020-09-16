import { HashModel } from '../../common/utility/hash-model';
import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldService } from '../../common/services/custom-field.service';

export const DocumentRuleState = {
  reduxDocumentRule: {
    documentRulestance: `reduxDocumentRule.documentRuleInstance`,
    getDocumentRuleByDocumentRuleId: (Id: number) => {
      return {
        documentRuleInstance: `reduxDocumentRule.documentRules.${Id}`
      };
    }
  }
};

export interface IFormGroupSetup {
  hashModel: HashModel;
  toUseHashCode: boolean;
  formBuilder: FormBuilder;
  customFieldService: CustomFieldService;
}
