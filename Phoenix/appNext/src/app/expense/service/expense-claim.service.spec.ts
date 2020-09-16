import { TestBed, inject } from '@angular/core/testing';

import { ExpenseClaimService } from './expense-claim.service';

describe('ExpenseClaimService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpenseClaimService]
    });
  });

  it('should ...', inject([ExpenseClaimService], (service: ExpenseClaimService) => {
    expect(service).toBeTruthy();
  }));
});
