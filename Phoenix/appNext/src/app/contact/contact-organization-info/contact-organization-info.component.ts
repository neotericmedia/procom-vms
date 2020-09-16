import { Component, OnInit, Input } from '@angular/core';
import { IProfile, IFormGroupSetup, IOrganizationInfo, IReadOnlyStorage } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ValidationExtensions, PhxConstants } from '../../common';
import { ContactService } from '../../contact/shared/contact.service';
import { reject, forEach } from 'lodash';
import { ControlsConfig } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldErrorType } from '../../common/model';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { ProfileService } from '../shared/profile.service';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-organization-info',
  templateUrl: './contact-organization-info.component.html',
  styleUrls: ['./contact-organization-info.component.less']
})
export class ContactOrganizationInfoComponent extends ContactBaseComponentPresentational<IOrganizationInfo> implements OnInit {

  public businessRules(obj: IFormGroupValue): void {

  }

  @Input() isMinimalistic: boolean = false;

  @Input() profileDetails: IProfile;
  @Input() readOnlyStorage: IReadOnlyStorage;

  internalOrganizationDefinition1List: Array<any>;
  organizationsList: Array<any>;
  organizationProfilesList: Array<any>;
  codeValueGroups: any;
  dataParams: string = null;
  currentProfiles: any;
  NewOrg: IOrganizationInfo;
  formGroupSetup: IFormGroupSetup;
  html: {
    phxConstants: typeof PhxConstants;
    orgUserProfiles: any[];
  } = {
      orgUserProfiles: [],
      phxConstants: PhxConstants,
    };

  constructor(
    private contactService: ContactService,
    private profileService: ProfileService
  ) {
    super('ContactOrganizationInfoComponent');
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.getCodeValuelistsStatic();
  }

  ngOnInit() {

    this.getCurrentProfiles();
    this.getOrganizationList();
    if (this.profileDetails) {
      this.getOrganizationProfileList(this.profileDetails);
      if (this.profileDetails.OrganizationId) {
        this.getOrgReps(this.profileDetails.OrganizationId);
      }
    }
  }

  getCodeValuelistsStatic() {
    this.internalOrganizationDefinition1List = this.codeValueService.getCodeValues(this.codeValueGroups.InternalOrganizationDefinition1, true);
    this.internalOrganizationDefinition1List.forEach(element => {
      element.value = element.text + ' - ' + element.code;
    });
  }

  getOrganizationList() {
    let oDataQuery: string;
    let oDataQueryFilterPart: string;

    if (this.profileDetails && this.profileDetails.IsDraft) {
      if (this.profileDetails.ProfileTypeId === PhxConstants.UserProfileType.Organizational) {
        this.contactService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRole(this.dataParams)
          .takeUntil(this.isDestroyed$)
          .subscribe((Org: any) => {
            this.organizationsList = Org.Items;
            if (!this.currentProfiles) {
              return;
            }

            this.currentProfiles.forEach(item => {
              if (item === PhxConstants.UserProfileType.Organizational && item.OrganizationId) {
                this.organizationsList = reject(this.organizationsList, function (o) { return item.OrganizationId === o.Id; });
                this.organizationsList.forEach(element => {
                  element.DisplayName = element.DisplayName + ' - ' + element.Id;
                });
              }
            });
          });
      }

      if (this.profileDetails.ProfileTypeId === PhxConstants.UserProfileType.Internal) {
        this.contactService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole(this.dataParams)
          .takeUntil(this.isDestroyed$)
          .subscribe((Org: any) => {
            this.organizationsList = Org.Items;
            this.organizationsList.forEach(element => {
              element.DisplayName = element.DisplayName + ' - ' + element.Id;
            });
          });
      }

      if (this.profileDetails.ProfileTypeId === PhxConstants.UserProfileType.WorkerUnitedStatesLLC
        || this.profileDetails.ProfileTypeId === PhxConstants.UserProfileType.WorkerSubVendor
        || this.profileDetails.ProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianInc) {

        switch(this.profileDetails.ProfileTypeId) {
          case PhxConstants.UserProfileType.WorkerUnitedStatesLLC: {
            oDataQueryFilterPart = 'IsOrganizationLimitedLiabilityCompanyRole';
            break;
          }
          case PhxConstants.UserProfileType.WorkerSubVendor: {
            oDataQueryFilterPart = 'IsOrganizationSubVendorRole';
            break;
          }
          case PhxConstants.UserProfileType.WorkerCanadianInc: {
            oDataQueryFilterPart = 'IsOrganizationIndependentContractorRole';
            break;
          }
        }

        oDataQuery = oreq
          .request()
          .withSelect(['Id', 'DisplayName'])
          .withFilter(oreq.filter(oDataQueryFilterPart).eq(true))
          .withOrderby(['DisplayName'])
          .url();

        this.contactService.getListOriginalOrganizations(oDataQuery)
          .takeUntil(this.isDestroyed$)
          .subscribe((Org: any) => {
            this.organizationsList = Org.Items;
            this.organizationsList.forEach(element => {
              element.DisplayName = element.DisplayName + ' - ' + element.Id;
            });
          });
      }
    }
  }

  getCurrentProfiles() {
    if (this.profileDetails && this.profileDetails.Contact) {
      this.contactService.getContactProfiles(this.profileDetails.Contact.Id)
      .takeUntil(this.isDestroyed$)
      .subscribe((profile: any) => {
        this.currentProfiles = profile.Items;
      });
    }
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  getOrganizationProfileList(profile: IProfile) {

    if (profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerSubVendor) {
      if (this.profileDetails.OrganizationId) {
        this.contactService.searchProfiles2(this.profileDetails.OrganizationId, 1)
        .takeUntil(this.isDestroyed$)
        .subscribe((profiles: any) => {
          this.organizationProfilesList = reject(profiles.Items, function (p) { return p.Id === profile.Id; });
          this.organizationProfilesList.forEach(element => {
            element.Contact.FullName = element.Contact.FullName + ' - ' + element.Contact.Id;
          });
          this.contactService.removeInactiveProfile(this.organizationProfilesList, this.profileDetails.ReportsToProfileId);
        });
      }
    } else if (profile.ProfileTypeId === PhxConstants.UserProfileType.Organizational) {
      this.contactService.searchProfiles(this.profileDetails.OrganizationId)
      .takeUntil(this.isDestroyed$)
      .subscribe((profiles: any) => {
        this.organizationProfilesList = reject(profiles.Items, function (p) { return p.Id === profile.Id; });
        this.organizationProfilesList.forEach(element => {
          element.Contact.FullName = element.Contact.FullName + ' - ' + element.Contact.Id;
        });
        this.contactService.removeInactiveProfile(this.organizationProfilesList, this.profileDetails.ReportsToProfileId);
      });
    }
  }

  organizationChanged(event, profile) {
    if (profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerSubVendor) {
      this.contactService.searchProfiles2(event.value, 1)
      .takeUntil(this.isDestroyed$)
      .subscribe((profiles: any) => {
        this.organizationProfilesList = reject(profiles.Items, function (p) { return p.Id === profile.Id; });
        this.contactService.removeInactiveProfile(this.organizationProfilesList, this.profileDetails.ReportsToProfileId);
      });
    } else if (profile.ProfileTypeId === PhxConstants.UserProfileType.Organizational) {
      this.contactService.searchProfiles(event.value)
      .takeUntil(this.isDestroyed$)
      .subscribe((profiles: any) => {
        this.organizationProfilesList = reject(profiles.Items, function (p) { return p.Id === profile.Id; });
        this.contactService.removeInactiveProfile(this.organizationProfilesList, this.profileDetails.ReportsToProfileId);
      });
    }
  }

  getOrgReps(orgid) {

    if (!orgid || orgid === 0 || this.profileDetails.ProfileTypeId !== this.phxConstants.UserProfileType.WorkerSubVendor) { return; }
    const odataquery = '$filter=ProfileTypeId eq ' + this.phxConstants.UserProfileType.Organizational;

    this.profileService.getContactsForOrganization(orgid, odataquery)
      .then((subvendorOrgs: any) => {
        this.html.orgUserProfiles = [];
        forEach(subvendorOrgs.Items, (obj) => {
          obj.FullName = obj.Contact.FullName;
          this.html.orgUserProfiles.push(obj);
        });

        // if (isRemoveInactiveProfile) {
        //   ProfileApiService.removeInactiveProfile(self.orgUserProfiles, self.currentProfile.UserProfileIdOrgRep);
        // }
      });
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile): any {
    const formGroup: ControlsConfig<IOrganizationInfo> = {
      OrganizationId: [
        model.OrganizationId, [Validators.required]
      ],
      InternalOrganizationDefinition1Id: [
        model.InternalOrganizationDefinition1Id, model.ProfileTypeId === PhxConstants.UserProfileType.Internal ? [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('InternalOrganizationDefinition1Id', CustomFieldErrorType.required))
        ] : []
      ],
      Department: [
        model.Department
      ],
      ReportsToProfileId: [
        model.ReportsToProfileId
      ],
      UserProfileIdOrgRep: [model.UserProfileIdOrgRep, [

      ]]
    };

    return formGroup;
  }

}
