import { WorkerCompensation } from './../WorkerCompensation';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-WorkerCompensationHeader',
  templateUrl: './WorkerCompensationHeader.component.html',
  styleUrls: ['./WorkerCompensationHeader.component.css']
})
export class WorkerCompensationHeaderComponent implements OnInit {
  private _wc:WorkerCompensation;
  constructor() { }
  @Input()
  set wc(wc:WorkerCompensation){
    this._wc = wc;
  }
  get wc():WorkerCompensation{
    return this._wc;
  }
  ngOnInit() {
  }

}