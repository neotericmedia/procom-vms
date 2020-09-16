import { CustomFieldValue } from './../../common/model/index';
import { Project } from '../../project/model/index';

export interface TimeSheetDetail {
    Guid: string;
    Id: number;
    RateTypeId: number;
    RateUnitId: number;
    UnitAmount: number;
    LastModifiedByProfileId?: number;
    LastModifiedDatetime?: Date;
    CreatedByProfileId?: number;
    CreatedDatetime?: Date;
    IsDraft?: boolean;
    TimeSheetDayId: number;
    Note?: string;
    ProjectId?: number;
    Project?: Project;
    ProjectVersionIdAtSubmission?: number;
    CustomFieldValues: Array<CustomFieldValue>;
    styleId?: number;
}
