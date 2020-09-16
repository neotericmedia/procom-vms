import { RouterModule } from '@angular/router';
import { SubscriptionComponent } from './subscription/subscription.component';

export const SubscriptionRouting = RouterModule.forChild([
    { path: 'edit/:subscriptionId', component: SubscriptionComponent, pathMatch: 'full' },
    { path: 'edit/:subscriptionId/:tabId', component: SubscriptionComponent, pathMatch: 'full' },

]);
