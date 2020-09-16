import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingTransactionComponent } from './billing-transaction.component';

describe('BillingTransactionComponent', () => {
  let component: BillingTransactionComponent;
  let fixture: ComponentFixture<BillingTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
