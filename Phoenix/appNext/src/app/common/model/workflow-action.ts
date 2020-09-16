export interface WorkflowAction {
    WorkflowPendingTaskId?: number;
    PendingCommandName?: string;
    IsActionButton?: boolean;
    TaskResultId?: number;
    TaskRoutingDialogTypeId?: number;
    Id?: number;
    Name?: string;
    CommandName?: string;
    DisplayButtonOrder?: number;
    DisplayHistoryEventName?: string;
    UiView?: string;
    Comments?: string;
    checkValidation?: boolean;
}
