import { Component, OnChanges } from '@angular/core';
import { ActivityCentreCardBase } from '../shared/activity-centre-card-base';
import { ActivityCentreService } from '../../shared/activity-centre.service';
import { WorkOrderCard, ActivityCentreModuleResourceKeys } from '../../model';

@Component({
  selector: 'app-activity-centre-card-workorder',
  templateUrl: './activity-centre-card-workorder.component.html',
  styleUrls: ['./activity-centre-card-workorder.component.less']
})

export class ActivityCentreCardWorkorderComponent extends ActivityCentreCardBase<WorkOrderCard> implements OnChanges {

  constructor(private activityCentreService: ActivityCentreService) {
    super();
  }

  getCardDetails() {
    this.activityCentreService.getWorkOrderCardDetails(this.cardEntity.EntityId).takeUntil(this.isDestroyed$)
      .subscribe((card: WorkOrderCard) => {
        this.card = card;
        this.cardInfo = card;
        this.card.title = card.LegalName;
        this.card.subTitle = this.getSubTitle(card.LegalStatusId);
        this.card.actionLink = `/next/workorder/${this.card.AssignmentId}/${this.card.WorkOrderId}/${this.card.EntityId}/core`;
        this.card.entityAbbreviation = this.localizationService.translate(ActivityCentreModuleResourceKeys.card.EntityAbbreviationWorkOrder);
      });
  }

  getSubTitle(id: number) {
    return id ? this.codeValueService.getCodeValues(this.codeValueGroups.ProfileType, true).find(i => i.id === id).text : '';
  }
}

