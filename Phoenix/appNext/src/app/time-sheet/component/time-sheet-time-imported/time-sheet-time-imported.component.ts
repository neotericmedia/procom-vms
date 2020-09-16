import { Component, OnInit, Input } from '@angular/core';
import { TimeSheet } from '../../model';
import { PhxDataTableColumn, PhxDataTableConfiguration, PhxDataTableStateSavingMode } from '../../../common/model';
import { CodeValueService } from '../../../common';
import { CodeValueGroups } from '../../../common/model/phx-code-value-groups';

@Component({
  selector: 'app-time-sheet-time-imported',
  templateUrl: './time-sheet-time-imported.component.html',
  styleUrls: ['./time-sheet-time-imported.component.less']
})
export class TimeSheetTimeImportedComponent implements OnInit {
  @Input() timeSheet: TimeSheet;
  columns: Array<PhxDataTableColumn>;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: false,
    showClearFilterButton: false,
    showSearch: false,
    showColumnChooser: false,
    showGrouping: false,
    stateSavingMode: PhxDataTableStateSavingMode.None
  });

  constructor(private codeValueService: CodeValueService) {}

  ngOnInit() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: 'ID'
      }),
      new PhxDataTableColumn({
        dataField: 'RateTypeId',
        caption: 'Rate Type',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.RateType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'UnitAmount',
        caption: 'Unit',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'RateUnitId',
        caption: 'Rate Unit',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.RateUnit, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      })
    ];
  }
}
