import { Component, OnInit, Input, SimpleChanges, OnChanges, EventEmitter, Output, HostListener } from '@angular/core';
import { ActivityTotal } from '../model/index';
import { Router } from '@angular/router/';
import { CommonService } from '../../common/services/common.service';
import { PhxLocalizationService } from '../../common/services/phx-localization.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-activity-centre-header',
  templateUrl: './activity-centre-header.component.html',
  styleUrls: ['./activity-centre-header.component.less']
})
export class ActivityCentreHeaderComponent implements OnInit, OnChanges {

  @Input() cardTotals: Array<ActivityTotal>;

  @Output() drillDown: EventEmitter<Array<ActivityTotal>> = new EventEmitter<Array<ActivityTotal>>();

  codeValueGroups: any;
  isMobile = false;
  isHidden = true;
  isCardTotalsLoaded = false;
  filters$: Observable<number[]>;

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.isWindowMobileSize(event.target);
  }

  constructor(private router: Router,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {
    this.codeValueGroups = commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.isWindowMobileSize(window);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.cardTotals.firstChange) {
      this.isCardTotalsLoaded = true;
    }
    if (changes && changes.cardTotals && changes.cardTotals.currentValue) {
      if (this.hasOnlyOneFilter() && !this.cardTotals[0].isActive) {
        this.onDrillDown(this.cardTotals[0]);
      }
    }
  }

  onDrillDown(total: ActivityTotal) {
    if (total.linkTo) {
      const taskType = this.activatedRoute.snapshot.url[0].path;
      const url = `next/activity-centre/${taskType}/${total.linkTo}`;
      this.router.navigateByUrl(url);
    } else {
      if (!(this.hasOnlyOneFilter() && total.isActive)) {
        total.isActive = !total.isActive;
      }
      const activeTotals = this.cardTotals.filter(x => x.isActive);
      this.drillDown.emit(activeTotals);
    }
  }

  isWindowMobileSize(window) {
    this.isMobile = window.innerWidth < 550 || (window.innerWidth >= 1167 && window.innerWidth <= 1304);
  }

  showMore() {
    this.isHidden = !this.isHidden;
  }

  private hasOnlyOneFilter() {
    return this.cardTotals && this.cardTotals.length === 1 && !this.cardTotals[0].linkTo;
  }

}
