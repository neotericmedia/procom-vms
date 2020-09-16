import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseClaimComponent } from './expense-claim.component';

describe('ExpenseClaimComponent', () => {
  let component: ExpenseClaimComponent;
  let fixture: ComponentFixture<ExpenseClaimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseClaimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
