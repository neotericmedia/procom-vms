import { SecurityAction } from './security-action';
import { FunctionalRole } from './functional-role';
export interface UserInfo {
    UserName: string;
    HasRegistered: boolean;
    LoginProvider: string;
    PreferredCultureId: number;
    Profiles: UserProfilePerDbInstance[];
}

export interface UserProfilePerDbInstance {
    DatabaseId: number;
    InstanceName: string;
    ContactId: number;
    ProfileId: number;
    FirstName: string;
    LastName: string;
    PrimaryEmail: string;
    CultureId: number;
    ProfileTypeId: number;
    ProfileStatusId: number;
    IsPrimary: boolean;
    OrganizationId: number;
}

export interface UserContext {
    IsLoggedIn: boolean;
    User: User;
}

export interface User {
    Id: number;
    LoginUserId: number;
    FirstName: string;
    LastName: string;
    CultureId: number;
    UserStatusId: number;
    PersonTitleId: string;
    PreferredPersonTitleId: string;
    PreferredFirstName: string;
    PreferredLastName: string;
    UserProfiles: UserProfile[];
}

export interface UserProfile {
    Id: number;
    DatabaseId: number;
    PrimaryEmail: string;
    ProfileTypeId: number;
    ProfileStatusId: number;
    IsPrimary: boolean;
    OrganizationId: number;
    FunctionalRoles: FunctionalRole[];
    SecurityItems: SecurityAction[];
    FunctionalOperations: number[];
}

export interface BasicUserProfile {
    databaseId: number;
    email: string;
    profileId: number;
    token: string;
    userName: string;
}
