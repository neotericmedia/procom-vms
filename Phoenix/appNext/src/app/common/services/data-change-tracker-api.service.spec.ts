/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DataChangeTrackerApiService } from './data-change-tracker-api.service';

describe('Service: DataChangeTrackerApi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataChangeTrackerApiService]
    });
  });

  it('should ...', inject([DataChangeTrackerApiService], (service: DataChangeTrackerApiService) => {
    expect(service).toBeTruthy();
  }));
});