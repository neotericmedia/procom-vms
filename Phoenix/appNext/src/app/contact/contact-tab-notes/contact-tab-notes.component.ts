import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PhxConstants } from '../../common';

@Component({
  selector: 'app-contact-tab-notes',
  templateUrl: './contact-tab-notes.component.html',
  styleUrls: ['./contact-tab-notes.component.less']
})

export class ContactTabNotesComponent implements OnInit {

  @Input() contactId: number;
  @Output() refreshNotesCount = new EventEmitter<any>();
  phxConstants: any = PhxConstants;

  constructor() { }

  ngOnInit() {

  }

  updateNotesCount() {
    this.refreshNotesCount.emit();
  }

}
