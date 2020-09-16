import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { TimeSheetService } from './../../service/time-sheet.service';
import { TimeSheet } from './../../model/index';

@Component({
  selector: 'app-time-sheet-projects',
  templateUrl: './time-sheet-projects.component.html',
  styleUrls: ['./time-sheet-projects.component.less']
})
export class TimeSheetProjectsComponent implements OnInit {
  private alive: boolean = true;

  timeSheetSubscription: Subscription;
  timeSheet: TimeSheet;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private timeSheetService: TimeSheetService) {}

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe(params => {
      const id = +params['TimeSheetId'];
      if (this.timeSheetSubscription) {
        this.timeSheetSubscription.unsubscribe();
      }

      this.timeSheetSubscription = this.timeSheetService
        .getTimeSheetById(id)
        .takeWhile(() => this.alive)
        .subscribe(timeSheet => {
          if (timeSheet) {
            if (!timeSheet.IsTimeSheetUsesProjects) {
              this.router.navigate(['./'], { relativeTo: this.activatedRoute.parent }).catch(err => {
                console.error(`error navigating to parent route`, err);
              });
            }

            this.timeSheet = timeSheet;
          }
        });
    });
  }
}
