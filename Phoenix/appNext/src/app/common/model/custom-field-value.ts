import { CustomFieldVersionConfiguration } from './custom-field-version-configuration';
export interface CustomFieldValue {
    Id: number;
    EntityTypeId: number;
    EntityId: number;
    CustomFieldConfigurationId: number;
    CustomFieldVersionConfiguration: CustomFieldVersionConfiguration;
    CustomFieldDataSourceDetailId?: number;
    CustomFieldTextValue: string;
}
