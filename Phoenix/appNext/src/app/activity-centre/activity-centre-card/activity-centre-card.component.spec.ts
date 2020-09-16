import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardComponent } from './activity-centre-card.component';

describe('ActivityCentreCardComponent', () => {
  let component: ActivityCentreCardComponent;
  let fixture: ComponentFixture<ActivityCentreCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
