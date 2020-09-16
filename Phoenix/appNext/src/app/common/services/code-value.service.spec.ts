import { TestBed, inject } from '@angular/core/testing';

import { CodeValueService } from './code-value.service';

describe('CodeValueService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CodeValueService]
    });
  });

  it('should ...', inject([CodeValueService], (service: CodeValueService) => {
    expect(service).toBeTruthy();
  }));
});
