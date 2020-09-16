/**
 * Tooltip opens when mouse over target.
 * It also stays open when mouse over tooltip itself.
 *
 * Tooltip closes when mouse leave target or tooltip.
 */

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DxTooltipComponent } from 'devextreme-angular';

@Component({
  selector: 'app-phx-tool-tip',
  templateUrl: './phx-tooltip.component.html'
})
export class PhxToolTipComponent implements OnInit {
  @ViewChild(DxTooltipComponent)
  dxTooltipComponent: DxTooltipComponent;

  @Input() targetId: string = null;
  @Input() position: string = 'top';
  @Input() visible: boolean = false;
  @Input() showAnimation: boolean = false;
  @Input() showAnimationType: string = 'slide'; // 'slide' | 'pop'
  @Input() hideAnimationType: string = 'pop'; // 'slide' | 'pop'

  mouseOverTooltip = false;
  showEvent = 'dxhoverstart';
  hideEvent = {
    delay: 500,
    name: 'dxhoverend'
  };

  constructor() {}

  ngOnInit() {}

  OnMouseOverTooltip() {
    this.mouseOverTooltip = true;
    this.dxTooltipComponent.instance.show();
  }

  OnMouseLeaveTooltip() {
    this.mouseOverTooltip = false;
    this.dxTooltipComponent.instance.hide();
  }

  /**
   * A function that is executed before the widget is hidden.
   * https://js.devexpress.com/Documentation/ApiReference/UI_Widgets/dxTooltip/Configuration/#onHiding
   * @param obj
   *    component: Tooltip -- The widget's instance.
   *    element: Element (jQuery or HTML) -- The widget's container. It is an HTML Element or a jQuery Element when you use jQuery.
   *    model: Object -- The model data. Available only if Knockout is used.
   *    cancel: Boolean -- Allows you to cancel overlay hiding
   */
  onHiding(obj: { component: any; element: any; model: any; cancel: any }) {
    if (this.mouseOverTooltip) {
      obj.cancel = true;
    }
  }
}
