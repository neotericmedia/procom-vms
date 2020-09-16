import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactProfilePaymentMethodsComponent } from './contact-profile-payment-methods.component';

describe('ContactProfilePaymentMethodsComponent', () => {
  let component: ContactProfilePaymentMethodsComponent;
  let fixture: ComponentFixture<ContactProfilePaymentMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactProfilePaymentMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactProfilePaymentMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
