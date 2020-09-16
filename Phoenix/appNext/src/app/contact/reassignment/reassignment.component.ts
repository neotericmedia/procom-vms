import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, ValidationErrors } from '@angular/forms';
import { PhxFormControlLayoutType } from './../../common/model/phx-form-control-layout-type';
import { PhxConstants } from './../../common/model/phx-constants';

import { ContactService } from '../shared/contact.service';
import {
  GroupedWOsByClient, OrganizationCollaborator, ContactCollaborator, InternalUserProfile, Reassign, InternalUserOffboardingFormModel,
  BranchManaged, WorkOrderVersionReassign, OrganizationReassign, UserProfileReassign, BranchReassign, AssignType, WorkOrdersByBranch, ReassignRecruiter, WorkOrderVersionRecruiterReassign, RecruiterProfile, ProfileReassignFrom
} from '../shared/model';
import * as _ from 'lodash';
import { Observable } from '../../../../node_modules/rxjs';
import { CommonService, NavigationService, DialogService, LoadingSpinnerService } from '../../common';
import { AuthService } from '../../common/services/auth.service';
import { DialogResultType } from '../../common/model';
import { FunctionalRole } from '../shared/model';
import { ProfileService } from '../shared/profile.service';

const ConstAssignType = PhxConstants.ReassignmentType;
const ConstRoleType = PhxConstants.FunctionalRole;
const Command = PhxConstants.CommandNamesSupportedByUi.BaseContactsCommand;
const EntityType = PhxConstants.EntityType;

@Component({
  selector: 'app-reassignment',
  templateUrl: './reassignment.component.html',
  styleUrls: ['./reassignment.component.less']
})
export class ReassignmentComponent implements OnInit, OnDestroy {

  isAlive: boolean = true;

  profileReassignFrom: ProfileReassignFrom = new ProfileReassignFrom();
  profileId: number;
  contactId: number;

  /**form.value is of Type InternalUserOffboardingFormModel */
  form: FormGroup;
  layoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.InputOnly;

  branchManagedList: BranchManaged[];
  internalUserProfileList: InternalUserProfile[] = [];
  totalWOs: number = 0;
  totalWOsByBranch: number = 0;
  isWOsByBranchExpanded: boolean = false;
  isWOsListExpanded: boolean = false;
  isOrgsListExpanded: boolean = false;
  isProfilesListExpanded: boolean = false;
  isCurrentProfileUnderReassignRole: boolean = false;
  model: Reassign = new Reassign();

  isUserInitiatedEvent: boolean = true;
  assignTypes: AssignType[] = [];

  workOrdersByBranch: WorkOrdersByBranch[] = [];
  workorders: GroupedWOsByClient[] = [];
  organizations: OrganizationCollaborator[] = [];
  profiles: ContactCollaborator[] = [];
  recruiterUserProfiles: RecruiterProfile[] = [];

  // constant for html
  ConstAssignType = PhxConstants.ReassignmentType;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private contactService: ContactService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private authService: AuthService,
    protected dialogService: DialogService,
    private router: Router,
    private profileService: ProfileService,
    private spinner: LoadingSpinnerService
  ) {
    this.contactId = +this.activatedRoute.snapshot.params['contactId'];
    this.profileId = +this.activatedRoute.snapshot.params['sourceProfileId'];
    this.navigationService.setTitle('reassign');
  }

  ngOnInit() {
    this.checkCurrentProfileUnderReassignRole();
    this.prepareForm();
  }

  getRolesNames(roles) {
    if (roles && roles.length > 0) {
      return roles.map(role => role.Name).join(', ');
    } else {
      return '';
    }
  }

  checkCurrentProfileUnderReassignRole() {
    this.authService.getCurrentProfile()
      .takeWhile(() => this.isAlive)
      .subscribe(userProfile => {
        const rolesIndex = userProfile.FunctionalRoles.findIndex(item =>
          item.FunctionalRoleId === ConstRoleType.BackOffice
          || item.FunctionalRoleId === ConstRoleType.Finance
          || item.FunctionalRoleId === ConstRoleType.SystemAdministrator
          || item.FunctionalRoleId === ConstRoleType.Controller
          || item.FunctionalRoleId === ConstRoleType.BackOfficeARAP
          || item.FunctionalRoleId === ConstRoleType.AccountsReceivable
        );
        this.isCurrentProfileUnderReassignRole = rolesIndex !== -1;
      });
  }

  prepareForm() {
    const loadWOs$ = this.loadWOs();
    const loadOrgs$ = this.loadOrgs();
    const loadProfiles$ = this.loadProfiles();
    const loadInternalProfiles$ = this.loadInternalProfile();
    const branchManaged$ = this.contactService.getBranchByManager(this.profileId);
    const wosUnderRecruiterRole$ = this.loadWOsByRecruiter();
    const profilesOfRecruiter$ = this.loadProfilesOfRecruiter();
    const profileReassignFrom$ = this.contactService.getProfileReassignFrom(this.profileId);
    Observable.forkJoin([loadWOs$, loadOrgs$, loadProfiles$, loadInternalProfiles$, branchManaged$, wosUnderRecruiterRole$, profilesOfRecruiter$, profileReassignFrom$])
      .takeWhile(() => this.isAlive).subscribe(results => {
        this.workorders = results[0];
        this.organizations = results[1];
        this.profiles = results[2];
        this.internalUserProfileList = results[3];
        let index = this.internalUserProfileList.findIndex(x => x.ProfileId === this.profileId); // removing the currently assigned user from the array, to prevent unnecessary update.
        if (index > -1) {
          this.internalUserProfileList.splice(index, 1);
        }
        this.branchManagedList = results[4];
        this.workOrdersByBranch = results[5];
        this.recruiterUserProfiles = results[6];
        index = this.recruiterUserProfiles.findIndex(x => x.ProfileId === this.profileId); // removing the currently assigned user from the array, to prevent unnecessary update.
        if (index > -1) {
          this.recruiterUserProfiles.splice(index, 1);
        }
        this.profileReassignFrom = results[7];
        // The order matters
        this.loadAssignTypes();
        this.buildForm();

      });
  }

  isBranchManager() {
    return this.branchManagedList.length > 0;
  }

  isRecruiter() {
    if (this.profileReassignFrom.UserProfileFunctionalRoles) {
      return this.profileReassignFrom.UserProfileFunctionalRoles.some(x => x.FunctionalRoleId === ConstRoleType.Recruiter);
    } else {
      return false;
    }
  }

  hasItemsToReassign(assignType) {
    if (assignType === ConstAssignType.Recruiter) {
      return this.workOrdersByBranch.length > 0;
    } else if (assignType === ConstAssignType.Collaborator) {
      return this.workorders.length > 0 || this.organizations.length > 0 || this.profiles.length > 0;
    } else {
      return false;
    }
  }

  isCollaborator() {
    return this.isBranchManager() || this.hasItemsToReassign(ConstAssignType.Collaborator);
  }

  getAssignTypeId() {
    return (this.form && this.form.value.AssignType) ? this.form.value.AssignType.Id : null;
  }

  loadAssignTypes() {
    if (this.isCollaborator()) {
      this.assignTypes.push({ Id: ConstAssignType.Collaborator, Description: 'Collaborator' });
    }
    if (this.isRecruiter() && this.hasItemsToReassign(ConstAssignType.Recruiter)) {
      this.assignTypes.push({ Id: ConstAssignType.Recruiter, Description: 'Recruiter' });
    }
  }

  buildForm() {
    const groupedWOsByClientList: GroupedWOsByClient[] = this.workorders;
    const organizationList: OrganizationCollaborator[] = this.organizations;
    const profileList: ContactCollaborator[] = this.profiles;

    this.form = this.formBuilder.group({
      AssignType: null,
      BranchManagerReassignedTo: null,
      ReassignAllItemsTo: null,
      ReassignAllWOsTo: null,
      AllWOsToRecruiterFormCtrl: null,
      WOsToRecruiterFormArray:
        this.formBuilder.array(
          this.workOrdersByBranch.map(
            (x: WorkOrdersByBranch) => this.formBuilder.group({
              WorkOrder: x,
              AssignedToUserProfileId: null
            })
          )
        ),

      GroupedWOsByClientList:
        this.formBuilder.array(
          groupedWOsByClientList.map(
            (x: GroupedWOsByClient) =>
              this.formBuilder.group({
                WOClient: x,
                AssignedToUserProfileId: null
              })
          )
        ),
      ReassignAllOrgsTo: null,
      OrganizationList:
        this.formBuilder.array(
          organizationList.map(
            (x: OrganizationCollaborator) => this.formBuilder.group({
              Organization: x,
              AssignedToUserProfileId: null
            })
          )
        ),
      ReassignAllProfilesTo: null,
      ProfileList:
        this.formBuilder.array(
          profileList.map(
            (x: ContactCollaborator) => this.formBuilder.group({
              Profile: x,
              AssignedToUserProfileId: null
            })
          )
        )
    }, { validator: Validators.compose([this.isFormValid]) });
    /* Workaround to prevent circular valuechange event triggering (Because of curent implimentation of dx-select-box,
      we are unable to distinguish between  valuechange by user action and databinding. This may be fixed in the future version of this control).
    https://www.devexpress.com/Support/Center/Question/Details/T618446/selectbox-selectionchanged-and-valuechanged-angular-5 */
    this.form.valueChanges.takeWhile(() => this.isAlive).debounceTime(100).subscribe(x => {
      this.isUserInitiatedEvent = true;
    });

    if (this.assignTypes.length > 0) {
      this.form.controls.AssignType.setValue(this.assignTypes[0]);
    }
  }

  loadWOs(): Observable<GroupedWOsByClient[]> {
    const groupedWOsByClientList: GroupedWOsByClient[] = [];

    return this.contactService.getWorkOrderVersionsAssociatedToCollaborator(this.profileId).map(wos => {
      const groupedWorkorderList = _.toArray(_.groupBy(wos, 'ClientOrganizationId'));
      for (const item of groupedWorkorderList) {
        const groupedWOsByClient = new GroupedWOsByClient();
        groupedWOsByClient.ClientDisplayName = item[0].ClientDisplayName;
        groupedWOsByClient.ClientOrganizationId = item[0].ClientOrganizationId;
        groupedWOsByClient.WorkorderCount = item.length;
        groupedWOsByClient.WOVExpenseApproverInfos = [];
        this.totalWOs += item.length;
        for (const wo of item) {
          const isExpenseApprover: boolean = wo.ExpenseApprovers.length > 0
            && wo.ExpenseApprovers.findIndex(x => x.UserProfileId === wo.AssignedToUserProfileId) !== -1
            ? true : false;
          const wOVExpenseApproverInfo = {
            WorkOrderVersionId: wo.WorkOrderVersionId,
            IsExpenseApprover: isExpenseApprover
          };
          groupedWOsByClient.WOVExpenseApproverInfos.push(wOVExpenseApproverInfo);
        }
        groupedWOsByClientList.push(groupedWOsByClient);
      }
      return groupedWOsByClientList.sort((a, b) => this.commonService.compareFnToSortObjects('ClientDisplayName', 'asc')(a, b));
    });
  }

  loadOrgs(): Observable<OrganizationCollaborator[]> {
    const organizationList: OrganizationCollaborator[] = [];
    return this.contactService.getOrganizationsByCollaborator(this.profileId)
      .map(orgs => {
        for (const org of orgs) {
          const organization = new OrganizationCollaborator();
          organization.Id = org.Id;
          organization.DisplayName = org.DisplayName;
          organizationList.push(organization);
        }
        return organizationList.sort((a, b) => this.commonService.compareFnToSortObjects('DisplayName', 'asc')(a, b));
      });
  }

  loadProfiles(): Observable<ContactCollaborator[]> {
    const profileList: ContactCollaborator[] = [];
    return this.contactService.getProfilesByCollaborator(this.profileId)
      .map(profiles => {
        for (const prof of profiles) {
          const profile = new ContactCollaborator();
          profile.Id = prof.Id;
          profile.FullName = prof.FullName;
          profileList.push(profile);
        }
        return profileList.sort((a, b) => this.commonService.compareFnToSortObjects('FullName', 'asc')(a, b));
      });
  }

  loadProfilesOfRecruiter(): Observable<RecruiterProfile[]> {
    return this.contactService.getActiveRecruiters().map((x: any[]) => {
      const profiles: RecruiterProfile[] = [];
      for (const item of x) {
        const profile = new RecruiterProfile();
        profile.ProfileId = item.ProfileId;
        profile.BranchId = item.BranchId;
        profile.FullName = item.FullName + ' - ' + item.ProfileId;
        profiles.push(profile);
      }
      return profiles.sort((a, b) => this.commonService.compareFnToSortObjects('FullName', 'asc')(a, b));
    });
  }

  loadInternalProfile(): Observable<InternalUserProfile[]> {
    return this.contactService.getActiveInternalUserProfileList().map((x: any[]) => {
      const internalUserProfileList: InternalUserProfile[] = [];
      for (const item of x) {
        const internalUserProfile = new InternalUserProfile();
        internalUserProfile.ProfileId = item.Id;
        internalUserProfile.ContactId = item.Contact.Id;
        internalUserProfile.FullName = item.Contact.FullName + ' - ' + item.Id;
        internalUserProfileList.push(internalUserProfile);
      }
      return internalUserProfileList.sort((a, b) => this.commonService.compareFnToSortObjects('FullName', 'asc')(a, b));
    });
  }

  loadWOsByRecruiter(): Observable<WorkOrdersByBranch[]> {
    return this.contactService.getWorkOrdersByRecruiter(this.profileId).map(wos => {
      const groupedWorkorderList = _.toArray(_.groupBy(wos, 'BranchId'));
      const groupedWOsByBranchList: WorkOrdersByBranch[] = groupedWorkorderList.map(item => {
        this.totalWOsByBranch += item.length;
        const groupedWOsByBranch: WorkOrdersByBranch = {
          BranchId: item[0].BranchId,
          BranchName: item[0].BranchName,
          WorkorderCount: item.length,
          WorkOrderVersionIdList: item.map(wo => wo.WorkOrderVersionId)
        };
        return groupedWOsByBranch;
      });
      return groupedWOsByBranchList.sort((a, b) => this.commonService.compareFnToSortObjects('BranchName', 'asc')(a, b));
    });
  }

  //#region phx-select-box valueChanged related functions
  onReassignAllItemsToChanged($event) {
    if (this.isUserInitiatedEvent) {
      this.isUserInitiatedEvent = false;
      const toBeAssignedUser: InternalUserProfile = $event.value;
      this.form.controls.ReassignAllWOsTo.setValue(toBeAssignedUser);
      this.reassignAllWOsTo(toBeAssignedUser);
      this.form.controls.ReassignAllOrgsTo.setValue(toBeAssignedUser);
      this.reassignAllOrgsTo(toBeAssignedUser);
      this.form.controls.ReassignAllProfilesTo.setValue(toBeAssignedUser);
      this.reassignAllProfilesTo(toBeAssignedUser);
    }
  }

  onReassignAllWOsToChanged($event) {
    if (this.isUserInitiatedEvent) {
      this.isUserInitiatedEvent = false;
      const toBeAssignedUser: InternalUserProfile = $event.value;

      if (this.getAssignTypeId() === ConstAssignType.Collaborator) {
        this.reassignAllWOsTo(toBeAssignedUser);
        this.updateCheckAllSelectBox(toBeAssignedUser);
      } else if (this.getAssignTypeId() === ConstAssignType.Recruiter) {
        this.reassignAllWOsTo(toBeAssignedUser);
      }
    }
  }

  reassignAllWOsTo(toBeAssignedUser: InternalUserProfile) {
    let formArray: FormArray;

    if (this.getAssignTypeId() === ConstAssignType.Collaborator) {
      formArray = this.form.controls.GroupedWOsByClientList as FormArray;
    } else if (this.getAssignTypeId() === ConstAssignType.Recruiter) {
      formArray = this.form.controls.WOsToRecruiterFormArray as FormArray;
    }

    if (formArray) {
      for (const control of formArray.controls as FormGroup[]) {
        control.controls.AssignedToUserProfileId.setValue(toBeAssignedUser);
      }
    }
  }

  onReassignAllOrgsToChanged($event) {
    if (this.isUserInitiatedEvent) {
      this.isUserInitiatedEvent = false;
      const toBeAssignedUser: InternalUserProfile = $event.value;
      this.reassignAllOrgsTo(toBeAssignedUser);
      this.updateCheckAllSelectBox(toBeAssignedUser);
    }
  }
  reassignAllOrgsTo(toBeAssignedUser: InternalUserProfile) {
    const OrganizationList: FormArray = this.form.controls.OrganizationList as FormArray;
    for (const control of OrganizationList.controls as FormGroup[]) {
      control.controls.AssignedToUserProfileId.setValue(toBeAssignedUser);
    }
  }
  onReassignAllProfilesToChanged($event) {
    if (this.isUserInitiatedEvent) {
      this.isUserInitiatedEvent = false;
      const toBeAssignedUser: InternalUserProfile = $event.value;
      this.reassignAllProfilesTo(toBeAssignedUser);
      this.updateCheckAllSelectBox(toBeAssignedUser);
    }
  }
  reassignAllProfilesTo(toBeAssignedUser: InternalUserProfile) {
    const ProfileList: FormArray = this.form.controls.ProfileList as FormArray;
    for (const control of ProfileList.controls as FormGroup[]) {
      control.controls.AssignedToUserProfileId.setValue(toBeAssignedUser);
    }
  }

  isProfileSameInFormArray(formArray, profileId) {
    let areAllSiblingsSame = true;
    for (const control of formArray.controls as FormGroup[]) {
      if (control.controls.AssignedToUserProfileId.value !== profileId) {
        areAllSiblingsSame = false;
        break;
      }
    }
    return areAllSiblingsSame;
  }

  onReassignWOsToChanged($event) {
    if (this.isUserInitiatedEvent) {
      this.isUserInitiatedEvent = false;
      const toBeAssignedUser: InternalUserProfile = $event.value;
      const formArray: FormArray = this.form.controls.GroupedWOsByClientList as FormArray;
      const areAllSiblingsSame = this.isProfileSameInFormArray(formArray, toBeAssignedUser);

      if (toBeAssignedUser && areAllSiblingsSame) {
        this.form.controls.ReassignAllWOsTo.setValue(toBeAssignedUser);
        this.updateCheckAllSelectBox(toBeAssignedUser);
      } else {
        this.form.controls.ReassignAllWOsTo.setValue(null);
        this.updateCheckAllSelectBox(null);
      }
    }
  }

  onWorkOrderReassignToChanged($event, i) {
    if (this.isUserInitiatedEvent) {
      this.isUserInitiatedEvent = false;
      const toBeAssignedUser: InternalUserProfile = $event.value;

      if (this.getAssignTypeId() === ConstAssignType.Collaborator) {
        const formArray: FormArray = this.form.controls.GroupedWOsByClientList as FormArray;
        const areAllSiblingsSame = this.isProfileSameInFormArray(formArray, toBeAssignedUser);

        if (toBeAssignedUser && areAllSiblingsSame) {
          this.form.controls.ReassignAllWOsTo.setValue(toBeAssignedUser);
          this.updateCheckAllSelectBox(toBeAssignedUser);
        } else {
          this.form.controls.ReassignAllWOsTo.setValue(null);
          this.updateCheckAllSelectBox(null);
        }
      } else if (this.getAssignTypeId() === ConstAssignType.Recruiter) {
        const formArray: FormArray = this.form.controls.WOsToRecruiterFormArray as FormArray;
        const areAllSiblingsSame = this.isProfileSameInFormArray(formArray, toBeAssignedUser);

        if (toBeAssignedUser && areAllSiblingsSame) {
          this.form.controls.AllWOsToRecruiterFormCtrl.setValue(toBeAssignedUser);
          // this.updateCheckAllSelectBox(toBeAssignedUser);
        } else {
          this.form.controls.AllWOsToRecruiterFormCtrl.setValue(null);
          // this.updateCheckAllSelectBox(null);
        }
      }
    } else {
      // do nothing
    }
  }

  onReassignOrgToChanged($event) {
    if (this.isUserInitiatedEvent) {
      this.isUserInitiatedEvent = false;
      const toBeAssignedUser: InternalUserProfile = $event.value;
      const formArray: FormArray = this.form.controls.OrganizationList as FormArray;
      const areAllSiblingsSame = this.isProfileSameInFormArray(formArray, toBeAssignedUser);

      if (toBeAssignedUser && areAllSiblingsSame) {
        this.form.controls.ReassignAllOrgsTo.setValue(toBeAssignedUser);
        this.updateCheckAllSelectBox(toBeAssignedUser);
      } else {
        this.form.controls.ReassignAllOrgsTo.setValue(null);
        this.updateCheckAllSelectBox(null);
      }
    }
  }

  onReassignProfileToChanged($event) {
    if (this.isUserInitiatedEvent) {
      this.isUserInitiatedEvent = false;
      const toBeAssignedUser: InternalUserProfile = $event.value;
      const formArray: FormArray = this.form.controls.ProfileList as FormArray;
      const areAllSiblingsSame = this.isProfileSameInFormArray(formArray, toBeAssignedUser);

      if (toBeAssignedUser && areAllSiblingsSame) {
        this.form.controls.ReassignAllProfilesTo.setValue(toBeAssignedUser);
        this.updateCheckAllSelectBox(toBeAssignedUser);
      } else {
        this.form.controls.ReassignAllProfilesTo.setValue(null);
        this.updateCheckAllSelectBox(null);
      }
    }
  }

  updateCheckAllSelectBox(toBeAssignedUser: InternalUserProfile) {
    const formValue: InternalUserOffboardingFormModel = this.form.value;
    if ((toBeAssignedUser === formValue.ReassignAllWOsTo || formValue.GroupedWOsByClientList.length === 0)
      && (toBeAssignedUser === formValue.ReassignAllOrgsTo || formValue.OrganizationList.length === 0)
      && (toBeAssignedUser === formValue.ReassignAllProfilesTo || formValue.ProfileList.length === 0)) {
      this.form.controls.ReassignAllItemsTo.setValue(toBeAssignedUser);
    } else {
      this.form.controls.ReassignAllItemsTo.setValue(null);
    }
  }
  //#endregion

  isFormValid(form: FormGroup): ValidationErrors {
    const formValue = form.value;
    const assignTypeId = form.controls.AssignType.value ? form.controls.AssignType.value.Id : null;
    let isValid = false;

    if (assignTypeId === ConstAssignType.Collaborator) {
      if (formValue.BranchManagerReassignedTo) {
        isValid = true;
      }
      if (!isValid) {
        for (const item of formValue.GroupedWOsByClientList) {
          if (item.AssignedToUserProfileId) {
            isValid = true;
            break;
          }
        }
      }
      if (!isValid) {
        for (const item of formValue.OrganizationList) {
          if (item.AssignedToUserProfileId) {
            isValid = true;
            break;
          }
        }
      }
      if (!isValid) {
        for (const item of formValue.ProfileList) {
          if (item.AssignedToUserProfileId) {
            isValid = true;
            break;
          }
        }
      }
    } else if (assignTypeId === ConstAssignType.Recruiter) {
      for (const item of formValue.WOsToRecruiterFormArray) {
        if (item.AssignedToUserProfileId) {
          isValid = true;
          break;
        }
      }
    } else if (form.controls.AssignType.value === null) {
      isValid = false;
    } else {
      isValid = true;
    }
    return isValid ? null : { errorMgs: 'Form not valid.' };
  }

  getReassignmentItemCount() {
    const formValue = this.form.value;
    if (this.getAssignTypeId() === ConstAssignType.Collaborator) {
      return [].concat(
        formValue.BranchManagerReassignedTo,
        formValue.GroupedWOsByClientList.map(x => x.AssignedToUserProfileId),
        formValue.OrganizationList.map(x => x.AssignedToUserProfileId),
        formValue.ProfileList.map(x => x.AssignedToUserProfileId)
      ).filter(x => x).length;
    } else if (this.getAssignTypeId() === ConstAssignType.Recruiter) {
      return formValue.WOsToRecruiterFormArray.filter(x => x.AssignedToUserProfileId) // skip null
        .map(wo => wo.AssignedToUserProfileId).length;
    } else {
      return 0;
    }
  }

  getReassignmentUsers() {
    const formValue = this.form.value;
    if (this.getAssignTypeId() === ConstAssignType.Collaborator) {
      let reassignedUsers: InternalUserProfile[] = [];
      reassignedUsers = reassignedUsers.concat(
        formValue.BranchManagerReassignedTo,
        formValue.GroupedWOsByClientList.map(x => x.AssignedToUserProfileId),
        formValue.OrganizationList.map(x => x.AssignedToUserProfileId),
        formValue.ProfileList.map(x => x.AssignedToUserProfileId)
      ).filter((value, index, items) => value && items.indexOf(value) === index);
      return reassignedUsers.map(x => '<strong>' + x.FullName + '</strong>').join(', ').replace(/,(?=[^,]*$)/, ' and');
    } else if (this.getAssignTypeId() === ConstAssignType.Recruiter) {
      const reassignedUsers = formValue.WOsToRecruiterFormArray.filter(x => x.AssignedToUserProfileId) // skip null
        .map(wo => wo.AssignedToUserProfileId);
      return reassignedUsers.map(x => '<strong>' + x.FullName + '</strong>').join(', ').replace(/,(?=[^,]*$)/, ' and');
    } else {
      return '';
    }
  }

  confirmSubmit() {
    const formValue: InternalUserOffboardingFormModel = this.form.value;
    const currentAssignee: string = `<strong>${this.profileReassignFrom.FullName}</strong>`;
    const reassignedUsersNamesCSV: string = this.getReassignmentUsers();
    const reassignCount = this.getReassignmentItemCount();

    const header: string = 'Reassignment Confirmation';
    const question: string = `${reassignCount} item(s) will be reassigned to ${reassignedUsersNamesCSV}.`;

    const body = `<p>${question}</p>`;
    const dialogOptions = { size: 'md' };

    this.dialogService.confirm(header, body, dialogOptions)
      .then((button) => {
        if (button === DialogResultType.Yes) {
          this.submitReassign();
        }
      }, (button) => {
        // click No button
      });
  }

  doReassign(commandName: string, payload?: any) {
    const d = {
      Id: this.profileId,
      ContactId: this.contactId,
      EntityIds: [ this.profileId ],
      EntityTypeId: EntityType.UserProfile
    };
    const data = Object.assign(this.model, d, payload);

    const that = this;
    return this.profileService.executeProfileCommand(commandName, null, data).then(
      (rsp) => {
        this.spinner.hide();
        this.router.navigate(['/next', 'contact', this.profileReassignFrom.latestContactId, 'profile', 'internal', this.profileReassignFrom.latestProfileId]);
        this.commonService.logSuccess('Reassigning was successful.');
      },
      (error) => {
        that.spinner.hide();
        this.commonService.logError('Error while reassigning.');
      });
  }

  submitReassign() {
    const formValue: InternalUserOffboardingFormModel = this.form.value;
    const commands: Promise<any>[] = [];
    if (this.getAssignTypeId() === ConstAssignType.Collaborator) {
      this.model.CurrentAssignedToUserProfileId = this.profileId;
      if (formValue.BranchManagerReassignedTo) {
        this.model.BranchReassign = this.branchManagedList.map(branchManaged => {
          const branchReassign = new BranchReassign();
          branchReassign.BranchManagerId = branchManaged.ManagerId;
          branchReassign.CodeInternalOrganizationDefinition1Id = branchManaged.CodeInternalOrganizationDefinition1Id;
          branchReassign.AssignedToUserProfileId = formValue.BranchManagerReassignedTo.ProfileId;
          return branchReassign;
        });
      }

      this.model.WOVReassign = []
        .concat(...formValue.GroupedWOsByClientList
          .filter(woByClient => woByClient.AssignedToUserProfileId)
          .map(woByClient => woByClient.WOClient.WOVExpenseApproverInfos
            .map(
              wov => {
                const workOrderVersionReassign = new WorkOrderVersionReassign();
                workOrderVersionReassign.AssignedToUserProfileId = woByClient.AssignedToUserProfileId.ProfileId;
                workOrderVersionReassign.IsExpenseApprover = wov.IsExpenseApprover;
                workOrderVersionReassign.WorkOrderVersionId = wov.WorkOrderVersionId;
                return workOrderVersionReassign;
              }
            )
          )
        );

      this.model.OrgReassign = formValue.OrganizationList
        .filter(org => org.AssignedToUserProfileId)
        .map(org => {
          const organizationReassign = new OrganizationReassign();
          organizationReassign.AssignedToUserProfileId = org.AssignedToUserProfileId.ProfileId;
          organizationReassign.OrganizationId = org.Organization.Id;
          return organizationReassign;
        });

      this.model.ProfileReassign = formValue.ProfileList
        .filter(contact => contact.AssignedToUserProfileId)
        .map(contact => {
          const userProfileReassign = new UserProfileReassign();
          userProfileReassign.AssignedToUserProfileId = contact.AssignedToUserProfileId.ProfileId;
          userProfileReassign.ContactId = contact.Profile.Id;
          return userProfileReassign;
        });

      this.doReassign(Command.UserProfileReassign, this.model);

    } else if (this.getAssignTypeId() === ConstAssignType.Recruiter) {
      const reassignRecruiter: ReassignRecruiter = new ReassignRecruiter();
      reassignRecruiter.CurrentAssignedToUserProfileId = this.profileId;
      let wovs = [];
      this.form.value.WOsToRecruiterFormArray.filter(workorder => workorder.AssignedToUserProfileId)
        .map(workorder => {
          wovs = wovs.concat(workorder.WorkOrder.WorkOrderVersionIdList.map(wovId => {
            const workOrderVersion = new WorkOrderVersionRecruiterReassign();
            workOrderVersion.AssignedToUserProfileId = workorder.AssignedToUserProfileId.ProfileId;
            workOrderVersion.WorkOrderVersionId = wovId;
            return workOrderVersion;
          }));
        });
      reassignRecruiter.WOVRecruiterReassign = wovs;

      this.doReassign(Command.UserProfileReassign, reassignRecruiter);
    }

  }

  cancelReassign() {
    this.router.navigate(['/next', 'contact', this.profileReassignFrom.latestContactId, 'profile', 'internal', this.profileReassignFrom.latestProfileId]);
  }
  ngOnDestroy(): void {
    this.isAlive = false;
  }
}

