import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-phx-dialog-error-template',
  templateUrl: './phx-dialog-error-template.component.html',
  styleUrls: ['./phx-dialog-error-template.component.less']
})
export class PhxDialogErrorTemplateComponent implements OnInit {

  @Input() title: string;
  @Input() message: string;
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
}
