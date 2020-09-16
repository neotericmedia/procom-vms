import { AuthService } from './../../common/services/auth.service';
import { PhxLocalizationService } from './../../common/services/phx-localization.service';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, ApiService, PhxConstants } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { PaymentService } from './../payment.service';
import { Subscription } from 'rxjs/Subscription';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, UserProfile, PhxInterceptPanelType, RowHighlightingConfig } from '../../common/model/index';
import { PhxDataTableSummaryItem } from './../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';

import { Http, HttpModule } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, OnDestroy, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { pxCurrencyPipe } from './../../common/pipes/pxCurrency.pipe';
import { ActivatedRoute } from '@angular/router';
import { PaymentDocumentComponent } from '../payment-document/payment-document.component';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';

@Component({
  selector: 'payment-search',
  templateUrl: './payment-search.component.html',
  styleUrls: ['./payment-search.component.less']
})
export class PaymentSearchComponent implements OnInit, OnDestroy, AfterViewInit {
  paymentId: number;
  paymentTransactionId: number;
  formatDate: string;
  showSlider: boolean = false;
  codeValueGroups: any;
  ApplicationConstants: any;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  isAlive: boolean = true;
  PhxInterceptPanelType: typeof PhxInterceptPanelType = PhxInterceptPanelType;
  unregisterList: any[] = [];
  odataParams: string = oreq.request()
        .withSelect(['Id', 'PaymentNumber', 'PaymentDate', 'PaymentMethodId', 'PaymentTotal', 'CurrencyId', 'PayeeName', 'TransactionsCount', 'WorkerName', 'IsTest', 'PayeeTypeId'])
        .withFilter(oreq.filter('StatusId').eq(PhxConstants.PaymentStatus.Cleared).or().filter('StatusId').eq(PhxConstants.PaymentStatus.Released))
        .url();
  @ViewChild('paymentDocument') paymentDocument: PaymentDocumentComponent;
  @ViewChild('masterTable') masterTable: PhxDataTableComponent;
  isShowFirstPaymentTransactionDocument: boolean = false;
  userProfile: UserProfile;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true,
    rowHighlightingConfig: new RowHighlightingConfig()
  });
  dataTableConfigurationTransaction: PhxDataTableConfiguration = new PhxDataTableConfiguration(<PhxDataTableConfiguration>({
    enableExport: true,
    rowHighlightingConfig: new RowHighlightingConfig()
  }));
  columns: Array<PhxDataTableColumn>;
  columnsTransaction: Array<PhxDataTableColumn>;
  gridViewMode: string = 'payment';
  currentPaymentId: number = null;

  constructor(
    private loadingSpinnerService: LoadingSpinnerService,
    protected commonService: CommonService,
    private navigationService: NavigationService,
    private paymentService: PaymentService,
    private codeValueService: CodeValueService,
    private pxCurrency: pxCurrencyPipe,
    private activatedRoute: ActivatedRoute,
    private localizationService: PhxLocalizationService,
    private apiService: ApiService,
    private authService: AuthService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.ApplicationConstants = this.commonService.ApplicationConstants;
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;


    this.activatedRoute.params
      .mergeMap(params => {
        return [this.authService.getCurrentProfile().takeWhile(t => this.isAlive), params];
      },
        (currentUser: UserProfile, params: any) => {
          return { currentUser: currentUser, params: params };
        }
      )
      .subscribe(data => {
        const { currentUser, params } = data;
        let reload: boolean = false;

        if (this.paymentId && this.paymentId !== +params['PaymentId']) {
          reload = true;
        }
        this.paymentId = +params['PaymentId'];

        if (this.paymentId) {
          this.dataTableConfiguration.stateSavingMode = PhxDataTableStateSavingMode.None;
          this.dataTableConfiguration.showFilter = false;
          this.odataParams += `&$filter=Id eq ${this.paymentId}`;
          this.isShowFirstPaymentTransactionDocument = true;
          if (reload) {
            this.masterTable.grid.instance.refresh();
          }
        }
        if (currentUser.ProfileTypeId !== PhxConstants.ProfileType.Internal) {
          // this.dataTableConfigurationTransaction.showFilter = false;
        }
        this.buildColumns();

        if (this.paymentId) {
          this.columns.find(col => col.dataField === 'Id').filterValue = this.paymentId;
        }
      });
  }

  ngOnInit() {
    this.navigationService.setTitle('payments-manage');


    // this.registerEvent();
  }

  ngAfterViewInit(): void {
    if (this.isShowFirstPaymentTransactionDocument) {
      this.expandRowOnInit();
    }
  }

  private expandRowOnInit() {
    this.masterTable.grid.onContentReady.takeWhile(() => this.isAlive).subscribe(() => {
      if (this.masterTable.grid.instance.getVisibleRows()[0]) {
        const key = this.masterTable.grid.instance.getVisibleRows()[0].data;
        this.masterTable.grid.instance.selectRows(key, false);
        this.masterTable.grid.instance.expandRow(key);
      }
    });
  }

  registerEvent() {
    this.apiService
      .onPrivate('DownloadFileStreamEvent', (event, data) => {
        // we get pdf here
        // this.iframeComplianceDocumentViewFileStream.nativeElement.setAttribute('src', 'data:' +data.FileContentType + ';base64,' + data.FileStream);
        this.paymentDocument.docFrame.nativeElement.setAttribute('src', 'data:' + data.FileContentType + ';headers=filename%3D' + data.FileName + ';base64,' + data.FileStream);
        this.showSlider = true;
      })
      .then(unregister => {
        if (unregister) {
          this.unregisterList.push(unregister);
        }
      })
      .catch(ex => {
        console.error('DownloadFileStreamEvent registration exception: ' + ex);
      });
  }
  ngOnDestroy() {
    this.isAlive = false;
    if (this.unregisterList && this.unregisterList.length) {
      for (const sub of this.unregisterList) {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      }
    }
  }

  buildColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: this.localizationService.translate('payment.search.idColumnHeader'),
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentNumber',
        caption: this.localizationService.translate('payment.search.paymentNumberColumnHeader')
      }),
      new PhxDataTableColumn({
        dataField: 'TransactionsCount',
        caption: this.localizationService.translate('payment.search.transactionsCountColumnHeader'),
        dataType: 'number',
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'PayeeName',
        caption: this.localizationService.translate('payment.search.payeeNameColumnHeader')
      }),
      new PhxDataTableColumn({
        dataField: 'PayeeTypeId',
        caption: this.localizationService.translate('payment.search.payeeTypeColumnHeader'),
        lookup: {
          dataSource: this.getPayeeTypeLookup(),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: this.localizationService.translate('payment.search.workerNameColumnHeader')
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentTotal',
        caption: this.localizationService.translate('payment.search.paymentTotalColumnHeader'),
        dataType: 'decimal',
        alignment: 'right',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentMethodId',
        caption: this.localizationService.translate('payment.search.paymentMethodIdColumnHeader'),
        lookup: {
          dataSource: this.getPaymentMethodLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentDate',
        caption: this.localizationService.translate('payment.search.paymentDateColumnHeader'),
        dataType: 'date',
        cellTemplate: 'dateCellTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'IsTest',
        caption: this.localizationService.translate('common.phxDataTable.implementationHeader'),
        dataType: 'boolean',
        lookup: {
          dataSource: PhxDataTableColumn.isTest.lookupDataSource(this.localizationService),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      })
    ];
    this.columnsTransaction = [
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'Id',
        width: 100,
        caption: this.localizationService.translate('payment.transaction.idColumnHeader'),
        hidingPriority: 1,
      }),
      new PhxDataTableColumn({
        dataType: 'string',
        dataField: 'PaymentTransactionNumber',
        caption: this.localizationService.translate('payment.transaction.paymentTransactionNumberColumnHeader'),
        hidingPriority: 9,
      }),
      new PhxDataTableColumn({
        dataType: 'string',
        dataField: 'AssignmnetWorkOrderNumber',
        caption: this.localizationService.translate('payment.transaction.workOrderColumnHeader'),
        hidingPriority: 2,
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: this.localizationService.translate('payment.transaction.workerColumnHeader'),
        hidingPriority: 5,
      }),
      new PhxDataTableColumn({
        dataField: 'WorksiteId',
        caption: this.localizationService.translate('payment.transaction.worksiteColumnHeader'),
        hidingPriority: 3,
        lookup: {
          dataSource: this.getWorksiteLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'TransactionTypeId',
        caption: this.localizationService.translate('payment.transaction.transactionTypeColumnHeader'),
        hidingPriority: 4,
        dataType: 'number',
        lookup: {
          dataSource: this.getTransactionTypeLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        },
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: this.localizationService.translate('payment.transaction.startDateColumnHeader'),
        dataType: 'date',
        hidingPriority: 7
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: this.localizationService.translate('payment.transaction.endDateColumnHeader'),
        dataType: 'date',
        hidingPriority: 6
      }),
      new PhxDataTableColumn({
        dataField: 'PlannedReleaseDate',
        caption: this.localizationService.translate('payment.transaction.plannedReleaseDate'),
        dataType: 'date',
        hidingPriority: 10
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentTransactionStatusId',
        caption: this.localizationService.translate('payment.transaction.paymentTransactionStatus'),
        hidingPriority: 3,
        lookup: {
          dataSource: this.getPaymentTransactionStatusLookup()
            .filter(code =>
              code.value === PhxConstants.PaymentTransactionStatus.PendingPaymentProcessing
              || code.value === PhxConstants.PaymentTransactionStatus.PendingPaymentRelease
            ),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),

      new PhxDataTableColumn({
        dataField: 'AmountNet',
        caption: this.localizationService.translate('payment.transaction.amountNetColumnHeader'),
        dataType: 'decimal',
        alignment: 'right',
        hidingPriority: 8,
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'IsTest',
        caption: this.localizationService.translate('common.phxDataTable.implementationHeader'),
        dataType: 'boolean',
        lookup: {
          dataSource: PhxDataTableColumn.isTest.lookupDataSource(this.localizationService),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      })
    ];
  }

  onRowExpanding(event: any) {
    if (event.key && event.key.Id) {
      this.paymentId = event.key.Id;
    }
  }

  onPaymentTransactionRowClick(e: any) {
    console.log(encodeURIComponent);
    this.showSlider = true;

    if (this.gridViewMode === 'payment') {
      this.paymentId = e.PaymentId;
      this.paymentTransactionId = e.Id;
      this.currentPaymentId = this.paymentId;
      // this.paymentTransactionId= data.Id;
      // this.apiService.command('PaymentUserActionViewDocument', {
      //     PaymentId: data.PaymentId,
      //     PaymentTransactionId: data.Id
      // });
    } else {
      if (this.gridViewMode === 'transaction') {
        this.paymentTransactionId = e.data.Id;
        this.currentPaymentId = null;
      }
    }
  }

  getTransactionTypeLookup() {
    return this.codeValueService.getCodeValues('trn.CodeTransactionType', true)
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
  getPaymentTransactionStatusLookup() {
    return this.codeValueService.getCodeValues('trn.CodePaymentTransactionStatus', true)
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
      })
      ;
  }
  getWorksiteLookup() {
    return this.codeValueService.getCodeValues('workorder.CodeWorksite', true)
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
  getPaymentMethodLookup() {
    return this.codeValueService
      .getCodeValues('payment.CodePaymentMethodType', true)
      .filter((x) => x.id !== PhxConstants.PaymentMethodType.FromPayeeProfile)
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

  getPayeeTypeLookup() {
    return this.codeValueService.getCodeValues('payment.CodePayeeType', true);
  }

  changeGridViewMode(mode: string) {
    this.showSlider = false;
    this.gridViewMode = mode;
    if (this.gridViewMode === 'payment') {
      this.currentPaymentId = this.paymentId;
    } else if (this.gridViewMode === 'transaction') {
      this.currentPaymentId = null;
    }
  }
  toggleRowExpansion(event: any) {
    const isToggleButton = event.event.target.classList.contains('dx-command-expand')
      || event.event.target.parentElement.classList.contains('dx-command-expand');
    if (!isToggleButton) {
      event.isExpanded ? this.masterTable.grid.instance.collapseRow(event.key) : this.masterTable.grid.instance.expandRow(event.key);
    }
  }
}
