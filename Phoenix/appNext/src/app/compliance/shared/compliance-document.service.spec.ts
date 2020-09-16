import { TestBed, inject } from '@angular/core/testing';

import { ComplianceDocumentService } from './compliance-document.service';

describe('ComplianceDocumentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComplianceDocumentService]
    });
  });

  it('should ...', inject([ComplianceDocumentService], (service: ComplianceDocumentService) => {
    expect(service).toBeTruthy();
  }));
});
