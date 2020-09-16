import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentChequesComponent } from './payment-cheques.component';

describe('PaymentSearchComponent', () => {
  let component: PaymentChequesComponent;
  let fixture: ComponentFixture<PaymentChequesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentChequesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentChequesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
