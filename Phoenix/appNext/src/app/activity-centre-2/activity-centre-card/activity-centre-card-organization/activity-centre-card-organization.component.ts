import { Component, OnChanges } from '@angular/core';
import { ActivityCentreCardBase } from '../shared/activity-centre-card-base';
import { ActivityCentreService } from '../../shared/activity-centre.service';
import { OrganizationCard } from '../../model';
import { PhxConstants } from '../../../common';
import { ActivityCentreModuleResourceKeys } from '../../model/activity-centre-module-resource-keys';

@Component({
  selector: 'app-activity-centre-card-organization',
  templateUrl: './activity-centre-card-organization.component.html',
  styleUrls: ['./activity-centre-card-organization.component.less']
})

export class ActivityCentreCardOrganizationComponent extends ActivityCentreCardBase<OrganizationCard> implements OnChanges {

  constructor(private activityCentreService: ActivityCentreService) {
    super();
  }

  getCardDetails() {
    this.activityCentreService.getOrganizationCardDetails(this.cardEntity.EntityId).takeUntil(this.isDestroyed$)
      .subscribe((card: OrganizationCard) => {
        this.card = card;
        this.cardInfo = card;
        this.card.title = card.OrganizationName;
        this.card.subTitle = this.getSubTitle(card.OrganizationRoleTypeIds);
        this.card.actionLink = `/next/organization/${this.cardInfo.EntityId}/${PhxConstants.OrganizationNavigationName.details}`;
        this.card.entityAbbreviation = this.localizationService.translate(ActivityCentreModuleResourceKeys.card.EntityAbbreviationOrganization);
      });
  }

  getSubTitle(roleTypeIds: Array<number>) {
    let subtitle: string = '';
    roleTypeIds.forEach((id, index) => {
      subtitle = subtitle + this.codeValueService.getCodeValues(this.codeValueGroups.OrganizationRoleType, true).find(i => i.id === id).text + (index !== (roleTypeIds.length - 1) ? ', ' : '');
    });
    return subtitle;
  }
}

