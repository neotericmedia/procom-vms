import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { CodeValue, CustomFieldErrorType, AccessAction } from '../../common/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ValidationExtensions, CommonService } from '../../common';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IFormGroupOnNew, IFormGroupSetup, IProfile, IUserProfileFunctionalRole } from '../state';
import { CodeValueService } from '../../common/services/code-value.service';

@Component({
  selector: 'app-contact-userrole',
  templateUrl: './contact-userrole.component.html',
  styleUrls: ['./contact-userrole.component.less']
})
export class ContactUserroleComponent extends ContactBaseComponentPresentational<IUserProfileFunctionalRole> implements OnInit {

  @Input() addressIndex: number;
  @Input() isQuickAdd: boolean;
  @Input() selectedFunctionalRoles: Array<any>;
 // @Input() profileTypeId: number;

  profileTypeId: number = 2;
  profileGroupId: number;

  mask: any;

  html: {
    codeValueGroups: any;
    codeValueLists: {
      listFunctionalRole: Array<any>;
    };
    commonLists: {};
  } = {
    codeValueGroups: null,
    codeValueLists: {
      listFunctionalRole: []
    },
    commonLists: {}
  };


  constructor(
     codeValueService: CodeValueService,
     commonService: CommonService
  ) {
    super('ContactUserroleComponent');
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.getCodeValuelistsStatic();
   }

   ngOnInit() {
     // this.selectedFunctionalRoles;
   }

   businessRules(obj: IFormGroupValue): void {
    let value: Partial<IUserProfileFunctionalRole> = null;
    switch (obj.name) {
      default:
        {
          value = {
            [obj.name]: obj.val
          };
        }
        break;
    }
    this.patchValue(this.inputFormGroup, value);
  }

  getCodeValuelistsStatic() {
    this.profileGroupId = this.codeValueService.getParentId(this.html.codeValueGroups.ProfileType, this.profileTypeId);
    // this.html.codeValueLists.listFunctionalRole = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.FunctionalRole, true);
    this.html.codeValueLists.listFunctionalRole = this.codeValueService.getRelatedCodeValues(this.html.codeValueGroups.FunctionalRole, this.profileGroupId, this.html.codeValueGroups.ProfileGroup);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, functionalRoles: Array<IUserProfileFunctionalRole>): FormArray<IUserProfileFunctionalRole> {
    const ex = formGroupSetup.formBuilder.array<IUserProfileFunctionalRole>(
      functionalRoles.map((FunctionalRole: IUserProfileFunctionalRole, index) =>
        formGroupSetup.hashModel.getFormGroup<IUserProfileFunctionalRole>(formGroupSetup.toUseHashCode, 'IUserProfileFunctionalRole', FunctionalRole, index, () =>
          formGroupSetup.formBuilder.group<IUserProfileFunctionalRole>({
          Id: [FunctionalRole.Id],
          SourceId: [FunctionalRole.SourceId],
          UserProfileId: [FunctionalRole.UserProfileId],
          FunctionalRoleId: [FunctionalRole.FunctionalRoleId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('FunctionalRoleId', CustomFieldErrorType.required))]],
          IsDraft: [FunctionalRole.IsDraft],
          CreatedByProfileId: [FunctionalRole.CreatedByProfileId],
          CreatedDatetime: [FunctionalRole.CreatedDatetime],
          LastModifiedByProfileId: [FunctionalRole.LastModifiedByProfileId],
          LastModifiedDatetime: [FunctionalRole.LastModifiedDatetime]
          })
        )
      )
    );
    return ex;
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, functionalRoles: Array<IUserProfileFunctionalRole>): FormGroup<IUserProfileFunctionalRole> {
    return formGroupOnNew.formBuilder.group<IUserProfileFunctionalRole>({
      Id: [0],
      FunctionalRoleId: [
        null,
        [
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('FunctionalRoleId', CustomFieldErrorType.required))
        ]
      ],
      CreatedByProfileId: [0],
      CreatedDatetime: [null],
      IsDraft: [true],
      LastModifiedByProfileId: [0],
      LastModifiedDatetime: [null],
      SourceId: [0],
      UserProfileId: [0],
    });
  }

  public get parentArray() {
    return <FormArray<IUserProfileFunctionalRole>>this.inputFormGroup.parent;
  }

  onClickDeleteFunctionalRole() {
    const formArrayPhonenumbers: FormArray<IUserProfileFunctionalRole> = <FormArray<IUserProfileFunctionalRole>>this.inputFormGroup.parent;
    formArrayPhonenumbers.removeAt(this.addressIndex);
    this.outputEvent.emit();
  }

  functionRoleChanged(event) {
  }


}
