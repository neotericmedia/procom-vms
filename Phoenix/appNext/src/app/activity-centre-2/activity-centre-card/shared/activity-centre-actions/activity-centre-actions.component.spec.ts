import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreActionsComponent } from './activity-centre-actions.component';

describe('ActivityCentreActionsComponent', () => {
  let component: ActivityCentreActionsComponent;
  let fixture: ComponentFixture<ActivityCentreActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
