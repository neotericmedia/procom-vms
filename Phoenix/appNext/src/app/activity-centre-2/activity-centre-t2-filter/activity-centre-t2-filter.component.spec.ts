import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreT2FilterComponent } from './activity-centre-t2-filter.component';

describe('ActivityCentreT2FilterComponent', () => {
  let component: ActivityCentreT2FilterComponent;
  let fixture: ComponentFixture<ActivityCentreT2FilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreT2FilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreT2FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
