import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderRebateVmsfeeComponent } from './workorder-rebate-vmsfee.component';

describe('WorkorderRebateVmsfeeComponent', () => {
  let component: WorkorderRebateVmsfeeComponent;
  let fixture: ComponentFixture<WorkorderRebateVmsfeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderRebateVmsfeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderRebateVmsfeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
