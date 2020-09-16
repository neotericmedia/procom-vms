import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-phx-slider',
  templateUrl: './phx-slider.component.html',
  styleUrls: ['./phx-slider.component.less']
})
export class PhxSliderComponent implements OnInit {

  @Input() showSlider: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
