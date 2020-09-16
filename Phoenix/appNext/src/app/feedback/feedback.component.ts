import { Location } from '@angular/common';
import { ApiService } from './../common/services/api.service';
import { PhxModalComponent } from './../common/components/phx-modal/phx-modal.component';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { FeedbackResourceKeys } from './feedback-resource-keys';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PhxFormControlLayoutType, PhxButton } from '../common/model';
import { PhxLocalizationService, CommonService } from '../common';
import { ValidationExtensions } from './../common/components/phx-form-control/validation.extensions';
import { PhoenixCommonModuleResourceKeys } from '../common/PhoenixCommon.module';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.less']
})
export class FeedbackComponent implements OnInit, OnDestroy {

  @ViewChild(PhxModalComponent) modal: PhxModalComponent;

  buttons: PhxButton[] = [
    {
      icon: 'send',
      tooltip: this.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.submit),
      btnType: 'primary',
      action: () => this.sendFeedback(),
      disabled: () => this.saving || !this.form || !this.form.valid
    }
  ];

  form: FormGroup;
  typeControl: AbstractControl;
  feedbackControl: AbstractControl;

  resourceKeys = FeedbackResourceKeys;

  layoutTypeEnum = PhxFormControlLayoutType;

  feedbackTypes: { label: string, value: string, description: string }[] = [
    { label: FeedbackResourceKeys.ideaLabel, value: null, description: FeedbackResourceKeys.ideaDescription },
    { label: FeedbackResourceKeys.problemLabel, value: null, description: FeedbackResourceKeys.problemDescription },
    { label: FeedbackResourceKeys.questionLabel, value: null, description: FeedbackResourceKeys.questionDescription },
    { label: FeedbackResourceKeys.praiseLabel, value: null, description: FeedbackResourceKeys.praiseDescription }
  ]; // TODO: make codevalues?

  model: { Type: string, Feedback: string };

  isAlive = true;

  saving = false;

  constructor(
    private formBuilder: FormBuilder,
    private localizationService: PhxLocalizationService,
    private apiService: ApiService,
    private location: Location,
    private commonService: CommonService
  ) {
  }

  ngOnInit() {
    for (const type of this.feedbackTypes) {
      type.value = this.localizationService.translate(type.label);
    }

    this.model = this.getDefaultFormValue();

    this.form = this.formBuilder.group({
      Type: [this.model.Type, [
        Validators.required
      ]],
      Feedback: [this.model.Feedback, [
        Validators.required,
        ValidationExtensions.noEmpty(),
        Validators.maxLength(1000),
      ]]
    });

    this.typeControl = this.form.get('Type');
    this.feedbackControl = this.form.get('Feedback');

    this.typeControl.valueChanges
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe((changes: string) => {
        this.model.Type = changes;
      });

    this.feedbackControl.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe((changes: string) => {
        this.model.Feedback = changes ? changes.trim() : changes;
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  getDefaultFormValue() {
    return { Type: this.feedbackTypes[0].value, Feedback: null };
  }

  show() {
    this.model = this.getDefaultFormValue();
    this.form.reset(this.model);
    this.modal.show();
  }

  sendFeedback() {
    const url = this.location.prepareExternalUrl(this.location.path());
    const browser = this.commonService.browserInfo;

    const command = {
      ...this.model,
      Url: url,
      BrowserName: browser.name,
      BrowserVersion: browser.version
    };

    this.saving = true;

    this.apiService.command('SendFeedback', command)
      .then(response => {
        this.commonService.logSuccess(this.localizationService.translate(this.resourceKeys.feedbackSuccessMessage));
        this.modal.hide();
        this.saving = false;
      })
      .catch(error => {
        this.saving = false;
        console.error(error);
      });
  }
}
