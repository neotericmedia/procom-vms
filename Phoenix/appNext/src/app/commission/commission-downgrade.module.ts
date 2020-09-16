/* The standard CommissionModule is lazily-loaded.
We want to use the component on an Angular 1 page. To make it available at bootstrap time,
we declare the component in entryComponents[] and its containing module in imports[] in AppModule.
That would break lazy-loading. So we declare CommissionAddWorkOrderComponent in a separate module.
*/
import { NgModule } from '@angular/core';
import { CommissionAddWorkOrderComponent } from './commission-add-work-order/commission-add-work-order.component';
import { CommissionRateWorkordersComponent } from './commission-rate-workorders/commission-rate-workorders.component';
import { CommonModule } from '@angular/common';
import { WorkorderCommonModule } from './../workorder/workorder-common.module';

import {
    DxButtonModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxTextAreaModule,
    DxNumberBoxModule, DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule
} from 'devextreme-angular';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';


@NgModule({
    imports: [
        CommonModule,
        PhoenixCommonModule,
        WorkorderCommonModule,
        // DxButtonModule,
        DxDataGridModule,
        // DxSelectBoxModule,
        // DxTextBoxModule,
        // DxTextAreaModule,
        // DxNumberBoxModule,
        // DxCheckBoxModule,
        // DxDateBoxModule,
        // DxRadioGroupModule,

    ],
    declarations: [CommissionRateWorkordersComponent],
    exports: [
        CommissionRateWorkordersComponent
    ],
})
export class CommissionDowngradeModule { }
