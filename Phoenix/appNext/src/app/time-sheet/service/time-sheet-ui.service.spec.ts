import { TestBed, inject } from '@angular/core/testing';

import { TimeSheetUiService } from './time-sheet-ui.service';

describe('TimeSheetUiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeSheetUiService]
    });
  });

  it('should ...', inject([TimeSheetUiService], (service: TimeSheetUiService) => {
    expect(service).toBeTruthy();
  }));
});
