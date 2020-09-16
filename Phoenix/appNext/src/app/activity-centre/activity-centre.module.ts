import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ActivityCentreComponent } from './activity-centre/activity-centre.component';
import { ActivityCentreSummaryComponent } from './activity-centre-summary/activity-centre-summary.component';
import { ActivityCentreDummyFilterComponent } from './activity-centre-dummy-filter/activity-centre-dummy-filter.component';
import { ActivityCentreHeaderComponent } from './activity-centre-header/activity-centre-header.component';
import { ActivityCentreNavbarComponent } from './activity-centre-navbar/activity-centre-navbar.component';
import { ActivityCentreSearchComponent } from './activity-centre-search/activity-centre-search.component';
import { ActivityCentreRouting } from './activity-centre.routing';
import { ActivityCentreCardComponent } from './activity-centre-card/activity-centre-card.component';
import { ActivityCentreService } from './activity-centre.service';
import { ActivityCentreCardFieldComponent } from './activity-centre-card-field/activity-centre-card-field.component';
import { ActivityCentreFilterbarComponent } from './activity-centre-filterbar/activity-centre-filterbar.component';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';

@NgModule({
  imports: [
    CommonModule,
    InfiniteScrollModule,
    ActivityCentreRouting,
    PhoenixCommonModule,
  ],
  declarations: [
    ActivityCentreComponent,
    ActivityCentreSummaryComponent,
    ActivityCentreDummyFilterComponent,
    ActivityCentreNavbarComponent,
    ActivityCentreHeaderComponent,
    ActivityCentreFilterbarComponent,
    ActivityCentreSearchComponent,
    ActivityCentreCardComponent,
    ActivityCentreCardFieldComponent
  ],
  providers: [
    ActivityCentreService
  ]
})
export class ActivityCentreModule { }
