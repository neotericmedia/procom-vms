import { AccessAction } from '../../common/model/index';

export interface SalesTaxVersionRate {
    Id: number;
    SalesTaxVersionId: number;
    SubdivisionId: number;
    IsApplied: boolean;
    RatePercentage?: number;
}

export interface SalesTaxVersion {
    Id: number;
    SalesTaxHeaderId: number;
    TaxVersionStatusId: number;
    EffectiveDate: string;
    SourceId?: number;
    SalesTaxVersionRates: SalesTaxVersionRate[];
}

export interface SalesTax {
    AccessActions: AccessAction[];
    Id: number;
    CountryId: number;
    SalesTaxId: number;
    SalesTaxVersions: SalesTaxVersion[];
    CurrentVersion: SalesTaxVersion;
    AvailableStateActions: Array<number>;
}
