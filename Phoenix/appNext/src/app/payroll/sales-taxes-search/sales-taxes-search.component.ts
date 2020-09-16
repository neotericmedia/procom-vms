import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, ApiService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { Subscription } from 'rxjs/Subscription';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../common/model/index';
import { PhxDataTableSummaryItem } from './../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';


import { Router, ActivatedRoute } from '@angular/router';

import { WindowRefService } from '../../common/index';


@Component({
  selector: 'app-sales-taxes-search',
  templateUrl: './sales-taxes-search.component.html',
  styleUrls: ['./sales-taxes-search.component.less']

})
export class SalesTaxesSearchComponent implements OnInit, OnDestroy {

  codeValueGroups: any;
  ApplicationConstants: any;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };

  odataParams: string = `$select=Id,VersionId,TaxId,CountryId`;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      alignment: 'left',
      dataType: 'number',
    }),
    new PhxDataTableColumn({
      dataField: 'TaxId',
      caption: 'Tax Name',
      lookup: {
        dataSource: this.getTaxName(),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'CountryId',
      caption: 'Country',
      lookup: {
        dataSource: this.getCountryName(),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    })
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private apiService: ApiService,
  ) { this.codeValueGroups = this.commonService.CodeValueGroups; }

  ngOnInit() {
    this.navigationService.setTitle('payroll-sales-taxes');
  }

  ngOnDestroy() {

  }

  public onRowClick(event: any) {
    if (event && event.data) {
      this.view(event.data);
    }
  }

  view(item) {
    this.apiService.query(`payroll/salestax/latestVersionId/${item.Id}`)
      .then((latestVersionId: number) => {
        this.viewSalesTaxes(item.Id, latestVersionId);
      }).catch((err) => {
        this.viewSalesTaxes(item.Id, item.VersionId);
      });
  }

  viewSalesTaxes(headerId, versionId) {
    this.router.navigate(['/next', 'payroll', 'salesTaxDetails', headerId, 'salesTaxVersion', versionId]);
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/payroll/salesTaxDetails/salesTax/${item.Id}/salesTaxVersion/${item.VersionId}`, '_blank');
  }

  getTaxName() {
    return this.codeValueService.getCodeValuesSortByCode('app.CodeSalesTax', true);
  }

  getCountryName() {
    return this.codeValueService.getCodeValuesSortByCode('geo.CodeCountry', true);
  }

}


