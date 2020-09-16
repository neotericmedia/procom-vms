export interface ConcurrencyError {
    CommandId: string,
    CommandName: string,
    EntityGuidId: string,
    EntityIsDeleted: boolean,
    GroupingEntityId: number,
    GroupingEntityTypeId: number,
    IsGlobal: boolean,
    Message: string,
    ReferenceCommandName: string,
    TargetEntityId: number,
    TargetEntityTypeId: number,
    TriggerEntityId: number,
    TriggerEntityTypeId: number,
    WorkflowId: number
}
