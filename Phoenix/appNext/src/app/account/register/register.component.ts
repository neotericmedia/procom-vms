import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../common/services/auth.service';
import { DialogService } from '../../common';
import { values, forEach } from 'lodash';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent implements OnInit, OnDestroy {
  form: FormGroup;
  cultureList: Array<{ text, id }> = [];
  isAlive: boolean = true;
  isLoading: boolean = true;
  tokenObj: any;
  validationMessages: Array<any> = [];
  constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private loadingSpinner: LoadingSpinnerService,
    private dialogService: DialogService,
  ) {

  }

  static MatchPassword(group: FormGroup) {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notSame: true };
  }

  initializeForm() {
    this.form = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      cultureId: ['', [
        Validators.required,
      ]],
    },
      {
        // validator: [RegisterComponent.MatchPassword]
      });
  }

  getCultureList(translations): any {
    const cultureObj = translations.codeValue && translations.codeValue.culture;
    if (cultureObj) {
      return Object.keys(cultureObj).map(function (key) { return { id: key, text: cultureObj[key] }; });
    } else {
      return null;
    }
  }

  ngOnInit() {
    this.initializeForm();
    const et = this.activatedRoute.snapshot.queryParams['et'];
    this.authService.validateRegistrationToken(et).then((tokenObj) => {
      this.tokenObj = tokenObj;
      this.tokenObj.token = et;
      if (tokenObj) {
        this.form.patchValue({
          email: tokenObj.UserName,
          cultureId: '' + tokenObj.CultureId
        }, { emitEvent: true });

        if ((<any>window).PhxTranslations) { // has translation data
          this.cultureList = this.getCultureList((<any>window).PhxTranslations);
          this.isLoading = false;
        } else {
          this.authService.loadTranslationDataByBrowserCulture().then((res) => {
            (<any>window).PhxTranslations = res;
            this.cultureList = this.getCultureList(res);
            this.isLoading = false;
          });
        }
      } else {
        console.log('The token for registration is invalid.');
      }
    }, (err) => {
      console.log(err);
    });
  }

  register() {
    console.log(this.form.errors);
    this.loadingSpinner.show();
    const username = this.form.controls.email.value;
    const password = this.form.controls.password.value;
    const cPassword = this.form.controls.confirmPassword.value;
    const cultureId = this.form.controls.cultureId.value;
    this.authService.register(username, password, cPassword, cultureId, this.tokenObj.token).then((res) => {
      this.authService.login(username, password).then((loginResponse) => {
        this.router.navigateByUrl('next/activity-centre');
        this.loadingSpinner.hide();
      }, (loginErr) => {
        this.dialogService.notify(loginErr);
        this.loadingSpinner.hide();
      });
    }, (err) => {
      this.validationMessages = [];
      Object.keys(err.error).forEach(item => {
        if (item === 'ModelState' && Object.keys(err.error[item]).length) {
          const val = values(err.error[item]);
          forEach(val, value => {
            for (let index = 0; index < value.length; index++) {
              const msg = value[index];
              this.validationMessages.push(msg);
            }
          });
        } else if (item === 'Message' && Object.keys(err.error[item]).length) {
          this.validationMessages.push(err.error[item]);
        }
      });

      this.loadingSpinner.hide();
    });
  }


  ngOnDestroy() {
    this.isAlive = false;
  }
}
