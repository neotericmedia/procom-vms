import { TestBed, inject } from '@angular/core/testing';

import { PhxDataTableService } from './phx-data-table.service';

describe('PhxDataTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhxDataTableService]
    });
  });

  it('should ...', inject([PhxDataTableService], (service: PhxDataTableService) => {
    expect(service).toBeTruthy();
  }));
});
