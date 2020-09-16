import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-phx-dialog-confirm-template',
  templateUrl: './phx-dialog-confirm-template.component.html',
  styleUrls: ['./phx-dialog-confirm-template.component.less']
})
export class PhxDialogConfirmTemplateComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() message: string;
  @Input() yesCallbackFn: () => void;
  @Input() noCallbackFn: () => void;
  @Input() modalRefHide: () => void;

  isAlive: boolean = true;
  yesFlag: boolean = false;

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    this.isAlive = false;
  }

  yes() {
    this.yesFlag = true;
    this.close();
    if (this.yesCallbackFn) {
      this.yesCallbackFn();
    }
  }

  close() {
    if (this.modalRefHide) {
      this.modalRefHide();
    } else {
      console.error('modalRefHide is required');
    }
    if (this.yesFlag === false && this.noCallbackFn) {
      this.noCallbackFn();
    }
  }
}
