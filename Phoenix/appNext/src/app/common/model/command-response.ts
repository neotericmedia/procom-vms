export interface CommandResponse {
    IsValid: boolean;
    EntityId: number;
    EntityTypeIdRedirect: number;
    EntityIdRedirect: number;
    ValidationMessages: Array<string>;
    TaskResultId: number;
    TaskComments: Array<string>;
    ModelState: any;
    ToCompletePreviousTask: boolean;
    IsGlobal: boolean;
    CommandId: string;
    CommandName: string;
    IsOwner: boolean;
}
