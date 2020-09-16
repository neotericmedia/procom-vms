export interface UserProfileNavigationHistory {
    Id: number;
    UserProfileId: number;
    NavigationId?: number;
    CreatedDateTime: Date;
}


export interface NavigationMenuItem {
    Id: number;
    ParentId?: number;
    Value?: string;
    Description?: string;
    State?: string;
    SortOrder: number;
    Icon?: string;
    Color?: string;
    Code?: string;
    HasChildren: boolean;
    Children: Array<NavigationMenuItem>;
    IsOpen: boolean;
}

export interface Navigation {
    LandingState: string;
    NavigationItems: Array<NavigationMenuItem>;
}
