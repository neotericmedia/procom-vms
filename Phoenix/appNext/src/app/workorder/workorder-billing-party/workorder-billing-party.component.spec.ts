import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderBillingPartyComponent } from './workorder-billing-party.component';

describe('WorkorderBillingPartyComponent', () => {
  let component: WorkorderBillingPartyComponent;
  let fixture: ComponentFixture<WorkorderBillingPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderBillingPartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderBillingPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
