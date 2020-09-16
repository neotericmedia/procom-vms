import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-phx-dialog-wait-template',
  templateUrl: './phx-dialog-wait-template.component.html',
  styleUrls: ['./phx-dialog-wait-template.component.less']
})
export class PhxDialogWaitTemplateComponent implements OnInit {

  @Input() title: string;
  @Input() message: string;
  @Input() getProgressFn: () => number;
  @Input() modalRefHide: () => void;

  constructor() {}

  ngOnInit() {
  }

  close() {
    if (this.modalRefHide) {
      this.modalRefHide();
    } else {
      console.error('modalRefHide is required');
    }
  }

  getProgress() {
    return this.getProgressFn ? this.getProgressFn() : 100;
  }

}
