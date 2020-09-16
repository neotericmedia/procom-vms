import { BatchOperation } from './../../model/batch-operation';
import { WorkflowAction } from './../../model/workflow-action';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PhxConstants } from '../../index';

@Component({
  selector: 'app-phx-batch-operation-buttons',
  templateUrl: './phx-batch-operation-buttons.component.html',
  styleUrls: ['./phx-batch-operation-buttons.component.less']
})

export class PhxBatchOperationButtonsComponent implements OnInit {
  @Output() callBatchOperation = new EventEmitter<BatchOperation>();

  @Input() disabled: boolean = false;
  @Input() valid: boolean = true;

  _batchOperations: BatchOperation[];
  get batchOperations(): BatchOperation[] {
    return this._batchOperations;
  }

  @Input('batchOperations')
  set batchOperations(value: BatchOperation[]) {
    this._batchOperations = value;
    this.actionMap.clear();

    if (value != null) {
      value.forEach((operation: BatchOperation) => {
        const action: WorkflowAction = {
          WorkflowPendingTaskId: null,
          PendingCommandName: 'WorkflowExecuteUserTask',
          IsActionButton: true,
          TaskResultId: PhxConstants.TaskResult.Complete,
          TaskRoutingDialogTypeId: operation.TaskRoutingDialogTypeId,
          Id: -1,
          Name: operation.Name,
          CommandName: operation.CommandName,
          DisplayButtonOrder: operation.DisplayButtonOrder,
          DisplayHistoryEventName: null
        };
        action['IsPrimaryAction'] = operation.IsPrimaryAction; // TODO: integrate button style logic into workflow
        this.actionMap.set(action, operation);
      });

      this.workflowActionButtons = Array.from(this.actionMap.keys());

    } else {
      this.workflowActionButtons = [];
    }
  }

  actionMap: Map<WorkflowAction, BatchOperation> = new Map<WorkflowAction, BatchOperation>();

  workflowActionButtons: WorkflowAction[] = [];

  constructor() { }

  ngOnInit() {
  }

  executeBatchOperation(action: WorkflowAction) {
    const batchOperation: BatchOperation = this.actionMap.get(action);

    if (batchOperation) {
      batchOperation.Comments = action.Comments;
      this.callBatchOperation.emit(batchOperation);
    }
  }

  getActionButtonCssClass(action: WorkflowAction) {
    return action['IsPrimaryAction'] ? 'primary' : 'secondary';
  }

}
