import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPurchaseOrderComponent } from './transaction-purchase-order.component';

describe('TransactionPurchaseOrderComponent', () => {
  let component: TransactionPurchaseOrderComponent;
  let fixture: ComponentFixture<TransactionPurchaseOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionPurchaseOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
