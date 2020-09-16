import { Component, OnInit } from '@angular/core';
import { DocumentRulePresentationalBase } from '../document-rule-presentational-base';
import { IDocumentRuleDetails, IComplianceDocumentRuleUserDefinedDocumentType, IFormGroupSetup, IDocumentRule } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { DocumentRuleService } from '../shared/document-rule.service';
import { FormGroup, ControlsConfig, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentRuleObservableService } from '../state/document-rule.observable.service';
import { Validators } from '@angular/forms';
import { CodeValueService, CommonService } from '../../common';

declare var oreq: any;

@Component({
    selector: 'app-document-rule-type-search',
    templateUrl: './document-rule-type-search.component.html',
    styleUrls: ['./document-rule-type-search.component.less']
})
export class DocumentRuleTypeSearchComponent implements OnInit {
    html: {
        listComplianceDocumentRuleAreaType: any[];
        codeValueGroups: any;
    } = {
            codeValueGroups: null,
            listComplianceDocumentRuleAreaType: []
        };

    constructor(private docRuleService: DocumentRuleService,
        private commonService: CommonService,
        private documentRuleService: DocumentRuleService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private codeValueService: CodeValueService) {
    }

    ngOnInit() { 
        this.html.codeValueGroups = this.commonService.CodeValueGroups;
        this.html.listComplianceDocumentRuleAreaType = this.codeValueService.getCodeValues(this.html.codeValueGroups.ComplianceDocumentRuleAreaType, true);
    }

    onGo(id: number) {
        this.router.navigateByUrl(`/next/compliance/document-rule/search/${id}`);
    }

}
