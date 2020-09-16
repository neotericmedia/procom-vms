import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { PhxModalComponent } from './../../common/components/phx-modal/phx-modal.component';
import { PhxButton } from './../../common/model/phx-button';
import { CommonService, PhxLocalizationService, WorkflowService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';
import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, PhxDataTableShowCheckboxesMode } from '../../common/model/index';
import { PhxDataTableSummaryItem } from './../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';

import { ApiService } from './../../common/services/api.service';
import { Http, HttpModule } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';

import { PayrollService } from '../payroll.service';
import { OrganizationApiService } from '../../organization/organization.api.service';
import { DialogService } from './../../common/services/dialog.service';
import { DialogResultType } from './../../common/model/index';
import { WindowRefService } from './../../common/services/WindowRef.service';
import { PendingPayrollRemittancesExport, RemittanceType, RemittanceRow } from './pending-payroll-remittances.export';
declare var oreq: any;
@Component({
  selector: 'app-pending-payroll-remittances',
  templateUrl: './pending-payroll-remittances.component.html',
  styleUrls: ['./pending-payroll-remittances.component.less']
})
export class PendingPayrollRemittancesComponent implements OnInit, OnDestroy {
  ApplicationConstants: any;
  exportFileName: string;
  organizationIdInternal: number;
  organizationInternalCode: number;
  currencyId: number;
  pageTitle: string;
  sourceDeductionTypes: any[];
  provinces: any[];
  workerCompensations: any[];
  @ViewChild('phxTable') phxTable: PhxDataTableComponent;
  @ViewChild('submitRemittanceModal') submitRemittanceModal: PhxModalComponent;

  dataSourceUrl: string;
  tableDataSet: any[];
  isWcb: boolean = false;
  remittanceType: string;
  sdGroups: any[] = new Array();
  paymentTransactions: any[] = new Array();
  RemittanceDate: any;
  grossPay: number;
  totalRemittanceAmount: number = 0;
  remittanceTotals: RemittanceType[] = [];
  selectedPaymentTransactionIds: number[] = new Array();
  csvSnapshots: {
    totalRemittanceAmount: number;
    csvText: string;
  }[] = [];
  unregisterList: any[] = [];
  isAlive: boolean = true;
  ValidationMessages: any;
  notifyName: any;
  continueRemittance: boolean;
  dataGridComponentName: string = 'PendingRemittances';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectionMode: PhxDataTableSelectionMode.Multiple,
    pageSize: 100000
  });
  filter: string;
  oDataParams: string;
  oDataParameterSelectFields: string = '';
  percentColumnFormat = { type: 'fixedPoint', precision: 4 };
  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({ dataField: 'PaymentTransaction', caption: 'Payment Transaction', fixed: true }),
    new PhxDataTableColumn({ dataField: 'PaymentTransactionId', caption: 'Payment Transaction ID', dataType: 'number' }),
    new PhxDataTableColumn({ dataField: 'WorkerId', caption: 'Worker ID', dataType: 'number' }),
    new PhxDataTableColumn({ dataField: 'WorkerName', caption: 'Worker Name' }),
    new PhxDataTableColumn({ dataField: 'OrganizationName', caption: 'Organization Name' }),
    new PhxDataTableColumn({
      dataField: 'LegalStatus',
      caption: 'Legal Status',
      lookup: { dataSource: this.profileType(), valueExpr: 'value', displayExpr: 'text' }
    }),
    new PhxDataTableColumn({
      dataField: 'Branch',
      caption: 'Branch',
      lookup: { dataSource: this.branch(), valueExpr: 'value', displayExpr: 'text' }
    }),
    new PhxDataTableColumn({
      dataField: 'DeductionsProvinceState',
      caption: 'Deductions Province State',
      lookup: { dataSource: this.worksite(), valueExpr: 'value', displayExpr: 'text' }
    }),
    new PhxDataTableColumn({
      dataField: 'LineOfBusiness',
      caption: 'Line Of Business',
      lookup: { dataSource: this.lineOfBusiness(), valueExpr: 'value', displayExpr: 'text' }
    }),
    new PhxDataTableColumn({ dataField: 'PaymentTransactionDate', caption: 'Payment Transaction Date', dataType: 'date' }),
    new PhxDataTableColumn({ dataField: 'PaymentTransactionStartDate', caption: ' Payment Transaction Start', dataType: 'date' }),
    new PhxDataTableColumn({ dataField: 'PaymentTransactionEndDate', caption: 'Payment Transaction End', dataType: 'date' }),
    new PhxDataTableColumn({ dataField: 'PaymentReleaseDate', caption: 'Payment Release Date', dataType: 'date' }),
    new PhxDataTableColumn({ dataField: 'PaymentBatchReference', caption: 'Reference No' }),
    new PhxDataTableColumn({ dataField: 'PaymentReference', caption: 'Payment Reference' }),
    new PhxDataTableColumn({ dataField: 'GrossPay', caption: 'Gross Pay', dataType: 'money' })
  ];

  submitRemittanceModalButtons: PhxButton[] = [
    {
      icon: '',
      tooltip: 'Remit',
      btnType: 'primary',
      action: () => {
        this.submitRemittanceModal.hide();
        this.onRemit();
      }
    },
    {
      icon: '',
      tooltip: 'Remit and Save File',
      btnType: 'default',
      action: () => {
        this.submitRemittanceModal.hide();
        this.onDownload();
        this.onRemit(false);
      }
    },
    {
      icon: '',
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        this.submitRemittanceModal.hide();
      }
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private payrollService: PayrollService,
    private organizationApiService: OrganizationApiService,
    private dialogService: DialogService,
    private apiService: ApiService,
    private winRef: WindowRefService,
    private localizationService: PhxLocalizationService,
    private workflowService: WorkflowService
  ) { }

  ngOnInit() {
    this.initSignalR();

    this.route.params
      .takeWhile(() => this.isAlive)
      .subscribe(params => {
        this.organizationIdInternal = +params['OrganizationIdInternal'];
        this.currencyId = +params['CurrencyId'];
      });

    this.ApplicationConstants = this.commonService.ApplicationConstants;
    this.route.data.subscribe(d => {
      this.filter = 'OrganizationIdInternal eq ' + this.organizationIdInternal + ' and CurrencyId eq ' + this.currencyId;
      switch (d.remittanceType) {
        case 'wcb': {
          this.isWcb = true;
          this.workerCompensations = d.resolvedData;
          this.columns.push(new PhxDataTableColumn({ dataField: 'WorkerClassification', caption: 'Worker Classification', lookup: { dataSource: d.resolvedData, valueExpr: 'value', displayExpr: 'text' } }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'ClassificationPct', caption: 'Classification %', alignment: 'right', dataType: 'decimal', format: this.percentColumnFormat }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'WcbEmployer', caption: 'Employer Worker Safety', dataType: 'money' }));
          this.columns.push(
            new PhxDataTableColumn({
              dataField: 'WcbEmployer',
              caption: 'Remit',
              dataType: 'money'
            })
          );
          this.columns.push(new PhxDataTableColumn({ dataField: 'YtdGrossPay', caption: 'YTD Pay', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'YtdWcbEmployer', caption: 'YTD WCB', dataType: 'money' }));
          break;
        }
        case 'health-tax': {
          this.columns.push(new PhxDataTableColumn({ dataField: 'EhtEmployer', caption: 'Employer Health Tax', dataType: 'money' }));
          this.columns.push(
            new PhxDataTableColumn({
              dataField: 'EhtEmployer',
              caption: 'Remit',
              dataType: 'money'
            })
          );
          break;
        }
        default: {
          this.columns.push(new PhxDataTableColumn({ dataField: 'CppEmployer', caption: 'CPP Employer', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'CppEmployee', caption: 'CPP Employee', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'EiEmployer', caption: 'EI Employer', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'EiEmployee', caption: 'EI Employee', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'PipEmployer', caption: 'PIP Employer', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'PipEmployee', caption: 'PIP Employee', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'FederalTax', caption: 'Federal Tax', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'ProvincialTax', caption: 'Provincial Tax', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'QppEmployer', caption: 'QPP Employer', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'QppEmployee', caption: 'QPP Employee', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'NonResidentTax', caption: 'Non-Resident Tax', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'AdditionalTax', caption: 'Additional Tax', dataType: 'money' }));
          this.columns.push(new PhxDataTableColumn({ dataField: 'Remit', caption: 'Remit', dataType: 'money' }));
          break;
        }
      }

      this.remittanceType = d.remittanceType;
      this.dataSourceUrl = d.dataSourceUrl;
      this.oDataParams = this.oDataParameterSelectFields + '&$filter=' + this.filter;
      this.dataGridComponentName = d.dataGridComponentName || this.dataGridComponentName;
      this.exportFileName = d.exportFileName || 'payrollPendingRemittance';
    });
    // for page title
    const orgFilter = oreq
      .request()
      .withFilter(oreq.filter('Id').eq(this.organizationIdInternal))
      .url();
    this.organizationApiService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole(orgFilter).subscribe(
      response => {
        this.organizationInternalCode = response.Items[0].Code;
        this.navigationService.setTitle('remittance-pending', [response.Items[0].DisplayName]);
      },
      error => {
        throw error;
      }
    );
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

  phxDataSetResponse(e) {
    this.tableDataSet = e;
    this.displayTotals(this.tableDataSet);
  }
  profileType() {
    return this.codeValueService.getCodeValues('usr.CodeProfileType', true).map((codeValue: CodeValue) => {
      return { text: codeValue.text, value: codeValue.id };
    });
  }
  branch() {
    return this.codeValueService.getCodeValues('workorder.CodeInternalOrganizationDefinition1', true).map((codeValue: CodeValue) => {
      return { text: codeValue.text, value: codeValue.id };
    });
  }
  lineOfBusiness() {
    return this.codeValueService.getCodeValues('org.CodeLineOfBusiness', true).map((codeValue: CodeValue) => {
      return { text: codeValue.text, value: codeValue.id };
    });
  }
  worksite() {
    return this.codeValueService.getCodeValues('workorder.CodeWorksite', true).map((codeValue: CodeValue) => {
      return { text: codeValue.text, value: codeValue.id };
    });
  }
  workerClassification() {
    return this.codeValueService.getCodeValues('workorder.CodeWorksite', true).map((codeValue: CodeValue) => {
      return { text: codeValue.text, value: codeValue.id };
    });
  }
  sourceDeductionType() {
    this.sourceDeductionTypes = this.codeValueService.getCodeValues('payroll.CodeSourceDeductionType', true).map((codeValue: CodeValue) => {
      return { text: codeValue.text, value: codeValue.id };
    });

    return this.sourceDeductionTypes;
  }
  selections(e: any) {
    if (e && e.selectedRowsData) {
      this.selectedPaymentTransactionIds = e.selectedRowsData.map(i => {
        return i.PaymentTransactionId;
      });
      this.displayTotals(e.selectedRowsData.length > 0 ? e.selectedRowsData : this.tableDataSet);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  displayTotals(rows: RemittanceRow[]) {
    this.remittanceTotals = PendingPayrollRemittancesExport.calculateRemittanceTotals(rows, this.remittanceType, this.workerCompensations, this.codeValueService);
    this.sdGroups = [];
    this.remittanceTotals.forEach(i => {
      this.sdGroups.push({ text: i.title, sum: i.total });
    });
    this.totalRemittanceAmount = this.remittanceTotals.reduce((prev, current) => prev + current.total, 0);
    this.grossPay = rows.reduce((prev, current) => prev + current.GrossPay, 0);
  }

  onDownload() {
    this.loadingSpinnerService.show();
    this.csvSnapshots.push({
      totalRemittanceAmount: this.totalRemittanceAmount,
      csvText: this.produceCsvText(this.RemittanceDate)
    });
  }

  onRemit(continueRemittance: boolean = true) {
    this.continueRemittance = continueRemittance;
    this.payrollService.SubmitPaymentTransactionsForRemittance(this.selectedPaymentTransactionIds, this.remittanceType, this.RemittanceDate).subscribe(
      response => {
        if(continueRemittance) {
          this.goToRemittedBatch(response.EntityIdRedirect);
        }
        else {
          this.downloadFinalFile(response.EntityIdRedirect);
          this.phxTable.refresh();
          this.loadingSpinnerService.hideAll();
        }
      },
      error => {
        if (error && error.IsValid === false) {
          if (error.ValidationMessages && error.ValidationMessages.length > 0) {
            error.ValidationMessages.forEach(element => {
              this.commonService.logError(element.Message);
            });
          } else {
            this.commonService.logError('Something went wrong, please try again');
          }
        }
      }
    );
  }

  submitRemittance() {
    this.submitRemittanceModal.show();
  }

  goToRemittedBatch(batchId: number) {
    this.router.navigateByUrl('/next/payroll/remittancebatch/' + this.organizationIdInternal + '/batch/' + batchId);
  }

  processWorkflowBatch(workflowTaskIds) {
    if (workflowTaskIds.length > 0) {
      this.workflowService
        .workflowBatchOperationOnTasksSelected({
          TaskIdsToBatch: workflowTaskIds,
          TaskResultId: this.ApplicationConstants.TaskResult.Complete,
          NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased,
          CommandBatchPreExecutionJsonBody: {
            CommandName: 'BatchRemittancePreExecution',
            WorkflowPendingTaskId: -1,
            ToSendNotifyOnPreExecutionNotValidResult: true,
            NotifyName_BatchPreExecution_OnReleased: this.notifyName.NotifyName_BatchOperation_OnPreExecuted
          },
          CommandBatchThreadExecutionJsonBody: {
            CommandName: 'BatchRemittanceTransaction',
            NotifyName_BatchThreadExecution_OnReleased: this.notifyName.NotifyName_BatchThreadExecution_OnReleased,
            RemittanceDate: this.RemittanceDate
          }
        })
        .then(function (response) { })
        .catch(function (response) {
          throw response;
        });
    } else {
      this.commonService.logError('Select pending remittance(s) to release');
    }
  }

  downloadDraftFile() {
    const csvText = this.produceCsvText(null);
    this.downloadCsvFile(csvText);
  }

  downloadFinalFile(batchId: number) {
    this.payrollService.getRemittanceBatchById(this.organizationIdInternal, batchId).subscribe(response => {
      const csvSnapshot = this.csvSnapshots.find(i => Math.abs(i.totalRemittanceAmount - response.TotalAmount) < 0.001);
      if (csvSnapshot) {
        this.downloadCsvFile(csvSnapshot.csvText, response.BatchNumber);
        this.csvSnapshots = this.csvSnapshots.filter(i => i.totalRemittanceAmount !== csvSnapshot.totalRemittanceAmount);
      } else {
        this.commonService.logError('Cannot save a final file because the remitted amount is different from the draft amount.');
      }
      this.loadingSpinnerService.hideAll();
    });
  }

  produceCsvText(remittanceDate: Date) {
    const rows = <RemittanceRow[]>this.phxTable.getSelectedRowsData();
    return PendingPayrollRemittancesExport.produceCsvText(this.remittanceType, /*this.columns,*/ rows, this.remittanceTotals, this.totalRemittanceAmount, this.grossPay, remittanceDate, this.codeValueService);
  }

  downloadCsvFile(csvText: string, batchNumber?: number) {
    const encodedData = btoa(csvText);
    const fileName = (batchNumber ? this.organizationInternalCode + ' Remittance batch ' + batchNumber : 'Pending Remittances Draft') + '.csv';
    this.commonService.base64FileSaveAs(encodedData, 'text/csv', 'utf-8', fileName);
  }

  initSignalR() {
    const componentName = 'PendingPayrollRemittancesComponent';
    this.notifyName = {
      NotifyName_BatchOperation_OnBatchMarkered: componentName + 'NotifyName_BatchOperation_OnBatchMarkered',
      NotifyName_BatchOperation_OnPreExecutionException: componentName + 'NotifyName_BatchOperation_OnPreExecutionException',
      NotifyName_BatchOperation_OnReleased: componentName + 'NotifyName_BatchOperation_OnReleased',
      NotifyName_BatchOperation_OnException: componentName + 'NotifyName_BatchOperation_OnException',
      NotifyName_BatchOperation_OnPreExecuted: componentName + 'NotifyName_BatchOperation_OnPreExecuted'
    };

    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchOperation_OnException, (event, data) => {
        this.refreshPageOnPrivateEvent(data, true, 'Exception', false);
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchOperation_OnBatchMarkered, (event, data) => {
        this.refreshPageOnPrivateEvent(data, true, null, false);
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchOperation_OnPreExecutionException, (event, data) => {
        this.refreshPageOnPrivateEvent(data, true, 'On batch pre-validation:', false);
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchOperation_OnPreExecuted, (event, data) => {
        this.selectedPaymentTransactionIds = new Array();
        this.RemittanceDate = null;
        this.phxTable.clearSelection();
        this.refreshPageOnPrivateEvent(data, false, data.Message, false);
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchOperation_OnReleased, (event, data) => {
        this.selectedPaymentTransactionIds = new Array();
        this.RemittanceDate = null;
        this.phxTable.clearSelection();
        this.refreshPageOnPrivateEvent(data, true, 'Remittance batch created successfully.', true);
        if (this.csvSnapshots.length > 0) {
          this.downloadFinalFile(data.BatchId);
        }
        if (this.continueRemittance === true) {
          this.goToRemittedBatch(data.BatchId);
        }
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
  }

  onContextMenuPreparing(event: any) {
    let profileTypeValue;
    if (event && event.row && event.row.rowType === 'data') {
      Object.keys(this.ApplicationConstants.UserProfileType).forEach(key => {
        if (event.row.data.LegalStatus === this.ApplicationConstants.UserProfileType[key]) {
          profileTypeValue = key;
        }
      });

      event.items = [
        {
          text: this.localizationService.translate('payroll.remittance.openPaymentTransactionNewTab'),
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/transaction/${event.row.data.TransactionId}/summary`);
          }
        },
        {
          text: this.localizationService.translate('payroll.remittance.openWorkerNewTab'),
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/contact/${event.row.data.ContactId}/profile/${profileTypeValue.toLowerCase()}/${event.row.data.WorkerId}`);
          }
        }
      ];
      if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.WorkOrderVersionId) {
        event.items.push({
          text: this.localizationService.translate('payroll.remittance.openWorkOrderNewTab'),
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.WorkOrderVersionId}/core`);
          }
        });
      }
    }
  }

  private refreshPageOnPrivateEvent(data, toCallServer, message, success) {
    const newLine: string = '<br/>';
    if (message !== null && typeof data.CountAll !== 'undefined' && data.CountAll !== null && typeof data.CountExecutionSuccess !== 'undefined' && data.CountExecutionSuccess !== null) {
      if (data.CountExecutionSuccess > 0) {
        message = message + newLine + data.CountExecutionSuccess + ' of ' + data.CountAll + ' remittances processed';
      }
      if (data.CountAll - data.CountExecutionSuccess > 0) {
        message = message + newLine + (data.CountAll - data.CountExecutionSuccess) + ' of ' + data.CountAll + ' remittances not processed';
      }

      if (data.CountAll === data.CountExecutionSuccess && data.CountAll > 0) {
        this.commonService.logSuccess(message);
      } else {
        this.commonService.logError(message);
      }
    } else if (success === true) {
      this.commonService.logSuccess(message);
    } else if (success === false) {
      this.commonService.logError(message);
    }

    if (typeof data.ValidationMessages !== 'undefined' && data.ValidationMessages && Object.keys(data.ValidationMessages).length !== 0) {
      this.ValidationMessages = data;
    }

    if (toCallServer) {
      this.phxTable.refresh();
    }
  }

  formatDate(x) {
    return moment(x).format('MMM DD, YYYY');
  }
}
