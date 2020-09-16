import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardExpenseComponent } from './activity-centre-card-expense.component';

describe('ActivityCentreCardExpenseComponent', () => {
  let component: ActivityCentreCardExpenseComponent;
  let fixture: ComponentFixture<ActivityCentreCardExpenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardExpenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
