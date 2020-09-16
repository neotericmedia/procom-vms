import { Component, OnInit, Input } from '@angular/core';
import { IDocumentRule } from '../state/document-rule.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService, CodeValueService } from '../../common';
import { CodeValue, PhxConstants } from '../../common/model';

@Component({
    selector: 'app-document-rule-tab-history',
    templateUrl: './document-rule-tab-history.component.html',
    styleUrls: ['./document-rule-tab-history.component.less']
})
export class DocumentRuleTabHistoryComponent implements OnInit {
    @Input() documentRule: IDocumentRule;
    html: {
        changeHistoryBlackList: any[];
        phxConstants: typeof PhxConstants;
        codeValueGroups: any;
        listComplianceDocumentRuleAreaType: CodeValue[];
    } = {
            changeHistoryBlackList: [],
            phxConstants: PhxConstants,
            codeValueGroups: null,
            listComplianceDocumentRuleAreaType: []
        };

    constructor(private router: Router, private commonService: CommonService, private codeValueService: CodeValueService, private activatedRoute: ActivatedRoute) {
        this.html.codeValueGroups = this.commonService.CodeValueGroups;
    }

    ngOnInit() {
        this.html.listComplianceDocumentRuleAreaType = this.codeValueService.getCodeValues(this.html.codeValueGroups.ComplianceDocumentRuleAreaType, true);
        this.html.changeHistoryBlackList = [
            { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
            { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
            { TableSchemaName: 'compliance', TableName: 'ComplianceDocumentRuleRequiredSituation', ColumnName: 'ComplianceDocumentRuleRequiredSituationTypeId' },
            { TableSchemaName: 'compliance', TableName: 'ComplianceDocumentRuleProfileVisibility', ColumnName: 'ComplianceDocumentRuleProfileVisibilityTypeId' },
            { TableSchemaName: 'compliance', TableName: 'ComplianceDocumentRuleRestriction', ColumnName: 'ComplianceDocumentRuleRestrictionTypeId' },
            { TableSchemaName: 'compliance', TableName: 'ComplianceDocumentRuleUserDefinedCodeComplianceDocumentType', ColumnName: 'UserDefinedCodeComplianceDocumentTypeId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
            { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
            { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
            { TableSchemaName: '', TableName: '', ColumnName: 'ComplianceDocumentRuleId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
        ];
    }
}
