// angular
import { Component, OnInit } from '@angular/core';
// common
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';

@Component({
  selector: 'app-workorder-root',
  templateUrl: './workorder-root.component.html'
})
export class WorkorderRootComponent extends BaseComponentActionContainer implements OnInit {
    routerState: any;
  showTemplate: boolean = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.stateService
      .selectOnAction(getRouterState)
      .takeUntil(this.isDestroyed$)
      .subscribe((routerStateResult: IRouterState) => {
        this.routerState = { ...routerStateResult };
      });
  }
}
