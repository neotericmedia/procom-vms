import { PhxConstants } from '../../common';

export interface ExpenseItemTaxline {
    Id: number;
    Amount: number;
    SalesTaxId: PhxConstants.SalesTax;
    SalesTaxVersionRateId: number;
    SalesTaxVersionRatePercentage?: number;
}
