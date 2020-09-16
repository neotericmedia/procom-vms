import { PhxConstants } from '../PhoenixCommon.module';
export interface BatchCommand {
  TaskIdsToBatch: number[];
  TaskResultId: PhxConstants.TaskResult;
  NotifyName_BatchOperation_OnBatchMarkered?: string;
  NotifyName_BatchOperation_OnPreExecutionException?: string;
  NotifyName_BatchOperation_OnReleased?: string;
  CommandBatchPreExecutionJsonBody: any; // TODO: type these + allow other data?
  CommandBatchThreadExecutionJsonBody: any; // TODO: type these + allow other data?
  CommandBatchPreExecutionManipulationJsonBody?: any;
}
