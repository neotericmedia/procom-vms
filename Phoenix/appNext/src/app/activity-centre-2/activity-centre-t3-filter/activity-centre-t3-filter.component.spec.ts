import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreT3FilterComponent } from './activity-centre-t3-filter.component';

describe('ActivityCentreComponent', () => {
  let component: ActivityCentreT3FilterComponent;
  let fixture: ComponentFixture<ActivityCentreT3FilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreT3FilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreT3FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
