import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// common
import { PhxConstants } from './../common/index';
import { PurchaseOrderSearchComponent } from './component/purchase-order-search/purchase-order-search.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchaseOrderNewComponent } from './purchase-order-new/purchase-order-new.component';

export const PurchaseOrderRouting = RouterModule.forChild([
    { path: 'create', component: PurchaseOrderNewComponent, pathMatch: 'full' },
    { path: 'search', component: PurchaseOrderSearchComponent, pathMatch: 'full' },
    { path: ':purchaseOrderId/:tabId', component: PurchaseOrderComponent, pathMatch: 'full' },
    { path: ':purchaseOrderId', redirectTo: ':purchaseOrderId/' + PhxConstants.OrganizationNavigationName.details, pathMatch: 'full' },
]);
