import { PhxConstants } from './phx-constants';

export interface AvailableStateActions {
    EntityId: number;
    EntityTypeId: PhxConstants.EntityType;
    EntityStatusId: number;
    AvailableStateActions: number[];
}
