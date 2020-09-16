import { Component, OnDestroy, Input, ViewChild, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { CommissionRateAddRestrictionConfig } from './../model/commission-template';
import { PhxSelectBoxComponent } from './../../common/components/phx-select-box/phx-select-box.component';
import { differenceBy } from 'lodash';

@Component({
  selector: 'commission-rate-add-restriction',
  templateUrl: './commission-rate-add-restriction.component.html'
})
export class CommissionRateAddRestrictionComponent implements OnDestroy, OnChanges {
  selectedValues: any = [];
  restrictionTypeForm: FormGroup;
  list: any = [];

  @Input() commissionRateAddRestrictionConfig: CommissionRateAddRestrictionConfig = <CommissionRateAddRestrictionConfig>{};
  @Input() control: AbstractControl;
  @Input() title: string;
  @ViewChild('phxSelectBox') phxSelectBox: PhxSelectBoxComponent;
  @Output() onCreate = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter();
  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.commissionRateAddRestrictionConfig && changes.commissionRateAddRestrictionConfig.currentValue) {
      this.commissionRateAddRestrictionConfig = changes.commissionRateAddRestrictionConfig.currentValue;
      this.showModel();
    }
  }

  showModel() {
    this.list = this.commissionRateAddRestrictionConfig.RestrictionList;
    if (this.commissionRateAddRestrictionConfig.ViewType === 'Checkbox') {
      this.initForm();
    } else {
      this.selectedValues = this.commissionRateAddRestrictionConfig.ValueField ? this.control.value.filter(a => a[this.commissionRateAddRestrictionConfig.ValueField]) : [];
      this.commissionRateAddRestrictionConfig.RestrictionList = [] = this.list ? differenceBy(this.list, this.selectedValues, this.commissionRateAddRestrictionConfig.ValueField) : [];
    }
  }

  ngOnDestroy() {}

  initForm() {
    const controls = this.commissionRateAddRestrictionConfig.RestrictionList.map(c => {
      if (this.control.value.find(a => a[this.commissionRateAddRestrictionConfig.ValueField] === c[this.commissionRateAddRestrictionConfig.ValueField])) {
        return new FormControl(true);
      } else {
        return new FormControl(false);
      }
    });
    this.restrictionTypeForm = this.fb.group({
      ContentRestrictionId: new FormArray(controls)
    });
  }

  removeCommissionRateRestriction(index: number) {
    this.commissionRateAddRestrictionConfig.RestrictionList.push(this.selectedValues[index]);
    this.commissionRateAddRestrictionConfig.RestrictionList.sort((a, b) => {
      if (a.Name.toLowerCase() < b.Name.toLowerCase()) {
        return -1;
      } else if (a.Name.toLowerCase() > b.Name.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });
    this.selectedValues.splice(index, 1);
  }

  valueChanged(event: any) {
    if (event.value) {
      this.selectedValues.push(event.value);
    }
    this.phxSelectBox.clear();
    this.commissionRateAddRestrictionConfig.RestrictionList = differenceBy(this.list, this.selectedValues, this.commissionRateAddRestrictionConfig.ValueField);
  }

  updateForm() {
    let formValues;
    if (this.commissionRateAddRestrictionConfig.ViewType === 'Dropdown') {
      formValues = this.control.value.filter(x => !x[this.commissionRateAddRestrictionConfig.ValueField]).concat(this.selectedValues);
    } else {
      const selectedValues = this.restrictionTypeForm.value.ContentRestrictionId.map((v, i) => (v ? this.commissionRateAddRestrictionConfig.RestrictionList[i] : null)).filter(v => v !== null);
      formValues = this.control.value.filter(x => !x[this.commissionRateAddRestrictionConfig.ValueField]).concat(selectedValues);
    }
    return formValues;
  }

  create() {
    this.onCreate.emit(this.updateForm());
  }

  cancel() {
    this.onCancel.emit();
  }
}
