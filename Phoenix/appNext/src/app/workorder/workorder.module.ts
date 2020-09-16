import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DxButtonModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxTextAreaModule,
  DxNumberBoxModule, DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule } from 'devextreme-angular';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { OrganizationApiService } from './../organization/organization.api.service';
import { WorkorderRoutes } from './workorder.routing';
import { WorkOrderSearchResolver } from './workorder-search/workorder-search.resolver';
import { WorkorderSearchComponent } from './workorder-search/workorder-search.component';
import { PendingDocumentSearchComponent } from './pending-document-search/pending-document-search.component';
import { WorkorderTemplateSearchComponent } from './workorder-template-search/workorder-template-search.component';
import { WorkorderCommonModule } from './workorder-common.module';
import { WorkorderRootComponent } from './workorder-root/workorder-root.component';
import { AssignmentCreateSetupComponent } from './assignment-create-setup/assignment-create-setup.component';
import { AssignmentCreateComponent } from './assignment-create/assignment-create.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
    WorkorderRoutes,
    ReactiveFormsModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    WorkorderCommonModule,
  ],
  declarations: [
    WorkorderSearchComponent,
    PendingDocumentSearchComponent,
    WorkorderTemplateSearchComponent,
    WorkorderRootComponent,
    AssignmentCreateSetupComponent,
    AssignmentCreateComponent,
],
  providers: [
    OrganizationApiService,
    WorkOrderSearchResolver,
  ]
})
export class WorkorderModule {
  constructor() {
  }
}
