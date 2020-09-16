import { ExpenseCategoryFieldListValue } from './index';
import { PhxConstants } from '../../common';

export interface ExpenseItemFieldValue {
    Id: number;
    ExpenseItemId: number;
    ExpenseCategoryFieldDefinitionId: number;
    ExpenseCategoryFieldListValueId?: number;
    ExpenseCategoryFieldTextValue: string;
    ExpenseCategoryFieldFinalValue: string;
    ExpenseCategoryFieldUIControlTypeId: number;
    ExpenseCategoryFieldTypeId: PhxConstants.ExpenseCategoryFieldType;
    ExpenseCategoryFieldDefinitionTitle: string;
    ExpenseCategoryFieldDefinitionIsMandatory: boolean;
    ExpenseCategoryFieldDefinitionOrder: number;
    IsDraft: boolean;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    ListValues: Array<ExpenseCategoryFieldListValue>;
}
