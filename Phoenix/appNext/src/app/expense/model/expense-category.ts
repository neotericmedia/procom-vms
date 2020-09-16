import { ExpenseCategoryFieldDefinition } from './index';

export interface ExpenseCategory {
    Id: number;
    ExpenseCategoryTemplateVersionId?: number;
    DisplayName: string;
    Icon: string;
    ShowTip: boolean;
    ShowMerchant: boolean;
    ShowTax: boolean;
    HelpText: string;
    FieldDefinitions: Array<ExpenseCategoryFieldDefinition>;
}
