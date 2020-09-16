import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseClaimHistoryComponent } from './expense-claim-history.component';

describe('ExpenseClaimHistoryComponent', () => {
  let component: ExpenseClaimHistoryComponent;
  let fixture: ComponentFixture<ExpenseClaimHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseClaimHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseClaimHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
