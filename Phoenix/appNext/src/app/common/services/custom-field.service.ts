import { PhxLocalizationService } from './phx-localization.service';
import { CustomFieldVersion, CustomFieldVersionConfiguration, CustomFieldValue, CustomFieldErrorType } from './../model/index';
import { Injectable } from '@angular/core';
import { Validators, ValidatorFn } from '@angular/forms';
import { ValidationExtensions } from '../components/phx-form-control/validation.extensions';
import { PhoenixCommonModuleResourceKeys } from '../PhoenixCommonModule.resource-keys';

@Injectable()
export class CustomFieldService {

  constructor(private localizationService: PhxLocalizationService) { }

  public isDataSourceField(field: CustomFieldVersionConfiguration): boolean {
    const dataSourceUIControlTypeIds: Array<number> = [1, 4];
    return dataSourceUIControlTypeIds.some(x => x === field.UIControlTypeId);
  }

  public mergeTransformCustomFieldValues(version: CustomFieldVersion, customFieldValues: Array<CustomFieldValue>): Array<CustomFieldValue> {
    const result: Array<CustomFieldValue> = [];

    if (version) {
      version.CustomFieldVersionConfigurations.forEach((config: CustomFieldVersionConfiguration) => {
        let value: CustomFieldValue;

        const existing = customFieldValues.find((v: CustomFieldValue) => v.CustomFieldConfigurationId === config.Id);
        if (existing) {
          value = existing;
        } else {
          value = {
            Id: 0,
            EntityTypeId: version.EnittyTypeId,
            EntityId: 0,
            CustomFieldConfigurationId: config.Id,
            CustomFieldVersionConfiguration: null,
            CustomFieldDataSourceDetailId: null,
            CustomFieldTextValue: null,
          };
        }

        value.CustomFieldVersionConfiguration = config,

          result.push(value);
      });
    }

    return this.sortOnSquence(result);

  }

  public sortOnSquence(customFieldList: Array<CustomFieldValue>) {

    return customFieldList.sort((a: CustomFieldValue, b: CustomFieldValue) => {

      if (a.CustomFieldVersionConfiguration.SortOrder > b.CustomFieldVersionConfiguration.SortOrder) {
        return 1;
      } else if (a.CustomFieldVersionConfiguration.SortOrder < b.CustomFieldVersionConfiguration.SortOrder) {
        return -1;
      } else {
        return 0;
      }

    });

  }

  public sortOnHierarchy(customFieldList: Array<CustomFieldValue>) {

    const sortedList: Array<CustomFieldValue> = [];
    const ancestorList = customFieldList.filter((cfv: CustomFieldValue) => cfv.CustomFieldVersionConfiguration.DependencyId == null);

    if (ancestorList && ancestorList.length === 1) {

      let count = 0; // prevent infinte loops if configuration is malformed
      let nextId = null;
      while (customFieldList.length > 0 && count < 150) {

        const matchList: Array<CustomFieldValue> = this.extractCustomFieldValue(nextId, customFieldList);
        for (let i = 0; i < matchList.length; i++) {
          if (matchList[i]) {
            nextId = matchList[i].CustomFieldVersionConfiguration.Id;
            sortedList.push(matchList[i]);
          }
        }

        count++;
      }

      return sortedList;

    } else {
      return customFieldList;
    }

  }

  private extractCustomFieldValue(configurationId: number, customFieldList: Array<CustomFieldValue>) {

    const matches: Array<CustomFieldValue> = [];

    for (let i = 0; i < customFieldList.length; i++) {


      if (customFieldList[i].CustomFieldVersionConfiguration.DependencyId === configurationId ||
        (customFieldList[i].CustomFieldVersionConfiguration.DependencyId == null && configurationId == null)
      ) {
        matches.push(customFieldList[i]);
        customFieldList.splice(i, 1);

      }
    }

    return matches;

  }

  public parentHasValue(targetCustomField: CustomFieldValue, customFieldList: Array<CustomFieldValue>): boolean {

    let result = true;

    const parentId = targetCustomField.CustomFieldVersionConfiguration.DependencyId;

    for (const customField of customFieldList) {

      if (parentId === customField.CustomFieldVersionConfiguration.Id) {

        const parentValue = (customField.CustomFieldVersionConfiguration.UIControlTypeId === 2)
          ? customField.CustomFieldTextValue : customField.CustomFieldDataSourceDetailId;

        result = (parentValue != null);

        break;
      }

    }

    return result;

  }

  public getParentValue(targetCustomField: CustomFieldValue, customFieldList: Array<CustomFieldValue>) {

    let result = null;

    const parentId = targetCustomField.CustomFieldVersionConfiguration.DependencyId;

    for (const customField of customFieldList) {

      if (parentId === customField.CustomFieldVersionConfiguration.Id) {

        result = (customField.CustomFieldVersionConfiguration.UIControlTypeId === 2)
          ? customField.CustomFieldTextValue : customField.CustomFieldDataSourceDetailId;

      }

    }

    return result;

  }


  public initializeCustomFields(controlsConfig, customFieldList: Array<CustomFieldValue>, disabled: boolean) {

    customFieldList.forEach((customField: CustomFieldValue) => {

      const fieldName = this.getFieldName(customField.CustomFieldConfigurationId);
      const fieldValue = this.isDataSourceField(customField.CustomFieldVersionConfiguration)
        ? customField.CustomFieldDataSourceDetailId : customField.CustomFieldTextValue;

      controlsConfig[fieldName] = [
        { value: fieldValue || null, disabled: disabled },
        Validators.compose(this.createValidators(customField.CustomFieldVersionConfiguration.DisplayName, customField))
      ];

    });

    return controlsConfig;

  }

  public getFieldName(id: number) {
    return 'customField_' + id;
  }

  createValidators(displayName: string, customField: CustomFieldValue): Array<ValidatorFn> {

    const validators: Array<ValidatorFn> = [];

    if (customField.CustomFieldVersionConfiguration.IsMandatory) {

      validators.push(ValidationExtensions.required(this.formatErrorMessage(displayName, CustomFieldErrorType.required)));

    }

    if (customField.CustomFieldVersionConfiguration.ValidationRegex != null) {

      validators.push(ValidationExtensions.pattern(customField.CustomFieldVersionConfiguration.ValidationRegex, customField.CustomFieldVersionConfiguration.ValidationMessage));

    }

    return validators;

  }

  formatErrorMessage(fieldName: string, errorType: CustomFieldErrorType, customArgs?: Array<any>) {

    let errorMessage: string = null;

    switch (errorType) {

      case CustomFieldErrorType.required:

        errorMessage = this.localizationService.translate(PhoenixCommonModuleResourceKeys.customField.requiredValidationMessage, fieldName, ...customArgs);

        break;

      case CustomFieldErrorType.invalid:

        errorMessage = this.localizationService.translate(PhoenixCommonModuleResourceKeys.customField.invalidValidationMessage, fieldName, ...customArgs);

        break;

      case CustomFieldErrorType.unique:

        errorMessage = this.localizationService.translate(PhoenixCommonModuleResourceKeys.customField.uniqueValidationMessage, fieldName, ...customArgs);

        break;

      case CustomFieldErrorType.range:
        errorMessage = this.localizationService.translate(PhoenixCommonModuleResourceKeys.customField.rangeValidationMessage, fieldName, ...customArgs);
        break;

      case CustomFieldErrorType.length:
        errorMessage = this.localizationService.translate(PhoenixCommonModuleResourceKeys.customField.lengthValidationMessage, fieldName, ...customArgs);
        break;

      case CustomFieldErrorType.cannotExceed:
        errorMessage = this.localizationService.translate(PhoenixCommonModuleResourceKeys.customField.cannotExceedValidationMessage, fieldName, ...customArgs);
        break;

      case CustomFieldErrorType.atLeast:
        errorMessage = this.localizationService.translate(PhoenixCommonModuleResourceKeys.customField.atLeastValidationMessage, fieldName, ...customArgs);
        break;

    }

    return errorMessage;

  }

}
