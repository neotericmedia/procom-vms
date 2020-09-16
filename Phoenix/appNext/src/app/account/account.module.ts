import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { AccountManageComponent } from './account-manage/account-manage.component';
import { AccountNotificationSettingsComponent } from './account-notification-settings/account-notification-settings.component';
import { AccountChangePasswordComponent } from './account-change-password/account-change-password.component';
import { AccountChangeLanguageComponent } from './account-change-language/account-change-language.component';
import { AccountPictureComponent } from './account-picture/account-picture.component';
import { routing } from './account.routing';
import { AccountService } from './shared/account.service';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DxDateBoxModule, DxNumberBoxModule } from 'devextreme-angular';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { CommonService } from '../common/services/common.service';
import { ProfileSelectorComponent } from './profile-selector/profile-selector.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    routing,
    PhoenixCommonModule,
    ModalModule.forRoot(),
    AngularCropperjsModule,
  ],
  declarations: [
    AccountManageComponent, AccountNotificationSettingsComponent, AccountChangePasswordComponent, AccountChangeLanguageComponent,
    AccountPictureComponent,
    ProfileSelectorComponent],
  providers: [
    CommonService,
    AccountService]
})
export class AccountModule { }
