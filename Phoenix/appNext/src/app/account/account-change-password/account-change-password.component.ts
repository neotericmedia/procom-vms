import { ComponentCanDeactivate } from './../../common/guards/pending-changes.guard';
import { Location } from '@angular/common';
import { AccountService } from './../shared/account.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { PhxFormControlLayoutType } from './../../common/model/phx-form-control-layout-type';
import { AuthService } from '../../common/services/auth.service';
import { IAccountChangePassword } from '../shared';

import { WithSubStore, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { ValidationExtensions, NavigationService } from '../../common';

@Component({
  selector: 'app-account-change-password',
  templateUrl: './account-change-password.component.html',
  styleUrls: ['./account-change-password.component.less']
})
export class AccountChangePasswordComponent implements ComponentCanDeactivate, OnInit, OnDestroy {

  model: IAccountChangePassword = {
    oldPassword: null,
    newPassword: null,
    confirmPassword: null,
  };

  validationMessages: any;

  form: FormGroup;
  newPasswordGroup: FormGroup;

  isAlive = true;

  formControlLayoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.Stacked;

  getBasePath = () => ['account', 'changePassword'];

  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private location: Location,
    private navigationService: NavigationService
  ) {
    this.navigationService.setTitle('account-change-password');
  }

  ngOnInit() {

    this.loadForm();

    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(changes => {
        changes = { ...{oldPassword: changes.oldPassword}, ...changes.newPasswordGroup };
        console.log('form change', changes);
        this.model = {...this.model, ...changes};
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  canDeactivate(): boolean {
    return this.form ? !this.form.dirty : true;
  }

  loadForm() {
    const initial = this.model;

    this.newPasswordGroup = this.formBuilder.group({
      newPassword: [initial.newPassword, [
        Validators.required, Validators.minLength(6)
      ]],
      confirmPassword: [initial.confirmPassword, [
        Validators.required, Validators.minLength(6)
      ]]
    }, { validator: ValidationExtensions.passwords() });

    this.form = this.formBuilder.group({
      oldPassword: [initial.oldPassword, [
        Validators.required
      ]],
      newPasswordGroup: this.newPasswordGroup
    });
  }

  save() {
    this.accountService.changePassword(this.model)
    .then(response => {
      this.form.reset();
      this.goBack();
    })
    .catch(error => this.validationMessages = error);
  }

  cancel() {
    this.form.reset();
    this.goBack();
  }

  goBack() {
    this.location.back();
  }

}
