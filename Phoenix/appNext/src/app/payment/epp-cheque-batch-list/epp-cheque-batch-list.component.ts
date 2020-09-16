import { Component, OnInit, OnDestroy } from '@angular/core';
import { PhxDataTableConfiguration, PhxDataTableColumn } from '../../common/model';
import { NavigationService } from '../../common';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { PaymentService } from '../payment.service';
import { OrganizationApiService } from '../../organization/organization.api.service';
import { Observable } from '../../../../node_modules/rxjs';

@Component({
  selector: 'app-epp-cheque-batch-list',
  templateUrl: './epp-cheque-batch-list.component.html',
  styleUrls: ['./epp-cheque-batch-list.component.less']
})
export class EppChequeBatchListComponent implements OnInit, OnDestroy {

  live: boolean = true;
  bankId?: number;
  organizationId?: number;
  currencyId?: number;
  oDataParams: string = '';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    enableExport: true
  });
  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataType: 'number',
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      alignment: 'left'
    }),
    new PhxDataTableColumn({
      dataField: 'CreatedDatetime',
      caption: 'Created Date',
      dataType: 'date'
    }),
    new PhxDataTableColumn({
      dataField: 'CreatedByName',
      caption: 'Created by',
    }),
    new PhxDataTableColumn({
      dataType: 'number',
      dataField: 'NumberofCheques',
      caption: 'Number of Cheques',
      alignment: 'right'
    }),
    new PhxDataTableColumn({
      dataField: 'TotalAmount',
      caption: 'Total Amount',
      dataType: 'money'
    }),
    new PhxDataTableColumn({
      dataField: 'Id',
      caption: 'Action',
      alignment: 'center',
      allowFiltering: false,
      allowSearch: false,
      cellTemplate: 'actionCellTemplate'
    })
  ];

  constructor(
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private organizationApiService: OrganizationApiService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.route.params.takeWhile(() => this.live)
      .subscribe(params => {
        this.bankId = +params['bankId'];
        this.organizationId = +params['orgId'];
        this.currencyId = +params['currencyId'];
        this.updateDataSourceParams();
        this.setPageTitle();
      });
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
      this.navigationService.setTitle('epp-batch', [organizationName, bankName]);
    });
  }

  updateDataSourceParams() {
    const filter = oreq.filter('BankId').eq(this.bankId)
      .and().filter('OrganizationalIdInternal').eq(this.organizationId)
      .and().filter('CurrencyId').eq(this.currencyId);
    this.oDataParams = oreq.request().withSelect([
      'Id',
      'CreatedDatetime',
      'CreatedByName',
      'NumberofCheques',
      'TotalAmount'
    ])
      .withFilter(filter)
      .url();
  }

  public onRowClick(event: any) {
    const batchId = event.data.Id;
    this.router.navigate([`epp-cheque-batch-detail/${batchId}`], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to EPP cheque batch detail`, err);
      });
  }

  public onDownloadAction(event: Event, batchId: number) {
    event.stopPropagation();
    this.paymentService.getPaymentEPPChequeStream(batchId);
  }

  ngOnDestroy(): void {
    this.live = false;
  }

}
