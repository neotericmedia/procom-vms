import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PhxConstants, CommonService } from '../common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { CustomField } from './model/custom-field';
import { ClientSpecificFieldsService } from './client-specific-fields.service';

@Component({
  selector: 'app-client-specific-fields',
  templateUrl: './client-specific-fields.component.html',
  styleUrls: ['./client-specific-fields.component.less']
})

export class ClientSpecificFieldsComponent implements OnInit {

  @Input() formData: any = {};
  @Input() entityTypeId: PhxConstants.EntityType;
  @Input() entityId: number;
  @Input() clientId: number;
  @Input() editable: boolean;
  @Output('formValidationChanged') formValidationChanged: EventEmitter<any> = new EventEmitter();
  @Output('formValueChanged') formValueChanged: EventEmitter<any> = new EventEmitter();

  formGroup: FormGroup;
  fields: CustomField[];

  dateSerializationFormat: string;
  dateDisplayFormat: string;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private clientSpecificFieldsService: ClientSpecificFieldsService
  ) {
    this.dateSerializationFormat = this.commonService.ApplicationConstants.DateFormat.yyyy_MM_dd;
    this.dateDisplayFormat = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
  }

  ngOnInit() {
    this.formData = {};
    if (this.clientId && this.entityId && this.entityTypeId) {
      this.clientSpecificFieldsService.getCustomFields(this.clientId, this.entityId, this.entityTypeId)
        .then((customFields: CustomField[]) => {
          this.fields = customFields;
          if (_.isEmpty(this.formData)) {
            this.initFormData();
          }

          this.initFormGroup();
        });
    }
  }

  initFormData() {
    this.fields.forEach(field => {
      if (field.FieldValue) {
        if (field.FieldType === 'Datepicker') {
          this.formData[field.FieldName] = new Date(field.FieldValue);
        } else if (field.FieldType === 'DecimalNumber') {
          this.formData[field.FieldName] = parseFloat(field.FieldValue);
        } else {
          this.formData[field.FieldName] = field.FieldValue;
        }
      }
    });
  }

  initFormGroup() {
    const controlsConfig = {};
    this.fields.forEach((field) => {
      const validators = [];
      if (field.IsMandatory) {
        validators.push(Validators.required);
      }
      if (field.RegEx) {
        validators.push(Validators.pattern(field.RegEx));
      }
      controlsConfig[field.FieldName] = [field.DefaultValue, validators];
      if (field.SelectValues) {
        field.SelectValueArray = field.SelectValues.split(',');
      }
    });
    this.formGroup = this.fb.group(controlsConfig);
    this.fields.filter(field => field.FieldType === 'Dropdown' && this.formData[field.FieldName])
      .forEach((field) => {
        this.formGroup.controls[field.FieldName].setValue(this.formData[field.FieldName]);
      });
    this.formGroup.valueChanges.subscribe(val => {
      this.formValidationChanged.emit(this.formGroup.valid);
      this.formValueChanged.emit(this.formGroup.value);
    });
  }

  trimText(fieldName) {
    this.formData[fieldName] = this.formData[fieldName].trim();
  }

  onDropdownSelectValueChanged(value, fieldName) {
    this.formData[fieldName] = value;
  }
}
