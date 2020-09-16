import { TestBed, inject } from '@angular/core/testing';

import { T4Service } from './t4.service';

describe('T4Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [T4Service]
    });
  });

  it('should be created', inject([T4Service], (service: T4Service) => {
    expect(service).toBeTruthy();
  }));
});
