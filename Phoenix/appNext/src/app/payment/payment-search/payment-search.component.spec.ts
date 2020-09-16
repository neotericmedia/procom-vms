import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSearchComponent } from './payment-search.component';

describe('PaymentSearchComponent', () => {
  let component: PaymentSearchComponent;
  let fixture: ComponentFixture<PaymentSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
