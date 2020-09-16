// angular
import { AuthService } from '../common/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { DocumentRuleBaseComponentPresentational } from './document-rule-base-component-presentational';
import { IDocumentRule } from './state';
import { DocumentRuleObservableService } from './state/document-rule.observable.service';
import { DocumentRuleApiServiceLocator } from './document-rule.api.service.locator';
import { DocumentRuleService } from './shared/document-rule.service';

export abstract class DocumentRulePresentationalBase<T> extends DocumentRuleBaseComponentPresentational<T> {

  private _currentDocumentRule: IDocumentRule;

  protected stateParams: {
    tabId: string;
    documentRuleId: number;
  } = {
    documentRuleId: 0,
    tabId: ''
  };

  public get currentDocumentRule(): IDocumentRule {
    return this._currentDocumentRule;
  }

  protected isDraftStatus: boolean;

  constructor(componentName: string,
    protected documentRuleObservableService: DocumentRuleObservableService,
    public activatedRoute: ActivatedRoute,
    protected documentRuleService: DocumentRuleService) {
    super(componentName);

    this.documentRuleObservableService.profileOnRouteChange$(this, false).subscribe((response: IDocumentRule) => {
      if (response) {
        this._currentDocumentRule = response;
      }
    });

    this.activatedRoute.params.subscribe(params => {
      this.stateParams.documentRuleId = params.documentRuleId;
      this.stateParams.tabId = params.tabId;
    });
  }
}
