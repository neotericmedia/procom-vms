import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreDummyFilterComponent } from './activity-centre-dummy-filter.component';

describe('ActivityCentreComponent', () => {
  let component: ActivityCentreDummyFilterComponent;
  let fixture: ComponentFixture<ActivityCentreDummyFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreDummyFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreDummyFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
