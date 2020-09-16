import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGarnisheePendingReleaseComponent } from './payment-garnishee-pending-release.component';

describe('PaymentGarnisheePendingReleaseComponent', () => {
  let component: PaymentGarnisheePendingReleaseComponent;
  let fixture: ComponentFixture<PaymentGarnisheePendingReleaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentGarnisheePendingReleaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentGarnisheePendingReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
