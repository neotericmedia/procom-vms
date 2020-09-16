import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardWorkorderComponent } from './activity-centre-card-workorder.component';

describe('ActivityCentreCardWorkorderComponent', () => {
  let component: ActivityCentreCardWorkorderComponent;
  let fixture: ComponentFixture<ActivityCentreCardWorkorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardWorkorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardWorkorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
