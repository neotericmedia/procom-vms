import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseClaimSummaryComponent } from './expense-claim-summary.component';

describe('ExpenseClaimSummaryComponent', () => {
  let component: ExpenseClaimSummaryComponent;
  let fixture: ComponentFixture<ExpenseClaimSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseClaimSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseClaimSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
