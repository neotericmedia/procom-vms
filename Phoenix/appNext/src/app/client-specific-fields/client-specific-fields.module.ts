import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientSpecificFieldsService } from './client-specific-fields.service';
import { ClientSpecificFieldsComponent } from './client-specific-fields.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import {
  DxButtonModule,
  DxDataGridModule,
  DxPopupModule,
  DxTemplateModule,
  DxDateBoxModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxNumberBoxModule
} from 'devextreme-angular';

@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, PhoenixCommonModule,  DxButtonModule,
        DxDataGridModule,
        DxPopupModule,
        DxTemplateModule,
        DxDateBoxModule,
        DxSelectBoxModule,
        DxTextBoxModule,
        CommonModule,
        DxNumberBoxModule
    ],
    providers: [
        ClientSpecificFieldsService
    ],
  declarations: [
    ClientSpecificFieldsComponent
  ],
  exports: [
    ClientSpecificFieldsComponent
  ]
})

export class ClientSpecificFieldsModule { }
