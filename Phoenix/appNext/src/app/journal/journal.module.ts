import {
    DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDataGridModule,
    DxButtonModule, DxDateBoxModule, DxNumberBoxModule, DxTextAreaModule, DxRadioGroupModule
} from 'devextreme-angular';

import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';

import { PhoenixCommonModule } from './../common/PhoenixCommon.module';

import { JournalRoutingModule } from './journal.routing.module';
import { JournalService } from './journal.service';
import { JournalBatchComponent } from './journal-batch/journal-batch.component';
import { JournalSearchComponent } from './journal-search/journal-search.component';
import { JournalPendingComponent } from './journal-pending/journal-pending.component';

@NgModule({
    imports: [FormsModule, CommonModule, PhoenixCommonModule,
              DxButtonModule, DxDataGridModule, DxSelectBoxModule,
              DxTextBoxModule, DxTextAreaModule, DxNumberBoxModule,
              DxCheckBoxModule, DxDateBoxModule, DxRadioGroupModule,
              JournalRoutingModule
  ],
  declarations: [ JournalBatchComponent, JournalSearchComponent, JournalPendingComponent ],
  providers: [JournalService ]
})
export class JournalModule { }
