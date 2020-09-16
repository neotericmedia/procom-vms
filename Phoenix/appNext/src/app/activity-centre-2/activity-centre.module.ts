import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { ActivityCentreComponent } from './activity-centre/activity-centre.component';
import { ActivityCentreRouting } from './activity-centre.routing';
import { ActivityCentreT3FilterComponent } from './activity-centre-t3-filter/activity-centre-t3-filter.component';
import { ActivityCentreNavbarComponent } from './activity-centre-t1-filter/activity-centre-navbar.component';
import { ActivityCentreService } from './shared/activity-centre.service';
import { ActivityCentreCardPaymentComponent } from './activity-centre-card/activity-centre-card-payment/activity-centre-card-payment.component';
import { ActivityCentreCardOrganizationComponent } from './activity-centre-card/activity-centre-card-organization/activity-centre-card-organization.component';
import { ActivityCentreCardProfileComponent } from './activity-centre-card/activity-centre-card-profile/activity-centre-card-profile.component';
import { ActivityCentreCardWorkorderComponent } from './activity-centre-card/activity-centre-card-workorder/activity-centre-card-workorder.component';
import { ActivityCentreCardExpenseComponent } from './activity-centre-card/activity-centre-card-expense/activity-centre-card-expense.component';
import { ActivityCentreCardHeaderComponent } from './activity-centre-card/shared/activity-centre-card-header/activity-centre-card-header.component';
import { ActivityCentreCardFooterComponent } from './activity-centre-card/shared/activity-centre-card-footer/activity-centre-card-footer.component';
import { ActivityCentreActionsComponent } from './activity-centre-card/shared/activity-centre-actions/activity-centre-actions.component';
import { ActivityCentreCardDocumentComponent } from './activity-centre-card/activity-centre-card-document/activity-centre-card-document.component';
import { ActivityCentreCardTimesheetComponent } from './activity-centre-card/activity-centre-card-timesheet/activity-centre-card-timesheet.component';
import { ActivityCentreCardLoadingComponent } from './activity-centre-card/activity-centre-card-loading/activity-centre-card-loading.component';
import { ActivityCentreApiServiceLocator } from './shared/activity-centre.api.service.locator';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AppHammerConfig } from './shared/hammer-config';
import { ActivityCentreT2FilterComponent } from './activity-centre-t2-filter/activity-centre-t2-filter.component';
import { TimeSheetUiService } from '../time-sheet/service/time-sheet-ui.service';
@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InfiniteScrollModule, BsDropdownModule, PhoenixCommonModule, ActivityCentreRouting],
  declarations: [
    ActivityCentreComponent,
    ActivityCentreNavbarComponent,
    ActivityCentreT3FilterComponent,
    ActivityCentreCardPaymentComponent,
    ActivityCentreCardOrganizationComponent,
    ActivityCentreCardProfileComponent,
    ActivityCentreCardWorkorderComponent,
    ActivityCentreCardExpenseComponent,
    ActivityCentreCardHeaderComponent,
    ActivityCentreCardFooterComponent,
    ActivityCentreActionsComponent,
    ActivityCentreCardDocumentComponent,
    ActivityCentreCardTimesheetComponent,
    ActivityCentreCardLoadingComponent,
    ActivityCentreT2FilterComponent
  ],
  providers: [ActivityCentreService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: AppHammerConfig
    },
    TimeSheetUiService
  ]
})
export class ActivityCentreModule2 {
  constructor(private injector: Injector) {
    ActivityCentreApiServiceLocator.injector = this.injector;
  }
}
