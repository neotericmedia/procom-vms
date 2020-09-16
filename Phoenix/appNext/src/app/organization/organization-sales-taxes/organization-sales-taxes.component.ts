import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { IReadOnlyStorage, IOrganizationTaxNumbers, IFormGroupOnNew, IOrganizationTaxNumber, ITabRoles, IOrganization } from './../state/organization.interface';
import { CustomFieldService, CodeValueService, CommonService } from '../../common';
import { OrganizationSalesTaxComponent } from '../organization-sales-tax/organization-sales-tax.component';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { AuthService } from '../../common/services/auth.service';
import { PhxConstants } from '../../common/PhoenixCommon.module';

@Component({
  selector: 'app-organization-sales-taxes',
  templateUrl: './organization-sales-taxes.component.html',
  styleUrls: ['./organization-sales-taxes.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationSalesTaxesComponent extends BaseComponentOnDestroy implements OnInit {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<IOrganizationTaxNumbers>;
  @Input() selectedValue: AbstractControl<any>;
  @Input() currentUserRole: PhxConstants.OrganizationRoleType = null;
  @Output() outputEvent = new EventEmitter();
  listTaxTypes: Array<any>;
  editable: boolean = true;

  constructor(private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private authService: AuthService,
    private chRef: ChangeDetectorRef) {
    super();
    this.listTaxTypes = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.SalesTax, true);
  }

  ngOnInit() {
    this.authService.getCurrentProfile().takeUntil(this.isDestroyed$).subscribe(data => {
      if (this.currentUserRole === PhxConstants.OrganizationRoleType.Internal) {
        const functionalRoles = data.FunctionalRoles;
        // Only Controller, Finance and System admin is allowed to edit internal role
        const authorizedRolesForInternalRoleEdit = [
          PhxConstants.FunctionalRole.Controller,
          PhxConstants.FunctionalRole.Finance,
          PhxConstants.FunctionalRole.SystemAdministrator
        ];
        this.editable = functionalRoles ? functionalRoles.some(r => authorizedRolesForInternalRoleEdit.includes(r.FunctionalRoleId)) : false;
        this.chRef.detectChanges();
      }
    });
  }

  formArrayOrganizationSaleTax(): FormArray<IOrganizationTaxNumber> {
    return <FormArray<IOrganizationTaxNumber>>this.inputFormGroup.controls.SalesTax;
  }

  public static formGroupToPartial(formGroupTabDetail: FormGroup<ITabRoles>): Partial<IOrganization> {
    const formGroupOrganizationTaxNumbers: FormGroup<IOrganizationTaxNumbers> = <FormGroup<IOrganizationTaxNumbers>>formGroupTabDetail.controls.OrganizationTaxNumbers;
    return { ...OrganizationSalesTaxComponent.formGroupToPartial(formGroupOrganizationTaxNumbers) };
  }

  onClickAddSalesTax() {
    const formArrayOrganizationSaleTax: FormArray<IOrganizationTaxNumber> = <FormArray<IOrganizationTaxNumber>>this.inputFormGroup.controls.SalesTax;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayOrganizationSaleTax.push(OrganizationSalesTaxComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayOrganizationSaleTax.value));
  }

  trackByFn(index: number, item) {
    return item.value.SalesTaxId;
  }

  onOutputEvent() {
    this.inputFormGroup.controls.SelectedType.patchValue(this.inputFormGroup.controls.SalesTax.value);
    this.outputEvent.emit();
  }
}
