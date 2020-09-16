import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder } from '../common/ngx-strongly-typed-forms/model';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { DxButtonModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxTextAreaModule, DxNumberBoxModule, DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule } from 'devextreme-angular';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { OrganizationBranchService } from './organization.branch.service';

import { OrganizationRouting } from './organization.routing';
import { OrganizationApiService } from './organization.api.service';
import { OrganizationApiServiceLocator } from './organization.api.service.locator';

import { OrganizationSearchComponent } from './organization-search/organization-search.component';
import { OrganizationSearchRebatesAndFeesComponent } from './organization-search-rebates-and-fees/organization-search-rebates-and-fees.component';
import { OrganizationSearchPendingDocumentComponent } from './organization-search-pending-document/organization-search-pending-document.component';
import { OrganizationSearchBranchComponent } from './organization-search-branch/organization-search-branch.component';
import { OrganizationBranchDetailsComponent } from './organization-branch-details/organization-branch-details.component';

import { OrganizationComponent } from './organization/organization.component';

import { OrganizationTabDetailComponent } from './organization-tab-detail/organization-tab-detail.component';
import { OrganizationTabRolesComponent } from './organization-tab-roles/organization-tab-roles.component';
import { OrganizationTabContactsComponent } from './organization-tab-contacts/organization-tab-contacts.component';
import { OrganizationTabHistoryComponent } from './organization-tab-history/organization-tab-history.component';
import { OrganizationTabAdvancesComponent } from './organization-tab-advances/organization-tab-advances.component';
import { OrganizationTabGarnisheesComponent } from './organization-tab-garnishees/organization-tab-garnishees.component';

import { OrganizationRoleClientComponent } from './organization-role-client/organization-role-client.component';
import { OrganizationRoleInternalComponent } from './organization-role-internal/organization-role-internal.component';
import { OrganizationRoleIndependentContractorComponent } from './organization-role-independent-contractor/organization-role-independent-contractor.component';
import { OrganizationRoleLimitedLiabilityCompanyComponent } from './organization-role-limited-liability-company/organization-role-limited-liability-company.component';
import { OrganizationRoleSubVendorComponent } from './organization-role-sub-vendor/organization-role-sub-vendor.component';

import { OrganizationHeaderComponent } from './organization-header/organization-header.component';
import { OrganizationAddressesComponent } from './organization-addresses/organization-addresses.component';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';
import { OrganizationSalesTaxesComponent } from './organization-sales-taxes/organization-sales-taxes.component';
import { OrganizationAddressComponent } from './organization-address/organization-address.component';
import { OrganizationWorkflowComponent } from './organization-workflow/organization-workflow.component';
import { OrganizationObservableService } from './state/organization.observable.service';
import { OrganizationQuickAddComponent } from './organization-quick-add/organization-quick-add.component';
import { OrganizationPrimaryContactComponent } from './organization-primary-contact/organization-primary-contact.component';
import { OrganizationCollaboratorsComponent } from './organization-collaborators/organization-collaborators.component';
import { OrganizationRoleDetailComponent } from './organization-role-detail/organization-role-detail.component';
import { OrganizationSalesTaxComponent } from './organization-sales-tax/organization-sales-tax.component';
import { TextMaskModule } from 'angular2-text-mask';
import { OrganizationAdvancesNewComponent } from './organization-advances-new/organization-advances-new.component';
import { OrganizationAdvancesDetailsComponent } from './organization-advances-details/organization-advances-details.component';
import { OrganizationTabGarnisheesDetailsComponent } from './organization-tab-garnishees-details/organization-tab-garnishees-details.component';
import { OrganizationTabGarnisheesNewComponent } from './organization-tab-garnishees-new/organization-tab-garnishees-new.component';
import { OrganizationRoleBankAccountComponent } from './organization-role-bank-account/organization-role-bank-account.component';
import { OrganizationRoleBankAccountsComponent } from './organization-role-bank-accounts/organization-role-bank-accounts.component';
import { OrganizationLlcRoleComponent } from './organization-llc-role/organization-llc-role.component';
import { OrganizationRoleRestrictionsComponent } from './organization-role-restrictions/organization-role-restrictions.component';
import { RestrictionModule } from '../restriction/restriction.module';
import { OrganizationRoleSubVendorRoleDetailsComponent } from './organization-role-sub-vendor-role-details/organization-role-sub-vendor-role-details.component';
import { OrganizationRoleInternalOrgImagesComponent } from './organization-role-internal-org-images/organization-role-internal-org-images.component';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { OrganizationRolePaymentMethodsComponent } from './organization-role-payment-methods/organization-role-payment-methods.component';
import { OrganizationCreateComponent } from './organization-create/organization-create.component';
import { OrganizationRebatesAndVmsFeesComponent } from './organization-rebates-and-fees-search/organization-rebates-and-fees-search.component';
import { OrganizationVmsFeesDetailComponent } from './organization-vms-fee-detail/organization-vms-fee-detail.component';
import { OrganizationRebatesFeesDetailComponent } from './organization-rebates-fee-detail/organization-rebates-fee-detail.component';
import { ComplianceModule } from '../compliance/compliance.module';


@NgModule({
  imports: [
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
    OrganizationRouting,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TextMaskModule,
    FormsModule,
    InfiniteScrollModule,
    RestrictionModule,
    ComplianceModule,
    PhxDocumentFileUploadModule
  ],
  declarations: [
    OrganizationSearchComponent,
    OrganizationSearchRebatesAndFeesComponent,
    OrganizationSearchPendingDocumentComponent,
    OrganizationSearchBranchComponent,
    OrganizationComponent,
    OrganizationRoleClientComponent,
    OrganizationRoleInternalComponent,
    OrganizationRoleIndependentContractorComponent,
    OrganizationRoleLimitedLiabilityCompanyComponent,
    OrganizationRoleSubVendorComponent,

    OrganizationTabDetailComponent,
    OrganizationTabRolesComponent,
    OrganizationTabContactsComponent,
    OrganizationTabHistoryComponent,
    OrganizationTabAdvancesComponent,
    OrganizationTabGarnisheesComponent,

    OrganizationHeaderComponent,
    OrganizationAddressesComponent,
    OrganizationDetailsComponent,
    OrganizationSalesTaxesComponent,
    OrganizationAddressComponent,
    OrganizationWorkflowComponent,
    OrganizationQuickAddComponent,
    OrganizationPrimaryContactComponent,
    OrganizationCollaboratorsComponent,
    OrganizationRoleDetailComponent,
    OrganizationSalesTaxComponent,
    OrganizationBranchDetailsComponent,
    OrganizationAdvancesNewComponent,
    OrganizationAdvancesDetailsComponent,
    OrganizationTabGarnisheesDetailsComponent,
    OrganizationTabGarnisheesNewComponent,
    OrganizationRoleBankAccountComponent,
    OrganizationRoleBankAccountsComponent,
    OrganizationRoleDetailComponent,
    OrganizationLlcRoleComponent,
    OrganizationRoleRestrictionsComponent,
    OrganizationRoleSubVendorRoleDetailsComponent,
    OrganizationRoleInternalOrgImagesComponent,
    OrganizationRolePaymentMethodsComponent,
    OrganizationCreateComponent,
    OrganizationRebatesAndVmsFeesComponent,
    OrganizationVmsFeesDetailComponent,
    OrganizationRebatesFeesDetailComponent
  ],
  exports: [
  ]
  ,
  providers: [
    OrganizationBranchService,
    OrganizationApiService,
    OrganizationObservableService,
    FormBuilder
  ],
  entryComponents: [
    OrganizationSearchComponent
  ]
})

export class OrganizationModule {
  constructor(private injector: Injector) {
    OrganizationApiServiceLocator.injector = this.injector;
  }
}
