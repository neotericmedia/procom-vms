import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldErrorType, AccessAction } from '../../common/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { IFormGroupOnNew, IFormGroupSetup, IOrganization, IOrganizationTaxNumbers, IOrganizationTaxNumber } from '../state/organization.interface';
import { ValidationExtensions, PhxConstants } from '../../common';

@Component({
    selector: 'app-organization-sales-tax',
    templateUrl: './organization-sales-tax.component.html',
    styleUrls: ['./organization-sales-tax.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationSalesTaxComponent extends OrganizationBaseComponentPresentational<IOrganizationTaxNumber> {
    @Input() taxIndex: number;
    @Input() selectedValues: AbstractControl<any>;
    @Input() listTaxTypes: Array<any>;
    @Input() editable: boolean = true;
    phxConstants = PhxConstants;

    constructor() {
        super('OrganizationSalesTaxesComponent');
    }

    businessRules(obj: IFormGroupValue): void { }

    getCodeValuelistsStatic() { }

    recalcLocalProperties(taxFormGroup: FormGroup<IOrganizationTaxNumber>) { }

    recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) { }

    public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, saleTaxes: Array<IOrganizationTaxNumber>): FormArray<IOrganizationTaxNumber> {
        return formGroupSetup.formBuilder.array<IOrganizationTaxNumber>(
            saleTaxes.map((tax: IOrganizationTaxNumber, index) =>
                formGroupSetup.hashModel.getFormGroup<IOrganizationTaxNumber>(formGroupSetup.toUseHashCode, 'IOrganizationTaxNumber', tax, index, () =>
                    formGroupSetup.formBuilder.group<IOrganizationTaxNumber>({
                        Id: [tax.Id],
                        SalesTaxId: [tax.SalesTaxId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SalesTaxId', CustomFieldErrorType.required))]],
                        SalesTaxNumber: [
                            tax.SalesTaxNumber,
                            [
                                ValidationExtensions.minLength(3),
                                ValidationExtensions.maxLength(64),
                                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SalesTaxNumber', CustomFieldErrorType.required))
                            ]
                        ],
                        OrganizationId: [tax.OrganizationId]
                    })
                )
            )
        );
    }

    onClickDeleteSalesTax() {
        const formArrayOrganizationSaleTax: FormArray<IOrganizationTaxNumber> = <FormArray<IOrganizationTaxNumber>>this.inputFormGroup.parent;
        formArrayOrganizationSaleTax.removeAt(this.taxIndex);
        this.selectedValues.value.splice(this.taxIndex, 1);
        this.outputEvent.emit();
    }

    public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, salesTax: Array<IOrganizationTaxNumber>): FormGroup<IOrganizationTaxNumber> {
        return formGroupOnNew.formBuilder.group<IOrganizationTaxNumber>({
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
            OrganizationId: [salesTax.length > 0 ? salesTax[0].OrganizationId : 0]
        });
    }

    public static formGroupToPartial(formGroupOrganizationTaxNumbers: FormGroup<IOrganizationTaxNumbers>): Partial<IOrganization> {
        const organizationTaxNumbers: Array<IOrganizationTaxNumber> = formGroupOrganizationTaxNumbers.controls.SalesTax.value;
        return { OrganizationTaxNumbers: organizationTaxNumbers };
    }
}
