import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionWorkflowComponent } from './subscription-workflow.component';

describe('SubscriptionWorkflowComponent', () => {
  let component: SubscriptionWorkflowComponent;
  let fixture: ComponentFixture<SubscriptionWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
