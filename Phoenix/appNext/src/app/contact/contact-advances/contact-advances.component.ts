import { Component, OnInit, Input, Inject, Output, EventEmitter, ViewChild } from '@angular/core';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';

import { CodeValueService } from '../../common/services/code-value.service';
import { CommonService } from '../../common/index';
import { CodeValue } from '../../common/model/code-value';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';

@Component({
  selector: 'app-contact-advances',
  templateUrl: './contact-advances.component.html',
  styleUrls: ['./contact-advances.component.less']
})

export class ContactAdvancesComponent implements OnInit {

  @Input() userProfileId: number;
  @Output() outputEvent = new EventEmitter();
  @ViewChild('grid') grid: PhxDataTableComponent;
  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  odataParams: string = '$select=Id,Description,AmountInitial,PaidAmount,PaybackRemainder,CurrencyId,AdvanceStatusId';
  dataSourceUrl: string;
  workflowPendingTaskId: number;
  showSlider: boolean = false;
  paymentId: number;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true
  });
  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'Id',
      dataType: 'number',
      sortOrder: 'asc',
    }),
    new PhxDataTableColumn({
      dataField: 'Description',
      caption: 'Description',
      dataType: 'string',
      sortIndex: 0,
    }),
    new PhxDataTableColumn({
      dataField: 'AmountInitial',
      caption: 'Advance Amount',
      alignment: 'right',
      dataType: 'decimal',
      cellTemplate: 'viewFormattedAmountInitial',
    }),
    new PhxDataTableColumn({
      dataField: 'PaidAmount',
      caption: 'Amount Paid',
      alignment: 'right',
      dataType: 'decimal',
      cellTemplate: 'viewFormattedPaidAmount',
    }),
    new PhxDataTableColumn({
      dataField: 'PaybackRemainder',
      caption: 'Amount Remaining',
      alignment: 'right',
      dataType: 'decimal',
      cellTemplate: 'viewFormattedPaybackRemainder',
    }),
    new PhxDataTableColumn({
      dataField: 'AdvanceStatusId',
      caption: 'Status',
      lookup: {
        dataSource: this.getCodeValue('trn.CodeAdvanceStatus'),
        valueExpr: 'text',
        displayExpr: 'text'
      },
    }),
  ];

  constructor(
    private codeValueService: CodeValueService,
    public commonService: CommonService
  ) { }

  ngOnInit() {
    this.dataSourceUrl = 'UserProfile/getProfileAdvances/profile/' + this.userProfileId;
  }

  getCodeValue(codeTable: string) {
    return this.codeValueService.getCodeValues(codeTable, true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          id: codeValue.id,
          code: codeValue.code,
        };
      });
  }

  getAdvanceStatusLookup() {
    const codeValues = this.codeValueService.getCodeValues('trn.CodeAdvanceStatus', true)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const subscriptions = codeValues.map((d) => {
      return {
        text: d.text,
        value: d.id
      };
    });
    return subscriptions;
  }

  public onRowClick(event: any) {
    this.outputEvent.emit(event.data.Id);
  }

  public displayCurrency(currencyId) {
    return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
  }

  public refresh() {
    this.grid.refresh();
  }

}
