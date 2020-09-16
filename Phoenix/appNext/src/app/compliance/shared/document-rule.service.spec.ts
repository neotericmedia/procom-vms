import { TestBed, inject } from '@angular/core/testing';

import { DocumentRuleService } from './document-rule.service';

describe('DocumentRuleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocumentRuleService]
    });
  });

  it('should be created', inject([DocumentRuleService], (service: DocumentRuleService) => {
    expect(service).toBeTruthy();
  }));
});
