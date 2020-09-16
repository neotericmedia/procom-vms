/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WorkorderService } from './workorder.service';

describe('Service: Workorder', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkorderService]
    });
  });

  it('should ...', inject([WorkorderService], (service: WorkorderService) => {
    expect(service).toBeTruthy();
  }));
});