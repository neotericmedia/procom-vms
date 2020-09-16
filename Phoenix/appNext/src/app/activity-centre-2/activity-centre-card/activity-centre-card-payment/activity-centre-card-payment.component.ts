import { Component, OnChanges } from '@angular/core';
import { ActivityCentreCardBase } from '../shared/activity-centre-card-base';
import { ActivityCentreService } from './../../shared/activity-centre.service';
import { PaymentCard, ActivityCentreModuleResourceKeys } from '../../model';

@Component({
  selector: 'app-activity-centre-card-payment',
  templateUrl: './activity-centre-card-payment.component.html',
  styleUrls: ['./activity-centre-card-payment.component.less']
})

export class ActivityCentreCardPaymentComponent extends ActivityCentreCardBase<PaymentCard> implements OnChanges {

  loaded: boolean = false;

  constructor(private activityCentreService: ActivityCentreService) {
    super();
  }

  getCardDetails() {
    this.activityCentreService.getPaymentCardDetails(this.cardEntity.EntityId).takeUntil(this.isDestroyed$)
      .subscribe((card: PaymentCard) => {
        this.loaded = true;
        this.card = card;
        this.cardInfo = card;
        this.card.title = card.PayeeName;
        this.card.subTitle = this.getSubTitle(card.LegalStatusId);
        this.card.actionLink = `/next/payment/search/${this.card.EntityId}`;
        this.card.entityAbbreviation = this.localizationService.translate(ActivityCentreModuleResourceKeys.card.EntityAbbreviationPayment);
      });
  }

  getSubTitle(id: number) {
    return id ? this.codeValueService.getCodeValues(this.codeValueGroups.ProfileType, true).find(i => i.id === id).text : '';
  }
}

