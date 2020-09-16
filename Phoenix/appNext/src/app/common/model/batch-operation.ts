import { PhxConstants } from '../PhoenixCommon.module';
export interface BatchOperation {
    Name: string;
    ConfirmMessage: string;
    SuccessMessage: string;
    TaskRoutingDialogTypeId: PhxConstants.TaskRoutingDialogType;
    CommandName: string;
    DisplayButtonOrder: number;
    IsPrimaryAction: boolean;
    TaskIdsToBatch: number[];
    Comments?: string;
    BatchPreValidationCommandName?: string;
    BatchPreExecutionCommandName: string;
    BatchThreadExecutionCommandName: string;
    TaskResultId: PhxConstants.TaskResult;
}
