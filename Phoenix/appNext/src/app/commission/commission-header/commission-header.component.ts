import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ICommissionRateVersion } from '../state';
import { CommonService } from '../../common/services/common.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { PhxConstants } from '../../common';

@Component({
  selector: 'app-commission-header',
  templateUrl: './commission-header.component.html',
  styleUrls: ['./commission-header.component.less']
})
export class CommissionHeaderComponent implements OnInit, OnChanges {
  @Input() commissionDetails: any;
  @Input() commissionRateVersionId;

  html: { codeValueGroups: any } = { codeValueGroups: this.commonService.CodeValueGroups };
  commissionRole: Array<any>;
  commissionRate: Array<any>;
  listCommissionRateHeaderStatus: Array<any>;
  listCustomStatus: Array<any>;
  customStatusId: number = 0;
  commissionResult: any;
  listCommissionRateVersionStatus: Array<any> = [];
  commissionRateVersionStatusId: number;
  commissionRateHeaderStatusId: number;
  phxConstants: any;

  routerParams: any;
  commmissionVersionId: number;
  filteredVersionDetails: Array<ICommissionRateVersion> = [];

  constructor(private commonService: CommonService, private codevalueService: CodeValueService) {
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.phxConstants = PhxConstants;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.commissionDetails && changes.commissionDetails.currentValue) {
      this.commissionDetails = changes.commissionDetails.currentValue;
      this.commissionRateHeaderStatusId = this.commissionDetails.CommissionRateHeaderStatusId;
      this.filteredVersionDetails = this.commissionDetails.CommissionRateVersions.filter(item => item.Id === +this.commissionRateVersionId);
      this.commissionDetails.CommissionRateTypeId = +this.commissionDetails.CommissionRateTypeId;
      this.commissionDetails.CommissionRoleId = +this.commissionDetails.CommissionRoleId;
      if (this.filteredVersionDetails.length > 0) {
        if (this.filteredVersionDetails[0].customStatusId) {
          this.commissionRateVersionStatusId = this.filteredVersionDetails[0].CommissionRateVersionStatusId;
          this.customStatusId = this.filteredVersionDetails[0].customStatusId;
        } else {
          this.customStatusId = 0;
          this.commissionRateVersionStatusId = this.filteredVersionDetails[0].CommissionRateVersionStatusId;
        }
      } else {
        this.customStatusId = 0;
      }
    }
  }

  ngOnInit() {
    this.getCommissionLists();
  }

  getCommissionLists() {
    this.commissionRole = this.codevalueService.getCodeValues(this.html.codeValueGroups.CommissionRole, true);
    this.commissionRate = this.codevalueService.getCodeValues(this.html.codeValueGroups.CommissionRateType, true);
    this.listCommissionRateHeaderStatus = this.codevalueService.getCodeValues(this.html.codeValueGroups.CommissionRateHeaderStatus, true);
    this.listCustomStatus = [
      {
        id: 0,
        code: 'Active',
        text: 'Active'
      },
      {
        id: 1,
        code: 'ToCorrect',
        text: 'To Correct'
      },
      {
        id: 2,
        code: 'ToScheduleChange',
        text: 'To Schedule Change'
      },
      {
        id: 3,
        code: 'ToManageRestrictions',
        text: 'To Manage Restrictions'
      }
    ];
    this.listCommissionRateVersionStatus = this.codevalueService.getCodeValues(this.html.codeValueGroups.CommissionRateVersionStatus, true);
    this.listCommissionRateHeaderStatus = this.codevalueService.getCodeValues(this.html.codeValueGroups.CommissionRateHeaderStatus, true);
  }
}
