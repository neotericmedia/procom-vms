import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IProfile, IContact } from '../state';
import { ContactService } from '../shared/contact.service';
import { CodeValueService, CommonService, ApiService } from '../../common';
import { CodeValue } from '../../common/model';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

@Component({
  selector: 'app-contact-header',
  templateUrl: './contact-header.component.html',
  styleUrls: ['./contact-header.component.less']
})

export class ContactHeaderComponent extends BaseComponentOnDestroy implements OnInit, OnChanges {

  @Input() profile: IProfile;
  loginName: string = 'N/A';
  contactStatuses: Array<CodeValue> = [];
  codeValueGroups: any;
  sourceContact: IContact;

  constructor(public contactService: ContactService,
    public codeValueService: CodeValueService,
    public commonService: CommonService,
    private apiService: ApiService 
  ) {
    super();
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.contactStatuses = this.codeValueService.getCodeValues(this.codeValueGroups.UserStatus, true);
    if (this.profile && this.profile.Contact.LoginUserId) {
      this.contactService.getLoginInfo(this.profile.Contact.LoginUserId)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        response.UserName = response.UserName.replace(/\"/g, '');
        this.loginName = response.UserName;
      });
      this.getSourceContact();
    }
  }

  ngOnChanges(v: SimpleChanges){
    this.getSourceContact();
  }

  getSourceContact() {
    this.sourceContact = this.profile.Contact;
    const sourceProfileId = this.profile.SourceId ? this.profile.SourceId : this.profile.Id;
    this.apiService.query('UserProfile/' + this.profile.ProfileTypeId + '/getUserProfileType/' + sourceProfileId, false).then((rsp: IProfile) => {
      this.sourceContact = rsp.Contact;
    });
  }
}
