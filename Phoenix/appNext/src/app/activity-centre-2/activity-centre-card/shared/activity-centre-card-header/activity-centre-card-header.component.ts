import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { PhxConstants } from '../../../../common';
import { ActivityCentreCardComponentBase } from '../../shared/activity-centre-card-component-base';
import { ActivityCentreModuleResourceKeys } from '../../../model';

@Component({
  selector: 'app-activity-centre-card-header',
  templateUrl: './activity-centre-card-header.component.html',
  styleUrls: ['./activity-centre-card-header.component.less']
})
export class ActivityCentreCardHeaderComponent extends ActivityCentreCardComponentBase implements OnChanges {

  @Input() showProfilePicture = false;

  phxConstants: typeof PhxConstants;

  constructor() {
    super();
    this.phxConstants = PhxConstants;
  }

  public get cardTitle() {

    if (this.cardInfo.title) {
      return this.cardInfo.title;
    }

    switch (this.cardInfo.EntityTypeId) {

      case PhxConstants.EntityType.Organization:
        return this.localizationService.translate(ActivityCentreModuleResourceKeys.card.OrganizationNameMissing);
      case PhxConstants.EntityType.WorkOrderVersion:
      case PhxConstants.EntityType.TimeSheet:
        return this.localizationService.translate(ActivityCentreModuleResourceKeys.card.WorkerNameMissing);
      case PhxConstants.EntityType.UserProfile:
        return this.localizationService.translate(ActivityCentreModuleResourceKeys.card.ContactNameMissing);
      case PhxConstants.EntityType.Payment:
        return this.localizationService.translate(ActivityCentreModuleResourceKeys.card.PayeeNameMissing);
      case PhxConstants.EntityType.Document:
        return this.localizationService.translate(ActivityCentreModuleResourceKeys.card.DocumentNameMissing);
      default:
        return 'Title not found';
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes && changes.cardInfo && changes.cardInfo.currentValue) {

      this.showProfilePicture = (this.cardInfo.TaskOwner !== null
        && this.cardInfo.EntityId !== null && this.cardInfo.EntityTypeId > 0);
    }
  }
}
