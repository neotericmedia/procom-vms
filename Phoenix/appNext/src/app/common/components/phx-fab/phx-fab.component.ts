import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PhxButton } from '../../model';

@Component({
  selector: 'app-phx-fab',
  templateUrl: './phx-fab.component.html',
  styleUrls: ['./phx-fab.component.less']
})
export class PhxFabComponent implements OnInit {
  @Input() fabIcon: string = 'more_vert';
  @Input() fabButtons: PhxButton[];

  @ViewChild('fab') fab: ElementRef;

  constructor() { }

  onMainButtonClick() {
    if (this.fabButtons && this.fabButtons.length === 1) {
      this.fabButtons[0].action();
    }
  }

  onFabButtonClick(button: PhxButton) {
    this.fab.nativeElement.className = this.fab.nativeElement.className.replace('active', '');
    button.action();
  }

  ngOnInit() {
  }
}
