import { Injectable, Output, EventEmitter, OnDestroy } from '@angular/core';
import { filter } from 'lodash';
import { PageTitleDetail } from './../model/page-title-detail';
import { EventService } from './event.service';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class NavigationService implements OnDestroy {

  @Output() pageTitleDecoratorsChanged: EventEmitter<PageTitleDetail[]> = new EventEmitter<PageTitleDetail[]>();
  private pageTitleDecorators: PageTitleDetail[];
  private helpShow = false;
  stateCurrentName;
  helpTitle = '';
  helpIcon = '';
  functionOnHelpAction;
  private broadcastEventLogoutSubscription: Subscription;

  constructor(
    private eventSvc: EventService
  ) {
    const self = this;
    (<any>window).navigation = {};

    this.broadcastEventLogoutSubscription = this.eventSvc.subscribe('broadcastEvent:logout', () => {
      self.updatePageTitleDecorators([]);
    });
  }
  ngOnDestroy(): void {
    if (this.broadcastEventLogoutSubscription) {
      this.broadcastEventLogoutSubscription.unsubscribe();
    }
  }

  // extraTexts --- must be an array
  public setTitle(key, extraTexts = null) {
    const pages = (<any>window).PhoenixPageTitles;
    let title = '';
    const search = filter(pages, { Key: (key || '').toLowerCase() });
    if (search.length > 0) {
      const page: any = search[0];
      const decorators: PageTitleDetail[] = page.Decorators || [];

      decorators.forEach((item) => {
        if (item.ShowText === true) {
          if (title !== '') {
            title += ' - ';
          }
          title += item.Text;
        }
      });

      const extraDecorators: PageTitleDetail[] = [];

      if (extraTexts && extraTexts.constructor === Array) {
        extraTexts.forEach((text) => {
          extraDecorators.push({ Text: text, ShowText: true, ShowIcon: false });
        });
      }
      this.updatePageTitleDecorators(decorators.concat(extraDecorators));

    } else {
      console.error('Page with key "' + key + '" not found');
      this.updatePageTitleDecorators([]);
    }

    (<any>window).document.title = title + ' - FlexBackOffice';
  }


  isHelpShow() {
    // fix me
    // this.helpShow = ($rootScope.$state && $rootScope.$state.current && $rootScope.$state.current.name &&
    //   $rootScope.stateCurrentName && $rootScope.$state.current.name.length > 0
    //   && $rootScope.$state.includes($rootScope.stateCurrentName)
    //   && $rootScope.functionOnHelpAction) ? true : false;
    return true;
  }

  public setHelp(stateCurrentName, title, icon, functionOnHelpAction) {
    this.stateCurrentName = stateCurrentName;
    this.helpTitle = (title || '');
    this.helpIcon = (icon || '');
    this.functionOnHelpAction = functionOnHelpAction;
    this.isHelpShow();
  }

  clickOnHelp() {
    if (this.functionOnHelpAction) {
      this.functionOnHelpAction();
    }
  }

  private updatePageTitleDecorators(value: PageTitleDetail[]) {
    this.pageTitleDecorators = value;
    this.pageTitleDecoratorsChanged.emit(this.pageTitleDecorators);
  }
}
