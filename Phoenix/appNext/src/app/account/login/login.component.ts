import { AppResolver } from './../../app-resolver.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  
  form: FormGroup;
  isLoginFailed: boolean;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private appResolver: AppResolver
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: ['']
    });
  }

  login() {
    this.authService.logout(false);
    this.isLoginFailed = false;
    const username = this.form.controls.email.value;
    const password = this.form.controls.password.value;
    this.authService.login(username, password).then(() => {
      this.appResolver.initApp().then(() => {
      });
    },
    err => {
      this.isLoginFailed = true;
    })
    .then(() => {
      if (!this.isLoginFailed) {
        this.router.navigate(['next/account/profile-selector']);
      }
    });
  }

  forgotAccount() {
    this.router.navigate(['accountforgot']);
  }
}
