import { IAccountNotificationSettings } from './IAccountNotificationSettings';
import { IAccountLoginUserSettings } from './IAccountLoginUserSettings';
export interface IAccountUserSettings {
    loginUserSettings: IAccountLoginUserSettings;
    notificationSettings: IAccountNotificationSettings;
}
