import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DxButtonModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxTextAreaModule,
  DxNumberBoxModule, DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule } from 'devextreme-angular';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { TemplateComponent } from './template/template.component';
import { TemplateRoutes } from './template.route';
import { WorkorderCommonModule } from './../workorder/workorder-common.module';

@NgModule({
  imports: [
    FormsModule,
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
    TemplateRoutes,
    ReactiveFormsModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    WorkorderCommonModule
  ],
  declarations: [
    TemplateComponent
],
  providers: [
  ]
})
export class TemplateModule {
  constructor() {
  }
}
