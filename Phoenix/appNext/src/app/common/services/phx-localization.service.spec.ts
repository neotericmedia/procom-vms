import { TestBed, inject } from '@angular/core/testing';

import { PhxLocalizationService } from './phx-localization.service';

describe('PhxLocalizationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhxLocalizationService]
    });
  });

  it('should be created', inject([PhxLocalizationService], (service: PhxLocalizationService) => {
    expect(service).toBeTruthy();
  }));
});
