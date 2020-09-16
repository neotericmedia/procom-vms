import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DxDataGridModule, DxDateBoxModule, DxSelectBoxModule, DxCalendarModule, DxTextBoxModule } from 'devextreme-angular';

import { PhoenixCommonModule } from './../common/PhoenixCommon.module';

import { DemoRouting } from './demo.routing';
import { DemoService } from './shared/demo.service';

import { DemoComponent } from './demo/demo.component';
import { DemoHeaderComponent } from './demo-header/demo-header.component';
import { DemoDetailComponent } from './demo-detail/demo-detail.component';
import { DemoSearchComponent } from './demo-search/demo-search.component';
import { DemoAttachmentsComponent } from './demo-attachments/demo-attachments.component';
import { DemoItemsComponent } from './demo-items/demo-items.component';
import { DemoLocalizationComponent } from './demo-localization/demo-localization.component';
import { DemoRemoteDataGridComponent } from './demo-remote-data-grid/demo-remote-data-grid.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxCalendarModule,
    PhoenixCommonModule, // fix me .forRoot(),
    DemoRouting
  ],
  declarations: [
    DemoComponent,
    DemoHeaderComponent,
    DemoDetailComponent,
    DemoSearchComponent,
    DemoAttachmentsComponent,
    DemoItemsComponent,
    DemoLocalizationComponent,
    DemoRemoteDataGridComponent,
  ],
  providers: [
    DemoService,
  ]
})
export class DemoModule {
}
