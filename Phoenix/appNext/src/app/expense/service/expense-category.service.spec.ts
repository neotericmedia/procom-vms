import { TestBed, inject } from '@angular/core/testing';

import { ExpenseCategoryService } from './expense-category.service';

describe('ExpenseCategoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpenseCategoryService]
    });
  });

  it('should ...', inject([ExpenseCategoryService], (service: ExpenseCategoryService) => {
    expect(service).toBeTruthy();
  }));
});
