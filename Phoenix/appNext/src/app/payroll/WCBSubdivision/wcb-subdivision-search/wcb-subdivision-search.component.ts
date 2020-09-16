import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../../common/services/navigation.service';
import { CommonService } from '../../../common/index';
import { CodeValueService } from '../../../common/services/code-value.service';
import { CodeValue } from '../../../common/model/code-value';
import { Subscription } from 'rxjs/Subscription';
import { SortArrayOfObjectsPipe } from '../../../common/pipes/sortArrayOfObjects.pipe';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../../common/model/index';
import { PhxDataTableSummaryItem } from './../../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../../common/model/data-table/phx-data-table-column';

import { Http, HttpModule } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';

import { WindowRefService } from '../../../common/index';
@Component({
  selector: 'app-wcb-subdivision-search',
  templateUrl: './wcb-subdivision-search.component.html',
  styleUrls: ['./wcb-subdivision-search.component.less']
})
export class WcbSubdivisionSearchComponent implements OnInit, OnDestroy {

  codeValueGroups: any;
  ApplicationConstants: any;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };

  // tslint:disable-next-line:max-line-length
  odataParams: string = `$filter=WCBSubdivisionVersions/any(v: v/StatusId eq '2')&$expand=WCBSubdivisionVersions&$top=20&$select=Id,SubdivisionId,LastModifiedDatetime,WCBSubdivisionVersions`;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      caption: 'ID',
      dataType: 'number',
      alignment: 'left',
      width: 100,
    }),


    new PhxDataTableColumn({
      dataField: 'SubdivisionId',
      caption: 'Province / State',
      lookup: {
        dataSource: this.getSubdivision(),
        valueExpr: 'value',
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
    private orderBy: SortArrayOfObjectsPipe,
    private winRef: WindowRefService,
  ) { this.codeValueGroups = this.commonService.CodeValueGroups; }

  ngOnInit() {
      this.navigationService.setTitle("workercompensation-rate-manage");
  }

  ngOnDestroy() {

  }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1 && event.currentSelectedRowKeys[0].Id) {
      const wcbHeader: any = event.currentSelectedRowKeys[0];
      const shortList = this.getShortList(wcbHeader);
      if (shortList && shortList.length > 0) {
        this.viewWCBSubdivision(shortList[0].Id);
      } else {
        console.error('Shortlist is empty!', event);
      }
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  private getShortList(wcbHeader: any) {   // Selects the Active items that are nearest to today;
    let shortList = wcbHeader.WCBSubdivisionVersions.filter(v => v.StatusId === 2 && v.EffectiveDate < (new Date()));
    shortList = shortList.length === 0
      ? wcbHeader.WCBSubdivisionVersions.filter(v => v.StatusId === 2)
      : shortList;

    this.orderBy.transform(shortList, '-EffectiveDate');
    return shortList;
  }

  viewWCBSubdivision(wcbsid) {
    this.router.navigate(['/next', 'payroll', 'wcbsubdivision', 'details', wcbsid])
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/next/payroll/wcbsubdivision/details/${this.getShortList(item)[0].Id}`, '_blank');
  }


  getSubdivision() {
    return this.codeValueService.getCodeValues('geo.CodeSubdivision', true)
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
          value: codeValue.id
        };
      });
  }



  newWCBSubdivision() {
    console.log('add New WCB Subdivision');
    this.router.navigate(['/next', 'payroll', 'wcbsubdivision', 'details', '0']);

  }
}


