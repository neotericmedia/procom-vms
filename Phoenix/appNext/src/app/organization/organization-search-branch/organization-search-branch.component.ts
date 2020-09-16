// angular
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
// common
import { CommonService } from '../../common/index';
import { NavigationService } from './../../common/services/navigation.service';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { WindowRefService } from '../../common/index';
// branch
import { OrganizationBranchService } from './../organization.branch.service';

declare var oreq: any;
@Component({
  selector: 'app-organization-search-branch',
  templateUrl: './organization-search-branch.component.html',
  styleUrls: ['./organization-search-branch.component.less']
})
export class OrganizationSearchBranchComponent implements OnInit {
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  pageTitle: string = 'Branch List';
  dataSourceUrl: string = 'branch/list';
  dataGridComponentName: string = 'OrganizationBranchListSearch';
  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'ID',
      summaryType: PhxDataTableSummaryType.Count
    })
  ];
  columns: Array<PhxDataTableColumn>;
  canCreate: boolean;
  constructor(
    private commonService: CommonService,
    private branchService: OrganizationBranchService,
    private navigationService: NavigationService,
    private winRef: WindowRefService,
    private router: Router
  ) {
    //
  }

  ngOnInit() {
    console.log(this.constructor.name + '.ngOnInit() ' + new Date().toTimeString());
    this.branchService.getCanCreate()
      .do((value) => {
        this.canCreate = value;
      }, (error) => {
      })
      .retryWhen(errors => errors.delay(1000).take(5).concat(Observable.throw('error')))
      .subscribe(
        value => {
          this.canCreate = !!value;
        },
        error => {
          this.canCreate = false;
        },
        () => {
        }
      );

    this.navigationService.setTitle('administration-branches');
    this.columns = this.buildColumns();
  }


  buildColumns(): Array<PhxDataTableColumn> {
    return [
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: 'ID',
        fixed: true,
        width: 100,
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'Code',
        caption: 'Branch Code'
      }),
      new PhxDataTableColumn({
        dataField: 'Name',
        caption: 'Branch Name'
      }),
      new PhxDataTableColumn({
        dataField: 'Description',
        caption: 'Branch Description'
      }),

    ];
  }

  createNewOrgBranch() {
    this.router.navigate(['/next', 'organization', 'branch', 0]);
  }
  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.viewOrgBranchDetails(event.currentSelectedRowKeys[0]);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewOrgBranchDetails(item: any) {
    this.router.navigate(['/next', 'organization', 'branch', item.Id]);
  }
  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/org/branch/${item.Id}`, '_blank');
  }
}
