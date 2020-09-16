import { AccessAction, CustomFieldValue } from './../../common/model/index';
import { ExpenseCategory } from './expense-category';
import { ExpenseItemTaxline } from './expense-item-taxline';
import { ExpenseItemFieldValue } from './expense-item-field-value';

export interface ExpenseItem {
  Id: number;
  ExpenseClaimId?: number;
  ExpenseCategoryTemplateVersionId?: number;
  WorkOrderId?: number;
  ExpenseCategoryId?: number;
  ProjectId?: number;
  ProjectName: string;
  DateIncurred?: Date;
  CountryId?: number;
  SubdivisionId?: number;
  Merchant: string;
  CurrencyId?: number;
  Subtotal: number;
  Tip: number;
  Total: number;
  Note: string;
  IsDraft: boolean;
  LastModifiedByProfileId: number;
  LastModifiedDatetime: Date;
  CreatedByProfileId: number;
  CreatedDatetime: Date;
  CustomFieldValues: Array<CustomFieldValue>;
  TaxLines: Array<ExpenseItemTaxline>;
  FieldValues: Array<ExpenseItemFieldValue>;

  // The result only contains expense category fields not including FieldDefinitions
  ExpenseCategory: ExpenseCategory;

  IsValid: boolean;
  ValidationErrors: string[];
}
