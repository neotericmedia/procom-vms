import { Component, OnChanges } from '@angular/core';
import { ActivityCentreCardBase } from '../shared/activity-centre-card-base';
import { ActivityCentreService } from '../../shared/activity-centre.service';
import { CardBase } from '../../model';

@Component({
  selector: 'app-activity-centre-card-expense',
  templateUrl: './activity-centre-card-expense.component.html',
  styleUrls: ['./activity-centre-card-expense.component.less']
})

export class ActivityCentreCardExpenseComponent extends ActivityCentreCardBase<CardBase> implements OnChanges {

  constructor(private activityCentreService: ActivityCentreService) {
    super();
  }

  getCardDetails() {
    this.activityCentreService.getExpenseCardDetails(this.cardEntity.EntityId).takeUntil(this.isDestroyed$)
      .subscribe((card: CardBase) => {
        this.card = card;
        this.cardInfo = card;
      });
  }
}
