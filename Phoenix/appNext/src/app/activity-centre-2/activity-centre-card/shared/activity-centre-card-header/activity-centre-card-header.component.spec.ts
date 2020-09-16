import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardHeaderComponent } from './activity-centre-card-header.component';

describe('ActivityCentreCardHeaderComponent', () => {
  let component: ActivityCentreCardHeaderComponent;
  let fixture: ComponentFixture<ActivityCentreCardHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
