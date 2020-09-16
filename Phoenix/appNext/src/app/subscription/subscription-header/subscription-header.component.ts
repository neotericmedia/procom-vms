import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ISubscription } from '../../../../node_modules/rxjs/Subscription';
import { CodeValue } from '../../common/model';
import { CommonService, CodeValueService } from '../../common';
import { SubscriptionObservableService } from '../state/subscription.observable.service';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';

@Component({
  selector: 'app-subscription-header',
  templateUrl: './subscription-header.component.html',
  styleUrls: ['./subscription-header.component.less']
})

export class SubscriptionHeaderComponent extends BaseComponentActionContainer implements OnInit, OnChanges {

  html: {
    codeValueGroups: any;
    codeValueLists: {
      subscriptionTypes: Array<CodeValue>;
      subStatuses: Array<CodeValue>;
    }
  } = {
      codeValueGroups: this.commonService.CodeValueGroups,
      codeValueLists: {
        subscriptionTypes: [],
        subStatuses: []
      }
    };

  @Input() subscription: ISubscription;
  userProfileIdSubscriber: number;
  constructor(private commonService: CommonService, private subscriptionObservableService: SubscriptionObservableService,
    private codeValueService: CodeValueService) {
    super();
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.getCodeValuelistsStatic();
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.subscriptionTypes = this.codeValueService.getCodeValues(this.html.codeValueGroups.AccessSubscriptionType, true);
    this.html.codeValueLists.subStatuses = this.codeValueService.getCodeValues(this.html.codeValueGroups.AccessSubscriptionStatus, true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.subscription && changes.subscription.currentValue) {
      this.subscription = changes.subscription.currentValue;
    }
  }

  ngOnInit() { }

}
