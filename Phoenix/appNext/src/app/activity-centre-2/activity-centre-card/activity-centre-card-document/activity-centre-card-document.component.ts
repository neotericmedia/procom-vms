import { Component, OnChanges } from '@angular/core';
import { ActivityCentreCardBase } from '../shared/activity-centre-card-base';
import { ActivityCentreService } from '../../shared/activity-centre.service';
import { ComplianceDoucmentCard } from '../../model';
import { PhxConstants } from '../../../common';
import { ActivityCentreModuleResourceKeys } from '../../model/activity-centre-module-resource-keys';

@Component({
  selector: 'app-activity-centre-card-document',
  templateUrl: './activity-centre-card-document.component.html',
  styleUrls: ['./activity-centre-card-document.component.less']
})

export class ActivityCentreCardDocumentComponent extends ActivityCentreCardBase<ComplianceDoucmentCard> implements OnChanges {

  constructor(private activityCentreService: ActivityCentreService) {
    super();
  }

  getCardDetails() {
    this.activityCentreService.getComplianceDocumentCardDetails(this.cardEntity.EntityId).takeUntil(this.isDestroyed$)
      .subscribe((card: ComplianceDoucmentCard) => {
        this.card = card;
        this.cardInfo = card;
        this.card.title = card.DocumentRuleName;
        this.card.subTitle = this.getSubTitle(card);
        this.card.entityAbbreviation = this.localizationService.translate(ActivityCentreModuleResourceKeys.card.EntityAbbreviationDocument);
        this.card.actionLink = this.getActionLink(this.card);

      });
  }

  getActionLink(card: ComplianceDoucmentCard): string {
    let actionLink: string = '';

    switch (card.DocumentCardEntityTypeId) {
      case PhxConstants.EntityType.Organization: {
        actionLink = `/next/organization/${card.OrganizationId}/details`;
        break;
      }
      case PhxConstants.EntityType.WorkOrder:
      case PhxConstants.EntityType.WorkOrderVersion: {
        actionLink = `/next/workorder/${card.WorkOrderAssignmentId}/${card.DocumentEntityId}/${card.WorkOrderVersionId}/core`;
        break;
      }
      case PhxConstants.EntityType.UserProfile: {
        actionLink = `/next/contact/userprofile/${card.DocumentEntityId}`;
        break;
      }
    }
    return actionLink;
  }

  getSubTitle(card: ComplianceDoucmentCard) {
    const documentEntityType = this.codeValueService.getCodeValueText(card.DocumentCardEntityTypeId, this.codeValueGroups.EntityType);
    let identifier: any;
    let status: string;
    switch (card.DocumentCardEntityTypeId) {
      case this.phxConstants.EntityType.Organization: {
        identifier = card.OrganizationId;
        status = this.codeValueService.getCodeValueText(card.OrganizationStatusId, this.codeValueGroups.OrganizationStatus);
        break;
      }
      case this.phxConstants.EntityType.WorkOrder: {
        identifier = card.WorkOrderNumber;
        status = this.codeValueService.getCodeValueText(card.WorkOrderVersionStatusId, this.codeValueGroups.WorkOrderVersionStatus);
        break;
      }
      case this.phxConstants.EntityType.UserProfile: {
        identifier = card.ProfileContactId;
        status = this.codeValueService.getCodeValueText(card.ProfileStatusId, this.codeValueGroups.ProfileStatus);
        break;
      }
    }

    return `${documentEntityType} ${identifier} (${status})`;
  }
}
