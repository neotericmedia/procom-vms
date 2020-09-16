import { Component, OnInit, Input } from '@angular/core';
import { PhxConstants, CommonService } from '../../common/index';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { AccessAction } from '../../common/model';
import { ProfileObservableService } from './../state/profile.observable.service';
import { IProfile, IReadOnlyStorage } from '../state';

@Component({
  selector: 'app-contact-tab-history',
  templateUrl: './contact-tab-history.component.html',
  styleUrls: ['./contact-tab-history.component.less']
})

export class ContactTabHistoryComponent extends BaseComponentOnDestroy implements OnInit {

  public profile: IProfile = null;
  html: {
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    entityTypeId: number;
    entityId: number;
    changeHistoryBlackList: any[];
  } = {
      codeValueGroups: null,
      phxConstants: null,
      entityTypeId: null,
      entityId: null,
      changeHistoryBlackList: null
    };

  constructor(private commonService: CommonService,
    private profileObservableService: ProfileObservableService) {
    super();
    console.log(this.constructor.name + '.constructor');
    this.html.phxConstants = PhxConstants;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    console.log(this.constructor.name + '.ngOnInit');
    this.profileObservableService
      .profileOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(profile => {
        if (profile) {
          this.onInitProfile(profile);
        }
      });
  }

  onInitProfile(profile: IProfile) {
    this.profile = profile;
    this.html.entityTypeId = PhxConstants.EntityType.UserProfile;
    this.html.entityId = this.profile.IdOriginal ? this.profile.Id : this.profile.SourceId;

    this.recalcLocalProperties();
  }

  recalcLocalProperties() {
    this.html.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },

      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },

      { TableSchemaName: '', TableName: '', ColumnName: 'ContactId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'UserProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'ProfileStatusId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsPrimary' },
      { TableSchemaName: '', TableName: '', ColumnName: 'UserStatusId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'UserProfileWorkerId' },

      { TableSchemaName: 'usr', TableName: 'Contact', ColumnName: 'LoginUserId' },
      { TableSchemaName: 'payment', TableName: 'PaymentMethod', ColumnName: 'PaymentMethodTypeId' },
      { TableSchemaName: 'usr', TableName: 'UserProfileWorkerSourceDeduction', ColumnName: 'SourceDeductionTypeId' },
      { TableSchemaName: 'usr', TableName: 'UserProfileWorkerOtherEarning', ColumnName: 'PaymentOtherEarningTypeId' },
    ];
  }

}
