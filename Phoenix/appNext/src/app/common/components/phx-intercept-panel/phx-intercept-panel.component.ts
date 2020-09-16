import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { PhxInterceptPanelButtonModel, PhxInterceptPanelType } from '../../model/index';

@Component({
  selector: 'app-phx-intercept-panel',
  templateUrl: './phx-intercept-panel.component.html',
  styleUrls: ['./phx-intercept-panel.component.less']
})
export class PhxInterceptPanelComponent implements OnChanges {


  PhxInterceptPanelType: typeof PhxInterceptPanelType = PhxInterceptPanelType;
  @Input() panelType: PhxInterceptPanelType;
  @Input() mainHeading: string = '';
  @Input() buttonList: Array<PhxInterceptPanelButtonModel>;
  @Output() clickEmmiter = new EventEmitter<string>();
  imgageSource = '';

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.panelType && changes.panelType.currentValue ) {
      this.setImageSrc();
    }

  }

  emittButtonClick( actionEventName: string) {
    this.clickEmmiter.emit(actionEventName);
  }

  setImageSrc() {

    switch (this.panelType) {

      case PhxInterceptPanelType.comingSoon: {
        this.imgageSource = '/assets/etc/coming_soon.png';
      }
        break;
      case PhxInterceptPanelType.error: {
        this.imgageSource = '/assets/etc/error_cloud.png';
      }
        break;

    }

  }

}
