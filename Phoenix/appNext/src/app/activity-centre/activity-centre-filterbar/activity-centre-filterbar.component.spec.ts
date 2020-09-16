import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreFilterbarComponent } from './activity-centre-filterbar.component';

describe('ActivityCentreFilterbarComponent', () => {
  let component: ActivityCentreFilterbarComponent;
  let fixture: ComponentFixture<ActivityCentreFilterbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreFilterbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreFilterbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
