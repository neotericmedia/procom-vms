import { Component, OnInit, SimpleChanges, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { ActivityCard, ACTIVITY_CENTRE_DEBUG } from '../model/index';
import { WindowRefService } from '../../common/index';
import { UrlData } from './../../common/services/urlData.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-centre-card',
  templateUrl: './activity-centre-card.component.html',
  styleUrls: ['./activity-centre-card.component.less']
})
export class ActivityCentreCardComponent implements OnInit, OnChanges {

  @Input() card: ActivityCard;
  @Input() selectable: boolean;
  @Input() entityTypeId: number;

  @Output() changeSelection = new EventEmitter<ActivityCard>();

  showProfilePicture: boolean = false;

  constructor(private winRef: WindowRefService,
    protected urlData: UrlData,
    protected router: Router) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes && changes.card && changes.card.currentValue) {
      this.card = changes.card.currentValue;
    }
    if (changes && (changes.card || changes.entityTypeId)) {
      this.showProfilePicture = (this.card.userProfileIdWorker != null && this.entityTypeId != null && this.entityTypeId > 0);
    }
  }

  getField(card: ActivityCard, slotId: number) {

    const filler = {
      displayData: (ACTIVITY_CENTRE_DEBUG) ? `Slot # ${slotId}` : '',
      fieldType: 0,
      slotId: null
    };

    if (card && card.cardFields) {

      const fieldForSlot = card.cardFields.find(field => field.slotId === slotId);
      if (fieldForSlot) {
        return fieldForSlot;
      }

    }

    return filler;

  }

  onClickIcon(event: MouseEvent) {
    if (this.selectable) {
      event.preventDefault();
      event.stopPropagation();
      this.changeSelection.emit(this.card);
    }
  }

  addData() {
    this.urlData.setUrl(this.router.url);
  }

  // navigate() {

  //   this.winRef.nativeWindow.open(this.card.actionLink);

  // }

}
