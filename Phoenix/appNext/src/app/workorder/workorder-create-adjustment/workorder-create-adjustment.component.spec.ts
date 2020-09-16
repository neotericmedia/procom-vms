import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderCreateAdjustmentComponent } from './workorder-create-adjustment.component';

describe('WorkorderCreateAdjustmentComponent', () => {
  let component: WorkorderCreateAdjustmentComponent;
  let fixture: ComponentFixture<WorkorderCreateAdjustmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderCreateAdjustmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderCreateAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
