/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WindowRefService } from './WindowRef.service';

describe('Service: WindowRef', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowRefService]
    });
  });

  it('should ...', inject([WindowRefService], (service: WindowRefService) => {
    expect(service).toBeTruthy();
  }));
});