import { CustomFieldDataSourceDetail } from './index';

export interface CustomFieldVersionConfiguration {
        Id: number;
        DisplayName: string;
        Description: string;
        DependencyId?: number;
        UIControlTypeId: number;
        SortOrder: number;
        IsMandatory: boolean;
        ValidationRegex?: any;
        ValidationMessage?: any;
        CustomFieldDataSourceDetails: CustomFieldDataSourceDetail[];
}
