import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { PhxDataTableComponent } from '../../../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableSelectionMode, StateAction, StateActionButtonStyle, PhxConstants } from '../../../../common/model/index';

@Component({
  selector: 'app-vms-documents-details',
  templateUrl: './vms-documents-details.component.html'
})
export class VmsDocumentsDetailsComponent implements OnInit {
  @ViewChild('phxTable') phxTable: PhxDataTableComponent;
  @ViewChild('phxTableDiscard') phxTableDiscard: PhxDataTableComponent;
  @Input() dataSourceUrl: string;
  @Input() document: any;
  @Input() dataTableDiscartedConfiguration: any;
  @Input() oDataParams: any;
  @Input() dataTableConfiguration: any;
  @Input() columns: any;
  @Input() skippedRecords: any[];
  @Input() documentType: string;
  @Output() discardAllConflictsEvent = new EventEmitter();
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();
  @Input() actionId: number;
  StateActions: StateAction[];
  importTypeText: string;

  constructor() {}

  ngOnInit() {
    this.initStateActions();

    this.importTypeText = this.documentType ? this.documentType.replace(/([A-Z])/g, ' $1').trim() : 'Timesheet';
  }

  changeColor(event: any) {
    if (event.rowType === 'data') {
      const VmsImportedRecordType = this.documentType ? `Vms${this.documentType}ImportedRecordTypeId` : 'VmsImportedRecordTypeId';
      if (event.data[VmsImportedRecordType] === 1) {
        event.rowElement.classList.add('pendingRowClass');
      } else if (event.data[VmsImportedRecordType] === 2) {
        event.rowElement.classList.add('conflictRowClass');
      } else if (event.data[VmsImportedRecordType] === 3) {
        event.rowElement.classList.add('discardRowClass');
      } else if (event.data[VmsImportedRecordType] === 5) {
        event.rowElement.classList.add('completeRowClass');
      }
    }
  }

  // discardAllConflicts() {
  //   this.discardAllConflictsEvent.emit('');
  // }

  onRowClick(event: any) {
    this.rowClick.emit(event);
  }
  initStateActions() {
    const self = this;
    self.StateActions = [
        { // Discard records
            displayText: 'Discard All Conflict Records',    // TODO - replace with actionId
            skipSecurityCheck: true,
            style: StateActionButtonStyle.SECONDARY,
            actionId: this.actionId,
            disabledFn: function(action, componentOption) {
              if (self.document && self.document.TotalConflict) {
                return self.document.TotalConflict === 0;
              } else {
                return true;
              }
            },
            onClick: function(action, componentOption, actionOption) {
                // TODO - call new command once state action is ready!!
                self.discardAllConflictsEvent.emit('');
            }
        },
    ];
}

}
