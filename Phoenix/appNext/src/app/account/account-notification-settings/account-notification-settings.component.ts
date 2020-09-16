import { ValidationExtensions } from './../../common/components/phx-form-control/validation.extensions';
import { PhxFormControlLayoutType } from './../../common/model/phx-form-control-layout-type';
import { IAccountNotificationSettings, AccountService } from '../shared';
import { FormGroup, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PhxLocalizationService } from '../../common';

interface NotificationDay {
  id: number;
  value: number;
  text: string;
  code: string;
  isChecked: boolean;
}

@Component({
  selector: 'app-account-notification-settings',
  templateUrl: './account-notification-settings.component.html',
  styleUrls: ['./account-notification-settings.component.less']
})
export class AccountNotificationSettingsComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;

  weekDayList: NotificationDay[] = [
    { id: 1, value: 1, text: 'Sunday', code: 'account.notificationSettings.daySundayShort', isChecked: false },
    { id: 2, value: 2, text: 'Monday', code: 'account.notificationSettings.dayMondayShort', isChecked: false },
    { id: 3, value: 4, text: 'Tuesday', code: 'account.notificationSettings.dayTuesdayShort', isChecked: false },
    { id: 4, value: 8, text: 'Wednesday', code: 'account.notificationSettings.dayWednesdayShort', isChecked: false },
    { id: 5, value: 16, text: 'Thursday', code: 'account.notificationSettings.dayThursdayShort', isChecked: false },
    { id: 6, value: 32, text: 'Friday', code: 'account.notificationSettings.dayFridayShort', isChecked: false },
    { id: 7, value: 64, text: 'Saturday', code: 'account.notificationSettings.daySaturdayShort', isChecked: false }
  ];

  model: IAccountNotificationSettings;

  daysMaskControl: AbstractControl;
  isImmediateControl: AbstractControl;
  timeControl: AbstractControl;

  layoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.InputOnly;

  private isAlive = true;

  constructor(
    private localizationService: PhxLocalizationService,
    private accountService: AccountService,
  ) { }

  static buildForm(formBuilder: FormBuilder, localizationService: PhxLocalizationService): FormGroup {
    return formBuilder.group({
      IsImmediate: [null, Validators.required],
      NotificationDaysMask: [null, Validators.compose([
        ValidationExtensions.minNumber(1, localizationService.translate('account.notificationSettings.minSelectedDaysValidationMessage')),
      ])],
      NotificationTime: [null, Validators.required]
    });
  }

  ngOnInit() {
    if (!this.form) {
      throw new Error('Invalid initialization. Need property `form`.');
    }

    this.daysMaskControl = this.form.get('NotificationDaysMask');
    if (!this.daysMaskControl) {
      throw new Error('Invalid initialization. form must have `NotificationDaysMask` control.');
    }
    this.isImmediateControl = this.form.get('IsImmediate');
    if (!this.isImmediateControl) {
      throw new Error('Invalid initialization. form must have `IsImmediate` control.');
    }
    this.timeControl = this.form.get('NotificationTime');
    if (!this.timeControl) {
      throw new Error('Invalid initialization. form must have `NotificationTime` control.');
    }

    this.model = this.form.value;
    this.checkDaysFromMask(this.model.NotificationDaysMask);
    this.onChangeIsImmediate(this.model.IsImmediate);

    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(changes => {
        console.log('form change', changes);
        this.model = {
          ...{ // TODO: form.valueChanges don't include disabled controls in the returned object, would be fine with redux
            IsImmediate: null,
            NotificationDaysMask: null,
            NotificationTime: null
          }, ...changes
        };
      });

    this.isImmediateControl.valueChanges
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe((value: boolean) => {
        this.onChangeIsImmediate(value);
      });

    this.daysMaskControl.valueChanges
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe((value: number) => {
        this.checkDaysFromMask(value);
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  onChangeIsImmediate(isImmediate: boolean) {
    if (!isImmediate) {
      if (this.model.NotificationDaysMask == null) {
        this.daysMaskControl.setValue(this.accountService.defaultNotificationSettings.NotificationDaysMask);
      }
      if (this.model.NotificationTime == null) {
        this.timeControl.setValue(this.accountService.defaultNotificationSettings.NotificationTime);
      }

      this.daysMaskControl.enable();
      this.timeControl.enable();
    } else {
      this.daysMaskControl.disable();
      this.timeControl.disable();
    }

    this.form.updateValueAndValidity();
  }

  checkDay(day: NotificationDay) {
    day.isChecked = !day.isChecked;
    const daysMask = this.getDateMaskFromDays();
    this.daysMaskControl.setValue(daysMask);
    this.daysMaskControl.markAsDirty();
  }

  toggleAMPM() {
    const time = this.model.NotificationTime;
    if (time) {
      const hours: number = time.getHours();
      const newHours = hours < 12 ? hours + 12 : hours - 12;
      this.model.NotificationTime.setHours(newHours);
      this.timeControl.markAsDirty();
    }
  }

  getDateMaskFromDays(): number {
    return this.weekDayList.reduce((count, currDay: NotificationDay) => count += currDay.isChecked ? currDay.value : 0, 0);
  }

  checkDaysFromMask(bitmask: number) {
    // https://stackoverflow.com/a/38113100
    const ids: number[] = this.weekDayList.map(x => x.value);
    // tslint:disable-next-line:no-bitwise
    const selected: number[] = ids.filter((value, index) => bitmask & (1 << index));

    this.weekDayList.forEach(day => {
      day.isChecked = selected.some(y => y === day.value);
    });
  }
}
