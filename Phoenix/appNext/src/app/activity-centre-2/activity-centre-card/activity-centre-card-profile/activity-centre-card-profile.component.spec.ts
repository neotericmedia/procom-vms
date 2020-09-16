import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardProfileComponent } from './activity-centre-card-profile.component';

describe('ActivityCentreCardProfileComponent', () => {
  let component: ActivityCentreCardProfileComponent;
  let fixture: ComponentFixture<ActivityCentreCardProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
