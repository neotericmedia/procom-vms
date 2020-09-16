import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { TaxRate } from '../../payroll/model';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, FormArray, ValidatorFn } from '@angular/forms';
import { InputTextLimitWithDecimalsDirective } from '../../common/directives/inputTextLimitWithDecimals.directive';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { isFulfilled } from 'q';

@Component({
  selector: 'app-payroll-taxrate',
  templateUrl: './payroll-taxrate.component.html',
  styleUrls: ['./payroll-taxrate.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class PayrollTaxrateComponent implements OnInit, OnChanges {
  formGroups: FormArray;
  @Input() editable: boolean;
  @Input() showButtons: boolean;
  @Input() taxRates: Array<TaxRate>;
  @Input() formTaxRate: FormGroup;
  @Input() groupName: string;
  @Input() fb: FormBuilder;
  @Input() displayConstant: boolean;
  numberFilter: any = { 'from': 0, 'to': 9999999999999.99, 'decimalplaces': 2 };
  percentageFilter: any = { 'from': 0, 'to': 99.9999, 'decimalplaces': 4 };
  constructor(private loadingSpinnerService: LoadingSpinnerService) { }


  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showButtons']) {
      this.showButtons = changes['showButtons']['currentValue'];
    }
    if (changes['editable']) {
      this.editable = changes['editable']['currentValue'];
    }
    if (changes['isCorrection']) {
      this.editable = changes['isCorrection']['currentValue'];
    }
  }

  private generateId(): number {
    return Math.round(Math.random() * 1000000000);
  }

  calculateIncomeFrom(index: number, value) {
    if (index > -1) {
      let currentValue = value;
      const replaceStr = '/\.{' + ('2').toString() + ',}/';
      try {
        currentValue = (currentValue) ? currentValue.replace(/[^0-9.]+/g, '').replace(replaceStr, '.') : '';
      } catch (e) { return null; }
      if (currentValue === '') {
        this.setControlAsInvalid(index, 'IncomeTo');
      }
      if (currentValue !== null && (String(currentValue)).split('.').length > 2 && currentValue !== '') {
        currentValue = Number((String(currentValue).substr(-1)) === '.' ? currentValue.substr(0, String(currentValue).length - 1) : null);
      }
      if (Number(this.formGroups.controls[index + 1].get('IncomeTo').value) > Number(currentValue)) {
        this.setControlAsValid(index + 1, 'IncomeTo');

      } else {
        this.setControlAsInvalid(index + 1, 'IncomeTo');
      }
      if (String(Math.floor(currentValue)).length <= String(Math.floor(this.numberFilter.to)).length) {
        this.formGroups.controls[index + 1].get('IncomeFrom').setValue((currentValue == null || currentValue === '') ? null : Number(currentValue) * 1 + 0.01);
      }
      this.formGroups.controls[index + 1].get('IncomeTo').updateValueAndValidity();
      this.formGroups.controls[index].updateValueAndValidity();
      this.formGroups.root.updateValueAndValidity();
    }
  }

  onIncomeToChange(index: number, value) {
    this.formGroups.controls[index + 1].get('IncomeTo').updateValueAndValidity();
    this.formGroups.controls[index].updateValueAndValidity();
    this.formGroups.root.updateValueAndValidity();
  }

  removeRate(idx: number) {
    this.formGroups.controls[idx + 1].get('IncomeFrom').setValue(this.formGroups.controls[idx].get('IncomeFrom').value);
    this.formGroups.removeAt(idx);
  }

  addRate() {
    const lastFormValue = <FormGroup>this.formGroups.controls[this.formGroups.controls.length - 1];
    const newTaxRateGroup: any = {
      Id: this.generateId(),
      IncomeFrom: lastFormValue.get('IncomeFrom').value,
      IncomeTo: null,
      RatePercentage: null
    };
    if (this.displayConstant) {
      newTaxRateGroup.Constant = null;
    }
    this.formGroups.controls[this.formGroups.controls.length - 1] = this.createControls(newTaxRateGroup);
    this.setControlAsInvalid(this.formGroups.controls.length - 1, 'IncomeTo');
    this.setControlAsInvalid(this.formGroups.controls.length - 1, 'RatePercentage');
    if (this.displayConstant) {
      this.setControlAsInvalid(this.formGroups.controls.length - 1, 'Constant');
    }
    lastFormValue.controls['IncomeFrom'].setValue(null);
    this.formGroups.push(lastFormValue);
  }

  createControls(taxRate: TaxRate): FormGroup {
    const taxRateGroup: any = {
      Id: [taxRate.Id],
      IncomeFrom: [taxRate.IncomeFrom, []],
      IncomeTo: [taxRate.IncomeTo != null ? Number(taxRate.IncomeTo).toFixed(2) : taxRate.IncomeTo, [Validators.required, this.validateFromAndToInline]],
      RatePercentage: [taxRate.RatePercentage != null ? Number(taxRate.RatePercentage).toFixed(4) : taxRate.RatePercentage, [Validators.required]]
    };
    if (this.displayConstant) {
      taxRateGroup.Constant = [taxRate.Constant != null ? Number(taxRate.Constant).toFixed(2) : taxRate.Constant, [Validators.required]];
    }
    const formGroup = this.fb.group(taxRateGroup);
    const self = this;
    formGroup.valueChanges
      .distinctUntilChanged()
      .subscribe(value => {
        console.log(value);

        const targetTaxRate = self.taxRates.find(x => x.Id === value.Id);
        if (targetTaxRate) {
          Object.assign(targetTaxRate, value);
        }
      });
    return formGroup;
  }

  initForm() {
    this.formTaxRate.setControl(this.groupName, this.fb.array([]));
    this.formGroups = this.formTaxRate.get(this.groupName) as FormArray;
    this.setFormControlValues();
  }

  setFormControlValues() {
    if (this.taxRates != null && this.taxRates.length > 0) {
      for (let index = 0; index < this.taxRates.length; index++) {
        this.formGroups.push(this.createControls(this.taxRates[index]));
      }
    }
  }

  private validateFromAndToInline(control: AbstractControl) {
    if (!control.parent) { return null; }
    const fromCtrl = control.parent.get('IncomeFrom');
    if (fromCtrl.value < control.value) {
      return null;
    } else {
      return { 'InvalidControl': true };
    }
  }

  refresh(taxRate: TaxRate[]) {
    this.taxRates = taxRate;
    this.formGroups.controls = [];
    this.setFormControlValues();
    this.loadingSpinnerService.hide();
  }

  setControlAsInvalid(index: number, contolName: string) {
    if (index > -1) {
      this.formGroups.controls[index].get(contolName).markAsDirty();
      this.formGroups.controls[index].get(contolName)['_status'] = 'INVALID';
      this.formGroups.controls[index].get(contolName).updateValueAndValidity();
    }
  }

  setControlAsValid(index: number, contolName: string) {
    if (index > -1) {
      this.formGroups.controls[index].get(contolName)['_dirty'] = false;
      this.formGroups.controls[index].get(contolName)['_status'] = 'VALID';
      this.formGroups.controls[index].get(contolName).updateValueAndValidity();
    }
  }
}
