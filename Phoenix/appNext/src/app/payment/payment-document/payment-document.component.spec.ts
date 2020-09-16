import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDocumentComponent } from './payment-document.component';

describe('PaymentDocumentComponent', () => {
  let component: PaymentDocumentComponent;
  let fixture: ComponentFixture<PaymentDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
