import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderPaymentPartyComponent } from './workorder-payment-party.component';

describe('WorkorderPayementPartyComponent', () => {
  let component: WorkorderPaymentPartyComponent;
  let fixture: ComponentFixture<WorkorderPaymentPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderPaymentPartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderPaymentPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
