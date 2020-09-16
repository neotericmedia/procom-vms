import { Component, OnChanges } from '@angular/core';
import { ActivityCentreCardBase, } from '../shared/activity-centre-card-base';
import { ActivityCentreService } from '../../shared/activity-centre.service';
import { ProfileCard, ActivityCentreModuleResourceKeys } from '../../model';

@Component({
  selector: 'app-activity-centre-card-profile',
  templateUrl: './activity-centre-card-profile.component.html',
  styleUrls: ['./activity-centre-card-profile.component.less']
})

export class ActivityCentreCardProfileComponent extends ActivityCentreCardBase<ProfileCard> implements OnChanges {

  constructor(private activityCentreService: ActivityCentreService) {
    super();
  }

  getCardDetails() {
    this.activityCentreService.getProfileCardDetails(this.cardEntity.EntityId).takeUntil(this.isDestroyed$)
    .subscribe((card: ProfileCard) => {
      this.card = card;
      this.cardInfo = card;
      this.card.title = card.LegalName;
      this.card.subTitle = this.getSubTitle(card.LegalStatusId);
      this.card.actionLink = `/next/contact/userprofile/${card.EntityId}`;
      this.card.entityAbbreviation = this.localizationService.translate(ActivityCentreModuleResourceKeys.card.EntityAbbreviationProfile);
    });
  }

  getSubTitle(id: number) {
    return id ? this.codeValueService.getCodeValues(this.codeValueGroups.ProfileType, true).find(i => i.id === id).text : '';
  }
}

