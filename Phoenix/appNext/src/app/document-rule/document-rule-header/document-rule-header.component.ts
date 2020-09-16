import { Component, OnInit, Input } from '@angular/core';
import { IDocumentRule } from '../state/document-rule.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService, CodeValueService } from '../../common';
import { CodeValue, PhxConstants } from '../../common/model';

@Component({
  selector: 'app-document-rule-header',
  templateUrl: './document-rule-header.component.html',
  styleUrls: ['./document-rule-header.component.less']
})
export class DocumentRuleHeaderComponent implements OnInit {
  @Input() documentRule: IDocumentRule;
  @Input() ruleTypeId: number;

  html: {
    phxConstants: typeof PhxConstants;
    codeValueGroups: any;
    listComplianceDocumentRuleAreaType: CodeValue[];
  } = {
    phxConstants: PhxConstants,
    codeValueGroups: null,
    listComplianceDocumentRuleAreaType: []
  };

  constructor(private router: Router, private commonService: CommonService, private codeValueService: CodeValueService, private activatedRoute: ActivatedRoute) {
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.html.listComplianceDocumentRuleAreaType = this.codeValueService.getCodeValues(this.html.codeValueGroups.ComplianceDocumentRuleAreaType, true);
  }
}
