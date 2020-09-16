import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPaymentsComponent } from './transaction-payments.component';

describe('TransactionPaymentsComponent', () => {
  let component: TransactionPaymentsComponent;
  let fixture: ComponentFixture<TransactionPaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionPaymentsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
