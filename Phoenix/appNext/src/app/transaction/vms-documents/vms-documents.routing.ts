// angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// common
import { PhxConstants } from './../../common/index';
import { VmsDocumentsHeaderComponent } from './shared/vms-documents-header/vms-documents-header.component';
import { VmsDocumentsTimesheetComponent } from './vms-documents-timesheet/vms-documents-timesheet.component';
import { VmsDocumentsDiscountComponent } from './vms-documents-discount/vms-documents-discount.component';
import { VmsDocumentsUssourcedeductionComponent } from './vms-documents-ussourcededuction/vms-documents-ussourcededuction.component';
import { VmsDocumentsExpenseComponent } from './vms-documents-expense/vms-documents-expense.component';
import { VmsDocumentsCommissionComponent } from './vms-documents-commission/vms-documents-commission.component';
import { VmsDocumentsFixedpriceComponent } from './vms-documents-fixedprice/vms-documents-fixedprice.component';
import { VmsDocumentsBatchTimesheetComponent } from './vms-documents-batch-timesheet/vms-documents-batch-timesheet.component';
import { VmsDocumentsBatchFixedpriceComponent } from './vms-documents-batch-fixedprice/vms-documents-batch-fixedprice.component';
import { VmsDocumentsBatchCommissionComponent } from './vms-documents-batch-commission/vms-documents-batch-commission.component';
import { VmsDocumentsBatchExpenseComponent } from './vms-documents-batch-expense/vms-documents-batch-expense.component';
import { VmsDocumentsBatchUssourcedeductionComponent } from './vms-documents-batch-ussourcededuction/vms-documents-batch-ussourcededuction.component';
import { VmsDocumentsBatchDiscountComponent } from './vms-documents-batch-discount/vms-documents-batch-discount.component';

export const VmsDocumentsRouting = RouterModule.forChild([
  // EXPENSE http://localhost:4200/#/next/vms/expense/InternalOrganization/1/document/7372/details
  // TIMESHEET http://localhost:4200/#/next/vms/timesheet/InternalOrganization/488/document/21443/details

  // url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/document/{documentId:[0-9]{1,8}}',

  // :organizationIdInternal = ${event.OrganizationIdInternal}
  // :documentId = ${event.DocumentId}
  // :tabId = details, files, workflow

  { path: 'timesheet/InternalOrganization/:internalOrganizationId/document/:documentId/:tabId', component: VmsDocumentsTimesheetComponent },
  { path: 'discount/InternalOrganization/:internalOrganizationId/document/:documentId/:tabId', component: VmsDocumentsDiscountComponent, pathMatch: 'full' },
  { path: 'ussourcededuction/InternalOrganization/:internalOrganizationId/document/:documentId/:tabId', component: VmsDocumentsUssourcedeductionComponent, pathMatch: 'full' },
  { path: 'expense/InternalOrganization/:internalOrganizationId/document/:documentId/:tabId', component: VmsDocumentsExpenseComponent, pathMatch: 'full' },
  { path: 'commission/InternalOrganization/:internalOrganizationId/document/:documentId/:tabId', component: VmsDocumentsCommissionComponent, pathMatch: 'full' },
  { path: 'fixedprice/InternalOrganization/:internalOrganizationId/document/:documentId/:tabId', component: VmsDocumentsFixedpriceComponent, pathMatch: 'full' },

  { path: 'batch/timesheet/processed/:recordId/:tabId', component: VmsDocumentsBatchTimesheetComponent, pathMatch: 'full' },
  { path: 'batch/discount/processed/:recordId/:tabId', component: VmsDocumentsBatchDiscountComponent, pathMatch: 'full' },
  { path: 'batch/ussourcededuction/processed/:recordId/:tabId', component: VmsDocumentsBatchUssourcedeductionComponent, pathMatch: 'full' },
  { path: 'batch/expense/processed/:recordId/:tabId', component: VmsDocumentsBatchExpenseComponent, pathMatch: 'full' },
  { path: 'batch/commission/processed/:recordId/:tabId', component: VmsDocumentsBatchCommissionComponent, pathMatch: 'full' },
  { path: 'batch/fixedprice/processed/:recordId/:tabId', component: VmsDocumentsBatchFixedpriceComponent, pathMatch: 'full' },

  { path: '**', component: VmsDocumentsHeaderComponent, pathMatch: 'full' }
]);
