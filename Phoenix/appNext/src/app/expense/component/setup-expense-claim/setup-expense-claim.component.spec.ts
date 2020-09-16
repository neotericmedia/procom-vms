import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupExpenseClaimComponent } from './setup-expense-claim.component';

describe('SetupExpenseClaimComponent', () => {
  let component: SetupExpenseClaimComponent;
  let fixture: ComponentFixture<SetupExpenseClaimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupExpenseClaimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupExpenseClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
