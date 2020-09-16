import { PhxModalDatePickerComponent } from './../common/components/phx-modal-date-picker/phx-modal-date-picker.component';
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TimeSheetRouting } from './time-sheet.routing';
import { TimeSheetService } from './service/time-sheet.service';
import { TimeSheetUiService } from './service/time-sheet-ui.service';
import { TimeSheetEntryComponent } from './component/time-sheet-entry/time-sheet-entry.component';
import { TimeSheetSearchComponent } from './component/time-sheet-search/time-sheet-search.component';
import { TimeSheetExceptionsComponent } from './component/time-sheet-exceptions/time-sheet-exceptions.component';
import { TimeSheetComponent } from './component/time-sheet/time-sheet.component';
import { TimeSheetHeaderComponent } from './component/time-sheet-header/time-sheet-header.component';
import { TimeSheetTimeCardComponent } from './component/time-sheet-time-card/time-sheet-time-card.component';
import { TimeSheetNotesAttachmentsComponent } from './component/time-sheet-notes-attachments/time-sheet-notes-attachments.component';
import { TimeSheetHistoryComponent } from './component/time-sheet-history/time-sheet-history.component';
import { TimeSheetCapsuleComponent } from './component/time-sheet-capsule/time-sheet-capsule.component';
import { TimeSheetCalendarComponent } from './component/time-sheet-calendar/time-sheet-calendar.component';
import { TimeSheetLineManagementComponent } from './component/time-sheet-line-management/time-sheet-line-management.component';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TimeSheetNotesAttachmentsDayDetailComponent } from './component/time-sheet-notes-attachments-day-detail/time-sheet-notes-attachments-day-detail.component';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { DndModule } from 'ng2-dnd';
import { TimeSheetCellComponent } from './component/time-sheet-cell/time-sheet-cell.component';
import { TimeSheetCommandListComponent } from './component/time-sheet-command-list/time-sheet-command-list.component';
import { TimeSheetDocumentService } from './service/time-sheet-document.service';
import { ProjectModule } from '../project/project.module';
import { ProjectService } from '../project/service/project.service';
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
import { TimeSheetCapsuleEditComponent } from './component/time-sheet-capsule-edit/time-sheet-capsule-edit.component';
import { TimeSheetCellDateComponent } from './component/time-sheet-cell-date/time-sheet-cell-date.component';
import { TimeSheetTimeCardSummaryComponent } from './component/time-sheet-time-card-summary/time-sheet-time-card-summary.component';
import { TimeSheetNotesAttachmentsEditComponent } from './component/time-sheet-notes-attachments-edit/time-sheet-notes-attachments-edit.component';
import { TimeSheetUnitDirective } from './directive/time-sheet-unit.directive';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { TimeSheetNotesByProjectComponent } from './component/time-sheet-notes-by-project/time-sheet-notes-by-project.component';
import { TimeSheetNotFoundComponent } from './component/time-sheet-not-found/time-sheet-not-found.component';
import { TimeSheetLineManagementCapsuleComponent } from './component/time-sheet-line-management-capsule/time-sheet-line-management-capsule.component';
import { TimeSheetLineManagementSearchComponent } from './component//time-sheet-line-management-search/time-sheet-line-management-search.component';
import { TimeSheetLineManagementCapsuleListComponent } from './component/time-sheet-line-management-capsule-list/time-sheet-line-management-capsule-list.component';
import { TimeSheetCapsuleSelectComponent } from './component/time-sheet-capsule-select/time-sheet-capsule-select.component';
import { TimeSheetLineManagementCapsuleEditComponent } from './component/time-sheet-line-management-capsule-edit/time-sheet-line-management-capsule-edit.component';
import { TimeSheetTabsComponent } from './component/time-sheet-tabs/time-sheet-tabs.component';
import { TimeSheetProjectsComponent } from './component/time-sheet-projects/time-sheet-projects.component';
import { TimeSheetTimeManualComponent } from './component/time-sheet-time-manual/time-sheet-time-manual.component';
import { TimeSheetTimeImportedComponent } from './component/time-sheet-time-imported/time-sheet-time-imported.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    TimeSheetRouting,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    PhoenixCommonModule,
    DndModule.forRoot(),
    ProjectModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxButtonModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxTextAreaModule,
    DxRadioGroupModule,
    PhxDocumentFileUploadModule
  ],
  declarations: [
    TimeSheetEntryComponent,
    TimeSheetSearchComponent,
    TimeSheetExceptionsComponent,
    TimeSheetComponent,
    TimeSheetHeaderComponent,
    TimeSheetTimeCardComponent,
    TimeSheetNotesAttachmentsComponent,
    TimeSheetHistoryComponent,
    TimeSheetCapsuleComponent,
    TimeSheetCalendarComponent,
    TimeSheetLineManagementComponent,
    TimeSheetNotesAttachmentsDayDetailComponent,
    TimeSheetCellComponent,
    TimeSheetCommandListComponent,
    TimeSheetCapsuleEditComponent,
    TimeSheetCellDateComponent,
    TimeSheetTimeCardSummaryComponent,
    TimeSheetNotesAttachmentsEditComponent,
    TimeSheetUnitDirective,
    TimeSheetNotesByProjectComponent,
    TimeSheetNotFoundComponent,
    TimeSheetLineManagementCapsuleComponent,
    TimeSheetLineManagementSearchComponent,
    TimeSheetLineManagementCapsuleListComponent,
    TimeSheetCapsuleSelectComponent,
    TimeSheetLineManagementCapsuleEditComponent,
    TimeSheetTabsComponent,
    TimeSheetProjectsComponent,
    TimeSheetTimeManualComponent,
    TimeSheetTimeImportedComponent
  ],
  providers: [
    TimeSheetService,
    TimeSheetUiService,
    TimeSheetDocumentService,
    ProjectService,
    DecimalPipe
  ]
})
export class TimeSheetModule { }
