import { ExpenseCategoryFieldListValue } from './index';

export interface ExpenseCategoryFieldDefinition {
    Id: number;
    DisplayName: string;
    UIControlTypeId: number;
    IsMandatory: boolean;
    ValidationRegex: string;
    SortOrder: number;
    ListValues: Array<ExpenseCategoryFieldListValue>;
}
