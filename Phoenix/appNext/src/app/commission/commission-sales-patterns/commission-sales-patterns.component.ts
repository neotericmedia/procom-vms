import { PhxConstants } from './../../common/model/phx-constants';
import { Component, OnInit, Inject } from '@angular/core';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { NavigationService } from '../../common/services/navigation.service';
import { WindowRefService } from '../../common/index';
import { Router } from '@angular/router';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-commission-sales-patterns',
  templateUrl: './commission-sales-patterns.component.html',
  styleUrls: ['./commission-sales-patterns.component.less']
})
export class CommissionSalesPatternsComponent implements OnInit {
  oDataParams: any;
  public summary = null; // fix me
  showButtonNew: boolean;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      caption: 'ID',
      dataType: 'number',
      width: '100px'
    }),
    new PhxDataTableColumn({
      dataField: 'Description',
      caption: 'Description',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'SalesPatternStatusId',
      caption: 'Status',
      dataType: 'string',
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
    private router: Router,
    private authService: AuthService,
  ) { }

  getStatusLookup() {
    return this.codeValueService.getCodeValues('commission.CodeCommissionRateHeaderStatus', true)
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
      this.viewSalesPatternDetail(event.data);
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewSalesPatternDetail(rowdata) {
    this.router.navigate(['/next', 'commission', 'pattern-sales', rowdata.Id]);
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/next/commission/pattern-sales/${item.Id}`, '_blank');
  }

  createSalesPattern() {
    this.router.navigate(['/next', 'commission', 'pattern-sales', 0]);
  }

  ngOnInit() {
    this.navigationService.setTitle('commission-patterns-manage');
    this.oDataParams = oreq.request().withSelect([
      'Id',
      'SalesPatternStatusId',
      'Description',
    ]).url();

    this.showButtonNew = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.CommissionSearchSalesPatterns);
  }
}
