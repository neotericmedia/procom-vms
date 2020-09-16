import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountForgotPasswordComponent } from './account-forgot-password.component';

describe('AccountForgotPasswordComponent', () => {
  let component: AccountForgotPasswordComponent;
  let fixture: ComponentFixture<AccountForgotPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountForgotPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
