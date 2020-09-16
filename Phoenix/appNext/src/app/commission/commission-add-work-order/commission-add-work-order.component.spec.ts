import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAddWorkOrderComponent } from './commission-add-work-order.component';

describe('CommissionAddWorkOrderComponent', () => {
  let component: CommissionAddWorkOrderComponent;
  let fixture: ComponentFixture<CommissionAddWorkOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionAddWorkOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAddWorkOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
