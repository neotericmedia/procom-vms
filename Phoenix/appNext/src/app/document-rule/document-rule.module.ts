import { DxDataGridModule, DxTreeViewModule } from 'devextreme-angular';
import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PhoenixCommonModule } from '../common/PhoenixCommon.module';
import { PhxDocumentFileUploadModule } from '../common/components/phx-document-file-upload/phx-document-file-upload.module';
import { RestrictionModule } from '../restriction/restriction.module';
// import { DocumentRuleObservableService } from './state/document-rule.observable.service';

import { DocumentRuleRouting } from './document-rule.routing';

import { DocumentRuleComponent } from './document-rule/document-rule.component';
import { DocumentRuleObservableService } from './state/document-rule.observable.service';
import { DocumentRuleHeaderComponent } from './document-rule-header/document-rule-header.component';
import { DocumentRuleDetailsComponent } from './document-rule-details/document-rule-details.component';
import { DocumentRuleApiServiceLocator } from './document-rule.api.service.locator';
import { DocumentRuleService } from './shared/document-rule.service';
import { DocumentRuleTabRulesComponent } from './document-rule-tab-rules/document-rule-tab-rules.component';
import { DocumentRuleTabHistoryComponent } from './document-rule-tab-history/document-rule-tab-history.component';
import { DocumentRuleTypeSearchComponent } from './document-rule-type-search/document-rule-type-search.component';
import { OrganizationApiService } from '../organization/organization.api.service';
import { ComplianceModule } from '../compliance/compliance.module';
// export * from './shared/common-methods.service';

@NgModule({
  imports: [CommonModule,
    DocumentRuleRouting,
    PhxDocumentFileUploadModule,
    PhoenixCommonModule,
    DxDataGridModule,
    DxTreeViewModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    RestrictionModule,
    ComplianceModule
  ],
  exports: [],
  declarations: [
    DocumentRuleComponent,
    DocumentRuleHeaderComponent,
    DocumentRuleDetailsComponent,
    DocumentRuleTabRulesComponent,
    DocumentRuleTabHistoryComponent,
    DocumentRuleTypeSearchComponent
  ],
  providers: [
    DocumentRuleService,
    DocumentRuleObservableService,
    OrganizationApiService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DocumentRuleModule {
  constructor(private injector: Injector) {
    DocumentRuleApiServiceLocator.injector = this.injector;
  }
}
