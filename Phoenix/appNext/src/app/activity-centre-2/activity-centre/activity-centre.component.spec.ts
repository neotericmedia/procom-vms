import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreComponent } from './activity-centre.component';

describe('ActivityCentreComponent', () => {
  let component: ActivityCentreComponent;
  let fixture: ComponentFixture<ActivityCentreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
