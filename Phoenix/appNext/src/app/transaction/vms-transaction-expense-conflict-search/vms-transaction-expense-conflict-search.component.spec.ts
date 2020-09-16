import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsTransactionExpenseConflictSearchComponent } from './vms-transaction-expense-conflict-search.component';

describe('VmsTransactionExpenseConflictSearchComponent', () => {
  let component: VmsTransactionExpenseConflictSearchComponent;
  let fixture: ComponentFixture<VmsTransactionExpenseConflictSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsTransactionExpenseConflictSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsTransactionExpenseConflictSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
