import { Component, OnInit, Input, ViewChild} from '@angular/core';
import { PhxDataTableComponent } from '../../../../common/components/phx-data-table/phx-data-table.component';

@Component({
  selector: 'app-vms-documents-expense-details',
  templateUrl: './vms-documents-expense-details.component.html'
})
export class VmsDocumentsExpenseDetailsComponent implements OnInit {

  @ViewChild('phxTable') phxTable: PhxDataTableComponent;
  @ViewChild('phxTableDiscard') phxTableDiscard: PhxDataTableComponent;
  @Input() dataSourceUrl: string ;
  @Input() document: any ;
  @Input() dataTableDiscartedConfiguration: any ;
  @Input() oDataParams: any ;
  @Input() dataTableConfiguration: any ;
  @Input() columns: any ;

  constructor() { }

  ngOnInit() {
  }

  changeColor(event: any) {
    if (event.rowType === 'data') {
      if (event.data.VmsExpenseImportedRecordTypeId === 3) {
        event.rowElement.classList.add('testRowClass');
      }
    }
  }

}
