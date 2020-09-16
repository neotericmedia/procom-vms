import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../common/services/auth.service';
import { Router } from '@angular/router';
import { PhxLocalizationService } from '../../common';

@Component({
  selector: 'app-account-forgot-password',
  templateUrl: './account-forgot-password.component.html',
  styleUrls: ['./account-forgot-password.component.less']
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  passwordForgotSent: boolean = false;
  currentUser = null;
  errorToShow: boolean = false;
  brokenRules = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private localizatioNSerice: PhxLocalizationService) { }

  ngOnInit() {
    const self = this;
    this.authService.getCurrentUser().subscribe(function(user) {
      self.currentUser = user;
      self.router.navigate(['next', 'account', 'manage']);
    });
    self.form = this.fb.group({
      Email: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  sendForgotPassword() {
    const self = this;
    self.brokenRules = {};
    self.errorToShow = false;
    this.authService.forgotPassword(this.form.controls.Email.value).subscribe(function(data) {
      self.passwordForgotSent = true;
      setTimeout(() => {
        self.router.navigate(['login']);
      }, 3000);
    },
    function(error) {
      if ((error === null) || (error.data === null) || (error.data === '')) {
        self.brokenRules = {errorText: self.localizatioNSerice.translate('account.forgot.pwdResetErrorMessage')};
      } else if (error.status === 304) {
        self.brokenRules = {errorText: self.localizatioNSerice.translate('account.forgot.emailIncorrectErrorMessage')};
      } else if (error.status === 400) {
        self.brokenRules = { errorText: error.error.ModelState['model.Email'][0]};
      }
      self.errorToShow = true;
      console.log(self.brokenRules);
    });
  }

}
