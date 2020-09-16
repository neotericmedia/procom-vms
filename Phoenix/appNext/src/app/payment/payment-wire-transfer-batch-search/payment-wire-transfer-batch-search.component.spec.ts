import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentWireTransferBatchSearchComponent } from './payment-wire-transfer-batch-search.component';

describe('PaymentWireTransferBatchSearchComponent', () => {
  let component: PaymentWireTransferBatchSearchComponent;
  let fixture: ComponentFixture<PaymentWireTransferBatchSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentWireTransferBatchSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentWireTransferBatchSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
