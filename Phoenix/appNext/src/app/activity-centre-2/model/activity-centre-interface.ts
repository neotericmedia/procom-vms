import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';

export interface IFormGroupSetup {
    formBuilder: FormBuilder;
}

export interface IRoot {
    T2Filter: IT2Filter;
    T3Filter: IT3Filter;
}

export interface IT2Filter {
    AllItem: boolean;
    Count: number;
    Statuses: Array<IStatus>;
}

export interface IT3Filter {
    AllEntities: boolean;
    KeyWord: string;
    StartDate: Date;
    EndDate: Date;
    Client: any;
    TaskOwner: any;
    FilterName: any;
    EntityItems: Array<IEntityItems>;
}

export interface IStatus {
    Count: number;
    DisplayName: string;
    isActive?: boolean;
    EntityStatusMapping: Array<IEntityStatus>;
    GroupKey?: string;
    order?: number;
}

export interface IEntityStatus {
    Count: number;
    EntityStatusId: number;
    EntityTypeId: number;
    CodeValueTableName?: string;
}

export interface IEntityItems {
    EntityTypeId: number;
    Count: number;
    FilterSelected: boolean;
}

export interface IGlobalFilter {
    T1Filter: number;
    T2Filter: Array<any>;
    EntityTypes: Array<any>;
    TaskOwners: Array<any>;
    Clients: Array<any>;
    Groups: Array<any>;
    Users: Array<any>;
    StartDate?: string;
    EndDate?: string;
    SortBy: string;
    SortDirection: string;
    PageSize: number;
}

export interface ISearchStatus {
        Id: number;
        LastModifiedDatetime?: Date;
        ComponentName?: string;
        StateName?: string;
        StateDescription?: string;
        State?: any;
        UserProfileId?: number;
        filterSelected?: boolean;
}

export interface ISortField {
    SortField: string;
    SortDirection: string;
    SortTitle: string;
    isSelected?: boolean;
}


