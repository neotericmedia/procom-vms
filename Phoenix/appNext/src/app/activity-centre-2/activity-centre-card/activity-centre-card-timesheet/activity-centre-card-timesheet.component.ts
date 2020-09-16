import { Component, OnChanges } from '@angular/core';
import { ActivityCentreCardBase } from '../shared/activity-centre-card-base';
import { ActivityCentreService } from '../../shared/activity-centre.service';
import { TimesheetCard, TimeSheetActionCommand, ActivityCentreModuleResourceKeys } from '../../model';
import { PhxConstants } from '../../../common';

@Component({
  selector: 'app-activity-centre-card-timesheet',
  templateUrl: './activity-centre-card-timesheet.component.html',
  styleUrls: ['./activity-centre-card-timesheet.component.less']
})

export class ActivityCentreCardTimesheetComponent extends ActivityCentreCardBase<TimesheetCard> implements OnChanges {

  constructor(private activityCentreService: ActivityCentreService) {
    super();
  }

  public get hasTimeSheetApproveDeclineActions(): boolean {
    if (this.card && this.card.Actions) {
      return this.card.Actions.includes(PhxConstants.StateAction.TimesheetApprove) &&
        this.card.Actions.includes(PhxConstants.StateAction.TimesheetDecline);
    }
    return false;
  }

  getCardDetails() {
    this.activityCentreService.getTimeSheetCardDetails(this.cardEntity.EntityId).takeUntil(this.isDestroyed$)
      .subscribe((card: TimesheetCard) => {
        this.card = card;
        this.cardInfo = card;
        this.card.title = card.LegalName;
        this.card.subTitle = this.getSubTitle(card.LegalStatusId);
        this.card.actionLink = `/next/timesheet/${this.cardEntity.EntityId}`;
        this.card.entityAbbreviation = this.localizationService.translate(ActivityCentreModuleResourceKeys.card.EntityAbbreviationTimeSheet);
      });
  }

  onActionExecuted($event: TimeSheetActionCommand) {
    this.cardActionCompleted.emit($event);
  }

  getSubTitle(id: number) {
    return id ? this.codeValueService.getCodeValues(this.codeValueGroups.ProfileType, true).find(i => i.id === id).text : '';
  }
}
