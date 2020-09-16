import { DxDataGridModule, DxTreeViewModule } from 'devextreme-angular';
import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { RestrictionModule } from '../restriction/restriction.module';

import { ComplianceRouting } from './compliance.routing';
// import { ComplianceDocumentExpirySearchComponent } from './compliance-document-expiry-search/compliance-document-expiry-search.component';
// import { ComplianceDocumentDeclinedSearchComponent } from './compliance-document-declined-search/compliance-document-declined-search.component';
import { DocumentTypeSearchComponent } from './document-type-search/document-type-search.component';
import { DocumentRuleSearchComponent } from './document-rule-search/document-rule-search.component';
import { DocumentTypeComponent } from './document-type/document-type.component';
import { DocumentTypeHeaderComponent } from './document-type-header/document-type-header.component';
import { DocumentTypeDetailComponent } from './document-type-detail/document-type-detail.component';
import { DocumentTypeTemplatesComponent } from './document-type-templates/document-type-templates.component';
import { DocumentTypeHistoryComponent } from './document-type-history/document-type-history.component';
import { DocumentRuleService, DocumentTypeService, ComplianceTemplateService } from './shared/index';
import { ComplianceTemplateComponent } from './compliance-template/compliance-template.component';
import { ComplianceTemplateDetailComponent } from './compliance-template-detail/compliance-template-detail.component';
import { ComplianceTemplateHeaderComponent } from './compliance-template-header/compliance-template-header.component';
import { ComplianceTemplateHistoryComponent } from './compliance-template-history/compliance-template-history.component';
import { ComplianceTemplateFileHistoryComponent } from './compliance-template-file-history/compliance-template-file-history.component';
import { OrganizationApiService } from '../organization/organization.api.service';
import { ComplianceTemplateDocumentFormControlComponent } from './compliance-template-document-form-control/compliance-template-document-form-control.component';
import { DocumentTypeRulesComponent } from './document-type-rules/document-type-rules.component';
import { ComplianceDocumentSearchComponent } from './compliance-document-search/compliance-document-search.component';
import { ComplianceDocumentDialogComplianceTemplateComponent } from './compliance-document-dialog-compliance-template/compliance-document-dialog-compliance-template.component';

import { ComplianceDocumentViewComponent } from './compliance-document-view/compliance-document-view.component';
import { ComplianceDocumentExpirySearchComponent } from './compliance-document-expiry-search/compliance-document-expiry-search.component';
import { ComplianceDocumentDeclinedSearchComponent } from './compliance-document-declined-search/compliance-document-declined-search.component';
import { ComplianceDocumentComponent } from './compliance-document/compliance-document.component';
import { ComplianceDocumentEntityGroupComponent } from './compliance-document-entity-group/compliance-document-entity-group.component';
import { ComplianceDocumentHeaderComponent } from './compliance-document-header/compliance-document-header.component';
import { ComplianceDocumentExpiryDateModalComponent } from './compliance-document-expiry-date-modal/compliance-document-expiry-date-modal.component';
import { ComplianceTemplateSearchComponent } from './compliance-template-search/compliance-template-search.component';
import { ComplianceDocumentWorkflowActionButtonName } from './compliance-document/compliance-document-workflow-action-button-name.pipe';
import { CommonMethodsService } from './shared/common-methods.service';
import { ComplianceDocumentService } from './shared/compliance-document.service';

export * from './shared/common-methods.service';

@NgModule({
  imports: [
    // CommonModule,
    // ComplianceRouting,
    // PhxDocumentFileUploadModule,
    // PhoenixCommonModule,
    // DxDataGridModule,
    // DxTreeViewModule,
    // FormsModule,
    // ReactiveFormsModule,
    // TabsModule.forRoot(),
    // ModalModule.forRoot(),
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ComplianceRouting,
    PhxDocumentFileUploadModule,
    PhoenixCommonModule,
    DxDataGridModule,
    DxTreeViewModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    RestrictionModule,
  ],
  exports: [
    ComplianceDocumentComponent,
    ComplianceTemplateSearchComponent,
  ],
  declarations: [
    ComplianceDocumentComponent,
    ComplianceDocumentEntityGroupComponent,
    ComplianceDocumentHeaderComponent,
    ComplianceDocumentExpiryDateModalComponent,
    ComplianceDocumentViewComponent,
    ComplianceDocumentExpirySearchComponent,
    ComplianceDocumentDeclinedSearchComponent,
    DocumentTypeSearchComponent,
    DocumentRuleSearchComponent,
    DocumentTypeComponent,
    DocumentTypeSearchComponent,
    DocumentTypeHeaderComponent,
    DocumentTypeDetailComponent,
    DocumentTypeTemplatesComponent,
    DocumentTypeHistoryComponent,
    ComplianceTemplateComponent,
    ComplianceTemplateSearchComponent,
    ComplianceTemplateDetailComponent,
    ComplianceTemplateHeaderComponent,
    ComplianceTemplateHistoryComponent,
    ComplianceTemplateFileHistoryComponent,
    ComplianceTemplateDocumentFormControlComponent,
    ComplianceTemplateFileHistoryComponent,
    DocumentTypeRulesComponent,
    ComplianceDocumentSearchComponent,
    ComplianceDocumentDialogComplianceTemplateComponent,
    ComplianceDocumentWorkflowActionButtonName
 ],
  providers: [
    DocumentRuleService,
    DocumentTypeService,
    CommonMethodsService,
    ComplianceDocumentService,
    ComplianceTemplateService,
    DocumentRuleService,
    DocumentTypeService,
    OrganizationApiService
  ]
})
export class ComplianceModule { }

