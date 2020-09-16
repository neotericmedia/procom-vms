import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardOrganizationComponent } from './activity-centre-card-organization.component';

describe('ActivityCentreCardOrganizationComponent', () => {
  let component: ActivityCentreCardOrganizationComponent;
  let fixture: ComponentFixture<ActivityCentreCardOrganizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardOrganizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
