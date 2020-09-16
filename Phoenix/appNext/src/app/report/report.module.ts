import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoenixCommonModule } from './../common/PhoenixCommon.module';

import { ReportRouting } from './report.routing';
import { ReportService } from './service/report.service';

import { ReportListComponent } from './component/report-list/report-list.component';
import { ReportComponent } from './component/report/report.component';

@NgModule({
  imports: [
    CommonModule,
    ReportRouting,
    PhoenixCommonModule
  ],
  declarations: [
    ReportListComponent,
    ReportComponent
  ],
  providers: [
    ReportService
  ]
})
export class ReportModule { }
