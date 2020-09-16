import { TestBed, inject } from '@angular/core/testing';

import { ComplianceTemplateService } from './compliance-template.service';

describe('ComplianceTemplateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComplianceTemplateService]
    });
  });

  it('should be created', inject([ComplianceTemplateService], (service: ComplianceTemplateService) => {
    expect(service).toBeTruthy();
  }));
});
