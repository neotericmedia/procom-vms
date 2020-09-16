import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreNavbarComponent } from './activity-centre-navbar.component';

describe('ActivityCentreNavbarComponent', () => {
  let component: ActivityCentreNavbarComponent;
  let fixture: ComponentFixture<ActivityCentreNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
