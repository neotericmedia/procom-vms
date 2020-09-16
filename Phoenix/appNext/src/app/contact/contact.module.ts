import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextMaskModule } from 'angular2-text-mask';
import { ContactRouting } from './contact-routing.module';
import { ContactSearchComponent } from './contact-search/contact-search.component';
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
import { ContactInternalTeamSearchComponent } from './contact-internalteam-search/contact-internalteam-search.component';
import { ContactSubscriptionsComponent } from './contact-subscriptions/contact-subscriptions.component';
import { PendingDocumentSearchComponent } from './pending-document-search/pending-document-search.component';
import { ReassignmentComponent } from './reassignment/reassignment.component';
import { ContactService } from './shared/contact.service';
import { ContactComponent } from './contact/contact.component';
import { ContactTabContactComponent } from './contact-tab-contact/contact-tab-contact.component';
import { ContactTabWorkordersComponent } from './contact-tab-workorders/contact-tab-workorders.component';
import { ContactTabHistoryComponent } from './contact-tab-history/contact-tab-history.component';
import { ContactTabNotesComponent } from './contact-tab-notes/contact-tab-notes.component';
import { ProfileObservableService } from './state/profile.observable.service';
import { ContactHeaderComponent } from './contact-header/contact-header.component';
import { AssociatedWorkordersComponent } from './associated-workorders/associated-workorders.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ContactApiServiceLocator } from './contact.api.service.locator';
import { ContactGarnisheesComponent } from './contact-garnishees/contact-garnishees.component';
import { ContactAdvancesComponent } from './contact-advances/contact-advances.component';
import { ContactGarnisheeSearchComponent } from './contact-garnishee-search/contact-garnishee-search.component';
import { ContactAdvancesSearchComponent } from './contact-advances-search/contact-advances-search.component';
import { ContactGarnisheeNewComponent } from './contact-garnishee-new/contact-garnishee-new.component';
import { ContactGarnisheeEditComponent } from './contact-garnishee-edit/contact-garnishee-edit.component';
import { ContactAdvancesEditComponent } from './contact-advances-edit/contact-advances-edit.component';
import { ContactAdvancesNewComponent } from './contact-advances-new/contact-advances-new.component';
import { ContactProfilesComponent } from './contact-profiles/contact-profiles.component';
import { ContactAddNewComponent } from './contact-add-new/contact-add-new.component';
import { ProfileService } from './shared/profile.service';
import { ContactProfileWorkerEligibilityComponent } from './contact-profile-worker-eligibility/contact-profile-worker-eligibility.component';
import { ContactProfilePaymentMethodsComponent } from './contact-profile-payment-methods/contact-profile-payment-methods.component';
import { ContactProfileBenefitSetupComponent } from './contact-profile-benefit-setup/contact-profile-benefit-setup.component';
import { ContactProfileDetailsComponent } from './contact-profile-details/contact-profile-details.component';
import { ContactPayrollSetupComponent } from './contact-payroll-setup/contact-payroll-setup.component';
import { ContactSalesTaxesComponent } from './contact-sales-taxes/contact-sales-taxes.component';
import { ContactSalesTaxComponent } from './contact-sales-tax/contact-sales-tax.component';
import { ContactOrganizationalProfileComponent } from './contact-organizational-profile/contact-organizational-profile.component';
import { ContactOrganizationInfoComponent } from './contact-organization-info/contact-organization-info.component';
import { ContactPhonenumbersComponent } from './contact-phonenumbers/contact-phonenumbers.component';
import { ContactPhonenumberComponent } from './contact-phonenumber/contact-phonenumber.component';
import { ContactAddressesComponent } from './contact-addresses/contact-addresses.component';
import { ContactAddressComponent } from './contact-address/contact-address.component';
import { ContactInternalProfileComponent } from './contact-internal-profile/contact-internal-profile.component';
import { ContactUserroleComponent } from './contact-userrole/contact-userrole.component';
import { ContactUserrolesComponent } from './contact-userroles/contact-userroles.component';
import { ContactProfileInternalCommissionComponent } from './contact-profile-internal-commission/contact-profile-internal-commission.component';
import { ContactTempProfileComponent } from './contact-temp-profile/contact-temp-profile.component';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { ContactCanadianSpProfileComponent } from './contact-canadian-sp-profile/contact-canadian-sp-profile.component';
import { ContactCanadianIncProfileComponent } from './contact-canadian-inc-profile/contact-canadian-inc-profile.component';
import { ContactCanadianEngagementSubVendorProfileComponent } from './contact-canadian-engagement-sub-vendor-profile/contact-canadian-engagement-sub-vendor-profile.component';
import { ContactUnitedStatesW2ProfileComponent } from './contact-united-states-w2-profile/contact-united-states-w2-profile.component';
import { ContactUnitedStatesLlcProfileComponent } from './contact-united-states-llc-profile/contact-united-states-llc-profile.component';
import { ContactWorkerDocumentsComponent } from './contact-worker-documents/contact-worker-documents.component';
import { ContactTransactionAdjustmentComponent } from './contact-transaction-adjustment/contact-transaction-adjustment.component';
import { UtilityService } from '../common/services/utility-service.service';
import { CookieModule, CookieService } from 'ngx-cookie';
import { ContactT4AFormEligibilitesComponent } from './contact-t4a-form-eligibilities/contact-t4a-form-eligibilities.component';
import { ContactT4AFormEligibilityComponent } from './contact-t4a-form-eligibility/contact-t4a-form-eligibility.component';
import { OrganizationApiService } from '../organization/organization.api.service';
import { AccessSubscriptionService } from './shared/accessSubscription.service';
import { ComplianceModule } from '../compliance/compliance.module';
import { OrganizationModule } from '../organization/organization.module';
import { UserProfileResolver } from './contact-resolver-service';

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
    ContactRouting,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    TextMaskModule,
    ComplianceModule,
    PhxDocumentFileUploadModule,
    // OrganizationModule
  ],
  declarations: [
    ContactSearchComponent,
    ContactInternalTeamSearchComponent,
    ContactSubscriptionsComponent,
    PendingDocumentSearchComponent,
    ReassignmentComponent,
    ContactComponent,
    ContactTabContactComponent,
    ContactTabWorkordersComponent,
    ContactTabHistoryComponent,
    ContactTabNotesComponent,
    ContactHeaderComponent,
    AssociatedWorkordersComponent,
    ContactDetailsComponent,
    ContactGarnisheesComponent,
    ContactAdvancesComponent,
    ContactGarnisheeSearchComponent,
    ContactAdvancesSearchComponent,
    ContactGarnisheeNewComponent,
    ContactGarnisheeEditComponent,
    ContactAdvancesEditComponent,
    ContactAdvancesNewComponent,
    ContactProfilesComponent,
    ContactAddNewComponent,
    ContactProfileWorkerEligibilityComponent,
    ContactProfilePaymentMethodsComponent,
    ContactProfileBenefitSetupComponent,
    ContactProfileDetailsComponent,
    ContactPayrollSetupComponent,
    ContactSalesTaxesComponent,
    ContactSalesTaxComponent,
    ContactOrganizationInfoComponent,
    ContactOrganizationalProfileComponent,
    ContactPhonenumbersComponent,
    ContactPhonenumberComponent,
    ContactAddressesComponent,
    ContactAddressComponent,
    ContactInternalProfileComponent,
    ContactUserroleComponent,
    ContactUserrolesComponent,
    ContactProfileInternalCommissionComponent,
    ContactTempProfileComponent,
    ContactCanadianSpProfileComponent,
    ContactCanadianIncProfileComponent,
    ContactCanadianEngagementSubVendorProfileComponent,
    ContactUnitedStatesW2ProfileComponent,
    ContactUnitedStatesLlcProfileComponent,
    ContactWorkerDocumentsComponent,
    ContactTransactionAdjustmentComponent,
    ContactT4AFormEligibilitesComponent,
    ContactT4AFormEligibilityComponent,
    ContactSubscriptionsComponent
  ],
  providers: [ContactService, ProfileObservableService,
     ProfileService, UtilityService, OrganizationApiService, AccessSubscriptionService, UserProfileResolver]
})

export class ContactModule {
  constructor(private injector: Injector) {
    ContactApiServiceLocator.injector = this.injector;
  }
}

