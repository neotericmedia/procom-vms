import { Component, OnInit, Input, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';

import { StateService } from '../../common/state/service/state.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { PayrollService } from '../payroll.service';
import { CommonService, ApiService } from './../../common/index';

@Component({
  selector: 'app-payroll-remittance-batch',
  templateUrl: './payroll-remittance-batch.component.html',
  styleUrls: ['./payroll-remittance-batch.component.less']
})
export class PayrollRemittanceBatchComponent implements OnInit {
  organizationIdInternal: number;
  organizationName: string;  
  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  odataParams: string = '$select=Id,OrganizationIdInternal,RemittanceDate,BatchNumber,RemittanceTypeId,RemittanceTransactionBatchStatusId,TotalAmount,CurrencyId';
  dataSourceUrl: string;
  workflowPendingTaskId: number;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true
  });
  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
          dataField: 'BatchNumber',
          caption: 'Batch Number',
          dataType: 'number',
          width: '120px'
      }),
    new PhxDataTableColumn({
      dataField: 'RemittanceDate',
      caption: 'Remittance Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'RemittanceTypeId',
      caption: 'Remittance Type',
      dataType: 'number',
      lookup: {
        dataSource: this.getCodeValue('payroll.CodeRemittanceType'),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'RemittanceTransactionBatchStatusId',
      caption: 'Batch Status',
      dataType: 'number',
      lookup: {
        dataSource: this.getCodeValue('payroll.CodeRemittanceTransactionBatchStatus'),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'TotalAmount',
      caption: 'Total Amount',
      alignment: 'right',
      cellTemplate: 'viewFormattedTotalAmount',
      dataType: 'money'
    })
  ];

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private codeValueService: CodeValueService,
    private navigationService: NavigationService,
    public commonService: CommonService,
    private payrollService: PayrollService,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.activeRoute.params.subscribe((values: { organizationIdInternal: number }) => { this.organizationIdInternal = values.organizationIdInternal; });
    this.payrollService.getOrganizationName(this.organizationIdInternal)
      .subscribe((response) => {
        this.organizationName = response.Items[0].LegalName;
          this.navigationService.setTitle('remittance-batch', [this.organizationName]);
      });

    this.dataSourceUrl = 'payroll/getRemittanceBatch/' + this.organizationIdInternal;
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

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.viewPayrollSourceDeductions(event.currentSelectedRowKeys[0]);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  public viewPayrollSourceDeductions(batch: any) {    
        this.router.navigateByUrl('/next/payroll/remittancebatch/' + batch.OrganizationIdInternal + '/batch/' + batch.Id);
  }

  public displayCurrency(currencyId) {
    return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
  }
}
