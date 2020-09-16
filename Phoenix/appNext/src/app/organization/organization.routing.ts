// angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// common
import { PhxConstants } from './../common/index';
// rebates

import { OrganizationSearchRebatesAndFeesComponent } from './organization-search-rebates-and-fees/organization-search-rebates-and-fees.component';
// organization level #1
import { OrganizationTabAdvancesComponent } from './organization-tab-advances/organization-tab-advances.component';
import { OrganizationSearchComponent } from './organization-search/organization-search.component';
import { OrganizationSearchPendingDocumentComponent } from './organization-search-pending-document/organization-search-pending-document.component';
import { OrganizationSearchBranchComponent } from './organization-search-branch/organization-search-branch.component';
import { OrganizationBranchDetailsComponent } from './organization-branch-details/organization-branch-details.component';
import { OrganizationComponent } from './organization/organization.component';
// organization level #2
import { OrganizationTabDetailComponent } from './organization-tab-detail/organization-tab-detail.component';
import { OrganizationTabRolesComponent } from './organization-tab-roles/organization-tab-roles.component';
import { OrganizationTabContactsComponent } from './organization-tab-contacts/organization-tab-contacts.component';
import { OrganizationTabHistoryComponent } from './organization-tab-history/organization-tab-history.component';
import { OrganizationTabGarnisheesComponent } from './organization-tab-garnishees/organization-tab-garnishees.component';
// organization level #3
import { OrganizationRoleIndependentContractorComponent } from './organization-role-independent-contractor/organization-role-independent-contractor.component';
import { OrganizationRoleClientComponent } from './organization-role-client/organization-role-client.component';
import { OrganizationRoleInternalComponent } from './organization-role-internal/organization-role-internal.component';
import { OrganizationRoleLimitedLiabilityCompanyComponent } from './organization-role-limited-liability-company/organization-role-limited-liability-company.component';
import { OrganizationRoleSubVendorComponent } from './organization-role-sub-vendor/organization-role-sub-vendor.component';
import { OrganizationQuickAddComponent } from './organization-quick-add/organization-quick-add.component';
import { OrganizationCreateComponent } from './organization-create/organization-create.component';
import { OrganizationRebatesAndVmsFeesComponent } from './organization-rebates-and-fees-search/organization-rebates-and-fees-search.component';
import { OrganizationVmsFeesDetailComponent } from './organization-vms-fee-detail/organization-vms-fee-detail.component';
import { OrganizationRebatesFeesDetailComponent } from './organization-rebates-fee-detail/organization-rebates-fee-detail.component';

export const OrganizationRouting = RouterModule.forChild([
  { path: 'create', component: OrganizationCreateComponent, pathMatch: 'full' },
  { path: 'search', component: OrganizationSearchComponent, pathMatch: 'full' },
  { path: 'search/declined', component: OrganizationSearchComponent, pathMatch: 'full', data: { dataSourceUrl: 'org/getListOrganizationsInDraftAndDeclined', pageTitle: 'Declined Organizations' } },
  { path: 'search/pendingDocuments', component: OrganizationSearchPendingDocumentComponent, pathMatch: 'full' },
  // tslint:disable-next-line:max-line-length
  {
    path: 'search/pending-review',
    component: OrganizationSearchComponent,
    pathMatch: 'full',
    data: { dataSourceUrl: 'org/getListOriginalOrganizations', oDataParameterFilters: '&$filter=(IsPendingReview eq true)', dataGridComponentName: 'organizationPendingReviewSearch', pageTitle: 'Organizations Pending Review' }
  },
  { path: 'branch', component: OrganizationSearchBranchComponent, pathMatch: 'full' },
  { path: 'branch/:branchId', component: OrganizationBranchDetailsComponent, pathMatch: 'full'},
  { path: 'rebatesandfees', component: OrganizationSearchRebatesAndFeesComponent, pathMatch: 'full' },
  { path: 'vmsfee/vmsFeeHeader/:vmsFeeHeaderId/vmsFeeVersion/:vmsFeeVersionId/:organizationId', component: OrganizationVmsFeesDetailComponent},
  { path: 'rebate/rebateHeader/:rebateHeaderId/rebateVersion/:rebateVersionId/:organizationId', component: OrganizationRebatesFeesDetailComponent},
  {path: ':organizationId/rebatesandfees', component: OrganizationRebatesAndVmsFeesComponent, pathMatch: 'full'},
  { path: ':organizationId/:tabId', component: OrganizationComponent, pathMatch: 'full' },
  { path: ':organizationId/:tabId/:roleType/:roleId', component: OrganizationComponent, pathMatch: 'full' },
  { path: 'quickadd', component: OrganizationQuickAddComponent, pathMatch: 'full' },
  { path: ':organizationId', redirectTo: ':organizationId/' + PhxConstants.OrganizationNavigationName.details, pathMatch: 'full' } // fix me
  // {
  //   path: ':organizationId',
  //   component: OrganizationComponent,
  //   runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  //   children: [
  //     { path: PhxConstants.OrganizationNavigationName.details, component: OrganizationTabDetailComponent, pathMatch: 'full', runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
  //     {
  //       path: PhxConstants.OrganizationNavigationName.roles,
  //       component: OrganizationTabRolesComponent,
  //       children: [
  //         { path: PhxConstants.OrganizationNavigationName.roleClient + '/:roleId', component: OrganizationRoleClientComponent, pathMatch: 'full' },
  //         { path: PhxConstants.OrganizationNavigationName.roleIndependentContractor + '/:roleId', component: OrganizationRoleIndependentContractorComponent, pathMatch: 'full' },
  //         { path: PhxConstants.OrganizationNavigationName.roleInternal + '/:roleId', component: OrganizationRoleInternalComponent, pathMatch: 'full' },
  //         { path: PhxConstants.OrganizationNavigationName.roleSubVendor + '/:roleId', component: OrganizationRoleSubVendorComponent, pathMatch: 'full' },
  //         { path: PhxConstants.OrganizationNavigationName.roleLimitedLiabilityCompany + '/:roleId', component: OrganizationRoleLimitedLiabilityCompanyComponent, pathMatch: 'full' },
  //         { path: '**', redirectTo: PhxConstants.OrganizationNavigationName.roles, pathMatch: 'full' }
  //       ],
  //       runGuardsAndResolvers: 'paramsOrQueryParamsChange'
  //     },
  //     { path: PhxConstants.OrganizationNavigationName.contacts, component: OrganizationTabContactsComponent, pathMatch: 'full', runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
  //     { path: PhxConstants.OrganizationNavigationName.history, component: OrganizationTabHistoryComponent, pathMatch: 'full', runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
  //     { path: PhxConstants.OrganizationNavigationName.advances, component: OrganizationTabAdvancesComponent, pathMatch: 'full', runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
  //     { path: PhxConstants.OrganizationNavigationName.garnishees, component: OrganizationTabGarnisheesComponent, pathMatch: 'full', runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
  //     { path: '**', redirectTo: PhxConstants.OrganizationNavigationName.details, pathMatch: 'full', runGuardsAndResolvers: 'paramsOrQueryParamsChange' }
  //   ]
  // }
]);

// C:\Projects\webdr01\DefaultCollection\ClientConnections_Development\Client.CC\Client.CC.Web\src\app\demo

// package.json
// , "alias": {
//   "@angular/animations": "@angular/animations/bundles/animations.umd.js",
//   "@angular/platform-browser/animations": "@angular/platform-browser/bundles/platform-browser-animations.umd.js",
//   "@angular/animations/browser": "@angular/animations/bundles/animations.umd.js"
// }

// https://stackoverflow.com/questions/43246338/angular-4-router-error-cannot-activate-an-already-activated-outlet
// https://github.com/fuse-box/fuse-box/issues/324
// "@angular/platform-browser/animations": "npm:@angular/platform-browser/bundles/platform-browser-animations.umd.js",
// "@angular/animations": "'npm:@angular/animations/bundles/animations.umd.js",
// "@angular/animations/browser": "npm:@angular/animations/bundles/animations-browser.umd.js",

// Attention: do not delete it. It sample of routing based on outlet name
//         path: PhxConstants.OrganizationNavigationName.roles, component: OrganizationTabRolesComponent,
//         children: [ { path: PhxConstants.OrganizationNavigationName.roleClient + '/:roleId', component: OrganizationRoleClientComponent, outlet: 'outletRole' },
// <router-outlet name="outletRole"></router-outlet>
// working version based on <router-outlet name="outletRole"> #/next/organization/278/roles/(outletRole:client/14) for 7914
// this.router.navigate([`next/organization/${organizationId}/` + PhxConstants.OrganizationNavigationName.roles, { outlets: { outletRole: [navigationName, roleId] } }])
// const organizationId = this.organization.Id;
// this.router.navigate([navigationName, roleId], { skipLocationChange: true  })

// git --version
// git version 2.17.1.windows.2
// https://git-scm.com/download/win


// node --version
// v8.9.1
// https://nodejs.org/en/
// npm install npm@latest -g
// v10.0.0
// v10.4.1

// npm -v
// 6.1.0


// npm i -g npm

// npm cache clean

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// npm downgrade:
// npm i -g npm@5.3.0

// cd C:\Projects\webdr01\Phoenix_Ramsey\Phoenix\Procom.Phoenix.Web\Phoenix\appNext>
// cd Phoenix\appNext
// ng generate component organization/organization
// ng generate component organization/organization-header
// ng generate component organization/organization-versions-list
// ng generate service   organization/organization

// ng generate component organization/organization-tab-detail
// ng generate component organization/organization-tab-roles
// ng generate component organization/organization-tab-contacts
// ng generate component organization/organization-tab-history
// ng generate component organization/organization-tab-advances
// ng generate component organization/organization-tab-garnishees

// ng generate component organization/organization-versions-list
// ng generate component organization/organization-header
// ng generate component organization/organization-details
// ng generate component organization/organization-addresses
// ng generate component organization/organization-address
// ng generate component organization/organization-sales-taxes
// ng generate component organization/organization-workflow
