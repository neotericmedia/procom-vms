import { CodeValueGroups } from './../../common/model/phx-code-value-groups';
import { IComplianceDocumentEntityGroup, IStateActionEvent, IComplianceDocumentHeader } from './../shared/compliance-document.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PhxConstants } from '../../common';
import { Router } from '@angular/router';
import { CommonListsObservableService } from '../../common/lists/lists.observable.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { ComplianceDocumentService } from '../shared/compliance-document.service';

@Component({
  selector: 'app-compliance-document-entity-group',
  templateUrl: './compliance-document-entity-group.component.html',
  styleUrls: ['./compliance-document-entity-group.component.less']
})
export class ComplianceDocumentEntityGroupComponent extends BaseComponentOnDestroy implements OnInit {

  @Input() parentEntityTypeId: PhxConstants.EntityType;
  @Input() documentEntityGroup: IComplianceDocumentEntityGroup;
  @Input() useBoldHeading = false;

  @Output() onStateAction = new EventEmitter<IStateActionEvent>();
  @Output() onGenerateDocument = new EventEmitter<IStateActionEvent>();
  @Output() onViewSample = new EventEmitter<IStateActionEvent>();

  url: string = null;

  codeValueGroups = CodeValueGroups;
  listUserProfileWorker: Array<any>;

  constructor(private router: Router, private commonListsObservableService: CommonListsObservableService, private complianceDocumentService: ComplianceDocumentService) {
    super();
  }

  ngOnInit() {
    this.setEntityGroupUrl();
  }

  identifyHeader(index, header: IComplianceDocumentHeader) {
    return header.Id;
  }

  setEntityGroupUrl() {
    if (this.documentEntityGroup.EntityTypeId !== this.parentEntityTypeId) {
      switch (this.documentEntityGroup.EntityTypeId) {
        case PhxConstants.EntityType.OrganizationIndependentContractorRole:
          this.setOrgRoleUrl('independentcontractor');
          break;
        case PhxConstants.EntityType.OrganizationSubVendorRole:
          this.setOrgRoleUrl('subvendor');
          break;
        case PhxConstants.EntityType.OrganizationLimitedLiabilityCompanyRole:
          this.setOrgRoleUrl('limitedliabilitycompany');
          break;
        case PhxConstants.EntityType.OrganizationClientRole:
          this.setOrgRoleUrl('client');
          break;
        case PhxConstants.EntityType.UserProfile:
          this.setUserProfileUrl();
          break;
      }
    }
  }

  setOrgRoleUrl(orgRoleType: string) {
    this.complianceDocumentService.getOrgInfo(this.documentEntityGroup.EntityId, this.documentEntityGroup.EntityTypeId)
      .takeUntil(this.isDestroyed$)
      .subscribe(res => {
        if (res && res.Id) {
          this.url = '#' + this.router.createUrlTree(['/next/organization/', res.Id, 'roles', orgRoleType, this.documentEntityGroup.EntityId]).toString();
        }
      });
  }

  setUserProfileUrl() {
    this.commonListsObservableService.listUserProfileWorkers$()
      .takeUntil(this.isDestroyed$)
      .subscribe((listUserProfileWorker: any) => {
        if (listUserProfileWorker) {
          this.listUserProfileWorker = listUserProfileWorker;
          let contactId = null;
          let profileTypeId = null;
          for (const item of this.listUserProfileWorker) {
            if (item.Id === this.documentEntityGroup.EntityId) {
              contactId = item.ContactId;
              profileTypeId = item.ProfileTypeId;
              break;
            }
          }
          if (contactId && profileTypeId) {
            this.url = '#' + this.router.createUrlTree(['/next/contact/', contactId, 'profile', this.getProfileType(profileTypeId), this.documentEntityGroup.EntityId]).toString();
          }
        }
      });
  }

  getProfileType(profileTypeId: number) {
    switch (profileTypeId) {
      case PhxConstants.UserProfileType.Internal:
        return 'internal';
      case PhxConstants.UserProfileType.Organizational:
        return 'organizational';
      case PhxConstants.UserProfileType.WorkerCanadianInc:
        return 'workercanadianinc';
      case PhxConstants.UserProfileType.WorkerCanadianSp:
        return 'workercanadiansp';
      case PhxConstants.UserProfileType.WorkerSubVendor:
        return 'workersubvendor';
      case PhxConstants.UserProfileType.WorkerTemp:
        return 'workertemp';
      case PhxConstants.UserProfileType.WorkerUnitedStatesLLC:
        return 'workerunitedstatesllc';
      case PhxConstants.UserProfileType.WorkerUnitedStatesW2:
        return 'workerunitedstatesw2';
      default:
        return '';
    }
  }
}
