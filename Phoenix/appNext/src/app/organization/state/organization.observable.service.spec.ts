import { TestBed, inject } from '@angular/core/testing';

import { OrganizationObservableService } from './organization.observable.service';

describe('OrganizationObservableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationObservableService]
    });
  });

  it('should be created', inject([OrganizationObservableService], (service: OrganizationObservableService) => {
    expect(service).toBeTruthy();
  }));
});
