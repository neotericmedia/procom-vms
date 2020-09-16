import { PhoenixCommonModule } from './../../PhoenixCommon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhxDocumentFileUploadComponent } from './phx-document-file-upload.component';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
    imports: [
        CommonModule
        , PhoenixCommonModule
        , ModalModule.forRoot()
        , DatepickerModule.forRoot()
        , FileUploadModule
        , FormsModule
    ],
    declarations: [
        PhxDocumentFileUploadComponent
    ],
    providers: [
    ],
    exports: [
        PhxDocumentFileUploadComponent
    ]
})
export class PhxDocumentFileUploadModule {

}
