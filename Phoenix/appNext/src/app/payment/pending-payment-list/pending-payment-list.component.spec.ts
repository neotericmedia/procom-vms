import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPaymentListComponent } from './pending-payment-list.component';

describe('PendingPaymentListComponent', () => {
  let component: PendingPaymentListComponent;
  let fixture: ComponentFixture<PendingPaymentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingPaymentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingPaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
