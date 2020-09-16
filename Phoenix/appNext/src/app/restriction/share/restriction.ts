export interface SelectedRestrictionType {
    RestrictionTypeId: number;
    RestrictionTypeName: string;
    RestrictionTypeCode: string;
    IsInclusive?: boolean;
    SelectedRestrictions: SelectedRestriction[];
}

export interface SelectedRestriction {
    Name: string;
}
