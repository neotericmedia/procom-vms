import { AccountChangeLanguageComponent } from './../account-change-language/account-change-language.component';
import { AccountNotificationSettingsComponent } from './../account-notification-settings/account-notification-settings.component';
import { ComponentCanDeactivate } from './../../common/guards/pending-changes.guard';
import { AccountService } from './../shared/account.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { IAccountLoginUserSettings, IAccountNotificationSettings, IAccountUserSettings } from './../shared';
import { UserInfo, UserProfile, UserContext } from './../../common/model';
import { AuthService } from '../../common/services/auth.service';

import { NavigationService, PhxLocalizationService } from '../../common';
import { environment } from '../../../environments/environment';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';


import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-account-manage',
  templateUrl: './account-manage.component.html',
  styleUrls: ['./account-manage.component.less']
})
export class AccountManageComponent implements ComponentCanDeactivate, OnInit, OnDestroy {

  userName: string;

  form: FormGroup;
  loginUserSettingsForm: FormGroup;
  notificationSettingsForm: FormGroup;

  validationMessages: any;

  allowUnfinishedFeatures: boolean;
  profileId$: Observable<number>;

  private isAlive = true;
  private isValid = false;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private navigationService: NavigationService,
    private formBuilder: FormBuilder,
    private localizationService: PhxLocalizationService
  ) {
    this.navigationService.setTitle('account-manage');
    this.allowUnfinishedFeatures = environment.allowUnfinishedFeatures;
    this.accountService.setCurrentUser();
  }

  ngOnInit() {
    this.profileId$ = this.accountService.profile$
      .takeWhile(x => this.isAlive)
      .filter(x => x != null)
      .map(x => x.Id);
    this.setForm();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  canDeactivate(): boolean {
    return this.form ? !this.form.dirty : true;
  }

  save() {
    // TODO: get from redux store?
    const loginUserSettings: IAccountLoginUserSettings = {
      CultureId: this.loginUserSettingsForm.get('CultureId').value
    };

    const reload: boolean = this.accountService.userInfo.PreferredCultureId !== loginUserSettings.CultureId;

    if (environment.allowUnfinishedFeatures) {
      // TODO: get from redux store?
      const notificationSettings: IAccountNotificationSettings = {
        IsImmediate: this.notificationSettingsForm.get('IsImmediate').value,
        NotificationDaysMask: this.notificationSettingsForm.get('NotificationDaysMask').value,
        NotificationTime: this.notificationSettingsForm.get('NotificationTime').value
      };

      this.accountService.saveUserSettings(loginUserSettings, notificationSettings)
        .then(response => {
          if (reload) {
            const profile = this.accountService.profile;
            this.authService.setCurrentProfile(profile.DatabaseId, profile.Id).then((userContext: UserContext) => {
              location.reload();
            });
          } else {
            this.setForm();
          }
        })
        .catch(err => this.validationMessages = err);
    } else {
      this.accountService.saveLoginUserSettings(loginUserSettings)
        .then(response => {
          if (reload) {
            const profile = this.accountService.profile;
            this.authService.setCurrentProfile(profile.DatabaseId, profile.Id).then((userContext: UserContext) => {
              location.reload();
            });
          } else {
            this.setForm();
          }
        })
        .catch(err => this.validationMessages = err);
    }
  }

  buildForm(): FormGroup {
    // TODO: strongly typed form?
    this.loginUserSettingsForm = AccountChangeLanguageComponent.buildForm(this.formBuilder);
    this.notificationSettingsForm = AccountNotificationSettingsComponent.buildForm(this.formBuilder, this.localizationService);
    if (!environment.allowUnfinishedFeatures) {
      this.notificationSettingsForm.disable();
    }

    return this.formBuilder.group({
      loginUserSettings: this.loginUserSettingsForm,
      notificationSettings: this.notificationSettingsForm,
    });
  }

  setForm() {
    const form: FormGroup = this.form ? this.form : this.buildForm();

    if (environment.allowUnfinishedFeatures) {
      this.accountService.getUserSettings()
        .then((response: IAccountUserSettings) => {
          form.reset(response);
          // TODO: phx-date-box sets the control to dirty as soon as value changes, so form.reset can't reset the form status on it's own
          form.markAsPristine();
          form.markAsUntouched();
          if (!this.form) {
            this.form = form;
          }
        })
        .catch(err => console.log(err));
    } else {
      form.reset({ loginUserSettings: this.accountService.getLoginUserSettings() });
      // TODO: phx-date-box sets the control to dirty as soon as value changes, so form.reset can't reset the form status on it's own
      form.markAsPristine();
      form.markAsUntouched();
      if (!this.form) {
        this.form = form;
      }
    }
  }

  reset() {
    this.setForm();
  }
}
