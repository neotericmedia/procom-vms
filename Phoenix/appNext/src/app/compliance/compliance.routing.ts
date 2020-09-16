import { RouterModule } from '@angular/router';
import { ComplianceDocumentExpirySearchComponent } from './compliance-document-expiry-search/compliance-document-expiry-search.component';
import { ComplianceDocumentDeclinedSearchComponent } from './compliance-document-declined-search/compliance-document-declined-search.component';
import { DocumentTypeSearchComponent } from './document-type-search/document-type-search.component';
import { DocumentTypeComponent } from './document-type/document-type.component';
import { DocumentTypeDetailComponent } from './document-type-detail/document-type-detail.component';
import { DocumentTypeTemplatesComponent } from './document-type-templates/document-type-templates.component';
import { DocumentTypeHistoryComponent } from './document-type-history/document-type-history.component';
import { DocumentRuleSearchComponent } from './document-rule-search/document-rule-search.component';
import { ComplianceTemplateSearchComponent } from './compliance-template-search/compliance-template-search.component';
import { ComplianceTemplateDetailComponent } from './compliance-template-detail/compliance-template-detail.component';
import { ComplianceTemplateComponent } from './compliance-template/compliance-template.component';
import { ComplianceTemplateHistoryComponent } from './compliance-template-history/compliance-template-history.component';
import { DocumentTypeRulesComponent } from './document-type-rules/document-type-rules.component';
import { ComplianceDocumentSearchComponent } from './compliance-document-search/compliance-document-search.component';
import { ComplianceDocumentViewComponent } from './compliance-document-view/compliance-document-view.component';
// import { DocumentRuleAreaTypeSearchComponent } from '../compliance/document-rule-area-type-search/document-rule-area-type-search.component';

export const ComplianceRouting = RouterModule.forChild([
  // { path: 'type', component: DocumentRuleAreaTypeSearchComponent, pathMatch: 'full' },
  { path: 'document-view/:id/:entityTypeId/:entityId', component: ComplianceDocumentViewComponent },
  { path: 'document-view', component: ComplianceDocumentViewComponent },
  {
    path: 'searchx', component: ComplianceDocumentSearchComponent, pathMatch: 'full',
  },
  {
    path: 'search/expiry-documents', component: ComplianceDocumentExpirySearchComponent, pathMatch: 'full',
    data: {
      dataSourceUrl: 'ComplianceDocument/getListComplianceDocumentExpiry',
      dataGridComponentName: 'ComplianceDocumentExpiry',
      pageTitleKey: 'ComplianceDocumentExpiry',
    }
  },
  {
    path: 'search/declined-documents', component: ComplianceDocumentDeclinedSearchComponent, pathMatch: 'full',
    data: {
      dataSourceUrl: 'ComplianceDocument/getListComplianceDocumentDeclined',
      dataGridComponentName: 'ComplianceDocumentDeclined',
      pageTitleKey: 'ComplianceDocumentDeclined',
    }
  },
  // { path: 'type', component: DocumentRuleAreaTypeSearchComponent, pathMatch: 'full' },
  {
    path: 'document-type',
    children: [
      { path: 'search', component: DocumentTypeSearchComponent, pathMatch: 'full' },
      {
        path: ':Id', component: DocumentTypeComponent,
        children: [
          { path: 'detail', component: DocumentTypeDetailComponent },
          { path: 'templates', component: DocumentTypeTemplatesComponent },
          { path: 'history', component: DocumentTypeHistoryComponent },
          { path: 'rules', component: DocumentTypeRulesComponent },
          { path: '**', component: DocumentTypeDetailComponent, pathMatch: 'full' },
        ]
      }
    ]
  },
  {
    path: 'template',
    children: [
      { path: 'search', component: ComplianceTemplateSearchComponent, pathMatch: 'full' },
      {
        path: ':Id', component: ComplianceTemplateComponent,
        children: [
          { path: 'detail', component: ComplianceTemplateDetailComponent },
          { path: 'history', component: ComplianceTemplateHistoryComponent },
          { path: '**', component: ComplianceTemplateDetailComponent, pathMatch: 'full' },
        ]
      }
    ]
  },
  {
    path: 'document-rule',
    children: [
      // { path: 'type', component: DocumentRuleAreaTypeSearchComponent, pathMatch: 'full' },
      { path: 'search/:ruleAreaTypeId', component: DocumentRuleSearchComponent, pathMatch: 'full' },
      { path: 'search/:ruleAreaTypeId/:selectedClientId', component: DocumentRuleSearchComponent, pathMatch: 'full' }
    ]
  }
]);
