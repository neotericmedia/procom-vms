import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-phx-dialog-notify-template',
  templateUrl: './phx-dialog-notify-template.component.html',
  styleUrls: ['./phx-dialog-notify-template.component.less']
})
export class PhxDialogNotifyTemplateComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() message: string;
  @Input() callbackFn: () => void;
  @Input() modalRefHide: () => void;

  isAlive: boolean = true;
  constructor() {}

  ngOnInit() {
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  close() {
    if (this.modalRefHide) {
      this.modalRefHide();
    } else {
      console.error('modalRefHide is required');
    }
    if (this.callbackFn) {
      this.callbackFn();
    }
  }
}
