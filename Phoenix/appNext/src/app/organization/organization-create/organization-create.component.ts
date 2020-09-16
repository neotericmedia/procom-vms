import { Component, OnInit } from '@angular/core';
import { OrganizationApiService } from '../organization.api.service';
import { PhxConstants, CommonService, LoadingSpinnerService } from '../../common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-organization-create',
  template: '<div></div>',
  styleUrls: ['./organization-create.component.less']
})
export class OrganizationCreateComponent implements OnInit {

  constructor(
    private orgService: OrganizationApiService,
    private router: Router,
    private commonService: CommonService,
    private loaderService: LoadingSpinnerService,
    private activatedRoute: ActivatedRoute) {
  }

  navigateTo(organizationIdNavigateTo: number, tabNavigationName: PhxConstants.OrganizationNavigationName, roleId: number = null) {
    const navigatePath = `/next/organization/${organizationIdNavigateTo}/${tabNavigationName}` + (roleId ? `/${roleId}` : ``);
    this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
      console.error(`app-organization: error navigating to ${organizationIdNavigateTo} , ${tabNavigationName}`, err);
    });
  }

  ngOnInit() {
    this.loaderService.show();
    this.orgService.createOrganization().then(response => {
      this.loaderService.hide();
      this.navigateTo(response.EntityId, PhxConstants.OrganizationNavigationName.details);
    }, error => {
      console.log(error);
      this.commonService.logError('An error occured on loading organization details.');
      this.router.navigate([`search`], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-organization - from organization creation page: error navigating to next/organization/search`, err);
      });
    });
  }

}
