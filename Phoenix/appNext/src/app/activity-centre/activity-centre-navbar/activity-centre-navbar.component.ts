import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TaskType } from '../model/index';
import { ActivityCentreService } from '../activity-centre.service';

@Component({
  selector: 'app-activity-centre-navbar',
  templateUrl: './activity-centre-navbar.component.html',
  styleUrls: ['./activity-centre-navbar.component.less']
})
export class ActivityCentreNavbarComponent implements OnInit {

  @Input() hideBackButton: boolean = false;

  entityTypeId: number;
  taskTypeEnum = TaskType;

  constructor(
    private location: Location,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    protected activityCentreService: ActivityCentreService
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.entityTypeId = +params['EntityTypeId'] === NaN ? 0 : +params['EntityTypeId'];
    });
  }

  goBack() {
    this.goTo(this.getTaskTypeFromUrl(), true);
  }

  goTo(taskType: string, force?: boolean) {
    if (force || taskType !== this.getTaskTypeFromUrl()) {
      this.router.navigate(['/next', 'activity-centre', taskType]);
    }
  }

  ngOnInit() {
  }

  get listScreenUrl(): string {
    switch (this.entityTypeId) {
      case 1:
        return '/#/next/organization/search';
      case 9:
        return '/#/next/timesheet/search';
      case 17:
        return '/#/next/workorder/search';
      case 21:
        return '/#/payment/pending';
      case 23:
        return '/#/next/payment/search';
      case 50:
        return '/#/next/contact/search';
      case 87:
        return '/#/next/compliance/search';
      case 96:
        return '/#/next/expense/search';
    }
  }

  get getTaskType(): TaskType {
    const urlPath = this.getTaskTypeFromUrl();

    switch (urlPath.toLowerCase()) {
      case 'all-tasks':
        return TaskType.allTask;
      default:
        return TaskType.myTask;
    }
  }

  private getTaskTypeFromUrl(): string {
    const snapshot = this.activatedRoute ? this.activatedRoute.snapshot : null,
      url = snapshot ? snapshot.url : null;
    return url && url.length > 0 && url[0] ? url[0].path : 'my-tasks';
  }

}
