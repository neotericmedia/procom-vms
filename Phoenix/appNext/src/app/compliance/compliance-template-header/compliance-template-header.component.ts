import { Component, OnInit, Input } from '@angular/core';
import { ComplianceTemplate } from '../shared/index';
import { CommonService } from '../../common/index';


@Component({
  selector: 'app-compliance-template-header',
  templateUrl: './compliance-template-header.component.html',
  styleUrls: ['./compliance-template-header.component.less']
})
export class ComplianceTemplateHeaderComponent implements OnInit {

  @Input() template: ComplianceTemplate;

  codeValueGroups: any;

  constructor(
    private commonService: CommonService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
  }

}
