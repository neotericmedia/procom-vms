import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommonModule, DatePipe } from '@angular/common';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';

import {
  DxSelectBoxModule
  , DxTextBoxModule
  , DxCheckBoxModule
  , DxDataGridModule
  , DxButtonModule
  , DxDateBoxModule
  , DxNumberBoxModule
  , DxTextAreaModule
  , DxRadioGroupModule
} from 'devextreme-angular';

import { PhoenixCommonModule } from './../common/PhoenixCommon.module';

import { ExpenseRouting } from './expense.routing';
import { ExpenseClaimService } from './service/expense-claim.service';
import { ExpenseCategoryService } from './service/expense-category.service';

import { ExpenseClaimNotesAttachmentsItemDetailComponent } from './component/expense-claim-notes-attachments-item-detail/expense-claim-notes-attachments-item-detail.component';
import { ExpenseSearchComponent } from './component/expense-search/expense-search.component';

import { ExpenseDetailComponent } from './component/expense-detail/expense-detail.component';
import { ExpenseHeaderComponent } from './component/expense-header/expense-header.component';
import { ExpenseItemListComponent } from './component/expense-item-list/expense-item-list.component';
import { ExpenseClaimDetailComponent } from './component/expense-claim-detail/expense-claim-detail.component';
import { ExpenseClaimSummaryComponent } from './component/expense-claim-summary/expense-claim-summary.component';
import { ExpenseClaimComponent } from './component/expense-claim/expense-claim.component';
import { ExpenseItemComponent } from './component/expense-item/expense-item.component';
import { SetupExpenseClaimComponent } from './component/setup-expense-claim/setup-expense-claim.component';
import { ExpenseClaimNotesAttachmentsComponent } from './component/expense-claim-notes-attachments/expense-claim-notes-attachments.component';
import { ExpenseItemDetailComponent } from './component/expense-item-detail/expense-item-detail.component';
import { ExpenseItemCategorySelectorComponent } from './component/expense-item-category-selector/expense-item-category-selector.component';
import { ExpenseItemAttachmentsComponent } from './component/expense-item-attachments/expense-item-attachments.component';
import { ExpenseItemDynamicFieldComponent } from './component/expense-item-dynamic-field/expense-item-dynamic-field.component';
import { CodeValuePipe } from '../common';
import { ExpenseCategoryIconComponent } from './component/expense-category-icon/expense-category-icon.component';
import { ExpenseClaimHistoryComponent } from './component/expense-claim-history/expense-claim-history.component';
import { ExpenseExceptionsSearchComponent } from './component/expense-exceptions-search/expense-exceptions-search.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PhoenixCommonModule,
    DxButtonModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxRadioGroupModule,
    ExpenseRouting,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    PhxDocumentFileUploadModule,
  ],
  declarations: [
    ExpenseSearchComponent,
    ExpenseDetailComponent,
    ExpenseHeaderComponent,
    ExpenseItemListComponent,
    ExpenseClaimDetailComponent,
    ExpenseClaimSummaryComponent,
    ExpenseClaimComponent,
    ExpenseItemComponent,
    SetupExpenseClaimComponent,
    ExpenseClaimNotesAttachmentsComponent,
    ExpenseItemDetailComponent,
    ExpenseItemCategorySelectorComponent,
    ExpenseItemAttachmentsComponent,
    ExpenseItemDynamicFieldComponent,
    ExpenseClaimNotesAttachmentsItemDetailComponent,
    ExpenseCategoryIconComponent,
    ExpenseClaimHistoryComponent,
    ExpenseExceptionsSearchComponent,
  ],
  providers: [
    ExpenseClaimService,
    ExpenseCategoryService,
    CodeValuePipe,
    DatePipe
  ]
})
export class ExpenseModule {
}
