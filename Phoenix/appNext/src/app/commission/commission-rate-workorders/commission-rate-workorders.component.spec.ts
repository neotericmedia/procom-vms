import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionRateWorkordersComponent } from './commission-rate-workorders.component';

describe('CommissionRateWorkordersComponent', () => {
  let component: CommissionRateWorkordersComponent;
  let fixture: ComponentFixture<CommissionRateWorkordersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionRateWorkordersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionRateWorkordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
