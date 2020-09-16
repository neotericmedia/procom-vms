import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInprogressChequeListComponent } from './payment-inprogress-cheque-list.component';

describe('PaymentInprogressChequeListComponent', () => {
  let component: PaymentInprogressChequeListComponent;
  let fixture: ComponentFixture<PaymentInprogressChequeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentInprogressChequeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentInprogressChequeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
