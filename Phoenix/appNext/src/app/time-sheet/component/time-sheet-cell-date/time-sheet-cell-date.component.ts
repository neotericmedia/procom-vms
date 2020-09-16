import { TimeSheetDay } from '../../model/time-sheet-day';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-time-sheet-cell-date',
  templateUrl: './time-sheet-cell-date.component.html',
  styleUrls: ['./time-sheet-cell-date.component.less']
})
export class TimeSheetCellDateComponent implements OnInit {
  @Input() timeSheetDay: TimeSheetDay;
  @Input() active = false;

  constructor(private uiService: TimeSheetUiService) { }

  ngOnInit() {
  }

  getDayType(): string {
    if ( this.timeSheetDay) {
      const weekday = this.timeSheetDay.Date.getDay();
      if (weekday === 0 || weekday === 6) { return 'weekend'; }
      if (this.timeSheetDay.IsHoliday) { return 'holiday'; }
    }
    return 'weekday';
  }
}
