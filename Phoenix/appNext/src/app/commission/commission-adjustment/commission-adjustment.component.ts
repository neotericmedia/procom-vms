import { Component, OnInit, Inject } from '@angular/core';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { StateService } from '../../common/state/service/state.service';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { NavigationService } from '../../common/services/navigation.service';
import { WindowRefService } from '../../common/index';
import { Router } from '@angular/router';
import { PhxConstants } from '../../common/model/phx-constants';

declare var oreq: any;
@Component({
  selector: 'app-commission-adjustment',
  templateUrl: './commission-adjustment.component.html',
  styleUrls: ['./commission-adjustment.component.less']
})
export class CommissionAdjustmentComponent implements OnInit {
  oDataParams: any;
  public summary = null; // fix me
  public ApplicationConstants = PhxConstants;
  commissions: any;
  amountColumnFormat = { type: 'fixedPoint', precision: 2 };

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      caption: 'ID',
      dataType: 'number',
      width: 100
    }),
    new PhxDataTableColumn({
      dataField: 'AdjustmentDate',
      caption: 'Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'Description',
      caption: 'Description',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'ClientCompany',
      caption: 'Client',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'AdjustmentAmountNet',
      caption: 'Amount',
      dataType: 'decimal',
      format: this.amountColumnFormat,
      alignment: 'right'
    }),
    ,
    new PhxDataTableColumn({
      dataField: 'CommissionAdjustmentHeaderStatusId',
      caption: 'Status',
      lookup: {
        dataSource: this.getStatusLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
    })
  ];

  constructor(
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private router: Router
  ) { }

  getStatusLookup() {
    return this.codeValueService.getCodeValues('commission.CodeCommissionAdjustmentHeaderStatus', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }
  public onRowClick(event: any) {
    if (event && event.data) {
      this.viewCommissionDetail(event.data);
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }
  viewCommissionDetail(rowdata) {
    this.router.navigate(['/next', 'commission', 'adjustment', 'edit', rowdata.Id]);
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/next/commission/adjustment/edit/${item.Id}`, '_blank');
  }

  createCommAdj() {
    this.router.navigate(['/next', 'commission', 'adjustment', 'edit', 0]);
  }

  ngOnInit() {
    this.navigationService.setTitle('commission-adjustment-manage');

    this.oDataParams = oreq.request().withSelect([
      'Id',
      'ClientCompany',
      'AdjustmentDate',
      'AdjustmentAmountNet',
      'Description',
      'CommissionAdjustmentHeaderTypeId',
      'CommissionAdjustmentHeaderStatusId',
      'CommissionRecurrency'
    ]).url();

  }
}
