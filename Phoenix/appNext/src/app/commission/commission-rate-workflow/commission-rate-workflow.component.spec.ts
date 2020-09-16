import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionRateWorkflowComponent } from './commission-rate-workflow.component';

describe('CommissionRateWorkflowComponent', () => {
  let component: CommissionRateWorkflowComponent;
  let fixture: ComponentFixture<CommissionRateWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionRateWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionRateWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
