import { RestrictionModule } from './restriction/restriction.module';
import { NgModule, Injectable, ErrorHandler, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { UpgradeModule } from '@angular/upgrade/static';

import * as Rollbar from 'rollbar';
import { environment } from '../environments/environment';

import { PhoenixCommonModule } from './common/PhoenixCommon.module';

import { AppComponent } from './app.component';
import { AppRouting } from './app.routes';
import { AppResolver } from './app-resolver.service';
import 'rxjs/Rx';

import { StateModule, StateService } from './common/state/state.module';
import { reducers } from './common/state/reducers';

import { LoadingSpinnerService } from './common/loading-spinner/service/loading-spinner.service';

import { DxSelectBoxModule, DxTreeViewModule, DxTextBoxModule, DxDateBoxModule, DxNumberBoxModule } from 'devextreme-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ClientSpecificFieldsModule } from './client-specific-fields/client-specific-fields.module';

import { PhxLocalizationService } from './common/services/phx-localization.service';
import { CommonListsObservableService } from './common/lists/lists.observable.service';
// fix me
// import {VmsService} from './transaction/shared/Vms.service';
import { WorkflowDataService } from './common/services/workflowData.service';
import { CommonDataService } from './common/services/commonData.service';
import { CommonService } from './common/services/common.service';

import { DummyComponent } from './dummy.component';
import { LoginComponent } from './account/login/login.component';
import { ForgotPasswordComponent } from './account/account-forgot-password/account-forgot-password.component';
import { RegisterComponent } from './account/register/register.component';
import { HomeComponent } from './home/home.component';

import { PhxWorkflowEventHistoryComponent } from './common/components/phx-workflow-event-history/phx-workflow-event-history.component';
import { PhxDocumentFileUploadModule } from './common/components/phx-document-file-upload/phx-document-file-upload.module';
import { CommissionAddWorkOrderComponent } from './commission/commission-add-work-order/commission-add-work-order.component';
import { CommissionDowngradeModule } from './commission/commission-downgrade.module';
import { PhxProfilePictureComponent } from './common/components/phx-profile-picture/phx-profile-picture.component';
import { PhxStateActionButtonsComponent } from './common/components/phx-state-action-buttons/phx-state-action-buttons.component';

// DevExtreme - load localized messages
import { loadMessages } from 'devextreme/localization';
import 'devextreme-intl';
import * as dxFrCA from './../../vendor/devextreme/localization/messages/fr-CA.json';
import { ServiceLocator } from './common/state/epics/service.locator';
import { UrlData } from './common/services/urlData.service';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SidenavService } from './sidenav/sidenav.service';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { TopNavMenuComponent } from './top-nav-menu/top-nav-menu.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { NavigationService } from './common/services/navigation.service';
import { LayoutComponentComponent } from './layouts/layout-component/layout-component.component';
import { CommonMethodsService } from './compliance/shared/common-methods.service';
import { SignalrService } from './common/services/signalr.service';
import { AuthService } from './common/services/auth.service';
import { ApiService } from './common/services/api.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventService } from './common/services/event.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiHttpInterceptorService } from './common/services/api-http-interceptor.service';
import { RootService } from './common/root.service';
import { AdminGuard } from './admin/admin.guard';
import { ViewEmailInBrowserComponent } from './view-email-in-browser/view-email-in-browser.component';
loadMessages(dxFrCA);

function getCurrentUserPayload() {
  let identity = null;
  try {
    identity = JSON.parse(decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent('BearerIdentity').replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null);
    return {
      person: {
        id: 'ProfileId: ' + identity.profileId + ', DatabaseId: ' + identity.databaseId,
        username: identity.userName,
        email: identity.email
      }
    };
  } catch (e) {
    return {};
  }
}

export function roolbarFactory() {
  if (environment.rollbar && environment.rollbar.accessToken) {
    const rollbar = new Rollbar(environment.rollbar);

    return {
      error: err => {
        const payload = getCurrentUserPayload();
        rollbar.configure({ payload });
        rollbar.error(err);
      },
      debug: function() {},
      info: function() {},
      warning: function() {},
      critical: function() {}
    };
  }
  return {
    error: err => {
      console.error(err);
    },
    debug: function() {},
    info: function() {},
    warning: function() {},
    critical: function() {}
  };
}

@Injectable()
export class RollbarErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}
  handleError(err: any): void {
    const rollbar = this.injector.get(Rollbar);
    rollbar.error(err.originalError || err);
    throw err;
  }
}

// @Injectable()
// export class GlobalErrorHandler implements ErrorHandler {
//     constructor() { }
//     handleError(error) {
//         console.log('ng2 exception')
//         // IMPORTANT: Rethrow the error otherwise it gets swallowed
//         throw error;
//     }
// }

// fix me
// Please use CommonService which is Ng2 wrapper instead
// export function commonFactory(injector: angular.auto.IInjectorService) {
//   return injector.get<any>('common');
// }

@NgModule({
  declarations: [
    AppComponent,
    DummyComponent,
    LoginComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    HomeComponent,
    // PurchaseOrderWorkOrdersComponent,
    // TransactionPaymentsComponent,
    // TransactionInvoicesComponent,
    // PurchaseorderlinetoworkorderComponent,
    // ContactGarnisheesComponent,
    // ViewEmailInBrowserComponent,
    TopNavMenuComponent,
    FeedbackComponent,
    // ClientSpecificFieldsComponent,
    HeaderComponent,
    SidenavComponent,
    BreadcrumbsComponent,
    LayoutComponentComponent,
    DashboardComponent,
    ViewEmailInBrowserComponent
  ],
  imports: [
    StateModule,
    PhoenixCommonModule,
    ModalModule.forRoot(),
    DatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    UpgradeModule,
    AppRouting,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    // PaymentSharedModule, // fix me
    PhxDocumentFileUploadModule,
    AccordionModule.forRoot(),
    DxTreeViewModule,
    RestrictionModule,
    ClientSpecificFieldsModule
    // ComplianceSuperModule,
  ],
  exports: [],
  providers: [
    LoadingSpinnerService,
    { provide: ErrorHandler, useClass: RollbarErrorHandler },
    // { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: Rollbar, useFactory: roolbarFactory },
    // CommonMethodsService,
    // ComplianceDocumentService,
    PhxLocalizationService,
    // DocumentRuleService,
    // ComplianceTemplateService,
    CommonListsObservableService,
    // OrganizationApiService,
    SidenavService,
    UrlData,
    // VmsService,
    WorkflowDataService,
    // AccessSubscriptionService,
    CommonDataService,
    CommonService,
    CommonMethodsService,
    NavigationService,
    AppResolver,
    SignalrService,
    ApiService, // fix me
    AuthService,
    EventService,
    RootService,
    AdminGuard,
    { provide: HTTP_INTERCEPTORS, useClass: ApiHttpInterceptorService, multi: true }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(state: StateService, injector: Injector, rootService: RootService) {
    state.init(reducers, {}, [], !environment.production);
    rootService.init();
    // Used by BaseComponentActionContainer
    ServiceLocator.injector = injector;
  }

  ngDoBootstrap() {}
}
