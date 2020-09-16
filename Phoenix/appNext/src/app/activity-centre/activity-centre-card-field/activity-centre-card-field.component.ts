import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivityCardFieldType } from '../model/index';
import { CommonService, PhxConstants } from '../../common/index';

@Component({
  selector: 'app-activity-centre-card-field',
  templateUrl: './activity-centre-card-field.component.html',
  styleUrls: ['./activity-centre-card-field.component.less']
})
export class ActivityCentreCardFieldComponent implements OnInit, OnChanges {

  @Input() cardField;

  ActivityCardFieldType: typeof ActivityCardFieldType = ActivityCardFieldType;

  dateFormat: string = PhxConstants.DateFormat.mediumDate;

  constructor(private commonService: CommonService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes && changes.cardField && changes.cardField.currentValue && this.cardField !== changes.cardField.currentValue) {
      this.cardField = changes.cardField.currentValue;
    }

  }

}
