import { CommonService } from '../../common/services/common.service';
import { UserInfo } from './../../common/model/user';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { UserProfile } from '../../common/model';
import { CodeValueService, PhxLocalizationService } from '../../common';
import { PaymentModuleResourceKeys } from './../payment-module-resource-keys';
@Component({
  selector: 'app-payment-ytd-earnings-summary',
  templateUrl: './payment-ytd-earnings-summary.component.html',
  styleUrls: ['./payment-ytd-earnings-summary.component.less']
})
export class PaymentYtdEarningsSummaryComponent implements OnInit {

  constructor(
    protected codeValueService: CodeValueService,
    protected commonService: CommonService,
    protected localizationService: PhxLocalizationService,
  ) {
    this.paymentModuleResourceKeys = PaymentModuleResourceKeys;
    PaymentYtdEarningsSummaryComponent.localizationService = localizationService;
  }
  static localizationService;
  paymentModuleResourceKeys: any;
  items: any;
  maxInfos: any[];
  workerProfile: any;
  _data: any;
  @Input('data')
  get data(): any {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    const { items, maxInfos, workerProfile } = PaymentYtdEarningsSummaryComponent.processData(this._data);
    this.items = items;
    this.maxInfos = maxInfos;
    this.workerProfile = workerProfile;
    this.updateUserProfile(workerProfile);
  }

  @Input() userInfo: UserInfo;
  userProfile: any;
  userProfileType: string;

  ngOnInit() {
    if (!this.workerProfile) {
      this.updateUserProfile(this.userInfo.Profiles[0]);
    }
  }

  updateUserProfile(workerProfile?: any) {
    this.userProfile = workerProfile;
    this.userProfileType = this.codeValueService.getCodeValueText(workerProfile.ProfileTypeId, this.commonService.CodeValueGroups.ProfileType);
  }

  static processData(data): { items: any[], maxInfos: any, workerProfile: any } {
    const items = [];
    if (data) {
      if (data.cols) {
        for (let index = 0; index < data.cols.length; index++) {
          const element = data.cols[index];
          const hasValue = element.value;
          if (!!hasValue) {
            const sourceDeduction = element.key.replace('Amount', '').toLowerCase();
            const name = this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.totalAmount) + ' ' + this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning[sourceDeduction]);
            const item = { Name: name, Key: element.key, TotalAmount: _.sumBy(data.items, element.key) };
            items.push(item);
          }
        }
        items.splice(0, 0, { Name: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.totalGrossAmount), TotalAmount: _.sumBy(data.items, 'AmountGross') });
        items.map( x => {
          if (x.Key === 'AmountVacationAccured')
          {
            x.Name = this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.totalVacationAccured);
            x.TotalAmount = data.items[0].AmountVacationAccured;
          }
        });
      }
    }
    return {
      items: items,
      maxInfos: data && data.maxInfo,
      workerProfile: data.workerProfile,
    };
  }

}
