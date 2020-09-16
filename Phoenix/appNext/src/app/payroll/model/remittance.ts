export interface Remittance {

    Id: number;
    WorkerId: number;
    WorkerName: string;
    WorkerOrganizationId: number;
    WorkerOrganizationDisplayName: string;
    WorkerTypeId: number;
    BranchId: number;
    DeductionProvinceId: number;
    LineOfBusinessId: number;
    PaymentTransactionNumber: string;
    PaymenTransactionDate: Date;
    PaymentReleaseDate: Date;
    GrossPay: number;
    SourceDeductionTypeId: number;
    IsEmployer: boolean;
    SourceDeductionAmount: number;
}

