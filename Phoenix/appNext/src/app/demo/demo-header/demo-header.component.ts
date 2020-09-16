import { Component, OnInit, Input } from '@angular/core';
import { Demo } from '../shared/index';
import { CommonService } from '../../common/index';

@Component({
  selector: 'app-demo-header',
  templateUrl: './demo-header.component.html',
  styleUrls: ['./demo-header.component.less']
})
export class DemoHeaderComponent implements OnInit {
  @Input() demo: Demo;

  codeValueGroups: any;

  constructor(private commonService: CommonService) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
  }

}
