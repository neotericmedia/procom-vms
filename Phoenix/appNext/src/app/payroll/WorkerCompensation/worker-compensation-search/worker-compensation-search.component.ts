import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../../common/services/navigation.service';
import { CommonService } from '../../../common/index';
import { CodeValueService } from '../../../common/services/code-value.service';
import { CodeValue } from '../../../common/model/code-value';
import { Subscription } from 'rxjs/Subscription';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../../common/model/index';
import { PhxDataTableSummaryItem } from './../../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../../common/model/data-table/phx-data-table-column';

import { Http, HttpModule } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';

import { WindowRefService } from '../../../common/index';


@Component({
  selector: 'app-worker-compensation-search',
  templateUrl: './worker-compensation-search.component.html',
  styleUrls: ['./worker-compensation-search.component.less']
})
export class WorkerCompensationSearchComponent implements OnInit, OnDestroy {

  codeValueGroups: any;
  ApplicationConstants: any;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };

  // tslint:disable-next-line:max-line-length
  odataParams: string = `$select=Id,Name,Code,SubdivisionId,StatusId`;

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
      dataField: 'Name',
      caption: 'Worker Classification',

    }),
    new PhxDataTableColumn({
      dataField: 'SubdivisionId',
      caption: 'Province/State',
      lookup: {
        dataSource: this.getSubdivision(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'StatusId',
      caption: 'Status',
      lookup: {
        dataSource: this.getStatus(),
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
    private winRef: WindowRefService,
  ) { this.codeValueGroups = this.commonService.CodeValueGroups; }

  ngOnInit() {
    this.navigationService.setTitle('payroll-worker-compensation-code');
  }

  ngOnDestroy() {

  }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1 && event.currentSelectedRowKeys[0].Id) {
      this.viewWorkerCompensationCode(event.currentSelectedRowKeys[0].Id);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewWorkerCompensationCode(wcid) {
    this.router.navigate(['/next', 'payroll', 'workercompensation', 'details', wcid]);
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/next/payroll/workercompensation/details/${item.Id}`, '_blank');
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

  getStatus() {
    return this.codeValueService.getCodeValues('payroll.CodeWorkerCompensationStatus', true)
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

  createWorkerCompensationCode() {
    console.log('add New Worker Compensation');
    this.router.navigate(['/next', 'payroll', 'workercompensation', 'new']);

  }
}


