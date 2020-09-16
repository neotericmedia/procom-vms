import { TestBed, inject } from '@angular/core/testing';

import { ChequeService } from './cheque.service';

describe('ChequeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChequeService]
    });
  });

  it('should ...', inject([ChequeService], (service: ChequeService) => {
    expect(service).toBeTruthy();
  }));
});
