import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionInvoicesComponent } from './transaction-invoices.component';

describe('TransactionInvoicesComponent', () => {
  let component: TransactionInvoicesComponent;
  let fixture: ComponentFixture<TransactionInvoicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionInvoicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
