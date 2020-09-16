import 'reflect-metadata';
import { Component,  ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { LoadingSpinnerService } from './common/loading-spinner/service/loading-spinner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {

  isAlive: boolean = true;

  constructor(
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService
  ) {
  }

  ngOnInit() {
    this.initRouterEventListener();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  initRouterEventListener() {
    this.router.events
      .takeWhile(() => this.isAlive)
      .subscribe(e => {
        if (e instanceof NavigationStart) {
          this.onNavigationStart();
        }
        if (e instanceof NavigationEnd) {
          this.onNavigationEnd();
        }
        if (e instanceof NavigationError) {
          this.onNavigationError();
        }
      });
  }

  onNavigationStart() {
    this.loadingSpinnerService.show();
  }

  onNavigationEnd() {
    this.loadingSpinnerService.hide();
  }

  onNavigationError() {
    this.loadingSpinnerService.hideAll();
  }

}
