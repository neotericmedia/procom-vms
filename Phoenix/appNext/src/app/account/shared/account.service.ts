import { UserProfile, UserInfo } from './../../common/model/user';
import { IAccountNotificationSettings } from './IAccountNotificationSettings';
import { AuthService } from './../../common/services/auth.service';
import { Injectable, NgModuleFactoryLoader } from '@angular/core';
import { ApiService, CommonService, PhxLocalizationService } from '../../common/index';
import { IAccountChangePassword, IAccountLoginUserSettings, IAccountUserSettings } from '../shared';

import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class AccountService {
  profile: UserProfile;
  userInfo: UserInfo;
  contactId: number;

  profile$ = new BehaviorSubject<UserProfile>(null);

  profileSub: Subscription;
  userSub: Subscription;

  defaultNotificationSettings: IAccountNotificationSettings = {
    IsImmediate: false,
    NotificationDaysMask: 62,
    NotificationTime: moment('16:00:00', 'HH:mm:ss').toDate()
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private commonService: CommonService,
    private localizationService: PhxLocalizationService,
  ) {
    this.setCurrentUser();
  }

  setCurrentUser() {
    this.profileSub = this.authService.getCurrentProfile()
      .subscribe((profile: UserProfile) => {
        this.profile = profile;
        this.profile$.next(profile);

        this.profileSub.unsubscribe();
      },
        error => {
          console.log(error);
        });
    this.userSub = this.authService.getCurrentUser()
      .subscribe((userInfo: UserInfo) => {
        this.userInfo = userInfo;

        this.contactId = userInfo.Profiles[0].ContactId;

        this.userSub.unsubscribe();
      },
        error => {
          console.log(error);
        });
  }

  getLoginUserSettings(): IAccountLoginUserSettings {
    return {
      CultureId: this.userInfo.PreferredCultureId
    };
  }

  getUserSettings(): Promise<IAccountUserSettings> {
    return new Promise<IAccountUserSettings>((resolve, reject) => {
      this.getUserNotificationSettings()
        .then((notificationSettings: IAccountNotificationSettings) => {

          const result: IAccountUserSettings = {
            loginUserSettings: this.getLoginUserSettings(),
            notificationSettings: notificationSettings
          };

          resolve(result);
        })
        .catch((err) => reject(err));
    });
  }

  getUserNotificationSettings(): Promise<IAccountNotificationSettings> {
    return new Promise<IAccountNotificationSettings>((resolve, reject) => {
      this.apiService.query('UserNotificationSetting/currentUser')
        .then((response: IAccountNotificationSettings) => {
          if (response.NotificationTime) {
            const formatFrom = 'HH:mm:ss';
            const formatTo = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy_HH_mm;
            response.NotificationTime = moment(response.NotificationTime, formatFrom).toDate();
          }
          resolve(response);
        })
        .catch((err) => {
          if (err && err.status === 404) {
            resolve(this.defaultNotificationSettings);
          } else {
            reject(err);
          }
        });
    });
  }

  changePassword(changePassword: IAccountChangePassword): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.authService.changePassword(changePassword.oldPassword, changePassword.newPassword, changePassword.confirmPassword)
        .then(response => {
          this.commonService.logSuccess(this.localizationService.translate('account.manage.pwdUpdateSuccessMessage'));
          resolve(response);
        })
        .catch(error => {
          let response = error;
          if (error == null || error.data == null) {
            response = { ValidationMessages: [{ PropertyName: '', Message: this.localizationService.translate('account.manage.pwdNotChangedMessage') }] };
          } else if (error.status === 304 || this.isErrorInvalidPassword(error.data)) { // TODO: figure out why status doesn't return 304
            response = { ValidationMessages: [{ PropertyName: '', Message: this.localizationService.translate('account.manage.pwdIncorrect') }] };
          } else if (error.status === 400) {
            response = error.data;
          }
          reject(response);
        });
    });
  }

  private isErrorInvalidPassword(data: any) {
    if (data && data.ModelState) {
      const prop = data.ModelState[''];
      return (prop && prop[0] === 'Incorrect password.');
    }
    return false;
  }

  saveLoginUserSettings(settings: IAccountLoginUserSettings): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.apiService.command('SaveLoginUserSettings', settings)
        .then(response => {
          this.commonService.logSuccess(this.localizationService.translate('account.manage.cultureUpdateSuccessMessage'));
          resolve(response);
        })
        .catch(error => {
          reject(error.data);
        });
    });
  }

  saveNotificationSettings(notificationSettings: IAccountNotificationSettings): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.apiService.command('SaveNotificationSettings', this.getNotificationSettingsCommand(notificationSettings))
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error.data);
        });
    });
  }

  saveUserSettings(settings: IAccountLoginUserSettings, notificationSettings: IAccountNotificationSettings): Promise<any> {

    const payload = {
      LoginUserSettings: settings,
      NotificationSettings: this.getNotificationSettingsCommand(notificationSettings)
    };

    return new Promise<any>((resolve, reject) => {
      this.apiService.command('SaveUserSettings', payload)
        .then(response => {
          this.commonService.logSuccess(this.localizationService.translate('account.manage.userSettingsSaveSuccessMessage'));
          resolve(response);
        })
        .catch(error => {
          reject(error.data);
        });
    });
  }

  getNotificationSettingsCommand(notificationSettings: IAccountNotificationSettings): any {

    const notificationTime: string = notificationSettings.NotificationTime ? moment(notificationSettings.NotificationTime).format('HH:mm:ss') : null;

    const payload = {
      IsImmediate: notificationSettings.IsImmediate,
      NotificationDaysMask: notificationSettings.NotificationDaysMask,
      NotificationTime: notificationTime
    };

    return payload;
  }

}
