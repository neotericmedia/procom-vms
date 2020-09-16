import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PhxFormControlLayoutType } from './../../common/model/phx-form-control-layout-type';

import { CommonService, CodeValueService } from './../../common';
import { CodeValue } from '../../common/model';
import { IAccountLoginUserSettings } from '../shared';

@Component({
  selector: 'app-account-change-language',
  templateUrl: './account-change-language.component.html',
  styleUrls: ['./account-change-language.component.less']
})
export class AccountChangeLanguageComponent implements OnInit, OnDestroy {

  model: IAccountLoginUserSettings;

  @Input() form: FormGroup;

  cultureList: CodeValue[] = [];

  isAlive = true;

  layoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.InputOnly;

  constructor(
    private codeValueService: CodeValueService,
    private commonService: CommonService,
  ) {
  }

  static buildForm(formBuilder: FormBuilder): FormGroup {
    return formBuilder.group({
      CultureId: [null, [
        Validators.required
      ]],
    });
  }

  ngOnInit() {
    if (!this.form) {
      throw new Error('Invalid initialization. Need property `form`.');
    }

    this.model = this.form.value;

    this.cultureList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Culture, true);

    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(changes => {
        console.log('form change', changes);
        this.model = {...this.model, ...changes};
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
