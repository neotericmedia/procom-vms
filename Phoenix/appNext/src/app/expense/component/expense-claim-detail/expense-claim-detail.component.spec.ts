import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseClaimDetailComponent } from './expense-claim-detail.component';

describe('ExpenseClaimDetailComponent', () => {
  let component: ExpenseClaimDetailComponent;
  let fixture: ComponentFixture<ExpenseClaimDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseClaimDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseClaimDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
