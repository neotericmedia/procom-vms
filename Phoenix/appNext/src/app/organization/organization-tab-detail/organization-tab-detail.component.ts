// angular
import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
// common
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants } from '../../common/model/phx-constants';
// organization
import { IReadOnlyStorage, IOrganization, ITabDetailsDetail, ITabDetails, ITabDetailsAddresses, IFormGroupSetup, IRoot } from '../state/organization.interface';
import { OrganizationDetailsComponent } from '../organization-details/organization-details.component';
import { OrganizationObservableService } from '../state/organization.observable.service';
import { OrganizationAddressesComponent } from '../organization-addresses/organization-addresses.component';
import { OrganizationAddressComponent } from '../organization-address/organization-address.component';

@Component({
  selector: 'app-organization-tab-detail',
  templateUrl: './organization-tab-detail.component.html',
  styleUrls: ['./organization-tab-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationTabDetailComponent {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<ITabDetails>;
  @Output() outputEvent = new EventEmitter();
  @Output() ready = new EventEmitter();
  @Input() rootModel: IOrganization;

  html: {
    phxConstants: typeof PhxConstants;
  } = {
    phxConstants: null
  };

  constructor() {
    console.log(this.constructor.name + '.constructor');
    this.html.phxConstants = PhxConstants;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onReady() {
    this.ready.emit();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, organization: IOrganization, organizationObservableService: OrganizationObservableService): FormGroup<ITabDetails> {
    // debugger;
    const organizationDetails: ITabDetailsDetail = {
      isFromParentOrgList: true,
      OrganizationId: organization.Id,
      LegalName: organization.LegalName,
      Code: organization.Code,
      DisplayName: organization.DisplayName,
      IndustryTypeId: organization.IndustryTypeId,
      SectorTypeId: organization.SectorTypeId,
      CountryId: organization.CountryId,
      DefaultTaxSubdivisionId: organization.DefaultTaxSubdivisionId,
      ParentOrganizationId: organization.ParentOrganizationId ? organization.ParentOrganizationId : null,
      ParentOrganization: organization.ParentOrganization !== null && organization.ParentOrganization.Id === null && organization.ParentOrganization.Name === null ? null : organization.ParentOrganization,
      parentOrganizationName: organization.ParentOrganization ? organization.ParentOrganization.Name : null
    };

    const formGroup: FormGroup<ITabDetails> = formGroupSetup.formBuilder.group<ITabDetails>({
      OrganizationId: [organization.Id],

      TabDetailsDetail: OrganizationDetailsComponent.formBuilderGroupSetup(formGroupSetup, organizationDetails, organizationObservableService),

      TabDetailsAddresses: formGroupSetup.formBuilder.group<ITabDetailsAddresses>({
        OrganizationAddresses: OrganizationAddressComponent.formBuilderGroupSetup(formGroupSetup, organization.OrganizationAddresses)
      })
    });

    if (organization.OrganizationStatusId === PhxConstants.OrganizationStatus.Active || PhxConstants.OrganizationStatus.PendingChange) {
      formGroup.controls.TabDetailsDetail.get('Code').clearAsyncValidators();
      formGroup.controls.TabDetailsDetail.get('LegalName').clearAsyncValidators();
    }

    return formGroup;
  }

  public static formGroupToPartial(formGroupRoot: FormGroup<IRoot>): Partial<IOrganization> {
    const formGroupTabDetail: FormGroup<ITabDetails> = <FormGroup<ITabDetails>>formGroupRoot.controls.TabDetails;
    return {
      ...OrganizationDetailsComponent.formGroupToPartial(<FormGroup<ITabDetailsDetail>>formGroupTabDetail.controls.TabDetailsDetail),
      ...OrganizationAddressesComponent.formGroupToPartial(<FormGroup<ITabDetailsAddresses>>formGroupTabDetail.controls.TabDetailsAddresses)
    };
  }
}
