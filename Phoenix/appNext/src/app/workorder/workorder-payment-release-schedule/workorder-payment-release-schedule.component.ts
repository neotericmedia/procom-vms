import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { WorkorderService } from '../workorder.service';
import { isEqual, cloneDeep } from 'lodash';
import * as moment from 'moment';
import { PhxConstants } from '../../common';

export enum PaymentReleaseScheduleColumnsKey {
  Id = <any>'Id',
  TimesheetEndDate = <any>'TimesheetEndDate',
  PlannedPaymentDate = <any>'PlannedPaymentDate',
}

@Component({
  selector: 'app-workorder-payment-release-schedule',
  templateUrl: './workorder-payment-release-schedule.component.html',
  styleUrls: ['./workorder-payment-release-schedule.component.less']
})

export class WorkorderPaymentReleaseScheduleComponent implements OnInit, OnChanges {

  @Input() id: number;
  previousTableState: any;
  scrollProgress: boolean;
  sortNumber: number = 0;
  phxConstants: any;
  html: {
    paymentReleaseScheduleColumnsKey: any;
    scrollConfig: {
      infiniteScrollDistance: number;
      scrollWindow: boolean;
      infiniteScrollThrottle: number;
    };
    commonLists: {
      paymentReleaseScheduleList: {
        Count: number;
        Items: Array<any>;
        NextPageLink: any;
      }
    };
    tableState: {
      isLoadedFromPreviousState: boolean;
      pagination: {
        currentPage: number;
        number: number;
        pageSize: number;
        start: number;
      };
      search: {
        predicateObject: any;
      };
      sort: {
        predicate: any;
        reverse: boolean;
      };
    };
  } = {
      paymentReleaseScheduleColumnsKey: null,
      scrollConfig: {
        infiniteScrollDistance: 2,
        scrollWindow: false,
        infiniteScrollThrottle: 750
      },
      commonLists: {
        paymentReleaseScheduleList: {
          Count: null,
          Items: [],
          NextPageLink: null
        }
      },
      tableState: {
        isLoadedFromPreviousState: false,
        pagination: {
          currentPage: 1,
          number: 30,
          pageSize: 30,
          start: 0
        },
        search: {
          predicateObject: {}
        },
        sort: {
          predicate: PaymentReleaseScheduleColumnsKey.Id,
          reverse: false
        }
      }
    };

  constructor(private workorderService: WorkorderService) {
    this.html.paymentReleaseScheduleColumnsKey = PaymentReleaseScheduleColumnsKey;
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.id && changes.id.currentValue) {
      this.id = changes.id.currentValue;
      if (this.id) {
        this.resetTableStateConfig();
        this.html.tableState.search.predicateObject[this.html.paymentReleaseScheduleColumnsKey.Id] = null;
        this.html.tableState.search.predicateObject[this.html.paymentReleaseScheduleColumnsKey.TimesheetEndDate] = null;
        this.html.tableState.search.predicateObject[this.html.paymentReleaseScheduleColumnsKey.PlannedPaymentDate] = null;
        const fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 3);
        const date = moment(fromDate).format('YYYY-MM-DD');
        this.html.tableState.search = { predicateObject: { ODATAEXP_TimesheetEndDate: 'TimesheetEndDate ge datetime\'' + date + '\'' } };
        this.getPaymentReleaseScheduleData();
      }
    }
  }

  getPaymentReleaseScheduleData() {
    const newTableState = this.filterTableState();
    let isPreviousStateIsEquelToNewState: boolean;
    if (this.previousTableState) {
      const prevStateValues = { search: { ...this.previousTableState.search }, sort: { ...this.previousTableState.sort } };
      const currentStateValues = { search: { ...newTableState.search }, sort: { ...newTableState.sort } };
      isPreviousStateIsEquelToNewState = isEqual(prevStateValues, currentStateValues);
      if (!isPreviousStateIsEquelToNewState) {
        isPreviousStateIsEquelToNewState = true;
        newTableState.pagination.currentPage = 1;
        newTableState.pagination.start = 0;
        this.resetTableStateConfig();
      }
    }

    this.workorderService.getPaymentReleaseScheduleDetail(this.id, newTableState).subscribe((response: any) => {
      if (isPreviousStateIsEquelToNewState) {
        response.Items = this.html.commonLists.paymentReleaseScheduleList.Items.concat(response.Items);
      }
      this.previousTableState = cloneDeep(newTableState);
      this.scrollProgress = false;
      this.html.commonLists.paymentReleaseScheduleList = response;
    });
  }

  filterTableState() {
    const tableStateFilter: any = cloneDeep(this.html.tableState);
    const output: any = {};
    Object.keys(cloneDeep(this.html.tableState.search.predicateObject)).forEach(key => {
      if (this.html.tableState.search.predicateObject[key] && typeof this.html.tableState.search.predicateObject[key] === 'object' && this.html.tableState.search.predicateObject[key].length > 0) {
        output[key] = this.html.tableState.search.predicateObject[key];
      } else if (this.html.tableState.search.predicateObject[key] && typeof this.html.tableState.search.predicateObject[key] !== 'object') {
        output[key] = this.html.tableState.search.predicateObject[key];
      }
    });

    tableStateFilter.sort = tableStateFilter.sort.predicate === null ? {} : tableStateFilter.sort;
    tableStateFilter.search.predicateObject = output;
    return cloneDeep(tableStateFilter);
  }

  onScroll() {
    if (this.html.commonLists.paymentReleaseScheduleList.Count > this.html.commonLists.paymentReleaseScheduleList.Items.length) {
      this.html.tableState.pagination.currentPage = this.html.tableState.pagination.currentPage + 1;
      this.html.tableState.pagination.start = this.html.tableState.pagination.start + 20;
      this.getPaymentReleaseScheduleData();
    }
  }

  sortBy(key: any) {
    if (this.html.tableState.sort.predicate === key) {
      this.sortNumber++;
      this.sortNumber = this.sortNumber > 2 ? 0 : this.sortNumber;
      switch (this.sortNumber) {
        case 0:
          this.html.tableState.sort.reverse = false;
          break;
        case 1:
          this.html.tableState.sort.reverse = true;
          break;
        case 2:
          this.html.tableState.sort.predicate = null;
          this.html.tableState.sort.reverse = false;
          break;
        default:
          break;
      }
    } else {
      this.html.tableState.sort.predicate = key;
      this.sortNumber = 0;
    }
    this.resetTableStateConfig();
    this.getPaymentReleaseScheduleData();
  }

  resetTableStateConfig() {
    this.html.commonLists.paymentReleaseScheduleList = {
      Count: null,
      Items: [],
      NextPageLink: null
    };
    this.html.tableState.pagination.currentPage = 1;
    this.html.tableState.pagination.start = 0;
  }

}
