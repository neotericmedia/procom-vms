import { Component, OnInit } from '@angular/core';
import { CodeValueService, CommonService, PhxConstants, ValidationExtensions } from '../../common';
import { IContactWizard, IFormGroupSetup, IProfileDetails } from '../../contact/state/profile.interface';
import { CustomFieldErrorType } from '../../common/model';
import { HashModel } from '../../common/utility/hash-model';
import { CustomFieldService } from '../../common/services/custom-field.service';
import { ContactService } from '../../contact/shared/contact.service';
import { NavigationService } from '../../common/services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { filter } from 'lodash';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-contact-add-new',
  templateUrl: './contact-add-new.component.html',
  styleUrls: ['./contact-add-new.component.less']
})
export class ContactAddNewComponent extends BaseComponentOnDestroy implements OnInit {
  workerTypesList: Array<any>;
  organizationList: Array<any>;
  codeValueGroups: any;
  Continue: boolean = false;
  Submitted: boolean = false;
  message: string = '';
  contactForm: FormGroup<IContactWizard>;
  contactNew: IContactWizard;
  formGroupSetup: IFormGroupSetup;
  checkingDuplicateEmails: boolean = false;
  profilesArray: Array<any>;
  showContinue: boolean = true;
  existingProfile: any;
  NewProfile = {} as IProfileDetails;
  newOrganizationId: number = 0;
  profileType: number;
  organizationId?: number;

  html: {
    phxConstants: any;
  } = {
      phxConstants: PhxConstants
    };

  constructor(
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private formbuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private contactService: ContactService,
    private navigationService: NavigationService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super();
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.getWorkerTypes();
    this.getOrganization();
    // this.formInitialize();
    this.activatedRoute.data
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.profileType = response.profileType;
      });

    this.activatedRoute.params
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        const orgId = +response.organizationId;
        this.organizationId = !isNaN(orgId) ? orgId : null;
      });
  }

  ngOnInit() {
    this.formInitialize();
    this.contactForm.controls['PrimaryEmail'].valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.isDestroyed$)
      )
      .subscribe((value) => {
        const primaryEmail = this.contactForm.controls['PrimaryEmail'];
        if (primaryEmail.valid) {
          this.changeAction();
        }
      });
    if (this.profileType === PhxConstants.NewProfile.WizardWorkerProfile) {
      this.contactForm.controls.OrganizationId.disable();
      this.navigationService.setTitle('new-worker-contact');
    } else if (this.profileType === PhxConstants.NewProfile.WizardOrganizationalProfile) {
      this.contactForm.controls.ProfileTypeId.disable();
      this.NewProfile.profileTypeId = PhxConstants.UserProfileGroups.UserProfileGroupOrganization;
      this.navigationService.setTitle('new-organizational-contact');
    } else if (this.profileType === PhxConstants.NewProfile.WizardInternalProfile) {
      this.contactForm.controls.ProfileTypeId.disable();
      this.contactForm.controls.OrganizationId.disable();
      this.navigationService.setTitle('new-internal-contact');
      this.NewProfile.profileTypeId = PhxConstants.UserProfileGroups.UserProfileGroupInternal;
      this.NewProfile.profileType = this.codeValueService.getCodeValue(this.NewProfile.profileTypeId, this.codeValueGroups.ProfileType).code.toLowerCase();
    } else {
      this.navigationService.setTitle('contact-new');
    }
  }

  getWorkerTypes() {
    this.workerTypesList = this.codeValueService.getRelatedCodeValues(this.codeValueGroups.ProfileType, PhxConstants.UserProfileGroups.UserProfileGroupWorker, this.codeValueGroups.ProfileGroup);
  }

  getOrganization() {
    const odataquery = '$select=Id,DisplayName&$filter=(IsOrganizationIndependentContractorRole eq true) or (IsOrganizationClientRole eq true) or (IsOrganizationSubVendorRole eq true) or (IsOrganizationLimitedLiabilityCompanyRole eq true)';
    this.contactService.getListOriginalOrganizations(odataquery)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.organizationList = response.Items;
        this.organizationList.forEach(element => {
          element.Text = element.DisplayName;
          element.DisplayName = element.DisplayName + ' - ' + element.Id;
        });
      });
  }

  changeAction() {
    this.Continue = false;
    this.showContinue = true;
    this.message = '';
    if (
      (this.profileType !== PhxConstants.NewProfile.WizardOrganizationalProfile && this.contactForm.valid) ||
      (this.contactForm.controls.PrimaryEmail.valid && (this.profileType === PhxConstants.NewProfile.WizardWorkerProfile || this.profileType === PhxConstants.NewProfile.WizardOrganizationalProfile))
    ) {
      this.checkingDuplicateEmails = true;
      this.contactService.searchAllWorkerProfile(this.contactForm.value.PrimaryEmail)
        .takeUntil(this.isDestroyed$)
        .subscribe((result: any) => {
          this.profilesArray = result.Items;
          this.checkingDuplicateEmails = false;
          if (this.profilesArray.length > 0) {
            this.profilesArray.forEach(obj => {
              const profileType = this.codeValueService.getCodeValue(obj.ProfileTypeId, this.codeValueGroups.ProfileType);
              obj.profileType = profileType.code;
              obj.profileTypeText = profileType.text;
              obj.profileStatus = this.codeValueService.getCodeValue(obj.ProfileStatusId, this.codeValueGroups.ProfileStatus).text;
            });
            this.NewProfile.profiles = this.profilesArray;
            this.message = 'We have found the following profiles with this email address. Remember, you can only add or edit profiles if there are no changes pending. Select to review, or add details to an existing contact.';
          } else {
            this.message = 'We havent found any profile with this email address.';
          }
        },
          err => {
            this.message = 'We havent found any profile with this email address.';
          });
    }
    this.NewProfile.primaryEmail = this.contactForm.value.PrimaryEmail;
  }

  formInitialize() {
    this.NewProfile = {
      primaryEmail: null,
      organization: null,
      organizationId: null,
      contactId: null,
      profiles: null,
      profileTypeId: null,
      profileType: null
    };
    this.contactNew = {
      PrimaryEmail: null,
      ProfileTypeId: null,
      OrganizationId: this.organizationId || null
    };
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formbuilder, customFieldService: this.customFieldService };
    this.contactForm = this.formBuilderGroupSetup(this.formGroupSetup, this.contactNew);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, ContactForm: IContactWizard): FormGroup<IContactWizard> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IContactWizard>(formGroupSetup.toUseHashCode, 'POLineNew', ContactForm, 0, () =>
      formGroupSetup.formBuilder.group<IContactWizard>({
        PrimaryEmail: [
          ContactForm.PrimaryEmail,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PrimaryEmail', CustomFieldErrorType.required)),
            ValidationExtensions.email(formGroupSetup.customFieldService.formatErrorMessage('PrimaryEmail', CustomFieldErrorType.required))
          ]
        ],
        ProfileTypeId: [
          ContactForm.ProfileTypeId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ProfileTypeId', CustomFieldErrorType.required))
          ]
        ],
        OrganizationId: [
          ContactForm.OrganizationId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationId', CustomFieldErrorType.required))
          ]
        ]
      })
    );
    return formGroup;
  }

  continueAction() {
    if (!this.profilesArray || this.profilesArray.length === 0) {
      if (this.Submitted === false) {
        this.Submitted = true;
        this.createAction();
      }
    } else {
      this.Continue = true;
      this.showContinue = false;
    }
  }

  createAction() {
    this.contactService
      .contactAddProfile({
        ContactId: 0,
        ProfileTypeId: this.NewProfile.profileTypeId,
        PrimaryEmail: this.NewProfile.primaryEmail,
        OrganizationId: this.organizationId ? this.organizationId : this.NewProfile.organizationId
      })
      .takeUntil(this.isDestroyed$)
      .subscribe(
        success => {
          const profileType = this.codeValueService.getCodeValue(this.NewProfile.profileTypeId, this.codeValueGroups.ProfileType).code.toLowerCase();
          const navigatePath = `/next/contact/${success.EntityIdRedirect}/profile/${profileType}/${success.EntityId}`;
          this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
            console.error(`app-People: error navigation`, err);
          });
        },
        () => {
          this.commonService.logError('Error while redirecting.');
        }
      );
  }

  canAddProfile(profileTypeId, profileList) {
    switch (profileTypeId) {
      case PhxConstants.UserProfileType.Internal:
      case PhxConstants.UserProfileType.WorkerTemp:
      case PhxConstants.UserProfileType.WorkerCanadianSp:
      case PhxConstants.UserProfileType.WorkerUnitedStatesW2:
        return !this.checkProfileTypeExists(profileTypeId, profileList);
      default:
        return true;
    }
  }

  checkProfileTypeExists(profileTypeId, profileList) {
    return (
      filter(profileList, function (item) {
        return item === profileTypeId;
      }).length > 0
    );
  }

  openProfile(profile) {
    if (this.profileType === PhxConstants.NewProfile.WizardWorkerProfile || this.profileType === PhxConstants.NewProfile.WizardInternalProfile) {
      this.existingProfile = this.profilesArray.find(item => item.ProfileTypeId === this.NewProfile.profileTypeId && item.Contact.Id === profile.Contact.Id);
    } else {
      this.existingProfile = this.profilesArray.find(item => item.ProfileTypeId === this.NewProfile.profileTypeId && item.Contact.Id === profile.Contact.Id && item.OrganizationId === this.NewProfile.organizationId);
      if (!this.existingProfile) {
        this.newOrganizationId = this.contactForm.value.OrganizationId;
      }
    }

    if (this.existingProfile) {
      this.goToProfile(this.existingProfile);
    } else if (profile.Contact.UserStatusId === PhxConstants.ContactStatus.Active && this.canAddProfile(this.NewProfile.profileTypeId, profile.ContactProfileTypes)) {
      const profileType = this.codeValueService.getCodeValue(this.NewProfile.profileTypeId, this.codeValueGroups.ProfileType).code.toLowerCase();
      this.contactService
        .contactAddProfile({
          EntityIds: [profile.ContactId],
          ProfileTypeId: this.NewProfile.profileTypeId,
          PrimaryEmail: profile.PrimaryEmail,
          OrganizationId: this.newOrganizationId
        })
        .takeUntil(this.isDestroyed$)
        .subscribe(
          success => {
            const navigatePath = `/next/contact/${success.EntityIdRedirect}/profile/${profileType}/${success.EntityId}`;
            this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
              console.error(`app-People: error navigation`, err);
            });
          },
          () => {
            this.commonService.logError('Error while redirecting.');
          }
        );
    } else {
      this.goToProfile(profile);
    }
  }

  goToProfile(profile) {
    const navigatePath = `/next/contact/${profile.ContactId}/profile/${profile.profileType}/${profile.Id}`;
    this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
      console.error(`app-People: error navigation`, err);
    });
  }

  workerTypeChanged(event) {
    this.NewProfile.profileTypeId = event.value;
    this.NewProfile.profileType = this.codeValueService.getCodeValue(event.value, this.codeValueGroups.ProfileType).code.toLowerCase();
  }

  organizationChanged(event) {
    this.NewProfile.organizationId = event.value;
    this.NewProfile.profileType = this.codeValueService.getCodeValue(this.NewProfile.profileTypeId, this.codeValueGroups.ProfileType).code.toLowerCase();
  }
}
