import { TestBed, inject } from '@angular/core/testing';

import { ClientSpecificFieldsService } from './client-specific-fields.service';

describe('ClientSpecificFieldsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientSpecificFieldsService]
    });
  });

  it('should be created', inject([ClientSpecificFieldsService], (service: ClientSpecificFieldsService) => {
    expect(service).toBeTruthy();
  }));
});
