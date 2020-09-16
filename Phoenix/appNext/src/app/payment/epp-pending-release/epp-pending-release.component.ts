import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationService, DialogService, LoadingSpinnerService, CodeValueService, CommonService, PhxConstants } from '../../common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../payment.service';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableConfiguration, PhxDataTableSelectionMode, PhxDataTableSelectallMode, PhxDataTableColumn, DialogResultType, CodeValue } from '../../common/model';
import { EPPChequePaymentStatusList } from '../share/epp-cheque-payment-status-list';
import { Observable } from '../../../../node_modules/rxjs';
import { OrganizationApiService } from '../../organization/organization.api.service';

@Component({
  selector: 'app-epp-pending-release',
  templateUrl: './epp-pending-release.component.html',
  styleUrls: ['./epp-pending-release.component.less']
})
export class EppPendingReleaseComponent implements OnInit {
  live: boolean = true;
  organizationId?: number;
  bankId?: number;
  currencyId?: number;
  bankName: string = '';
  organizationName: string = '';
  selectedRowKeys: any[] = [];
  oDataParams = '';
  @ViewChild('grid') grid: PhxDataTableComponent;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectionMode: PhxDataTableSelectionMode.Multiple,
    selectAllMode: PhxDataTableSelectallMode.Page,
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

  constructor(
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private organizationApiService: OrganizationApiService,
    private dialogService: DialogService,
    private loadingSpinnerService: LoadingSpinnerService,
    protected codeValueService: CodeValueService,
    protected commonService: CommonService,
  ) { }

  ngOnInit() {
    this.navigationService.setTitle('epp-pending');
    this.route.params
      .takeWhile(() => this.live)
      .subscribe(params => {
        this.organizationId = +params['orgId'];
        this.bankId = +params['bankId'];
        this.currencyId = +params['currencyId'];
        this.updateDataSourceParams();
        this.setPageTitle();
      });
  }

  updateDataSourceParams() {
    const filter = oreq.filter('BankId').eq(this.bankId)
      .and().filter('OrganizationalIdInternal').eq(this.organizationId)
      .and().filter('CurrencyId').eq(this.currencyId);
    this.oDataParams = oreq.request().withSelect([
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
    ])
      .withFilter(filter)
      .url();
  }

  getPayeeTypeLookup() {
    return this.codeValueService.getCodeValues('payment.CodePayeeType', true);
  }

  getPaymentStatusLookup() {
    return this.codeValueService.getCodeValues('payment.CodePaymentStatus', true)
      .filter((codevalue: CodeValue) => EPPChequePaymentStatusList.includes(codevalue.id));
  }

  setPageTitle() {
    const bankName$ = this.paymentService.getOriginalOrganizationBankAccount(this.bankId)
      .map(org => {
        return org.Items[0].OrganizationInternalRoles[0].BankAccounts.filter((item) => {
          return item.Id === this.bankId;
        })[0].BankName;
      });
    const organizationName$ = this.organizationApiService.getOrganizationName(this.organizationId)
      .takeWhile(() => this.live).map(res => {
        return res.Items[0].LegalName;
      });
    Observable.forkJoin([bankName$, organizationName$]).takeWhile(() => this.live).subscribe(results => {
      const bankName = results[0];
      const organizationName = results[1];
      this.navigationService.setTitle('epp-pending', [organizationName, bankName]);
    });
  }

  onSelectionChanged(event) {
    this.selectedRowKeys = event.selectedRowKeys;
  }

  processPendingEpp() {
    this.dialogService.confirm('Process', `Are you sure you want to Process?`)
      .then((button) => {
        if (button === DialogResultType.Yes) {
          this.loadingSpinnerService.show();
          const paymentIds: number[] = this.selectedRowKeys.map(row => row.Id);
          if (paymentIds.length > 0) {
            this.paymentService
              .processEPPPending(paymentIds)
              .then(response => {
                this.paymentService.getPaymentEPPChequeStream(response.EntityId);
                this.loadingSpinnerService.hide();
                this.grid.refresh();
              })
              .catch(error => {
                this.commonService.logError('Error processing EPP pending.', error);
                this.loadingSpinnerService.hide();
              });
          }
        }
      });
  }

}
