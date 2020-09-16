import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderPaymentContactComponent } from './workorder-payment-contact.component';

describe('WorkorderPaymentContactComponent', () => {
  let component: WorkorderPaymentContactComponent;
  let fixture: ComponentFixture<WorkorderPaymentContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderPaymentContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderPaymentContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
