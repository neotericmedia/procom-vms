import { Component, OnInit, Input, Inject, Output, EventEmitter, ViewChild } from '@angular/core';

import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';

import { CodeValueService } from '../../common/services/code-value.service';
import { CommonService } from '../../common/index';
import { CodeValue } from '../../common/model/code-value';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';

@Component({
  selector: 'app-contact-garnishees',
  templateUrl: './contact-garnishees.component.html',
  styleUrls: ['./contact-garnishees.component.less']
})
export class ContactGarnisheesComponent implements OnInit {
  @Input() userProfileId: number;
  @Output() outputEvent = new EventEmitter();

  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  odataParams: string = '$select=Id,Description,PayAmount,PayAmountMaximum,PaidAmount,PaybackRemainder,CurrencyId,GarnisheeStatusId,ProfileTypeId';
  dataSourceUrl: string;
  workflowPendingTaskId: number;
  showSlider: boolean = false;
  paymentId: number;
  @ViewChild('grid') grid: PhxDataTableComponent;
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
      dataField: 'PayAmount',
      caption: 'Payback Amount',
      alignment: 'right',
      dataType: 'decimal',
      cellTemplate: 'viewFormattedPayAmount',
    }),
    new PhxDataTableColumn({
      dataField: 'PayAmountMaximum',
      caption: 'Pay Amount Maximum',
      alignment: 'right',
      dataType: 'decimal',
      cellTemplate: 'viewFormattedPayAmountMaximum',
    }),
    new PhxDataTableColumn({
      dataField: 'PaidAmount',
      caption: 'Paid Amount',
      alignment: 'right',
      dataType: 'decimal',
      cellTemplate: 'viewFormattedPaidAmount',
    }),
    new PhxDataTableColumn({
      dataField: 'PaybackRemainder',
      caption: 'Payback Remainder',
      alignment: 'right',
      dataType: 'decimal',
      cellTemplate: 'viewFormattedPaybackRemainder',
    }),
    new PhxDataTableColumn({
      dataField: 'GarnisheeStatusId',
      caption: 'Status',
      lookup: {
        dataSource: this.getCodeValue('trn.CodeGarnisheeStatus'),
        valueExpr: 'id',
        displayExpr: 'text'
      },
    }),
  ];

  constructor(
    private codeValueService: CodeValueService,
    public commonService: CommonService
  ) { }

  ngOnInit() {
    this.dataSourceUrl = 'UserProfile/getProfileGarnishees/profile/' + this.userProfileId;
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

  getGarnisheeStatusLookup() {
    const codeValues = this.codeValueService.getCodeValues('trn.CodeGarnisheeStatus', true)
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
    if (event && event.data && event.data.ProfileTypeId && event.data.ProfileTypeId === this.commonService.ApplicationConstants.UserProfileType.WorkerTemp) {
      this.outputEvent.emit(event.data.Id);
    } else if (event && event.data && event.data.ProfileTypeId && event.data.ProfileTypeId === this.commonService.ApplicationConstants.UserProfileType.WorkerCanadianSp) {
      this.outputEvent.emit(event.data.Id);
    } else {
      console.error('Selection collection \'e.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  public displayCurrency(currencyId) {
    return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
  }

  public refresh() {
    this.grid.refresh();
  }
}
