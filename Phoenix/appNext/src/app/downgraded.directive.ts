// merge fix
// import { CommissionRateWorkordersComponent } from './commission/commission-rate-workorders/commission-rate-workorders.component';
// import { RestrictionSummaryComponent } from './restriction/restriction-summary/restriction-summary.component';
// import { ComplianceTemplateSearchComponent } from './compliance/compliance-template-search/compliance-template-search.component';
// import { Directive, ElementRef, Injector, NgModule } from '@angular/core';
// import { UpgradeComponent, downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
// import { PurchaseOrderWorkOrdersComponent } from './purchase-order/component/purchase-order-work-orders/purchase-order-work-orders.component';
// import { ComplianceDocumentComponent } from './compliance/compliance-document/compliance-document.component';
// import { TransactionPaymentsComponent } from './transaction/transaction-payments/transaction-payments.component';
// import { TransactionInvoicesComponent } from './transaction/transaction-invoices/transaction-invoices.component';
// import { PhxWorkflowEventHistoryComponent } from './common/components/phx-workflow-event-history/phx-workflow-event-history.component';
// import { PurchaseorderlinetoworkorderComponent } from './workorder/purchaseorderlinetoworkorder/purchaseorderlinetoworkorder.component';
// import { ContactGarnisheesComponent } from './contact/contact-garnishees/contact-garnishees.component';
// import { CommissionAddWorkOrderComponent } from './commission/commission-add-work-order/commission-add-work-order.component';
// import { PhxProfilePictureComponent } from './common/components/phx-profile-picture/phx-profile-picture.component';
// import { ViewEmailInBrowserComponent } from './view-email-in-browser/view-email-in-browser.component';
// import { ComplianceDocumentViewComponent } from './compliance/compliance-document-view/compliance-document-view.component';
// import { AssociatedWorkordersComponent } from './contact/associated-workorders/associated-workorders.component';
// import { TopNavMenuComponent } from './top-nav-menu/top-nav-menu.component';
// import { ClientSpecificFieldsComponent } from './client-specific-fields/client-specific-fields.component';
// import { PhxStateActionButtonsComponent } from './common/components/phx-state-action-buttons/phx-state-action-buttons.component';

// angular.module('Phoenix')
//   .directive(
//     'appComplianceDocument',
//     downgradeComponent(
//       {
//         component: ComplianceDocumentComponent,
//         inputs: ['entityTypeId', 'entityId', 'triggerToRefresh'],
//         outputs: ['complianceDocumentOutput']
//       }) as angular.IDirectiveFactory
//   );

// angular.module('Phoenix')
//   .directive(
//     'appPurchaseOrderWorkOrders',
//     downgradeComponent({
//       component: PurchaseOrderWorkOrdersComponent,
//       inputs: ['purchaseOrderId'],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appTransactionPayments',
//     downgradeComponent({
//       component: TransactionPaymentsComponent,
//       inputs: ['transactionHeaderId'],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appTransactionInvoices',
//     downgradeComponent({
//       component: TransactionInvoicesComponent,
//       inputs: ['transactionHeaderId'],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appPhxWorkflowEventHistory',
//     downgradeComponent({
//       component: PhxWorkflowEventHistoryComponent,
//       inputs: ['entityTypeId', 'entityId', 'approverName', 'funcGetHistoryLength', 'funcGetLastItem'],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appPurchaseorderlinetoworkorder',
//     downgradeComponent({
//       component: PurchaseorderlinetoworkorderComponent,

//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appContactGarnishees',
//     downgradeComponent({
//       component: ContactGarnisheesComponent,
//       inputs: ['userProfileId'],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appComplianceTemplateSearch',
//     downgradeComponent({
//       component: ComplianceTemplateSearchComponent,
//       inputs: ['documentTypeId', 'showNewButton'],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'commissionAddWorkOrder',
//     downgradeComponent({
//       component: CommissionAddWorkOrderComponent,
//       // inputs: ['entityTypeId', 'entityId', 'approverName', 'funcGetHistoryLength', 'funcGetLastItem'],
//       // outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appPhxProfilePicture',
//     downgradeComponent({
//       component: PhxProfilePictureComponent,
//       inputs: ['profileId'],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'viewemailinbrowser',
//     downgradeComponent({
//       component: ViewEmailInBrowserComponent,
//       outputs: []
//     }) as angular.IDirectiveFactory);
// angular.module('Phoenix')
//   .directive(
//     'documentview',
//     downgradeComponent({
//       component: ComplianceDocumentViewComponent,
//       inputs: [],
//       outputs: []
//     }) as angular.IDirectiveFactory);
// angular.module('Phoenix')
//   .directive(
//     'appAssociatedWorkorders',
//     downgradeComponent({
//       component: AssociatedWorkordersComponent,
//       inputs: [],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appTopNavMenu',
//     downgradeComponent({
//       component: TopNavMenuComponent,
//       inputs: [],
//       outputs: ['menuOpenChange']
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appRestrictionSummary',
//     downgradeComponent({
//       component: RestrictionSummaryComponent,
//       inputs: ['selectedRestrictionList', 'showLabelAsHyperlink'],
//       outputs: ['restrictionTypeClick']
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appClientSpecificFields',
//     downgradeComponent({
//       component: ClientSpecificFieldsComponent,
//       inputs: ['formData', 'entityTypeId', 'entityId', 'clientId', 'editable'],
//       outputs: ['formValidationChanged']
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appCommissionRateWorkorders',
//     downgradeComponent({
//       component: CommissionRateWorkordersComponent,
//       inputs: [],
//       outputs: []
//     }) as angular.IDirectiveFactory);

// angular.module('Phoenix')
//   .directive(
//     'appPhxStateActionButtons',
//     downgradeComponent({
//       component: PhxStateActionButtonsComponent,
//       inputs: ['stateActions', 'displayType', 'availableStateActions', 'refData'],
//       outputs: []
//     }) as angular.IDirectiveFactory);
