import { RouterModule, Routes } from '@angular/router'; // , RouteReuseStrategy,
import { DummyComponent } from './dummy.component';
import { HomeComponent } from './home/home.component';
import { LayoutComponentComponent } from './layouts/layout-component/layout-component.component';
import { AppResolver } from './app-resolver.service';
import { LoginComponent } from './account/login/login.component';
import { ForgotPasswordComponent } from './account/account-forgot-password/account-forgot-password.component';
import { RegisterComponent } from './account/register/register.component';
import { AdminGuard } from './admin/admin.guard';
import { ViewEmailInBrowserComponent } from './view-email-in-browser/view-email-in-browser.component';

const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'dummy',
    component: DummyComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    resolve: {
      AppResolver: AppResolver
    }
    // loadChildren: './home/home.module#HomeModule'
  },
  {
    path: 'login',
    component: LoginComponent,
    resolve: {
      AppResolver: AppResolver
    }
    // loadChildren: './home/home.module#HomeModule'
  },
  {
    path: 'accountforgot',
    component: ForgotPasswordComponent,
    resolve: {
      AppResolver: AppResolver
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    // loadChildren: './home/home.module#HomeModule'
  },
  {
    path: 'view-email-in-browser',
    component: ViewEmailInBrowserComponent
  },
  {
    path: 'next',
    component: LayoutComponentComponent,
    resolve: {
      AppResolver: AppResolver
    },
    children: [
      { path: 'test', loadChildren: './test/test.module#TestModule' },
      { path: 'demo', loadChildren: './demo/demo.module#DemoModule' },
      { path: 'account', loadChildren: './account/account.module#AccountModule' },
      { path: 'payroll', loadChildren: './payroll/payroll.module#PayrollModule' },
      { path: 'compliance', loadChildren: './compliance/compliance.module#ComplianceModule' },
      { path: 'timesheet', loadChildren: './time-sheet/time-sheet.module#TimeSheetModule' },
      { path: 'expense', loadChildren: './expense/expense.module#ExpenseModule' },
      { path: 'organization', loadChildren: './organization/organization.module#OrganizationModule' },
      { path: 'document', loadChildren: './document-rule/document-rule.module#DocumentRuleModule' },
      { path: 'commission', loadChildren: './commission/commission.module#CommissionModule' },
      { path: 'contact', loadChildren: './contact/contact.module#ContactModule' },
      { path: 'payment', loadChildren: './payment/payment.module#PaymentModule' },
      { path: 'journal', loadChildren: './journal/journal.module#JournalModule' },
      { path: 'workorder', loadChildren: './workorder/workorder.module#WorkorderModule' },
      { path: 'invoice', loadChildren: './invoice/invoice.module#InvoiceModule' },
      { path: 'transaction', loadChildren: './transaction/transaction.module#TransactionModule' },
      { path: 'purchase-order', loadChildren: './purchase-order/purchase-order.module#PurchaseOrderModule' },
      { path: 'activity-centre', loadChildren: './activity-centre-2/activity-centre.module#ActivityCentreModule2' },
      { path: 'activity-centre-2', loadChildren: './activity-centre-2/activity-centre.module#ActivityCentreModule2' },
      { path: 'report', loadChildren: './report/report.module#ReportModule' },
      { path: 'user-guides', loadChildren: './user-guides/user-guides.module#UserGuidesModule' },
      { path: 'template', loadChildren: './template/template.module#TemplateModule' },
      { path: 'subscription', loadChildren: './subscription/subscription.module#SubscriptionModule' },
      { path: 'contact/subscriptions', loadChildren: './subscription/subscription.module#SubscriptionModule' },
      { path: 'vms', loadChildren: './transaction/vms-documents/vms-documents.module#VmsDocumentsModule' },
      { path: 'admin', canActivate: [AdminGuard], loadChildren: './admin/admin.module#AdminModule' }
    ]
  }
];

export const AppRouting = RouterModule.forRoot(ROUTES, { useHash: true });
