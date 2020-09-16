import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreSummaryComponent } from './activity-centre-summary.component';

describe('ActivityCentreSummaryComponent', () => {
  let component: ActivityCentreSummaryComponent;
  let fixture: ComponentFixture<ActivityCentreSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
