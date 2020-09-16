import { WorkerCompensation } from './../WorkerCompensation';
import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-WorkerCompensationDetails',
  templateUrl: './WorkerCompensationDetails.component.html',
  styleUrls: ['./WorkerCompensationDetails.component.css']
})
export class WorkerCompensationDetailsComponent implements OnInit {

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

