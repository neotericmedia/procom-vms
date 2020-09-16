import { RouterModule } from '@angular/router';
import { TransactionSearchComponent } from './component/transaction-search/transaction-search.component';
import { TransactionReleaseVacationPayComponent } from './transaction-release-vacation-pay/transaction-release-vacation-pay.component';
import { VmsBatchSearchComponent } from './vms-batch-search/vms-batch-search.component';
import { VmsTransactionConflictSearchComponent } from './vms-transaction-conflict-search/vms-transaction-conflict-search.component';

import { VmsTransactionExpenseConflictSearchComponent } from './vms-transaction-expense-conflict-search/vms-transaction-expense-conflict-search.component';
import { VmsExpenseProcessComponent } from './vms-expense-process/vms-expense-process.component';

import { VmsTransactionCommissionConflictSearchComponent } from './vms-transaction-commission-conflict-search/vms-transaction-commission-conflict-search.component';
import { VmsCommissionProcessComponent } from './vms-commission-process/vms-commission-process.component';

import { VmsTransactionFixedPriceConflictSearchComponent } from './vms-transaction-fixedprice-conflict-search/vms-transaction-fixedprice-conflict-search.component';
import { VmsFixedPriceProcessComponent } from './vms-fixedprice-process/vms-fixedprice-process.component';

import { VmsTransactionDiscountConflictSearchComponent } from './vms-transaction-discount-conflict-search/vms-transaction-discount-conflict-search.component';
import { VmsDiscountProcessComponent } from './vms-discount-process/vms-discount-process.component';

import { VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent } from './vms-transaction-ussourcededuction-conflict-search/vms-transaction-ussourcededuction-conflict-search.component';
import { VmsUnitedStatesSourceDeductionProcessComponent } from './vms-ussourcededuction-process/vms-ussourcededuction-process.component';

import { VmsTimesheetProcessComponent } from './vms-timesheet-process/vms-timesheet-process.component';

import { VmsPreprocessComponent } from './vms-preprocess/vms-preprocess.component';
import { VmsPreprocessDocumentListResolver } from './vms-preprocess/vms-preprocess-document-list.resolver';
import { VmsPreprocessDetailTimesheetComponent } from './vms-preprocess/vms-preprocess-detail-timesheet.component';
import { VmsPreprocessDetailDiscountComponent } from './vms-preprocess/vms-preprocess-detail-discount.component';
import { VmsPreprocessDetailExpenseComponent } from './vms-preprocess/vms-preprocess-detail-expense.component';
import { VmsPreprocessDetailCommissionComponent } from './vms-preprocess/vms-preprocess-detail-commission.component';
import { VmsPreprocessDetailFixedPriceComponent } from './vms-preprocess/vms-preprocess-detail-fixedprice.component';
import { VmsPreprocessDetailUnitedstatessourcedeductionComponent } from './vms-preprocess/vms-preprocess-detail-unitedstatessourcededuction.component';
import { VmsBatchManagementComponent } from './vms-batch-management/vms-batch-management.component';
import { VmsManagementComponent } from './vms-management/vms-management.component';
import { TransactionComponent } from './transaction/transaction.component';

export const TransactionRouting = RouterModule.forChild([
  { path: 'search', component: TransactionSearchComponent, pathMatch: 'full' },
  { path: 'releasevacationpay/:workOrderVersionId', component: TransactionReleaseVacationPayComponent, pathMatch: 'full' },
  {
    path: 'vms-discount/org/:organizationId',
    component: VmsBatchSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'thirdpartyimport-manage-discount',
      dataSourceUrl: 'vms/getVmsDiscountSummary/internalOrganization/',
      dataGridComponentName: 'VmsDiscountManagement',
      exportFileName: 'VmsDiscountDocuments',
      goState: 'vms-discount.document.details'
    }
  },
  {
    path: 'vms-preprocess/:organizationIdInternal/:organizationIdClient/:documentPublicId',
    component: VmsPreprocessComponent,
    resolve: {
      documents: VmsPreprocessDocumentListResolver
    },
    children: [
      {
        path: 'timesheet/:docPublicId',
        component: VmsPreprocessDetailTimesheetComponent
      },
      {
        path: 'discount/:docPublicId',
        component: VmsPreprocessDetailDiscountComponent
      },
      {
        path: 'expense/:docPublicId',
        component: VmsPreprocessDetailExpenseComponent
      },
      {
        path: 'commission/:docPublicId',
        component: VmsPreprocessDetailCommissionComponent
      },
      {
        path: 'fixedprice/:docPublicId',
        component: VmsPreprocessDetailFixedPriceComponent
      },
      {
        path: 'unitedstatessourcededuction/:docPublicId',
        component: VmsPreprocessDetailUnitedstatessourcedeductionComponent
      }
    ]
  },
  {
    path: 'vms-discount/process/:organizationIdInternal',
    component: VmsDiscountProcessComponent
  },
  {
    path: 'vms-ussourcededuction/org/:organizationId',
    component: VmsBatchSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'thirdpartyimport-manage-ussourcededuction',
      dataSourceUrl: 'vms/getVmsUnitedStatesSourceDeductionSummary/internalOrganization/',
      dataGridComponentName: 'VmsUnitedStatesSourceDeductionManagement',
      exportFileName: 'VmsUnitedStatesSourceDeductionDocuments',
      goState: 'vms-ussourcededuction.document.details'
    }
  },
  {
    path: 'vms-ussourcededuction/process/:organizationIdInternal',
    component: VmsUnitedStatesSourceDeductionProcessComponent
  },
  {
    path: 'vms-expense/process/:organizationIdInternal',
    component: VmsExpenseProcessComponent
  },
  {
    path: 'vms-timesheet/process/:organizationIdInternal',
    component: VmsTimesheetProcessComponent
  },
  {
    path: 'vms-commission/process/:organizationIdInternal',
    component: VmsCommissionProcessComponent
  },
  {
    path: 'vms-fixedprice/process/:organizationIdInternal',
    component: VmsFixedPriceProcessComponent
  },
  {
    path: 'vms-timesheet/org/:organizationId',
    component: VmsBatchSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'thirdpartyimport-manage-timesheet',
      dataSourceUrl: 'vms/getVmsTimesheetDocument/internalOrganization/',
      dataGridComponentName: 'VmsTimesheetManagement',
      exportFileName: 'VmsTimesheetDocuments',
      goState: 'vms.timesheet.document.details'
    }
  },
  {
    path: 'vms-expense/org/:organizationId',
    component: VmsBatchSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'thirdpartyimport-manage-expense',
      dataSourceUrl: 'vms/getVmsExpenseSummary/internalOrganization/',
      dataGridComponentName: 'VmsExpenseManagement',
      exportFileName: 'VmsExpenseDocuments',
      goState: 'vms-expense.document.details'
    }
  },
  {
    path: 'vms-timesheet-conflict/search/:OrganizationIdInternal',
    component: VmsTransactionConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getClientConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsTimesheetConflictSearch',
      exportFileName: 'VmsTimesheetConflicts',
      conflictType: 'timesheet'
    }
  },
  {
    path: 'vms-timesheet-conflict/search/:OrganizationIdInternal/client/:OrganizationIdClient',
    component: VmsTransactionConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getClientConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsTimesheetConflictSearch',
      exportFileName: 'VmsTimesheetConflicts',
      conflictType: 'timesheet'
    }
  },
  {
    path: 'vms-discount-conflict/search/:OrganizationIdInternal',
    component: VmsTransactionDiscountConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Discount Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsDiscountConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsDiscountConflictSearch',
      exportFileName: 'VmsDiscountConflicts',
      conflictType: 'discount'
    }
  },
  {
    path: 'vms-discount-conflict/search/:OrganizationIdInternal/client/:OrganizationIdClient',
    component: VmsTransactionDiscountConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Discount Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsDiscountConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsDiscountConflictSearch',
      exportFileName: 'VmsDiscountConflicts',
      conflictType: 'discount'
    }
  },
  {
    path: 'vms-ussourcededuction-conflict/search/:OrganizationIdInternal',
    component: VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'UnitedStates Source Deduction Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsUnitedStatesSourceDeductionConflicts/internalOrganization/:OrganizationIdInternal',
      dataGridComponentName: 'VmsUnitedStatesSourceDeductionConflictSearch',
      exportFileName: 'VmsUnitedStatesSourceDeductionConflicts',
      conflictType: 'ussourcededuction'
    }
  },
  {
    path: 'vms-ussourcededuction-conflict/search/:OrganizationIdInternal/client/-1',
    component: VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'United States Source Deduction Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsUnitedStatesSourceDeductionConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/-1',
      dataGridComponentName: 'VmsUnitedStatesSourceDeductionConflictSearch',
      exportFileName: 'VmsUnitedStatesSourceDeductionConflicts',
      conflictType: 'ussourcededuction'
    }
  },
  {
    path: 'vms-expense-conflict/search/:OrganizationIdInternal',
    component: VmsTransactionExpenseConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Expense Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsExpenseConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsExpenseConflictSearch',
      exportFileName: 'VmsExpenseConflicts',
      conflictType: 'expense'
    }
  },
  {
    path: 'vms-expense-conflict/search/:OrganizationIdInternal/client/:OrganizationIdClient',
    component: VmsTransactionExpenseConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Expense Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsExpenseConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsExpenseConflictSearch',
      exportFileName: 'VmsExpenseConflicts',
      conflictType: 'expense'
    }
  },
  {
    path: 'vms-fixedprice-conflict/search/:OrganizationIdInternal',
    component: VmsTransactionFixedPriceConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Fixed Price Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsFixedPriceConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsFixedPriceConflictSearch',
      exportFileName: 'VmsFixedPriceConflicts',
      conflictType: 'fixedprice'
    }
  },
  {
    path: 'vms-commission-conflict/search/:OrganizationIdInternal',
    component: VmsTransactionCommissionConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Commission Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsCommissionConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsCommissionConflictSearch',
      exportFileName: 'VmsCommissionConflicts',
      conflictType: 'commission'
    }
  },
  {
    path: 'vms-commission-conflict/search/:OrganizationIdInternal/client/:OrganizationIdClient',
    component: VmsTransactionCommissionConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Commission Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsCommissionConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsCommissionConflictSearch',
      exportFileName: 'VmsCommissionConflicts',
      conflictType: 'commission'
    }
  },
  {
    path: 'vms-fixedprice-conflict/search/:OrganizationIdInternal/client/:OrganizationIdClient',
    component: VmsTransactionFixedPriceConflictSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'Fixed Price Transactions with conflicts',
      dataSourceUrl: 'transactionHeader/getVmsFixedPriceConflicts/internalOrganization/:OrganizationIdInternal/clientOrganization/:OrganizationIdClient',
      dataGridComponentName: 'VmsFixedPriceConflictSearch',
      exportFileName: 'VmsFixedPriceConflicts',
      conflictType: 'fixedprice'
    }
  },
  {
    path: 'vms-commission/org/:organizationId',
    component: VmsBatchSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'thirdpartyimport-manage-commission',
      dataSourceUrl: 'vms/getVmsCommissionSummary/internalOrganization/',
      dataGridComponentName: 'VmsCommissionManagement',
      exportFileName: 'VmsCommissionDocuments',
      goState: 'vms-commission.document.details'
    }
  },
  {
    path: 'vms-fixedprice/org/:organizationId',
    component: VmsBatchSearchComponent,
    pathMatch: 'full',
    data: {
      pageTitle: 'thirdpartyimport-manage-fixedprice',
      dataSourceUrl: 'vms/getVmsFixedPriceSummary/internalOrganization/',
      dataGridComponentName: 'VmsFixedPriceManagement',
      exportFileName: 'VmsFixedPriceDocuments',
      goState: 'vms-fixedprice.document.details'
    }
  },
  {
    path: 'vms/management',
    component: VmsManagementComponent,
    pathMatch: 'full'
  },
  {
    path: 'vms/batch/management',
    component: VmsBatchManagementComponent,
    pathMatch: 'full'
  },
  { path: ':transactionHeaderId/:tabName', component: TransactionComponent, pathMatch: 'full' },

  { path: '**', component: TransactionSearchComponent, pathMatch: 'full' }
]);
