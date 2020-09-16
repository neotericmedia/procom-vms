export interface PaymentRate {
    Id: number;
    PaymentInfoId: number;
    SourceId?: number;
    RateTypeId?: number;
    Rate?: number;
    IsDraft: boolean;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    RateUnitId?: number;
}
