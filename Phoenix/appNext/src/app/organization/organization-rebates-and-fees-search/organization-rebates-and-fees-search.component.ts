import { Component, OnInit } from '@angular/core';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { StateService } from '../../common/state/state.module';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { OrganizationApiService } from '../organization.api.service';
import { CodeValueService, CommonService, PhxConstants } from '../../common';
import { find, map, concat, curry } from 'lodash';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organization-rebates-vms-fees-search',
  templateUrl: './organization-rebates-and-fees-search.component.html'
})
export class OrganizationRebatesAndVmsFeesComponent extends BaseComponentOnDestroy implements OnInit {
  organizationId: number;
  organizationRoleStatusTypeList: Array<any>;
  lineOfBusinessList: Array<any>;
  rebateTypeList: Array<any>;
  rebateHeaderStatusList: Array<any>;
  vmsItems: any;

  constructor(private stateService: StateService, private organizationApiService: OrganizationApiService, private codeValueService: CodeValueService, private router: Router, private commonService: CommonService) {
    super();
    this.lineOfBusinessList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.LineOfBusiness, true);
    this.organizationRoleStatusTypeList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.OrganizationRoleStatusType, true);
    this.rebateTypeList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RebateType, true); // It is the same for both Rebates and VMS Fees
    this.rebateHeaderStatusList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RebateHeaderStatus, true);
  }

  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState)
      .takeUntil(this.isDestroyed$)
      .subscribe((routerStateResult: IRouterState) => {
        this.organizationId = +routerStateResult.params.organizationId;
        this.getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization();
      });
  }

  getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization() {
    this.organizationApiService
      .getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization(this.organizationId)
      .takeUntil(this.isDestroyed$)
      .subscribe(data => {
        this.processResult(data);
      });
  }
  processResult(data) {
    this.vmsItems = {};
    this.vmsItems.organizationId = data.Organization.Id;
    this.vmsItems.organizationName = data.Organization.DisplayName;
    this.vmsItems.organizationStatus = data.Organization.StatusId && find(this.organizationRoleStatusTypeList, ['id', data.Organization.StatusId]).text;

    const mapHeader = (type, header) => {
      const version = header.Versions[0];
      const row = {
        headerId: header.Id,
        versionId: version.Id,
        type: type,
        feeType: type === PhxConstants.VmsFeeRebate.VmsFee ? 'VMS Fee' : type === PhxConstants.VmsFeeRebate.Rebate ? 'Rebate' : null,
        description: header.Description,
        lob: find(this.lineOfBusinessList, ['id', version.LineOfBusinessId]).text,
        rebateTypeId: version.RebateTypeId,
        rateType: find(this.rebateTypeList, ['id', version.RebateTypeId]).text,
        rate: version.Rate,
        status: find(this.rebateHeaderStatusList, ['id', header.RebateHeaderStatusId]).text
      };
      return row;
    };

    const rebates = data.Rebates;
    rebates.Type = PhxConstants.VmsFeeRebate.Rebate;
    const rebateRows = map(rebates.Headers, curry(mapHeader)(rebates.Type));
    const vmsFees = data.VmsFees;
    vmsFees.Type = PhxConstants.VmsFeeRebate.VmsFee;
    const vmsFeeRows = map(vmsFees.Headers, curry(mapHeader)(vmsFees.Type));

    this.vmsItems.items = concat(rebateRows, vmsFeeRows);
  }

  displayRate(item) {
    return item.rebateTypeId === PhxConstants.RebateType.Amount ? '$' + item.rate : item.rebateTypeId === PhxConstants.RebateType.Percentage ? item.rate + '%' : null;
  }

  createNewVms() {
    this.router.navigate(['next', 'organization', 'vmsfee', 'vmsFeeHeader', 0, 'vmsFeeVersion', 0, 0]);
  }

 createNewRebate() {
    this.router.navigate(['next', 'organization', 'rebate', 'rebateHeader', 0, 'rebateVersion', 0, 0]);
 }

  onRowClick(item) {
    if (item.type === PhxConstants.VmsFeeRebate.VmsFee) {
      this.router.navigate(['next', 'organization', 'vmsfee', 'vmsFeeHeader', item.headerId, 'vmsFeeVersion', item.versionId, this.organizationId]);
    } else if (item.type === PhxConstants.VmsFeeRebate.Rebate) {
      this.router.navigate(['next', 'organization', 'rebate', 'rebateHeader', item.headerId, 'rebateVersion', item.versionId, this.organizationId]);
    }
  }
}
