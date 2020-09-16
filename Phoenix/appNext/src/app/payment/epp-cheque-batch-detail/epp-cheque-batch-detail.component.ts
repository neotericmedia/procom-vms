import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NavigationService, DialogService, LoadingSpinnerService, CodeValueService, CommonService, PhxConstants } from '../../common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../payment.service';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableConfiguration, PhxDataTableSelectionMode, PhxDataTableSelectallMode, PhxDataTableColumn, DialogResultType, CodeValue, PhxButton } from '../../common/model';
import { ChequeService } from '../cheque.service';
import { ChequePaymentStatusList } from '../share/cheque-payment-status-list';

@Component({
  selector: 'app-epp-cheque-batch-detail',
  templateUrl: './epp-cheque-batch-detail.component.html',
  styleUrls: ['./epp-cheque-batch-detail.component.less']
})
export class EppChequeBatchDetailComponent implements OnInit, OnDestroy {
  live: boolean = true;
  eppChequeBatchId: number;
  eppChequeBatch: any;
  bankId: number;
  bankName: string = '';
  organizationName: string = '';
  dateFormat: string;
  odataParams = '';
  originalOdataParams = oreq.request().withSelect([
    'Id',
    'ChequeNumber',
    'PaymentTotal',
    'PaymentDate',
    'PayeeName',
    'PaymentNumber',
    'OrganizationalInternalLegalName',
    'BankId',
    'BankName',
    'PaymentStatus',
    'PayeeTypeId'
  ]).url();

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    enableExport: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataType: 'number',
      dataField: 'Id',
      width: 100,
      caption: 'Payment ID',
      alignment: 'left'
    }),
    new PhxDataTableColumn({
      dataType: 'number',
      dataField: 'ChequeNumber',
      caption: 'Cheque Number',
      alignment: 'right'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentTotal',
      caption: 'Amount',
      dataType: 'money',
    }),
    new PhxDataTableColumn({
      dataField: 'PayeeName',
      caption: 'Payee Name',
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentDate',
      caption: 'Issue Date',
      dataType: 'date'
    }),
    new PhxDataTableColumn({
      dataField: 'PayeeTypeId',
      caption: 'Payee Type',
      alignment: 'left',
      lookup: {
        dataSource: this.getPayeeTypeLookup(),
        valueExpr: 'id',
        displayExpr: 'text'
      },
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentStatus',
      caption: 'Status',
      alignment: 'left',
      lookup: {
        dataSource: this.getPaymentStatusLookup(),
        valueExpr: 'id',
        displayExpr: 'text'
      },
    }),
  ];

  fabButtons: PhxButton[] = [{
    icon: 'get_app',
    tooltip: 'Download',
    btnType: 'primary',
    action: this.downloadBatchFile.bind(this)
  }];

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private chequeService: ChequeService,
    protected codeValueService: CodeValueService,
    protected commonService: CommonService,
  ) {
    this.dateFormat = PhxConstants.DateFormat.MMM_dd_yyyy;
  }

  ngOnInit() {
    this.navigationService.setTitle('epp-batch');
    this.route.params
      .takeWhile(() => this.live)
      .subscribe(params => {
        this.eppChequeBatchId = +params['eppChequeBatchId'];
        this.buildOdataParam(this.eppChequeBatchId);
        this.getBatchDetail(this.eppChequeBatchId);
      });
  }

  ngOnDestroy() {
    this.live = false;
  }

  buildOdataParam(eppChequeBatchId: number) {
    this.odataParams = this.originalOdataParams + `&$filter= EPPChequeBatchId eq ${eppChequeBatchId}`;
  }

  getBatchDetail(eppChequeBatchId: number) {
    this.chequeService.getChequeEPPBatch(this.eppChequeBatchId)
      .takeWhile(() => this.live)
      .subscribe((eppChequeBatch) => {
        this.eppChequeBatch = eppChequeBatch;
      });
  }

  dataReceived(data) {
    if (data.length > 0) {
      this.bankId = data[0].BankId;
      this.paymentService.getOriginalOrganizationBankAccount(this.bankId)
        .takeWhile(() => this.live)
        .subscribe((org) => {
          this.bankName = org.Items[0].OrganizationInternalRoles[0].BankAccounts.filter((item) => {
            return item.Id === this.bankId;
          })[0].BankName;

          this.navigationService.setTitle('epp-batch', [data[0].OrganizationalInternalLegalName, this.bankName, this.eppChequeBatchId]);
        });
    }
  }

  getPayeeTypeLookup() {
    return this.codeValueService.getCodeValues('payment.CodePayeeType', true);
  }

  getPaymentStatusLookup() {
    return this.codeValueService.getCodeValues('payment.CodePaymentStatus', true)
      .filter((codevalue: CodeValue) => ChequePaymentStatusList.includes(codevalue.id));
  }

  downloadBatchFile() {
    this.paymentService.getPaymentEPPChequeStream(this.eppChequeBatchId);
  }

  goToEPPBatches() {
    this.router.navigate([`eppchequebatch/org/${this.eppChequeBatch.OrganizationalIdInternal}/bank/${this.eppChequeBatch.BankId}/currency/${this.eppChequeBatch.CurrencyId}`], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to EPP Batches List`, err);
      });
  }

}
