import { Component, OnInit, HostListener, Input } from '@angular/core';
import { PhxButton } from '../../model/phx-button';
import { PhxConstants } from '../../model/phx-constants';

@Component({
  selector: 'app-phx-responsive-buttons',
  templateUrl: './phx-responsive-buttons.component.html',
  styleUrls: ['./phx-responsive-buttons.component.less']
})
export class PhxResponsiveButtonsComponent implements OnInit {
  @Input() buttons: PhxButton[];
  @Input() placedOnModal: boolean = false;
  @Input() btnClasses: string[] = [];

  isMobile = false;
  @HostListener('window:resize', ['$event']) onResize(event) {
    this.isWindowMobileSize(event.target);
  }

  constructor() { }

  ngOnInit() {
    this.isWindowMobileSize(window);
  }

  isWindowMobileSize(window) {
    this.isMobile = window.innerWidth < PhxConstants.MOBILE_WIDTH;
  }

  onButtonClick(button: PhxButton) {
    button.action();
  }

}
