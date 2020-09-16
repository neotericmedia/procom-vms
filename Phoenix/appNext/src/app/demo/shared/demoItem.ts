export interface DemoItem {
    Id: number;
    DemoId: number;
    StringField: string;
    DateField?: Date;
    DecimalField: number;
    IntegerField: number;
    MultilineStringField: string;
    CountryId?: number;
    SubdivisionId?: number;
    IsDraft: boolean;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
}
