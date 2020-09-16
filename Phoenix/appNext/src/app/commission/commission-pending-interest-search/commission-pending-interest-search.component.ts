import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { AuthService } from './../../common/services/auth.service';
import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { CommonService } from '../../common/index';
import { NavigationService } from './../../common/services/navigation.service';
import { Subscription } from 'rxjs/Rx';
import { CommissionService } from './../commission.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { WindowRefService } from '../../common/index';
declare var oreq: any;

@Component({
  selector: 'app-commission-pending-interest-search',
  templateUrl: './commission-pending-interest-search.component.html',
  styleUrls: ['./commission-pending-interest-search.component.less']
})
export class CommissionPendingInterestSearchComponent implements OnInit, OnDestroy {
  reportUserProfileId: number;
  dataSubscription: Subscription;
  paramSubscription: Subscription;
  commissionUsers: any[];
  hasAdministratorView: boolean = false;
  commissionUserProfileId: number;
  displayOwnName: string;
  total: number;
  codeValueGroups: any;
  pageTitle: string = 'Pending Interest Report';
  dataSourceUrl: string;
  dataGridComponentName: string = 'CommissionPendingInterestReportSearch';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'ID',
      summaryType: PhxDataTableSummaryType.Count
    })
  ];
  columns: Array<PhxDataTableColumn>;
  @ViewChild('grid')
  grid: PhxDataTableComponent;
  constructor(
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private commissionService: CommissionService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private winRef: WindowRefService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.paramSubscription = this.route.params.subscribe(params => {
      this.reportUserProfileId = +params['reportUserProfileId'];
      if (this.reportUserProfileId > 0) {
        this.setUpTableWithUserId(this.reportUserProfileId);
      }
    });
  }

  ngOnInit() {
    this.navigationService.setTitle('commission-ipending-interest');
    this.hasAdministratorView = this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.CommissionReportAdministratorView);
    if (!this.hasAdministratorView) {
      this.authService
        .getCurrentProfile()
        .take(1)
        .subscribe(value => {
          this.commissionUserProfileId = value.Id;
          this.setUpTableWithUserId(this.commissionUserProfileId);
          this.authService.getUserContext().then(user => {
            this.displayOwnName = user.User.PreferredFirstName + ' ' + user.User.PreferredLastName;
          });
        });
    }
    this.getCommissionRateHeaderUsers();
    this.columns = this.buildColumns();

    this.dataSubscription = this.route.data.subscribe(d => {});
  }

  getCommissionRateHeaderUsers() {
    const commissionPatternDataParams = oreq
      .request()
      .withSelect(['CommissionUserProfileId', 'CommissionUserProfileFirstName', 'CommissionUserProfileLastName'])
      .url();
    this.commissionService.getCommissionUserProfileListWithRatesOnly(commissionPatternDataParams).subscribe(
      response => {
        this.commissionUsers = this.transformAndSortCommissionUsersForDisplay(response.Items);
      },
      error => {
        console.log(error);
      }
    );
  }
  buildColumns(): Array<PhxDataTableColumn> {
    return [
      new PhxDataTableColumn({
        dataField: 'TransactionNumber',
        caption: 'Transaction'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: 'Worker Name'
      }),
      new PhxDataTableColumn({
        dataField: 'ClientOrganization',
        caption: 'Client'
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceReleaseDate',
        caption: 'Invoice\r\nDate',
        dataType: 'date',
        headerCellTemplate: this.lineBreakCellTemplate
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerPayReleaseDate',
        caption: 'Payment\r\nDate',
        dataType: 'date',
        headerCellTemplate: this.lineBreakCellTemplate
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentAmount',
        caption: 'Payment\r\nAmount',
        headerCellTemplate: this.lineBreakCellTemplate,
        dataType: 'money',
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'DaysPassed',
        caption: 'Days\r\nPassed',
        dataType: 'number',
        headerCellTemplate: this.lineBreakCellTemplate,
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'DaysInterestAccrued',
        caption: 'Interest\r\nDays',
        dataType: 'number',
        headerCellTemplate: this.lineBreakCellTemplate,
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionRate',
        caption: 'Commission\r\nRate',
        dataType: 'decimal',
        headerCellTemplate: this.lineBreakCellTemplate,
        alignment: 'right',
        format: { formatter: this.formatPercentage }
      }),
      new PhxDataTableColumn({
        dataField: 'InterestIncurred',
        caption: 'Interest\r\nIncurred',
        headerCellTemplate: this.lineBreakCellTemplate,
        dataType: 'money',
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'InterestOnTransaction',
        caption: 'Interest On\r\nTransaction',
        headerCellTemplate: this.lineBreakCellTemplate,
        dataType: 'money',
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'InterestToSales',
        caption: 'Interest\r\nTo Sales',
        headerCellTemplate: this.lineBreakCellTemplate,
        dataType: 'money',
        alignment: 'right'
      })
    ];
  }

  lineBreakCellTemplate(header: any, info: any) {
    if (header) {
      header.innerHTML = info.column.caption.replace(/\r\n/g, '<br/>');
    }
  }

  getTotal(userProfileId) {
    this.total = undefined;
    this.commissionService.getPendingInterestTotal(userProfileId).then(
      data => {
        this.total = data;
      },
      error => {
        console.log(error);
      }
    );
  }

  formatPercentage(c, n) {
    if (isNaN(c) || c === null) {
      return null;
    }
    if (isNaN(n) || n === null) {
      n = 2;
    }
    return parseFloat(c).toFixed(n) + '%';
  }

  onUserSelectValueChanged($event) {
    if ($event && $event.value) {
      const userProfileId: number = $event.value;
      this.router.navigate(['/next', 'commission', 'pendinginterest', userProfileId]);
    } else {
      this.router.navigate(['/next', 'commission', 'pendinginterest']);
    }
  }

  setUpTableWithUserId(userProfileId: number) {
    this.dataSourceUrl = `commission/PendingInterestSearch/${userProfileId}`;
    this.getTotal(userProfileId);
    if (this.grid && this.grid.grid && this.grid.grid.instance) {
      this.grid.grid.instance.refresh();
    }
    console.log(this.dataSourceUrl);
  }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.viewTransactionSummary(event.currentSelectedRowKeys[0]);
    } else {
      console.error("Selection collection 'e.currentSelectedRowKeys' does not exist or is missing Id property for navigation: ", event);
    }
  }

  viewTransactionSummary(item: any) {
    this.router.navigate(['next', 'transaction',  item.TransactionId , 'summary']);
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`/#/transaction/${item.TransactionId}/summary`, '_blank');
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
  }

  private transformAndSortCommissionUsersForDisplay(commissionUsers) {
    return commissionUsers
      .map(commissionUser => {
        commissionUser.displayName = commissionUser.CommissionUserProfileLastName + ', ' + commissionUser.CommissionUserProfileFirstName;
        return commissionUser;
      })
      .sort((a, b) => {
        const compareA = a.displayName.toLowerCase();
        const compareB = b.displayName.toLowerCase();
        if (compareA > compareB) {
          return 1;
        }
        if (compareA < compareB) {
          return -1;
        }
        return 0;
      });
  }
}
