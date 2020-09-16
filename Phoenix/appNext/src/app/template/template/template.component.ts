import { Component, OnInit } from '@angular/core';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
})

export class TemplateComponent extends BaseComponentActionContainer implements OnInit {
  routerStateResult: any;
  showTemplate: boolean = true;
  constructor() {
    super();
  }
  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState)
      .takeUntil(this.isDestroyed$)
      .subscribe((routerStateResult: IRouterState) => {
        this.routerStateResult = routerStateResult;
      });
  }
}
