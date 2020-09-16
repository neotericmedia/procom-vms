import { PhoenixCommonModule } from './../common/PhoenixCommon.module';
import { WorkerCompensationModule } from './WorkerCompensation/WorkerCompensation.module';
import { WCBSubdivisionModule } from './WCBSubdivision/WCBSubdivision.module';
import { Routes, Router, RouterModule,  ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import { WCBSubdivisionService } from './Services/WCBSubdivision.service';
import { WorkerCompensationService } from './Services/WorkerCompensation.service';
import { PayrollService } from './payroll.service';
import { OrganizationApiService } from './../organization/organization.api.service';
import { SalesTaxesSearchComponent } from './sales-taxes-search/sales-taxes-search.component';
import { PayrollTaxesSearchComponent } from './payroll-taxes-search/payroll-taxes-search.component';
import { SalesTaxService } from './Services/SalesTax.service';

import {
  DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDataGridModule,
  DxButtonModule, DxDateBoxModule, DxNumberBoxModule, DxTextAreaModule, DxRadioGroupModule
} from 'devextreme-angular';
import { PayrollRemittanceComponent } from './payroll-remittance/payroll-remittance.component';
import { PayrollRemittanceBatchComponent } from './payroll-remittance-batch/payroll-remittance-batch.component';

import { PendingPayrollRemittancesComponent } from './pending-payroll-remittances/pending-payroll-remittances.component';
import { PendingPayrollRemittancesResolver } from './pending-payroll-remittances/pending-payroll-remittances.resolver';

import { PayrollRemittanceBatchHeaderComponent } from './payroll-remittance-batch-header/payroll-remittance-batch-header.component';
import { PayrollRemittanceBatchDetailsComponent } from './payroll-remittance-batch-details/payroll-remittance-batch-details.component';
import { PayrollRemittanceBatchSummaryComponent } from './payroll-remittance-batch-summary/payroll-remittance-batch-summary.component';
import { PayrollRemittanceBatchWorkflowComponent } from './payroll-remittance-batch-workflow/payroll-remittance-batch-workflow.component';
import { SalesTaxDetailsComponent } from './sales-tax-details/sales-tax-details.component';
import { PhxTaxVersionsComponent } from './phx-tax-versions/phx-tax-versions.component';
import { PayrollFederaltaxDetailsComponent } from './payroll-federaltax-details/payroll-federaltax-details.component';
import { PayrollTaxrateComponent } from './payroll-taxrate/payroll-taxrate.component';
// import { InputTextLimitWithDecimalsDirective } from '../common/directives/inputTextLimitWithDecimals.directive';
import { PayrollProvincialTaxComponent } from './payroll-provincial-tax/payroll-provincial-tax.component';
import { PayrollTaxesFederalComponent } from './PayrollNewTax/PayrollCreateFederalTax/payroll-taxes-federal.component';
import { PayrollTaxesProvincialComponent } from './PayrollNewTax/PayrollCreateProvincialTax/payroll-taxes-provincial.component';
import { NavigationService } from '../common';
// import { PhxDisplayCurrency } from '../common/pipes/phxDisplayCurrency.pipe';

const payrollRoute: Routes = [
  { path: '', redirectTo: 'workercompensation', pathMatch: 'full' },
  { path: 'workercompensation', loadChildren: 'app/payroll/WorkerCompensation/WorkerCompensation.module#WorkerCompensationModule', data: { key: 'payroll-worker-compensation-setup', } },
  { path: 'wcbsubdivision', loadChildren: 'app/payroll/WCBSubdivision/WCBSubdivision.module#WCBSubdivisionModule', data: {/* key: 'payroll-wbc' */ } },
  { path: 'sales-taxes-search', component: SalesTaxesSearchComponent },
  { path: 'salesTaxDetails/:salesTaxId/salesTaxVersion/:salesTaxVersionId', component: SalesTaxDetailsComponent },
  { path: 'payroll-taxes-search', component: PayrollTaxesSearchComponent },
  { path: 'remittance', component: PayrollRemittanceComponent },
  { path: 'remittancebatch/:organizationIdInternal', component: PayrollRemittanceBatchComponent, pathMatch: 'full' },
  {
    path: 'remittancebatch/:organizationIdInternal/batch/:batchId', component: PayrollRemittanceBatchHeaderComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'details' },
      {
        path: 'details', component: PayrollRemittanceBatchDetailsComponent,
        resolve: {
          resolvedData: PendingPayrollRemittancesResolver
        }
      },
      { path: 'summary', component: PayrollRemittanceBatchSummaryComponent },
      { path: 'workflow', component: PayrollRemittanceBatchWorkflowComponent },
    ]
  },
  {
    path: 'pending-ws-remittance/organization/:OrganizationIdInternal/currency/:CurrencyId',
    component: PendingPayrollRemittancesComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Pending Worker Safety Remittances',
      dataSourceUrl: 'Payroll/getListPendingPaymentTransactionRemittanceWorkerSafety',
      dataGridComponentName: 'payrollPendingWorkerSafetyRemittance',
      exportFileName: 'payrollPendingWorkerSafetyRemittance',
      remittanceType: 'wcb',
    },
    resolve: {
      resolvedData: PendingPayrollRemittancesResolver
    }
  },
  {
    path: 'pending-pd-remittance/organization/:OrganizationIdInternal/currency/:CurrencyId',
    component: PendingPayrollRemittancesComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Pending Payroll Deduction Remittances',
      dataSourceUrl: 'Payroll/getListPendingPaymentTransactionRemittancePayroll',
      dataGridComponentName: 'payrollPendingPayrollDeductionRemittance',
      exportFileName: 'payrollPendingPayrollDeductionRemittance',
      remittanceType: 'payroll-deduction',
    }
  },
  {
    path: 'pending-ht-remittance/organization/:OrganizationIdInternal/currency/:CurrencyId',
    component: PendingPayrollRemittancesComponent,
    data: {
      pageTitle: 'Pending Health Tax Remittances',
      dataSourceUrl: 'Payroll/getListPendingPaymentTransactionRemittanceHealthTax',
      dataGridComponentName: 'payrollPendingHealthTaxRemittance',
      exportFileName: 'payrollPendingHealthTaxRemittance',
      remittanceType: 'health-tax',
    }
  },
  {
    path: 'federalTax/:federalTaxHeaderId/:federalTaxVersionId', component: PayrollFederaltaxDetailsComponent, pathMatch: 'full'
  },
  { path: 'payroll-provincial-tax/:taxId/:taxVersionId', component: PayrollProvincialTaxComponent, pathMatch: 'full' }
];

export const payrollRouting = RouterModule.forChild(payrollRoute);

@NgModule({
  imports: [
    CommonModule, payrollRouting, WorkerCompensationModule, WCBSubdivisionModule, PhoenixCommonModule,
    DxButtonModule, DxDataGridModule, DxSelectBoxModule,
    DxTextBoxModule, DxTextAreaModule, DxNumberBoxModule,
    DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule,
    FormsModule, ReactiveFormsModule,
  ],
  declarations: [
    SalesTaxesSearchComponent,
    PayrollTaxesSearchComponent,
    PayrollRemittanceComponent,
    PendingPayrollRemittancesComponent,
    PayrollRemittanceBatchComponent,
    PayrollRemittanceBatchHeaderComponent,
    PayrollRemittanceBatchDetailsComponent,
    PayrollRemittanceBatchSummaryComponent,
    PayrollRemittanceBatchWorkflowComponent,
    SalesTaxDetailsComponent,
    PhxTaxVersionsComponent,
    PayrollFederaltaxDetailsComponent,
    PayrollTaxrateComponent,
    PayrollProvincialTaxComponent
    // PhxDisplayCurrency
    , PayrollTaxesFederalComponent // fix me
    , PayrollTaxesProvincialComponent // fix me
  ],
  providers: [WCBSubdivisionService, WorkerCompensationService, PayrollService, OrganizationApiService, 
    PendingPayrollRemittancesResolver,
    SalesTaxService
  ],
  exports: [
  ]

})
export class PayrollModule {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private $nav: NavigationService
  ) {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map(route => {
        while (route.firstChild) { route = route.firstChild; }
        return route;
      })
      .filter(route =>
        route.outlet === 'primary'
      )
      .mergeMap(route => {
        return route.data;
      }
      )
      .subscribe((event) => {
        if (event['key']) {
          this.$nav.setTitle(event['key']);
        }
      }
      );

  }
}
