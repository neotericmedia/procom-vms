import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskType } from '../model/index';
@Component({
  selector: 'app-activity-centre-navbar',
  templateUrl: './activity-centre-navbar.component.html',
  styleUrls: ['./activity-centre-navbar.component.less']
})

export class ActivityCentreNavbarComponent implements OnChanges, OnInit {
  taskTypeEnum = TaskType;
  showFilter: boolean = false;
  lastRefreshed: number = 0;
  @Input() taskType: any = 'to-do';
  @Input() filterCount: number;
  @Output() canShowFilter = new EventEmitter<boolean>();
  @Output() refreshAction = new EventEmitter<any>();
  interval: any;
  finalCalculatedTime: number;

  constructor(private router: Router, protected activatedRoute: ActivatedRoute) {
    this.checkScreen();
  }

  goTo(taskType: string) {
    setTimeout(() => {
      this.router.navigate(['/next', 'activity-centre-2', taskType]);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filterCount && changes.filterCount.currentValue) {
      this.filterCount = changes.filterCount.currentValue;
    }
  }

  ngOnInit() {
    this.calculateRefreshTime();
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log());
  }

  get getTaskType() {
    switch (this.getTaskTypeFromUrl()) {
      case 'to-do':
        return TaskType.toDo;
      case 'in-progress':
        return TaskType.inProgress;
      default:
        return TaskType.completed;
    }
  }

  private getTaskTypeFromUrl() {
    const snapshot = this.activatedRoute ? this.activatedRoute.snapshot : null,
      url = snapshot && snapshot.firstChild ? snapshot.firstChild.url : null;
    return url && url.length > 0 && url[0] ? url[0].path : 'to-do';
  }

  onClickShowFilter() {
    this.showFilter = !this.showFilter;
    this.canShowFilter.emit(this.showFilter);
  }

  checkScreen() {
    if (window.innerWidth >= 1200) {
      this.showFilter = true;
    }
  }

  refreshFun() {
    this.refreshTimer();
    this.refreshAction.emit();
  }

  calculateRefreshTime() {
    this.interval = setInterval(() => {
      if (this.lastRefreshed >= 0) {
        this.lastRefreshed++;
      } else {
        this.lastRefreshed = 0;
      }
      this.finalCalculatedTime = this.getTimeFormat(this.lastRefreshed);
    }, 1000);
  }

  refreshTimer() {
    clearInterval(this.interval);
    this.lastRefreshed = 0;
    this.delay(1000).then(any => {
      this.calculateRefreshTime();
    });
  }

  getTimeFormat(time: any) {
      const interval = Number(time);
      const minutes = Math.floor(interval / 60);
      if (minutes) {
      return minutes;
      }
  }
}

