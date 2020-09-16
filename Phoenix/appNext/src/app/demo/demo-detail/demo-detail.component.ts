import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';

import { CodeValue } from '../../common/model/index';
import { CommonService, CodeValueService, ValidationExtensions, PhxLocalizationService } from '../../common/index';

import { Demo } from '../shared/index';
import { DemoService } from '../shared/demo.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-demo-detail',
  templateUrl: './demo-detail.component.html',
  styleUrls: ['./demo-detail.component.less'],
})
export class DemoDetailComponent implements OnInit, OnDestroy {
  id: number;
  demo: Demo;
  editable: boolean = true;

  isAlive: boolean = true;
  form: FormGroup;
  codeValueGroups: any;
  currencyList: Array<{ text, value }> = [];
  profileStatusList: Array<{ text, value }> = [];
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public commonService: CommonService,
    private codeValueService: CodeValueService,
    private demoService: DemoService,
    private localizationService: PhxLocalizationService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {

    this.validateDecimal = this.validateDecimal.bind(this);
    this.validateInteger = this.validateInteger.bind(this);
    this.checkForDuplicate = this.checkForDuplicate.bind(this);

    this.loadCurrencyList();
    this.loadProfileStatus();
    this.form = this.fb.group({
      StringField: ['', [
        Validators.required,
        ValidationExtensions.minLength(2, 'you should enter at least 2 characters'),
        Validators.maxLength(200)
      ], [this.checkForDuplicate.bind(this)]],

      MultilineStringField: ['', [Validators.maxLength(2000)]],
      CurrencyCodeValueField: ['', [Validators.required]],
      DateField: ['', [ValidationExtensions.required('Date field is required!')]],
      IntegerField: ['', [Validators.required, this.validateInteger]],
      DecimalField: ['', [Validators.required, this.validateDecimal]],
      CountryId: [''],
      ProfileStatusIds: ['', [Validators.required]],
      SubdivisionId: [''],
      RadioButton: ['Option1'],
      CheckBox: ['Check1'],
      Parent: this.fb.group({
        StringField: ['', [ValidationExtensions.minLength(2, 'you should enter at least 2 characters in Parent string field')]]
      })
    });

    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => {
        console.log('form change', value);
        Object.assign(this.demo, value);
        this.demoService.updateState(this.demo);
      });

    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['id'];
        this.loadDemo(this.id);
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadDemo(id: number, force: boolean = false) {
    this.demoService.getDemo(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.demo = data;
        this.setDemoEditableStatus(this.demo);
        this.form.patchValue(data, { emitEvent: false });
      });
  }

  setDemoEditableStatus(demo: Demo) {
    this.editable = true;
  }

  validateDecimal(control: AbstractControl) {
    if (control.value < 4) {
      return {
        valueShouldBeMoreThan4: {
          message: this.localizationService.translate('demo.detail.valueShouldBeMoreThan4')
        }
      };
    }
  }

  validateInteger(control: AbstractControl) {

    if (control.value % 2 === 0) {
      return {
        valueShouldBeOdd: {
          message: this.localizationService.translate('demo.detail.valueShouldBeOdd')
        }
      };
    }
  }

  checkForDuplicate(control: AbstractControl) {
    return new Promise((resolve) => {
      this.demoService.isDuplicate(control.value)
        .subscribe((isDuplicate) => {
          if (isDuplicate === true) {
            resolve({
              duplicate: {
                message: this.localizationService.translate('demo.detail.duplicate')
              }
            });
          } else {
            resolve(null);
          }
        });
    });

  }

  loadCurrencyList() {
    this.currencyList = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.code + ' - ' + codeValue.text,
          value: codeValue.id
        };
      });
  }
  loadProfileStatus() {
    this.profileStatusList = this.codeValueService.getCodeValues(this.codeValueGroups.ProfileStatus, true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.code + ' - ' + codeValue.text,
          value: codeValue.id
        };
      });
  }

  profileListChanged(data: any) {
    console.log(data);
  }
}

