import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardLoadingComponent } from './activity-centre-card-loading.component';

describe('ActivityCentreCardLoadingComponent', () => {
  let component: ActivityCentreCardLoadingComponent;
  let fixture: ComponentFixture<ActivityCentreCardLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
