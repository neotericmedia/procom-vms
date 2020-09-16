import { CustomFieldService } from './../../services/custom-field.service';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, NgZone, OnChanges } from '@angular/core';
import { CustomFieldValue, CustomFieldDataSourceDetail, PhxFormControlLayoutType } from '../../model/index';
import { FormControl, FormGroup } from '@angular/forms';
import { FormControlExtensions } from '../phx-form-control/formcontrol.extensions';

@Component({
  selector: 'app-phx-custom-field-value',
  templateUrl: './phx-custom-field-value.component.html',
  styleUrls: ['./phx-custom-field-value.component.less']
})
export class PhxCustomFieldValueComponent implements OnInit, OnChanges {

  @Input() customFieldValue: CustomFieldValue;
  @Input() forceValidation: boolean;
  @Input() control: FormControl;
  @Input() filterId: number = null;
  @Input() layoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.Responsive;
  nameAttribute: string;
  private selectUndefinedOptionValue: any;

  @Output() valueUpdated: EventEmitter<CustomFieldValue> = new EventEmitter();

  dataSourceDetails: Array<CustomFieldDataSourceDetail>;

  PhxFormControlLayoutType: typeof PhxFormControlLayoutType = PhxFormControlLayoutType;

  constructor( private zone: NgZone, private customFieldService: CustomFieldService) { }

  ngOnInit() {
    if (!this.customFieldValue) {
      throw new Error('Invalid initialization. "customFieldValue" is required.');
    }

    if (this.control && !this.nameAttribute) {

      this.nameAttribute = FormControlExtensions.findControlName(this.control);
    }

    this.updateDataSourceDetails();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filterId) {
      this.updateDataSourceDetails();
    }

    if (changes.customFieldValue && changes.customFieldValue.currentValue && this.customFieldService.isDataSourceField(this.customFieldValue.CustomFieldVersionConfiguration)) {

      this.control.setValue(changes.customFieldValue.currentValue.CustomFieldDataSourceDetailId);

    }
  }

  updateDataSourceDetails(): void {

    this.dataSourceDetails = this.getFilteredList(this.customFieldValue.CustomFieldVersionConfiguration.CustomFieldDataSourceDetails)
      .sort((a: CustomFieldDataSourceDetail, b: CustomFieldDataSourceDetail) => {
        const valueA = a.Value.toLowerCase();
        const valueB = b.Value.toLowerCase();
        if (valueA < valueB) {
          return -1;
        }
        if (valueA > valueB) {
          return 1;
        }
        return 0;
      });

    if (this.customFieldValue.CustomFieldDataSourceDetailId && !this.dataSourceDetails.some(x => x.Id === this.customFieldValue.CustomFieldDataSourceDetailId)) {
      this.updateValueDataSource(null);
    }
  }

  updateValueDataSource(value: number) {

    const fieldValue: CustomFieldValue = JSON.parse(JSON.stringify(this.customFieldValue));

    fieldValue.CustomFieldDataSourceDetailId = value ? Number(value) : null;
    fieldValue.CustomFieldTextValue = null;

    this.valueUpdated.emit(fieldValue);
  }

  updateValueText(value: any) {
    const fieldValue: CustomFieldValue = JSON.parse(JSON.stringify(this.customFieldValue));
    fieldValue.CustomFieldDataSourceDetailId = null;
    fieldValue.CustomFieldTextValue = value;

    this.valueUpdated.emit(fieldValue);
  }

  getFilteredList(customFieldDataSourceDetails: Array<CustomFieldDataSourceDetail>): Array<CustomFieldDataSourceDetail> {

    if (this.filterId != null) {

      return customFieldDataSourceDetails.filter( cfd => cfd.ParentId === this.filterId);

    } else if (!this.customFieldValue.CustomFieldVersionConfiguration.DependencyId) {
      return customFieldDataSourceDetails;
    } else {
      return [];
    }
  }

  showPlaceHolder() {

    let result = false;

    if (this.customFieldValue.CustomFieldDataSourceDetailId == null) {
      result = true;
      this.control.setValue(null);
    }
    return result;

  }


}
