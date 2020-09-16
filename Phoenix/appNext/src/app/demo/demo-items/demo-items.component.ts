import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PhxDataTableConfiguration, PhxDataTableColumn, CodeValue } from '../../common/model/index';
import { DemoItem } from '../shared/demoItem';
import { CommonService, CodeValueService } from '../../common/index';

@Component({
  selector: 'app-demo-items',
  templateUrl: './demo-items.component.html',
  styleUrls: ['./demo-items.component.less']
})
export class DemoItemsComponent implements OnInit, OnDestroy {
  @Input() items: Array<DemoItem>;
  @Input() editable: boolean = true;

  decimalColumnFormat = { type: 'fixedPoint', precision: 2 };
  codeValueGroups: any;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'Id',
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'CountryId',
      caption: 'Country',
      lookup: {
        dataSource: this.codeValueService.getCodeValuesSortByText('geo.CodeCountry', true),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'SubdivisionId',
      caption: 'Subdivision',
      lookup: {
        dataSource: this.codeValueService.getCodeValuesSortByText('geo.CodeSubdivision', true),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'IntegerField',
      caption: 'Integer Field',
      dataType: 'number',
    }),
    new PhxDataTableColumn({
      dataField: 'DecimalField',
      caption: 'Decimal Field',
      dataType: 'decimal',
      format: this.decimalColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'MultilineStringField',
      caption: 'Multiline String Field',
    }),
    new PhxDataTableColumn({
      dataField: 'DateField',
      caption: 'Date Field',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'StringField',
      caption: 'String Field',
    }),
  ];

  constructor(
    private commonService: CommonService,
    private codeValueService: CodeValueService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  onRowClick(event: any) {
    if (event && event.data) {
      this.view(event.data.Id);
    }
  }

  view(id) {
    alert(id);
  }

}
