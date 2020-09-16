import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextMaskModule } from 'angular2-text-mask';
// import {  } from './contact-routing.module';
// import { ContactSearchComponent } from './contact-search/contact-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import {
    DxButtonModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxRadioGroupModule
} from 'devextreme-angular';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SubscriptionRouting } from './subscription-routing.module';
import { SubscriptionComponent } from './subscription/subscription.component';
import { SubscriptionObservableService } from './state/subscription.observable.service';
import { SubscriptionHeaderComponent } from './subscription-header/subscription-header.component';
import { SubscriptionTabSubscriptionComponent } from './subscription-tab-subscription/subscription-tab-subscription.component';
import { SubscriptionService } from './subscription.service';
import { SubscriptionApiServiceLocator } from './subscription.api.service.locator';
import { RestrictionModule } from './../restriction/restriction.module';
import { SubscriptionTabHistoryComponent } from './subscription-tab-history/subscription-tab-history.component';
import { SubscriptionWorkflowComponent } from './subscription-workflow/subscription-workflow.component';


@NgModule({
    imports: [
        FormsModule,
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
        SubscriptionRouting,
        TabsModule.forRoot(),
        ModalModule.forRoot(),
        ReactiveFormsModule,
        TextMaskModule,
        RestrictionModule
    ],
    declarations: [
        SubscriptionComponent,
        SubscriptionHeaderComponent,
        SubscriptionTabSubscriptionComponent,
        SubscriptionTabHistoryComponent,
        SubscriptionWorkflowComponent
        // ContactSearchComponent,
    ],
    providers: [
        SubscriptionObservableService,
        SubscriptionService
    ]
})

export class SubscriptionModule {
    constructor(private injector: Injector) {
        SubscriptionApiServiceLocator.injector = this.injector;
    }
}

