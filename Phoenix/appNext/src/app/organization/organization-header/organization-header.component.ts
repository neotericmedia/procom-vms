// angular
import { Component, Input } from '@angular/core';
// common
import { CommonService } from '../../common/services/common.service';
// organization
import { IOrganization, IRoot } from './../state/organization.interface';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';

@Component({
  selector: 'app-organization-header',
  templateUrl: './organization-header.component.html',
  styleUrls: ['./organization-header.component.less']
})
export class OrganizationHeaderComponent {
  @Input() organization: IOrganization;
  @Input() inputFormGroup: FormGroup<IRoot>;

  html: { codeValueGroups: any } = { codeValueGroups: this.commonService.CodeValueGroups };

  public get orgLegalName() {
    return this.inputFormGroup ? this.inputFormGroup.controls.TabDetails.get('TabDetailsDetail').get('LegalName').value : null;
  }

  constructor(private commonService: CommonService) {
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
  }
}
