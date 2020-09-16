import { WorkflowAction, AccessAction } from '../../common/model/index';

export interface TaxRate {
    Id?: number;
    IncomeFrom: number;
    IncomeTo?: number;
    RatePercentage?: number;
    Constant?: number;
}

export interface FederalTaxVersion {
    WorkflowPendingTaskId?: number;
    WorkflowAvailableActions?: Array<WorkflowAction>;
    Id: number;
    TaxVersionStatusId: number;
    EffectiveDate: string ;
    TD1Minimum: number;
    AbatementRatePercentage: number;
    NonResidentWithholdingPercentage: number;
    CanadaEmploymentAmount: number;
    CreatedDatetime: string;
    FederalTaxRates: TaxRate[];
}


export interface FederalTax {
    AccessActions: AccessAction[];
    AccessLevelId: number;
    Id: number;
    CountryId: number;
    CreatedDatetime: string;
    FederalTaxVersions: FederalTaxVersion[];
}



