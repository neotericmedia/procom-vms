import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from './service/project.service';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { ProjectListComponent } from './component/project-list/project-list.component';
import { ProjectEditComponent } from './component/project-edit/project-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';

import {
  DxSelectBoxModule
  , DxTextBoxModule
  , DxCheckBoxModule
  , DxButtonModule
  , DxDateBoxModule
  , DxNumberBoxModule
  , DxTextAreaModule,
  DxRadioGroupModule
} from 'devextreme-angular';
import { ProjectEditModalComponent } from './component/project-edit-modal/project-edit-modal.component';
import { ProjectSelectDetailComponent } from './component/project-select-detail/project-select-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    PhoenixCommonModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxRadioGroupModule,
  ],
  declarations: [
    ProjectListComponent,
    ProjectEditComponent,
    ProjectEditModalComponent,
    ProjectSelectDetailComponent,
  ],
  exports: [
    ProjectListComponent,
    ProjectEditComponent,
    ProjectSelectDetailComponent,
  ],
  providers: [ProjectService]
})
export class ProjectModule { }
