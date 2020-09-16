import { NgModule } from '@angular/core';
import { DxTreeViewModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../payment.service';
import { PhoenixCommonModule } from '../../common/PhoenixCommon.module';
import { PaymentDocumentComponent } from './../payment-document/payment-document.component';
import { PaymentTransactionComponent } from './../payment-transaction/payment-transaction.component';
import { PaymentBatchDetailsBaseComponent } from './payment-batch-details-base/payment-batch-details-base.component';
import { PaymentTransactionGarnisheeComponent } from './../payment-transaction-garnishee/payment-transaction-garnishee.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        PhoenixCommonModule,
        DxTreeViewModule
    ],
    declarations: [
        PaymentDocumentComponent,
        PaymentTransactionComponent,
        PaymentTransactionGarnisheeComponent,
    ],
    providers: [
        PaymentService
    ],
    exports: [
        PaymentDocumentComponent,
        PaymentTransactionComponent,
        PaymentTransactionGarnisheeComponent,
    ]
})
export class PaymentSharedModule {

}
