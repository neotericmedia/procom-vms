import { CustomFieldVersionConfiguration } from './index';

export interface CustomFieldVersion {
        Id: number;
        OrganizationId: number;
        EnittyTypeId: number;
        CustomFieldVersionConfigurations: CustomFieldVersionConfiguration[];
}
