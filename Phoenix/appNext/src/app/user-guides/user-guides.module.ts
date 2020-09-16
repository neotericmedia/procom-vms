import { PhxDocumentFileUploadModule } from './../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { PhoenixCommonModule } from './../common/PhoenixCommon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserGuidesRouting} from './user-guidesrouting';
import { UserGuidesComponent } from './user-guides/user-guides.component';
import { UserGuidesHeaderComponent } from './user-guides-header/user-guides-header.component';
import { UserGuidesFileComponent } from './user-guides-file/user-guides-file.component';
import { UserGuidesService } from './user-guides.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    UserGuidesRouting,
    PhoenixCommonModule,
    PhxDocumentFileUploadModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [UserGuidesComponent, UserGuidesHeaderComponent, UserGuidesFileComponent],
  providers: [
    UserGuidesService]
})
export class UserGuidesModule { }
