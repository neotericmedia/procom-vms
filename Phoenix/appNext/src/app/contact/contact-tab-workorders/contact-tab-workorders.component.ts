import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-contact-tab-workorders',
  templateUrl: './contact-tab-workorders.component.html',
  styleUrls: ['./contact-tab-workorders.component.less']
})

export class ContactTabWorkordersComponent implements OnInit {

  @Input() contactId: number;
  constructor() { }

  ngOnInit() {
  }

}
