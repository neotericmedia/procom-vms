import { Component, OnChanges, Input } from '@angular/core';
import { ActivityCentreCardComponentBase } from '../../shared/activity-centre-card-component-base';
import { PhxConstants } from '../../../../common';

@Component({
  selector: 'app-activity-centre-card-footer',
  templateUrl: './activity-centre-card-footer.component.html',
  styleUrls: ['./activity-centre-card-footer.component.less']
})

export class ActivityCentreCardFooterComponent extends ActivityCentreCardComponentBase implements OnChanges {

  @Input() entityTypeStatus: string;

  constructor() {
    super();
  }

  ngOnChanges() {
  }

}
