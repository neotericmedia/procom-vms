import { PhxDataTableUserProfile } from '../../common/model/index';

export interface ReportRoutingConfiguration {
    Id: number;
    RouteName: string;
    Routing: string;
    SortOrder: number;
    Condition: string;
    Description: string;
}

export interface ReportListItem {
    Id: number;
    Name: string;
    Icon: string;
    Description: string;
    ReportRoutingConfiguration: Array<ReportRoutingConfiguration>;
    UserViewStates: Array<PhxDataTableUserProfile>;
}
