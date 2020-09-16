import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../common';
import { PageTitleDetail } from './../common/model/page-title-detail';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.less']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  isAlive: boolean = true;
  pageTitleDecorators: PageTitleDetail[] = [];

  constructor(private navigationService: NavigationService) {
    this.initNavigationPageTitleListener();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.isAlive = false;
  }

  initNavigationPageTitleListener() {
    this.navigationService.pageTitleDecoratorsChanged
      .takeWhile(() => this.isAlive)
      .subscribe((pageTitleDecorators) => {
        this.pageTitleDecorators = pageTitleDecorators;
      });
  }
}
