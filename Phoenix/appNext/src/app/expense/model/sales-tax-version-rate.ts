import { PhxConstants } from '../../common';

export interface SalesTaxVersionRate {
    Id: number;
    RatePercentage: number;
    SalesTaxId: PhxConstants.SalesTax;
    SubdivisionId: number;
    TaxVersionStatusId: number;
    EffectiveDate: string;
    HasNumberAssigned: boolean;
    IsApplied: boolean;
}
