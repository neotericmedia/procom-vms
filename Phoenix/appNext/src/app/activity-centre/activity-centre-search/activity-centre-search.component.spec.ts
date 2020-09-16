import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreSearchComponent } from './activity-centre-search.component';

describe('ActivityCentreSearchComponent', () => {
  let component: ActivityCentreSearchComponent;
  let fixture: ComponentFixture<ActivityCentreSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
