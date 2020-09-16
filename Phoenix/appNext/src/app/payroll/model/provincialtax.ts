import { AccessAction } from '../../common/model/access-action';

export interface ProvincialTaxRate {
    Id: number;
    IncomeFrom: number;
    IncomeTo: number;
    RatePercentage: number;
    Constant: number;
}

export interface ProvincialSurtaxRate {
    Id: number;
    IncomeFrom: number;
    IncomeTo: number;
    RatePercentage: number;
}

export interface ProvincialHealthPremium {
    Id: number;
    IncomeFrom: number;
    IncomeTo: number;
    RatePercentage: number;
    Constant: number;
}

export interface TaxTypeHealthCare {
    Id: number;
    SourceDeductionTypeId: number;
    IsEligible: boolean;
    EmployeeRatePercentage: number;
}

export interface TaxTypeCanadaPensionPlan {
    Id: number;
    SourceDeductionTypeId: number;
    IsEligible: boolean;
    EmployeeRatePercentage: number;
    EmployerMultiplerPercentage: number;
    MinAge: number;
    MaxAge: number;
    MaxEarnings: number;
    AnnualExemption: number;
}

export interface TaxTypeEmploymentInsurance {
    Id: number;
    SourceDeductionTypeId: number;
    IsEligible: boolean;
    EmployeeRatePercentage: number;
    EmployerMultiplerPercentage: number;
    MaxEarnings: number;
    MaxInsurable: number;
}

export interface TaxTypeParentalInsurancePlan {
    Id: number;
    SourceDeductionTypeId: number;
    IsEligible: boolean;
    EmployeeRatePercentage: number;
    EmployerMultiplerPercentage: number;
    MaxInsurable: number;
}

export interface TaxTypeQuebecPensionPlan {
    Id: number;
    SourceDeductionTypeId: number;
    IsEligible: boolean;
    EmployeeRatePercentage: number;
    EmployerMultiplerPercentage: number;
    MinAge: number;
    MaxAge: number;
    MaxEarnings: number;
    AnnualExemption: number;
}

export interface TaxTypeQuebecTrainingFee {
    Id: number;
    SourceDeductionTypeId: number;
    IsEligible: boolean;
    EmployeeRatePercentage: number;
}

export interface ProvincialTaxVersion {
    WorkflowPendingTaskId?: any;
    WorkflowAvailableActions?: any;
    Id: number;
    TaxVersionStatusId: number;
    EffectiveDate: Date;
    TD1Minimum: number;
    WCBMaximum: number;
    CanadaEmploymentAmount: number;
    CreatedDatetime: Date;
    ProvincialTaxRates: ProvincialTaxRate[];
    ProvincialSurtaxRates: ProvincialSurtaxRate[];
    ProvincialHealthPremiums: ProvincialHealthPremium[];
    TaxTypeHealthCare: TaxTypeHealthCare;
    TaxTypeCanadaPensionPlan: TaxTypeCanadaPensionPlan;
    TaxTypeEmploymentInsurance: TaxTypeEmploymentInsurance;
    TaxTypeParentalInsurancePlan: TaxTypeParentalInsurancePlan;
    TaxTypeQuebecPensionPlan: TaxTypeQuebecPensionPlan;
    TaxTypeQuebecTrainingFee: TaxTypeQuebecTrainingFee;
}

export interface ProvincialTaxHeader {
    AccessActions: AccessAction[];
    AccessLevelId: number;
    Id: number;
    SubdivisionId: number;
    CreatedDatetime: Date;
    ProvincialTaxVersions: ProvincialTaxVersion[];
}

export interface WorkflowAvailableAction {
    WorkflowPendingTaskId: number;
    PendingCommandName: string;
    IsActionButton: boolean;
    TaskResultId: number;
    TaskRoutingDialogTypeId: number;
    Id: number;
    Name: string;
    CommandName: string;
    DisplayButtonOrder: number;
    DisplayHistoryEventName: string;
}

export interface Item {
    WorkflowPendingTaskId: number;
    WorkflowAvailableActions: WorkflowAvailableAction[];
    GroupingEntityTypeId: number;
    GroupingEntityId: number;
    TargetEntityTypeId: number;
    TargetEntityId: number;
}

export interface Workflow {
    Items: Item[];
    NextPageLink?: any;
    Count?: any;
}
