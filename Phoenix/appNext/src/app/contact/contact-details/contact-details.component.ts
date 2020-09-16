import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PhxFormControlLayoutType, CodeValue, CustomFieldErrorType } from '../../common/model';
import { IFormGroupSetup, ITabContactDetail, IProfile, IContact } from '../state/profile.interface';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { ContactService } from '../shared/contact.service';
import { ValidationExtensions } from '../../common';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ProfileObservableService } from '../state/profile.observable.service';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactDetailsComponent extends ContactBaseComponentPresentational<ITabContactDetail> implements OnInit {
  layoutType: any;
  listTitles: Array<CodeValue> = [];
  listCultureOptions: Array<CodeValue> = [];
  listAssignedTo: Array<any> = [];
  loginName: string;
  profile: IContact;
  currentProfile: IProfile;
  isPreferredLanguageEditable: boolean;

  constructor(private authService: AuthService, private contactService: ContactService, private changeRef: ChangeDetectorRef, private profileObservableService: ProfileObservableService) {
    super('ContactDetailsComponent');
    this.getCodeValuelistsStatic();
    this.layoutType = PhxFormControlLayoutType;
  }

  ngOnInit() {
    this.contactService.getListUserProfileInternal()
    .takeUntil(this.isDestroyed$)
    .subscribe((response: any) => {
      this.listAssignedTo = response.Items;
      this.listAssignedTo.forEach(element => {
        element.DisplayValue = element.Contact.FullName + ' - ' + element.Contact.Id;
      });
      this.changeRef.detectChanges();
    });

    if (this.inputFormGroup && this.inputFormGroup.controls.LoginUserId.value) {
      this.contactService.getLoginInfo(this.inputFormGroup.controls.LoginUserId.value)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        response.UserName = response.UserName.replace(/\"/g, '');
        this.loginName = response.UserName;
      });
    }

    this.profileObservableService.profileOnRouteChange$(this, false)
    .takeUntil(this.isDestroyed$)
    .subscribe((response: IProfile) => {
      if (response) {
        this.currentProfile = response;
        this.profile = response.Contact;
        this.isPreferredLanguageEditable = this.profile.LoginUserId === null && !this.hideActions;
      }
    });
  }

  private get hideActions() {
    return (
      this.currentProfile &&
      this.currentProfile.Id > 0 &&
      this.currentProfile.ProfileTypeId === this.phxConstants.UserProfileType.Internal &&
      !this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileEditTypeInternal)
    );
  }

  getCodeValuelistsStatic() {
    this.listTitles = this.codeValueService.getCodeValues(this.codeValueGroups.PersonTitle, true);
    this.listCultureOptions = this.codeValueService.getCodeValues(this.codeValueGroups.Culture, true);
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<ITabContactDetail> = null;

    switch (obj.name) {
      case 'FirstName':
        {
          if (this.profile.FirstName === this.profile.PreferredFirstName) {
            value = {
              FirstName: obj.val,
              PreferredFirstName: obj.val
            };
          }
        }
        break;
      case 'LastName':
        {
          if (this.profile.LastName === this.profile.PreferredLastName) {
            value = {
              LastName: obj.val,
              PreferredLastName: obj.val
            };
          }
        }
        break;
      case 'PersonTitleId':
        {
          if (this.profile.PersonTitleId === this.profile.PreferredPersonTitleId) {
            value = {
              PersonTitleId: obj.val,
              PreferredPersonTitleId: obj.val
            };
          }
        }
        break;
      default:
        {
          value = {
            [obj.name]: obj.val
          };
        }
        break;
    }

    if (value) {
      this.patchValue(this.inputFormGroup, value);
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, contact: ITabContactDetail): FormGroup<ITabContactDetail> {
    const formGroup = formGroupSetup.formBuilder.group<ITabContactDetail>({
      PersonTitleId: [contact.PersonTitleId],
      PreferredPersonTitleId: [contact.PreferredPersonTitleId],
      FirstName: [contact.FirstName, [ValidationExtensions.maxLength(32), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('FirstName', CustomFieldErrorType.required))]],
      PreferredFirstName: [contact.PreferredFirstName, [ValidationExtensions.maxLength(32), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PreferredFirstName', CustomFieldErrorType.required))]],
      LastName: [contact.LastName, [ValidationExtensions.maxLength(32), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('LastName', CustomFieldErrorType.required))]],
      PreferredLastName: [contact.PreferredLastName, [ValidationExtensions.maxLength(32), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PreferredLastName', CustomFieldErrorType.required))]],
      CultureId: [contact.CultureId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CultureId', CustomFieldErrorType.required))]],
      AssignedToUserProfileId: [contact.AssignedToUserProfileId],
      CreatedByName: [contact.CreatedByName],
      LoginUserId: [contact.LoginUserId]
    });
    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<ITabContactDetail>): IProfile {
    const detail = formGroup.value;
    contact.Contact.PersonTitleId = detail.PersonTitleId;
    contact.Contact.PreferredPersonTitleId = detail.PreferredPersonTitleId;
    contact.Contact.FirstName = detail.FirstName;
    contact.Contact.PreferredFirstName = detail.PreferredFirstName;
    contact.Contact.LastName = detail.LastName;
    contact.Contact.PreferredLastName = detail.PreferredLastName;
    contact.Contact.CultureId = detail.CultureId;
    contact.Contact.AssignedToUserProfileId = detail.AssignedToUserProfileId;
    contact.Contact.CreatedByName = detail.CreatedByName;
    return contact;
  }
}
