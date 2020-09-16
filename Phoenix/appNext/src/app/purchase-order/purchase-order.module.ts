import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '../common/ngx-strongly-typed-forms/model';

import { PurchaseOrderRouting } from './purchase-order.routing';
import { PurchaseOrderSearchComponent } from './component/purchase-order-search/purchase-order-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import {
  DxButtonModule
  , DxDataGridModule
  , DxSelectBoxModule
  , DxTextBoxModule
  , DxTextAreaModule
  , DxNumberBoxModule
  , DxCheckBoxModule
  , DxDateBoxModule
  , DxRadioGroupModule
} from 'devextreme-angular';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PurchaseOrderDetailsComponent } from './purchase-order-details/purchase-order-details.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderObservableService } from './state/purchase-order.observable.service';
import { PurchaseOrderTabWorkorderComponent } from './purchase-order-tab-workorder/purchase-order-tab-workorder.component';
import { PurchaseOrderTabHistoryComponent } from './purchase-order-tab-history/purchase-order-tab-history.component';
import { PurchaseOrderTabDocumentsComponent } from './purchase-order-tab-documents/purchase-order-tab-documents.component';
import { PurchaseOrderHeaderComponent } from './purchase-order-header/purchase-order-header.component';
import { PurchaseOrderTabDetailsComponent } from './purchase-order-tab-details/purchase-order-tab-details.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { PurchaseOrderApiServiceLocator } from './purchase-order.api.service.locator';
import { PurchaseOrderDetailsLinesComponent } from './purchase-order-details-lines/purchase-order-details-lines.component';
import { PurchaseOrderNewComponent } from './purchase-order-new/purchase-order-new.component';
import { PurchaseOrderWorkOrdersComponent } from './component/purchase-order-work-orders/purchase-order-work-orders.component';
import { PurchaseOrderEditModalComponent} from './purchase-order-edit-modal/purchase-order-edit-modal.component';

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
    PurchaseOrderRouting,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    InfiniteScrollModule,
    PhxDocumentFileUploadModule,
  ],
  declarations: [
    PurchaseOrderSearchComponent,
    PurchaseOrderDetailsComponent,
    PurchaseOrderComponent,
    PurchaseOrderTabWorkorderComponent,
    PurchaseOrderTabHistoryComponent,
    PurchaseOrderTabDocumentsComponent,
    PurchaseOrderHeaderComponent,
    PurchaseOrderTabDetailsComponent,
    PurchaseOrderDetailsLinesComponent,
    PurchaseOrderNewComponent,
    PurchaseOrderWorkOrdersComponent,
    PurchaseOrderEditModalComponent
  ],
  providers: [
    PurchaseOrderService,
    PurchaseOrderObservableService,
    FormBuilder
  ]
})
export class PurchaseOrderModule {
  constructor(private injector: Injector) {
    PurchaseOrderApiServiceLocator.injector = this.injector;
  }
}
