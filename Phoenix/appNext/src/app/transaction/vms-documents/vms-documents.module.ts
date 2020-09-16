import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoenixCommonModule } from '../../common/PhoenixCommon.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { VmsDocumentsRouting } from './vms-documents.routing';
import { VmsDocumentsHeaderComponent } from './shared/vms-documents-header/vms-documents-header.component';
import { VmsDocumentsCommissionComponent } from './vms-documents-commission/vms-documents-commission.component';
import { VmsDocumentsDiscountComponent } from './vms-documents-discount/vms-documents-discount.component';
import { VmsDocumentsFixedpriceComponent } from './vms-documents-fixedprice/vms-documents-fixedprice.component';
import { VmsDocumentsUssourcedeductionComponent } from './vms-documents-ussourcededuction/vms-documents-ussourcededuction.component';
import { VmsDocumentsTimesheetComponent } from './vms-documents-timesheet/vms-documents-timesheet.component';
import { VmsDocumentService } from './vms-document.service';
import { VmsDocumentsExpenseComponent } from './vms-documents-expense/vms-documents-expense.component';
import { VmsDocumentsDetailsComponent } from './shared/vms-documents-details/vms-documents-details.component';
import { VmsDocumentsFilesComponent } from './shared/vms-documents-files/vms-documents-files.component';
import { VmsDocumentsBatchHeaderComponent } from './shared/vms-documents-batch-header/vms-documents-batch-header.component';
import { VmsDocumentsBatchTimesheetComponent } from './vms-documents-batch-timesheet/vms-documents-batch-timesheet.component';
import { VmsDocumentsBatchDiscountComponent } from './vms-documents-batch-discount/vms-documents-batch-discount.component';
import { VmsDocumentsBatchUssourcedeductionComponent } from './vms-documents-batch-ussourcededuction/vms-documents-batch-ussourcededuction.component';
import { VmsDocumentsBatchFixedpriceComponent } from './vms-documents-batch-fixedprice/vms-documents-batch-fixedprice.component';
import { VmsDocumentsBatchExpenseComponent } from './vms-documents-batch-expense/vms-documents-batch-expense.component';
import { VmsDocumentsBatchCommissionComponent } from './vms-documents-batch-commission/vms-documents-batch-commission.component';
import { VmsService } from '../shared/Vms.service';
import { DxDataGridModule } from 'devextreme-angular';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DxDataGridModule,
    VmsDocumentsRouting,
    PhoenixCommonModule,
    TabsModule.forRoot()
  ],
  declarations: [
    VmsDocumentsHeaderComponent,
    VmsDocumentsCommissionComponent,
    VmsDocumentsDiscountComponent,
    VmsDocumentsExpenseComponent,
    VmsDocumentsFixedpriceComponent,
    VmsDocumentsUssourcedeductionComponent,
    VmsDocumentsTimesheetComponent,
    VmsDocumentsDetailsComponent,
    VmsDocumentsFilesComponent,
    VmsDocumentsBatchHeaderComponent,
    VmsDocumentsBatchTimesheetComponent,
    VmsDocumentsBatchDiscountComponent,
    VmsDocumentsBatchUssourcedeductionComponent,
    VmsDocumentsBatchFixedpriceComponent,
    VmsDocumentsBatchExpenseComponent,
    VmsDocumentsBatchCommissionComponent
  ],
  exports: [
  ]
  ,
  providers: [
    VmsDocumentService,
    VmsService,
  ],
  entryComponents: [
  ]
})

export class VmsDocumentsModule {
  constructor(private injector: Injector) {
  }
}
