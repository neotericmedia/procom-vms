import { StateService } from './../../../common/state/service/state.service';
import { NavigationService } from './../../../common/services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimeSheetService } from '../../service/time-sheet.service';
import { PhxInterceptPanelType } from '../../../common/model/index';
import { TimeSheetAction, timeSheetInitial } from '../../state/time-sheet/index';

@Component({
  selector: 'app-time-sheet-entry',
  templateUrl: './time-sheet-entry.component.html',
  styleUrls: ['./time-sheet-entry.component.less']
})
export class TimeSheetEntryComponent implements OnInit, OnDestroy {

  private alive: boolean = true;
  private noTimeSheets: boolean = false;

  PhxInterceptPanelType: typeof PhxInterceptPanelType = PhxInterceptPanelType;

  constructor(private timeSheetService: TimeSheetService,
    private state: StateService,
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService
  ) {
    // Get latest timesheet headers
    timeSheetService.getTimeSheetHeaders(null, true)
      .takeWhile(() => this.alive)
      .subscribe((headers: any) => {
        if (headers.Items) {
          const id: number = timeSheetService.findLatestTimeSheetId(headers.Items);

          if (id) {
            this.router.navigate([`${id}`], { relativeTo: this.route.parent })
              .catch((err) => {
                console.error(`error navigating to timesheet/${id}`, err);
              });
          } else {
            this.noTimeSheets = true;
          }
        }
      });
  }

  ngOnInit() {
    this.navigationService.setTitle('my-timesheets');
  }

  ngOnDestroy() {
    this.alive = false;
  }

}
