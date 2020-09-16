import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-phx-badged-accordion-group',
  templateUrl: './phx-badged-accordion-group.component.html',
  styleUrls: ['./phx-badged-accordion-group.component.less']
})
export class PhxBadgedAccordionGroupComponent implements OnInit {

  @Input() public heading: string;
  @Input() public panelClass: string;
  @Input() public headerClass: string;
  @Input() public badgeClass: string;
  @Input() public isDisabled: boolean;
  @Input() public badge: string;
  @Input() public isOpen: boolean = false;
  @Input() public showToggle: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
