import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardFieldComponent } from './activity-centre-card-field.component';

describe('ActivityCentreCardFieldComponent', () => {
  let component: ActivityCentreCardFieldComponent;
  let fixture: ComponentFixture<ActivityCentreCardFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
