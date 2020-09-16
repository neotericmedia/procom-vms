import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardFooterComponent } from './activity-centre-card-footer.component';

describe('ActivityCentreCardFooterComponent', () => {
  let component: ActivityCentreCardFooterComponent;
  let fixture: ComponentFixture<ActivityCentreCardFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
