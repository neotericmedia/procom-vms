import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderBillingRecipientComponent } from './workorder-billing-recipient.component';

describe('WorkorderBillingRecipientComponent', () => {
  let component: WorkorderBillingRecipientComponent;
  let fixture: ComponentFixture<WorkorderBillingRecipientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderBillingRecipientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderBillingRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
