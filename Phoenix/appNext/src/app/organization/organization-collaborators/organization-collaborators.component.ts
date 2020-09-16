import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { OrganizationApiService } from './../organization.api.service';
import { AuthService } from '../../common/services/auth.service';
import { UserContext } from '../../common/model/index';
import { IOrganizationCollaborators } from './../state/organization.interface';

import { AccessAction, CustomFieldErrorType } from '../../common/model';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { IFormGroupValue } from '../../common/utility/form-group';
import { IFormGroupSetup, IOrganization } from '../state';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions } from '../../common';

@Component({
  selector: 'app-organization-collaborators',
  templateUrl: './organization-collaborators.component.html',
  styleUrls: ['./organization-collaborators.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class OrganizationCollaboratorsComponent extends OrganizationBaseComponentPresentational<IOrganizationCollaborators> implements OnInit {

  @Input() isOrgDetails: boolean = false;
  userProfileList: Array<any>;
  codeValueGroups: any;
  currentUser: UserContext;

  constructor(private organizationApiService: OrganizationApiService, private authService: AuthService, private ref: ChangeDetectorRef) {
    super('OrganizationCollaboratorsComponent');
  }

  businessRules(obj: IFormGroupValue): void {
  }

  recalcLocalProperties(collaboratorsFormGroup: FormGroup<IOrganizationCollaborators>) {
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
  }

  ngOnInit() {
    this.getCodeValuelistsStatic();
  }

  getCodeValuelistsStatic() {
    this.organizationApiService.getUserProfileInternalList().subscribe((response: any) => {
      this.userProfileList = response.Items;
      this.userProfileList.forEach(element => {
        element.DisplayValue = element.Contact.FullName + ' - ' + element.Contact.Id;
      });

      if (!this.isOrgDetails && !this.inputFormGroup.get('AssignedToUserProfileId').value) {
        this.authService.getCurrentProfile().subscribe(data => {
          this.inputFormGroup.get('AssignedToUserProfileId').patchValue(data.Id);
          this.ref.detectChanges();
        });
      }
      this.ref.detectChanges();
    });

    if (!this.inputFormGroup.get('CreatedByName').value) {
      this.authService.getUserContext().then((data: UserContext) => {
        this.inputFormGroup.get('CreatedByName').setValue(data.User.FirstName + ' ' + data.User.LastName);
        this.ref.detectChanges();
      });
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, organizationCollaborators: IOrganizationCollaborators): FormGroup<IOrganizationCollaborators> {
    return formGroupSetup.hashModel.getFormGroup<IOrganizationCollaborators>(formGroupSetup.toUseHashCode, 'IOrganizationCollaborators', organizationCollaborators, 0, () =>
      formGroupSetup.formBuilder.group<IOrganizationCollaborators>({
        AssignedToUserProfileId: [organizationCollaborators.AssignedToUserProfileId],
        CreatedByName: [organizationCollaborators.CreatedByName],
        SourceId: [organizationCollaborators.SourceId],
        EditorUserProfileName: [organizationCollaborators.EditorUserProfileName]
      })
    );
  }

  public static formGroupToPartial(formGroupCollaborators: FormGroup<IOrganizationCollaborators>): Partial<IOrganization> {
    const formGroupDetails: FormGroup<IOrganizationCollaborators> = formGroupCollaborators;
    const collaborators: IOrganizationCollaborators = formGroupDetails.value;
    return {
      AssignedToUserProfileId: collaborators.AssignedToUserProfileId,
      CreatedByName: collaborators.CreatedByName
    };
  }

}
