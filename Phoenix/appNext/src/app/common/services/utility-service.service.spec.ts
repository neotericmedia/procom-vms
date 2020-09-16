import { TestBed, inject } from '@angular/core/testing';

import { UtilityService } from './utility-service.service';

describe('UtilityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilityService]
    });
  });

  it('should ...', inject([UtilityService], (service: UtilityService) => {
    expect(service).toBeTruthy();
  }));
});
