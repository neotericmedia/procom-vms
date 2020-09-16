/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WorkerCompensationService } from './WorkerCompensation.service';

describe('Service: WorkerCompensation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkerCompensationService]
    });
  });

  it('should ...', inject([WorkerCompensationService], (service: WorkerCompensationService) => {
    expect(service).toBeTruthy();
  }));
});