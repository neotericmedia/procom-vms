import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhxConstants } from '../../../common/PhoenixCommon.module';
import { BaseComponentOnDestroy } from '../../../common/state/epics/base-component-on-destroy';

@Component({
  selector: 'app-time-sheet-history',
  templateUrl: './time-sheet-history.component.html',
  styleUrls: ['./time-sheet-history.component.less']
})
export class TimeSheetHistoryComponent extends BaseComponentOnDestroy implements OnInit {

  ENTITY_TYPE = PhxConstants.EntityType;
  timeSheetId: number;

  constructor(private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.route.parent.params.takeUntil(this.isDestroyed$).subscribe(params => {
      this.timeSheetId = +params['TimeSheetId'];
    });
  }
}
