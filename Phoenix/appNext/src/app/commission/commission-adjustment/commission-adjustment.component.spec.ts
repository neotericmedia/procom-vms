import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAdjustmentComponent } from './commission-adjustment.component';

describe('CommissionAdjustmentComponent', () => {
  let component: CommissionAdjustmentComponent;
  let fixture: ComponentFixture<CommissionAdjustmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionAdjustmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
