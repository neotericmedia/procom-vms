import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions, PhxConstants } from '../../common';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IUserProfileWorkerSPTaxNumber, IFormGroupSetup, IFormGroupOnNew, ISalesTaxNumber, IProfile } from '../state';
import { CustomFieldErrorType } from '../../common/model/custom-field-error-type';


@Component({
  selector: 'app-contact-sales-tax',
  templateUrl: './contact-sales-tax.component.html',
  styleUrls: ['./contact-sales-tax.component.less']
})
export class ContactSalesTaxComponent extends ContactBaseComponentPresentational<IUserProfileWorkerSPTaxNumber> implements OnInit {
  @Input() taxIndex: number;
  @Input() selectedValues: AbstractControl<any>;
  @Input() listTaxTypes: Array<any>;
  phxConstants = PhxConstants;
  constructor() {
    super('ContactSalesTaxComponent');
  }

  getCodeValuelistsStatic() { }

  businessRules() { }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, saleTaxes: Array<IUserProfileWorkerSPTaxNumber>, profileTypeId: number): FormArray<IUserProfileWorkerSPTaxNumber> {
    return formGroupSetup.formBuilder.array<IUserProfileWorkerSPTaxNumber>(
      saleTaxes.map((tax: IUserProfileWorkerSPTaxNumber, index) =>
          formGroupSetup.formBuilder.group<IUserProfileWorkerSPTaxNumber>({
            Id: [tax.Id],
            UserProfileId: [tax.UserProfileId],
            SourceId: [tax.SourceId],
            SalesTaxId: [tax.SalesTaxId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SalesTaxId', CustomFieldErrorType.required))]],
            SalesTaxNumber: [
              tax.SalesTaxNumber,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(64),
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SalesTaxNumber', CustomFieldErrorType.required))
              ]
            ],
            ProfileTypeId: profileTypeId,
            IsDraft: [tax.IsDraft],
            CreatedByProfileId: [tax.CreatedByProfileId],
            CreatedDatetime: [tax.CreatedDatetime],
            LastModifiedByProfileId: [tax.LastModifiedByProfileId],
            LastModifiedDatetime: [tax.LastModifiedDatetime]
          })
        )
    );
  }

  test($event) {
    // console.log($event);
  }

  onClickDeleteSalesTax() {
    const formArrayOrganizationSaleTax: FormArray<IUserProfileWorkerSPTaxNumber> = <FormArray<IUserProfileWorkerSPTaxNumber>>this.inputFormGroup.parent;
    formArrayOrganizationSaleTax.removeAt(this.taxIndex);
    this.selectedValues.value.splice(this.taxIndex, 1);
    // this.outputEvent.emit();
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, salesTax: Array<IUserProfileWorkerSPTaxNumber>): FormGroup<IUserProfileWorkerSPTaxNumber> {
    return formGroupOnNew.formBuilder.group<IUserProfileWorkerSPTaxNumber>({
      Id: [0],
      SalesTaxNumber: [
        null,
        [
          ValidationExtensions.minLength(1),
          ValidationExtensions.maxLength(64),
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('SalesTaxNumber', CustomFieldErrorType.required))
        ]
      ],
      SalesTaxId: [null, ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('SalesTaxId', CustomFieldErrorType.required))],
      IsDraft: [true],
      CreatedByProfileId: [0],
      CreatedDatetime: [null],
      LastModifiedByProfileId: [0],
      LastModifiedDatetime: [null],
      UserProfileId: [0],
      SourceId: [0],
    });
  }

  ngOnInit() {
  }

}
