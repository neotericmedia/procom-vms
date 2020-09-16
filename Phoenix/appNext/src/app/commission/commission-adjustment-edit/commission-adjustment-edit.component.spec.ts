import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAdjustmentEditComponent } from './commission-adjustment-edit.component';

describe('CommissionAdjustmentEditComponent', () => {
  let component: CommissionAdjustmentEditComponent;
  let fixture: ComponentFixture<CommissionAdjustmentEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionAdjustmentEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAdjustmentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
