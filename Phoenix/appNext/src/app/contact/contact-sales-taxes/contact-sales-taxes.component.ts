import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { ISalesTaxNumber, IReadOnlyStorage, IUserProfileWorkerSPTaxNumber, IFormGroupOnNew } from '../state';
import { CustomFieldService, CodeValueService, CommonService } from '../../common';
import { ContactSalesTaxComponent } from '../contact-sales-tax/contact-sales-tax.component';
import { uniq } from 'lodash';

@Component({
  selector: 'app-contact-sales-taxes',
  templateUrl: './contact-sales-taxes.component.html',
  styleUrls: ['./contact-sales-taxes.component.less']
})
export class ContactSalesTaxesComponent implements OnInit {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<ISalesTaxNumber>;
  @Input() selectedValue: AbstractControl<any>;
  @Output() outputEvent = new EventEmitter();
  @Input() forInternalProfile: boolean = false;

  formArrayName: 'UserProfileWorkerSPTaxNumbers' | 'UserProfileInternalTaxNumbers';

  listTaxTypes: Array<any>;

  constructor(private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private codeValueService: CodeValueService,
    private commonService: CommonService) {
    this.listTaxTypes = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.SalesTax, true);
  }

  ngOnInit() {
    if (this.forInternalProfile) {
      this.formArrayName = 'UserProfileInternalTaxNumbers';
    } else {
      this.formArrayName = 'UserProfileWorkerSPTaxNumbers';
    }
  }

  formArraySaleTax(): FormArray<IUserProfileWorkerSPTaxNumber> {
    return <FormArray<IUserProfileWorkerSPTaxNumber>>this.inputFormGroup.get(this.formArrayName);
  }

  onClickAddSalesTax() {
    const formArraySaleTax: FormArray<IUserProfileWorkerSPTaxNumber> = <FormArray<IUserProfileWorkerSPTaxNumber>>this.inputFormGroup.get(this.formArrayName);
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArraySaleTax.push(ContactSalesTaxComponent.formBuilderGroupAddNew(formGroupOnNew, formArraySaleTax.value));
  }

  trackByFn(index, item: FormGroup<IUserProfileWorkerSPTaxNumber>) {
    if (!item) {
      return undefined;
    }

    return item.value.SalesTaxId;
  }

  private hasDuplicates(values: number[]) {
    return uniq(values).length !== values.length;
  }


  onOutputEvent() {
    if (this.forInternalProfile) {

      if (!this.hasDuplicates(this.inputFormGroup.controls.UserProfileInternalTaxNumbers.value.map(x => x.SalesTaxId))) {
        this.inputFormGroup.controls.SelectedType.patchValue(this.inputFormGroup.controls.UserProfileInternalTaxNumbers.value);
        this.outputEvent.emit();
      }

    } else {
      this.inputFormGroup.controls.SelectedType.patchValue(this.inputFormGroup.controls.UserProfileWorkerSPTaxNumbers.value);
      this.outputEvent.emit();
    }


  }

}
