/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CommissionService } from './commission.service';

describe('Service: Commission', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommissionService]
    });
  });

  it('should ...', inject([CommissionService], (service: CommissionService) => {
    expect(service).toBeTruthy();
  }));
});