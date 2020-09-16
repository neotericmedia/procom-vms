/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OrganizationApiService } from './organization.api.service';

describe('Service: OrganizationApi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationApiService]
    });
  });

  it(
    'should ...',
    inject([OrganizationApiService], (service: OrganizationApiService) => {
      expect(service).toBeTruthy();
    })
  );
});
