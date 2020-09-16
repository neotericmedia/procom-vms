import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsTransactionDiscountConflictSearchComponent } from './vms-transaction-discount-conflict-search.component';

describe('VmsTransactionDiscountConflictSearchComponent', () => {
  let component: VmsTransactionDiscountConflictSearchComponent;
  let fixture: ComponentFixture<VmsTransactionDiscountConflictSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsTransactionDiscountConflictSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsTransactionDiscountConflictSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
