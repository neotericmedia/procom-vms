import { TestBed, inject } from '@angular/core/testing';

import { TimeSheetDocumentService } from './time-sheet-document.service';

describe('TimeSheetDocumentActionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeSheetDocumentService]
    });
  });

  it('should ...', inject([TimeSheetDocumentService], (service: TimeSheetDocumentService) => {
    expect(service).toBeTruthy();
  }));
});
