import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ActivityCentreService } from '../activity-centre.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-activity-centre-dummy-filter',
  templateUrl: './activity-centre-dummy-filter.component.html',
  styleUrls: ['./activity-centre-dummy-filter.component.less']
})
export class ActivityCentreDummyFilterComponent implements OnInit, OnDestroy {

  filters$: Observable<number[]>;
  isAlive: boolean = true;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected activityCentreService: ActivityCentreService
  ) { }

  ngOnInit() {
    this.filters$ = this.activatedRoute.params
      .map((params: Params) => {
        const filters = params['filters'] ? params['filters'].includes('%2C') ? params['filters'].split('%2C') : params['filters'].split(',') : [];
        return filters.map(n => +n);
      });

    this.filters$
      .takeWhile(() => this.isAlive)
      .subscribe(filters => {
        this.activityCentreService.updateFilterSelection(filters);
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
    this.activityCentreService.clearFilterSelection();
  }

}
