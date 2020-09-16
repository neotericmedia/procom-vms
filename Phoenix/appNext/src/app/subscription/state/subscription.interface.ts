import { PhxConstants, CustomFieldService } from '../../common';
import { HashModel } from '../../common/utility/hash-model';
import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';

export interface ISubscriptionRouterState {
    subscriptionId: number;
    routerPath: PhxConstants.SubscriptionNavigationName;
    roleType?: PhxConstants.OrganizationRoleType;
    roleId?: number;
    url: string;
}

export interface IFormGroupSetup {
    hashModel: HashModel;
    toUseHashCode: boolean;
    formBuilder: FormBuilder;
    customFieldService: CustomFieldService;
}

export interface ISubscriptionValidationError {
    ValidationErrors: Array<string>;
}

export interface IVersion {
    Id: number;
    IsOriginal: boolean;
    SubscriptionStatusId: PhxConstants.AccessSubscriptionStatus;
}

export interface IReadOnlyStorage {
    readonly IsEditable: boolean;
    readonly IsDebugMode: boolean;
    readonly AccessActions: Array<IAccessAction>;
}

export interface IRoot {
    SubscriptionId: number;
    TabSubscription: ITabSubscription;
}


export interface ISubscription {
    AccessActions: IAccessAction[];
    readonly ReadOnlyStorage: IReadOnlyStorage;
    Id: number;
    SourceId?: any;
    ChildId?: any;
    AccessSubscriptionStatusId: number;
    ChildAccessSubscriptionStatusId?: any;
    AccessSubscriptionTypeId?: any;
    IsTimeRestricted: boolean;
    StartDate?: any;
    EndDate?: any;
    OrganizationIdClient?: any;
    OrganizationClient?: any;
    InternalOrganizationDefinition1Id?: any;
    UserProfileIdSubscriber?: any;
    UserProfileSubscriber?: any;
    IsDraft: boolean;
    HasRestrictions: boolean;
    SubscribedTo?: any;
    InternalOrgs: string;
    ClientOrgs: string;
    Branches: string;
    LOBs: string;
    InternalOrgsList: any[];
    ClientOrgsList: any[];
    BranchesList: any[];
    LOBsList: any[];
    AccessSubscriptionRestrictions: IAccessSubscriptionRestriction[];
    WorkflowAvailableActions: IWorkflowAvailableAction[];
    WorkflowPendingTaskId: number;
    Versions?: Array<IVersion>;
    SubscriptionValidationError: Array<ISubscriptionValidationError>;
}

export interface IAccessSubscriptionRestriction {
    Id?: number;
    AccessSubscriptionId?: number;
    SourceId?: any;
    AccessSubscriptionRestrictionTypeId?: number;
    OrganizationIdInternal?: number;
    OrganizationIdClient?: any;
    LineOfBusinessId?: any;
    InternalOrganizationDefinition1Id?: any;
    IsDraft?: boolean;
    LastModifiedByProfileId?: number;
    LastModifiedDatetime?: any;
    CreatedByProfileId?: number;
    CreatedDatetime?: any;
    Name?: string;
    AccessSubscription?: any;
    CreatedByProfile?: any;
    LastModifiedByProfile?: any;
    OrganizationClient?: any;
    OrganizationInternal?: any;
    AccessSubscriptionRestrictionChildren?: any;
    AccessSubscriptionRestrictionSource?: any;
}

export interface IWorkflowAvailableAction {
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

export interface IAccessAction {
    AccessAction: number;
}


export interface ITabSubscription {
    Id: number;
    AccessSubscriptionStatusId?: number;
    ChildAccessSubscriptionStatusId?: any;
    AccessSubscriptionTypeId?: any;
    IsTimeRestricted?: boolean;
    StartDate?: any;
    EndDate?: any;
    UserProfileIdSubscriber: number;
    UserProfileSubscriber: string;
    OrganizationIdClient?: number;
    AccessSubscriptionRestrictions?: IAccessSubscriptionRestriction[];
    InternalOrganizationDefinition1Id?: number;
    DateValid?: boolean;
}

