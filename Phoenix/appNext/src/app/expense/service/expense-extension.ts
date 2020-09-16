import { ExpenseItem } from '../model/expense-Item';
import { PhxConstants } from '../../common';

export class ExpenseExtension {
    public static calculateSubTotal(item: ExpenseItem) {
        const milageNumberOfUnits = this.getExpenseItemFieldValue(item, PhxConstants.ExpenseCategoryFieldType.MilageNumberOfUnits);
        const milageRatePerUnit = this.getExpenseItemFieldValue(item, PhxConstants.ExpenseCategoryFieldType.MilageRatePerUnit);
        const perDiemDailyRate = this.getExpenseItemFieldValue(item, PhxConstants.ExpenseCategoryFieldType.PerDiemDailyRate);
        const perDiemNumberOfDays = this.getExpenseItemFieldValue(item, PhxConstants.ExpenseCategoryFieldType.PerDiemNumberOfDays);

        item.Subtotal = +((milageNumberOfUnits * milageRatePerUnit) + (perDiemDailyRate * perDiemNumberOfDays)).toFixed(2);
    }

    private static getExpenseItemFieldValue(item: ExpenseItem, fieldType: PhxConstants.ExpenseCategoryFieldType): number {
        const fields = item.FieldValues.filter(i => i.ExpenseCategoryFieldTypeId === fieldType);
        if (fields == null || fields.length === 0) {
            return null;
        }

        return +fields[0].ExpenseCategoryFieldTextValue;
    }

    public static calculateTax(subtotal: number, salesTaxVersionRatePercentage: number): number {
        return +((subtotal * (salesTaxVersionRatePercentage || 0)) / 100).toFixed(2);
    }

    public static calculateAllTaxes(item: ExpenseItem) {
        item.TaxLines.forEach((taxLine) => {
            taxLine.Amount = this.calculateTax(item.Subtotal, taxLine.SalesTaxVersionRatePercentage);
        });
    }
}
