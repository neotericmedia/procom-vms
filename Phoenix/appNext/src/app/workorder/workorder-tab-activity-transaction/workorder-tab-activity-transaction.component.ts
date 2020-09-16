// angular
import { Component, OnInit } from '@angular/core';
// common
import { CommonService, PhxConstants } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
// workorder
import { WorkorderService } from './../workorder.service';
import { InputFilter, TextBoxFilter, DateFilter } from './../../common/model/advance-filter/phx-advance-filter';
import { isEqual, cloneDeep, forEach, sortBy } from 'lodash';
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workorder-tab-activity-transaction',
  templateUrl: './workorder-tab-activity-transaction.component.html'
})
/*
-------------------------------------------------
                 To Do List
                 ---------
1. Add and replace the files
    #. Phx-calendar component, Phx-advance-filter component in common component
2. Import phx-calendar component in phoenix.common.module.ts
    #. import { PhxCalendarComponent } from './components/phx-calendar/phx-calendar.component';
3. Import InfiniteScrollModule in and component workorder.module.ts
    #. import { InfiniteScrollModule } from 'ngx-infinite-scroll';
    #. import { WorkorderTabActivityTransactionComponent } from './workorder-tab-activity-transaction/workorder-tab-activity-transaction.component';
4. Add the following methods in workorder.service.ts
    public getTransactionList(workOrderId: number, tableState, oDataParams): Observable<any> {
        // We do custom sort by code in sortAndFilter().
          delete tableState.sort;
        const tableStateParams = tableState && tableState !== undefined ? this.generateRequestObject(tableState).url() : '';
        return Observable.fromPromise(this.apiService.query('transactionHeader/getAllByWorkOrderId/' + workOrderId + '?' + (oDataParams ? (oDataParams + '&') : '') + tableStateParams));
      }
      generateRequestObject(tableState) {
        const searchObj = tableState && tableState.search && tableState.search.predicateObject ? tableState.search.predicateObject : null;
        const sortObj = tableState && tableState.sort && tableState.sort.predicate ? tableState.sort.predicate + (tableState.sort.reverse ? ' desc ' : '') : null;
        let currentPage = tableState && tableState.pagination && tableState.pagination.currentPage ? tableState.pagination.currentPage : 1;
        const pageSize = tableState && tableState.pagination && tableState.pagination.pageSize ? tableState.pagination.pageSize : 30;
        const isDisabled = tableState && tableState.pagination && tableState.pagination.isDisabled ? tableState.pagination.isDisabled : null;
        currentPage--;
        let oDataParams = oreq.request();
        if (Object.keys(searchObj).length > 0) {
          oDataParams = oDataParams.withFilter(oreq.filter().smartTableObjectConverter(searchObj));
        }
        if (sortObj) {
          oDataParams = oDataParams.withOrderby(sortObj);
        }
        if (!(tableState && tableState.pagination && tableState.pagination.isDisabled === true)) {
          oDataParams = oDataParams
            .withTop(pageSize)
            .withSkip(currentPage * pageSize)
            .withInlineCount();
        } else {
          oDataParams = oDataParams.withInlineCount();
        }
        return oDataParams;
      }
5. Replace the advance-filter folder in common/model with the new one
6. Add the activity transaction component selector tag in corresponding component
7. Fix tslint error
    #. Replace " with '
    # spaces in html
    # comments and debuggers
8. Unit testing

*/
export class WorkorderTabActivityTransactionComponent extends BaseComponentActionContainer implements OnInit {
  workorderId: number;
  currentSelectedColumn: string;
  sortNumber: number = 0;
  previousTableState: any;
  selectedPredicateKey: any;
  scrollProgress: boolean;

  inputFilterForTransactionNumber: InputFilter;
  inputFilterForCreateDate: InputFilter;
  inputFilterForStartDate: InputFilter;
  inputFilterForEndDate: InputFilter;
  inputFilterForTotalBilling: InputFilter;
  inputFilterForTotalPayment: InputFilter;

  html: {
    codeValueGroups: any;
    workorderActivityTransactionColumnsKey: any;
    phxConstants: any;
    scrollConfig: {
      infiniteScrollDistance: number;
      scrollWindow: boolean;
      infiniteScrollThrottle: number;
    };
    commonLists: {
      transactionList: {
        Count: number;
        Items: Array<any>;
        NextPageLink: any;
      };
    };
    filterSelectedStatus: {
      isTransactionIdClicked: boolean;
      isCreateDateClicked: boolean;
      isStartDateClicked: boolean;
      isEndDateClicked: boolean;
      isTotalBillingClicked: boolean;
      isTotalPaymentClicked: boolean;
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
      codeValueGroups: null,
      workorderActivityTransactionColumnsKey: null,
      phxConstants: PhxConstants,
      scrollConfig: {
        infiniteScrollDistance: 2,
        scrollWindow: false,
        infiniteScrollThrottle: 750
      },
      commonLists: {
        transactionList: {
          Count: null,
          Items: [],
          NextPageLink: null
        }
      },
      filterSelectedStatus: {
        isTransactionIdClicked: false,
        isCreateDateClicked: false,
        isStartDateClicked: false,
        isEndDateClicked: false,
        isTotalBillingClicked: false,
        isTotalPaymentClicked: false
      },
      tableState: {
        isLoadedFromPreviousState: false,
        pagination: {
          currentPage: 1,
          number: 20,
          pageSize: 20,
          start: 0
        },
        search: {
          predicateObject: {}
        },
        sort: {
          predicate: WorkorderActivityTransactionColumnsKey.CreateDate,
          reverse: false
        }
      }
    };

  constructor(private commonService: CommonService, private workorderService: WorkorderService, private codeValueService: CodeValueService, private router: Router) {
    super();
    this.html.workorderActivityTransactionColumnsKey = WorkorderActivityTransactionColumnsKey;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState)
      .takeUntil(this.isDestroyed$)
      .subscribe((routerStateResult: IRouterState) => {
        this.workorderId = routerStateResult.params.workorderId;
        this.getTransactionList();
      });
  }

  getTransactionList() {
    const oDataParams = oreq
      .request()
      .withExpand(['BillingTransactions/BillingTransactionLines', 'PaymentTransactions/PaymentTransactionLines'])
      .withSelect([
        'Id',
        'TransactionNumber',
        'TransactionDate',
        'StartDate',
        'EndDate',
        'Total',
        'PaymentTotal',

        'BillingTransactions/CurrencyId',
        'BillingTransactions/TotalAmount',

        'PaymentTransactions/CurrencyId',
        'PaymentTransactions/TotalAmount'
      ])
      .url();
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

    this.workorderService.getTransactionList(this.workorderId, newTableState, oDataParams).subscribe(result => {
      const items: any = [];
      forEach(result.Items, transactionHeader => {
        // transactionHeader.TransactionHeaderPeriod_display =
        //    (transactionHeader.StartDate && transactionHeader.EndDate) ?
        //    ($filter('date')(transactionHeader.StartDate, ApplicationConstants.formatDate) + ' - ' + $filter('date')(transactionHeader.EndDate, ApplicationConstants.formatDate)) :
        //    '';
        // transactionHeader = TransactionViewService.Calculate(transactionHeader);
        // transactionHeader.TransactionHeaderDate_display = $filter('date')(transactionHeader.TransactionDate, ApplicationConstants.formatDate);
        // transactionHeader.TotalBill_display = transactionHeader.billing.CurrencyCode + ' $' + $filter('currency')(transactionHeader.billing.Total, "");
        // transactionHeader.TotalPay_display = transactionHeader.payment.CurrencyCode + ' $' + $filter('currency')(transactionHeader.payment.Total, "");

        let totalBill = 0;
        let billCurrencyCode = '';

        forEach(transactionHeader.BillingTransactions, trn => {
          totalBill += trn.TotalAmount;
          billCurrencyCode = this.codeValueService.getCodeValue(trn.CurrencyId, this.html.codeValueGroups.Currency).code;
        });

        let totalPay = 0;
        let payCurrencyCode = '';

        forEach(transactionHeader.PaymentTransactions, trn => {
          totalPay += trn.TotalAmount;
          payCurrencyCode = this.codeValueService.getCodeValue(trn.CurrencyId, this.html.codeValueGroups.Currency).code;
        });

        // transactionHeader.TransactionHeaderPeriod_display =
        //     (transactionHeader.StartDate && transactionHeader.EndDate) ?
        //     ($filter('date')(transactionHeader.StartDate, ApplicationConstants.formatDate) + ' - ' + $filter('date')(transactionHeader.EndDate, ApplicationConstants.formatDate)) :
        //     '';
        transactionHeader.TransactionHeaderPeriod_display =
          transactionHeader.StartDate && transactionHeader.EndDate
            ? moment(transactionHeader.StartDate, 'YYYY-MM-DD').format(PhxConstants.DateFormat.mediumDate) + ' - ' + moment(transactionHeader.EndDate, 'YYYY-MM-DD').format(PhxConstants.DateFormat.mediumDate)
            : '';
        transactionHeader.TransactionHeaderDate_display = moment(transactionHeader.TransactionDate, 'YYYY-MM-DD').format(PhxConstants.DateFormat.mediumDate);
        // $filter('date')(transactionHeader.TransactionDate, ApplicationConstants.formatDate);
        // transactionHeader.TotalBill_display = billCurrencyCode + ' $' + $filter('currency')(totalBill, "");
        transactionHeader.TotalBill_display = billCurrencyCode + ' $' + Number(totalBill).toFixed(2);
        // transactionHeader.TotalPay_display = payCurrencyCode + ' $' + $filter('currency')(totalPay, "");
        transactionHeader.TotalPay_display = payCurrencyCode + ' $' + Number(totalPay).toFixed(2);
        items.push(transactionHeader);
      });
      if (isPreviousStateIsEquelToNewState) {
        result.Items = this.html.commonLists.transactionList.Items.concat(items);
      }
      const filterVal = this.filterTableState();
      this.previousTableState = cloneDeep(newTableState);
      this.html.commonLists.transactionList = { ...result, Items: items };
      if (this.sortNumber < 2) {
        this.sortAndFilter();
      }
      this.scrollProgress = false;
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
    tableStateFilter.sort = tableStateFilter.sort.predicate === null ? {} : tableStateFilter.sort; // || filter status false
    tableStateFilter.search.predicateObject = output;
    return cloneDeep(tableStateFilter);
  }

  onScroll() {
    if (this.html.commonLists.transactionList.Count > this.html.commonLists.transactionList.Items.length && !this.scrollProgress) {
      this.scrollProgress = true;
      this.html.tableState.pagination.currentPage = this.html.tableState.pagination.currentPage + 1;
      this.html.tableState.pagination.start = this.html.tableState.pagination.start + 20;
      this.getTransactionList();
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
    this.getTransactionList();
  }

  resetTableStateConfig() {
    this.html.commonLists.transactionList = {
      Count: null,
      Items: [],
      NextPageLink: null
    };
    this.html.tableState.pagination.currentPage = 1;
    this.html.tableState.pagination.start = 0;
  }

  setTableStatePredicateObjectFromFilterOutput(event) {
    this.html.tableState.search.predicateObject[event.columnId] = this.processResult(event);
  }

  processResult(event) {
    let result: any = null;
    switch (event.columnId) {
      case this.html.workorderActivityTransactionColumnsKey.TransactionNumber:
        result = event.result.inputText ? '\'' + event.result.inputText + '\'' + event.result.selectedDropdownValue : null;
        break;
      case this.html.workorderActivityTransactionColumnsKey.PaymentTotal:
      case this.html.workorderActivityTransactionColumnsKey.TotalPayment:
        result = event.result.inputText ? event.result.inputText + 'M' + event.result.selectedDropdownValue : null;
        break;
      case this.html.workorderActivityTransactionColumnsKey.CreateDate:
      case this.html.workorderActivityTransactionColumnsKey.StartDate:
      case this.html.workorderActivityTransactionColumnsKey.EndDate:
        result = this.processDateFilterInput(event);
        break;
    }
    return result;
  }

  processDateFilterInput(event) {
    let prefixName: string;
    let result: string;
    let dateFormat: string;
    let joinOperator: string;
    if (!event.result.selectedDropdownValue) {
      return;
    }
    let value = event.result.selectedDropdownValue.split(',');
    value = value.map(a => a && a.trim());
    switch (event.columnId) {
      case this.html.workorderActivityTransactionColumnsKey.CreateDate:
        prefixName = 'TransactionDate';
        break;
      case this.html.workorderActivityTransactionColumnsKey.StartDate:
        prefixName = 'StartDate';
        break;
      case this.html.workorderActivityTransactionColumnsKey.EndDate:
        prefixName = 'EndDate';
        break;
    }

    if (value.length === 1) {
      dateFormat = value[0] === 'le datetime' || value[0] === 'gt datetime' ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD';
    } else {
      if (value.length > 1 && value.filter(a => a === 'ge datetime').length === 1) {
        joinOperator = 'and';
      }
      if (value.length > 1 && value.filter(a => a === 'gt datetime').length === 1) {
        joinOperator = 'or';
      }
      dateFormat = 'YYYY-MM-DD';
    }

    forEach(value, (val: string, index: number) => {
      let noOfDays: number = 0;
      if (index > 0) {
        noOfDays = 1;
      }
      if (dateFormat === 'YYYY-MM-DD') {
        result =
          (result ? result + ' ' + joinOperator + ' ' : '') +
          prefixName +
          ' ' +
          val +
          '\'' +
          moment(event.result.inputDate)
            .add(noOfDays, 'days')
            .format(dateFormat) +
          '\'';
      } else {
        result =
          (result ? result + ' ' + joinOperator + ' ' : '') +
          prefixName +
          ' ' +
          val +
          '\'' +
          moment(event.result.inputDate)
            .add(23, 'hour')
            .add(59, 'minute')
            .add(59, 'second')
            .format(dateFormat) +
          '\'';
      }
    });
    console.log('result::', result);
    return result;
  }

  onColumnClicked(event) {
    this.closeAllFilterPopup(event.columnId);
    switch (event) {
      case this.html.workorderActivityTransactionColumnsKey.TransactionNumber:
        this.inputFilterForTransactionNumber = {
          filterType: PhxConstants.FilterType.Dropdown,
          filterConfiguration: <TextBoxFilter>{
            inputText: null,
            selectedDropdownValue: null,
            usePrefix: false,
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.workorderActivityTransactionColumnsKey.TransactionNumber),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: null
            }
          }
        };
        this.html.filterSelectedStatus.isTransactionIdClicked = true;
        break;
      case this.html.workorderActivityTransactionColumnsKey.CreateDate:
        this.inputFilterForCreateDate = {
          filterType: PhxConstants.FilterType.Date,
          filterConfiguration: <DateFilter>{
            inputDate: null,
            selectedDropdownValue: 'gt datetime',
            usePrefix: true,
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.workorderActivityTransactionColumnsKey.CreateDate),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: 'prefixSymbol',
              displayDateFormat: PhxConstants.DateFormat.mediumDate
            }
          }
        };
        this.html.filterSelectedStatus.isCreateDateClicked = true;
        break;
      case this.html.workorderActivityTransactionColumnsKey.StartDate:
        this.inputFilterForStartDate = {
          filterType: PhxConstants.FilterType.Date,
          filterConfiguration: <DateFilter>{
            inputDate: null,
            selectedDropdownValue: 'gt datetime',
            usePrefix: true,
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.workorderActivityTransactionColumnsKey.StartDate),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: 'prefixSymbol',
              displayDateFormat: PhxConstants.DateFormat.mediumDate
            }
          }
        };
        this.html.filterSelectedStatus.isStartDateClicked = true;
        break;
      case this.html.workorderActivityTransactionColumnsKey.EndDate:
        this.inputFilterForEndDate = {
          filterType: PhxConstants.FilterType.Date,
          filterConfiguration: <DateFilter>{
            inputDate: null,
            selectedDropdownValue: 'gt datetime',
            usePrefix: true,
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.workorderActivityTransactionColumnsKey.EndDate),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: 'prefixSymbol',
              displayDateFormat: PhxConstants.DateFormat.mediumDate
            }
          }
        };
        this.html.filterSelectedStatus.isEndDateClicked = true;
        break;
      case this.html.workorderActivityTransactionColumnsKey.TotalBilling:
        this.inputFilterForTotalBilling = {
          filterType: PhxConstants.FilterType.Dropdown,
          filterConfiguration: <TextBoxFilter>{
            inputText: null,
            selectedDropdownValue: null,
            usePrefix: true,
            dataSafeRestrictInput: '[^0123456789]',
            numberFilter: {
              from: 0,
              to: 999999999999.99,
              decimalplaces: 2
            },
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.workorderActivityTransactionColumnsKey.TotalBilling),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: 'prefixSymbol'
            }
          }
        };
        this.html.filterSelectedStatus.isTotalBillingClicked = true;
        break;
      case this.html.workorderActivityTransactionColumnsKey.TotalPayment:
        this.inputFilterForTotalPayment = {
          filterType: PhxConstants.FilterType.Dropdown,
          filterConfiguration: <TextBoxFilter>{
            inputText: null,
            selectedDropdownValue: null,
            usePrefix: true,
            dataSafeRestrictInput: '[^0123456789.]',
            numberFilter: {
              from: 0,
              to: 999999999999.99,
              decimalplaces: 2
            },
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.workorderActivityTransactionColumnsKey.TotalPayment),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: 'prefixSymbol'
            }
          }
        };
        this.html.filterSelectedStatus.isTotalPaymentClicked = true;
        break;
      default:
        break;
    }
  }

  getFilterInputDropdownList(columnKey) {
    const textBoxFilter = [
      {
        valueField: '000',
        textField: 'Equal(Exact Value)',
        prefixSymbol: '='
      },
      {
        valueField: '100',
        textField: 'Not Equal',
        prefixSymbol: '!='
      },
      {
        valueField: '200',
        textField: 'Greater Than',
        prefixSymbol: '>'
      },
      {
        valueField: '300',
        textField: 'Greater than or equal',
        prefixSymbol: '>='
      },
      {
        valueField: '400',
        textField: 'Less than',
        prefixSymbol: '<'
      },
      {
        valueField: '500',
        textField: 'Less than or equal',
        prefixSymbol: '<='
      }
    ];
    const dateFilter = [
      {
        valueField: 'ge datetime, lt datetime',
        textField: 'On the selected day',
        prefixSymbol: '='
      },
      {
        valueField: 'lt datetime, gt datetime',
        textField: 'Any other day',
        prefixSymbol: '!='
      },
      {
        valueField: 'gt datetime',
        textField: 'All days above selected date',
        prefixSymbol: '>'
      },
      {
        valueField: 'ge datetime',
        textField: 'All days above and including the day',
        prefixSymbol: '>='
      },
      {
        valueField: 'lt datetime',
        textField: 'All days prior to the day',
        prefixSymbol: '<'
      },
      {
        valueField: 'le datetime',
        textField: 'All days prior to and including the day',
        prefixSymbol: '<='
      }
    ];

    const stringFilter = [
      {
        valueField: '000',
        textField: 'Found within'
      },
      {
        valueField: '100',
        textField: 'Start\'s with'
      },
      {
        valueField: '200',
        textField: 'Ends\'s with'
      }
    ];
    let selectedFilter: any = [];
    switch (columnKey) {
      case this.html.workorderActivityTransactionColumnsKey.TransactionNumber:
        selectedFilter = cloneDeep(stringFilter);
        break;
      case this.html.workorderActivityTransactionColumnsKey.CreateDate:
      case this.html.workorderActivityTransactionColumnsKey.StartDate:
      case this.html.workorderActivityTransactionColumnsKey.EndDate:
        selectedFilter = cloneDeep(dateFilter);
        break;
      case this.html.workorderActivityTransactionColumnsKey.TotalBilling:
      case this.html.workorderActivityTransactionColumnsKey.TotalPayment:
        selectedFilter = cloneDeep(textBoxFilter);
        break;
      default:
        break;
    }
    return selectedFilter;
  }

  closeAllFilterPopup(event) {
    forEach(Object.keys(this.html.filterSelectedStatus), key => {
      this.html.filterSelectedStatus[key] = false;
    });
  }

  onGo(event) {
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup(event.columnId);
    this.getTransactionList();
  }

  onClear(event) {
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup(event.columnId);
    this.getTransactionList();
  }

  sortAndFilter() {
    if (this.html.tableState.sort.predicate) {
      let key: string;
      switch (this.html.tableState.sort.predicate) {
        case this.html.workorderActivityTransactionColumnsKey.CreateDate:
          key = 'CreateDate';
          break;
        case this.html.workorderActivityTransactionColumnsKey.StartDate:
          key = 'StartDate';
          break;
        case this.html.workorderActivityTransactionColumnsKey.EndDate:
          key = 'EndDate';
          break;
        case this.html.workorderActivityTransactionColumnsKey.TotalBilling:
          key = 'TotalBill_display';
          break;
        case this.html.workorderActivityTransactionColumnsKey.TotalPayment:
          key = 'TotalPay_display';
          break;
        default:
          key = this.html.tableState.sort.predicate;
          break;
      }

      this.html.commonLists.transactionList.Items = sortBy(this.html.commonLists.transactionList.Items, key);

      if (this.html.tableState.sort.reverse) {
        this.html.commonLists.transactionList.Items = this.html.commonLists.transactionList.Items.reverse();
      }
    }
    // check and remove
    // forEach(this.html.tableState.search.predicateObject, (val, key) => {
    //   if (val.indexOf("_display'") > -1) {
    //     this.html.commonLists.transactionList.Items = filter(this.html.commonLists.transactionList.Items, item => {
    //       return item[key] && item[key].indexOf(val) > -1;
    //     });
    //   }
    // });
  }

  openTransaction(id: number) {
    this.router.navigate([`/next/transaction/${id}/summary`]);
  }
}

export enum WorkorderActivityTransactionColumnsKey {
  TransactionNumber = <any>'TransactionNumber',
  CreateDate = <any>'ODATAEXP_TransactionDate',
  StartDate = <any>'ODATAEXP_StartDate',
  EndDate = <any>'ODATAEXP_EndDate',
  TotalBilling = <any>'Total',
  TotalPayment = <any>'PaymentTotal'
}
