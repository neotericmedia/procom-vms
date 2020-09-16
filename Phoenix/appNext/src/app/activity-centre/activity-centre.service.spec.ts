import { TestBed, inject } from '@angular/core/testing';

import { ActivityCentreService } from './activity-centre.service';

describe('ActivityCentreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivityCentreService]
    });
  });

  it('should be created', inject([ActivityCentreService], (service: ActivityCentreService) => {
    expect(service).toBeTruthy();
  }));
});
