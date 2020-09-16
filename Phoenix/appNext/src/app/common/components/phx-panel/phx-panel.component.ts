import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-phx-panel',
  templateUrl: './phx-panel.component.html',
  styleUrls: ['./phx-panel.component.less']
})
export class PhxPanelComponent {
  @Input() headerTitle: string;

  constructor() { }

}
