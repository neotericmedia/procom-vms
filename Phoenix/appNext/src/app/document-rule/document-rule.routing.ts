import { RouterModule } from '@angular/router';
import { DocumentRuleComponent } from './document-rule/document-rule.component';
import { DocumentRuleTypeSearchComponent } from './document-rule-type-search/document-rule-type-search.component';

export const DocumentRuleRouting = RouterModule.forChild([
  { path: 'ruleareatype/search', component: DocumentRuleTypeSearchComponent, pathMatch: 'full' },
  { path: 'rule/:documentRuleId', component: DocumentRuleComponent, pathMatch: 'full' },
  { path: 'rule/edit/:documentRuleId/:tabId', component: DocumentRuleComponent, pathMatch: 'full' },
]);
