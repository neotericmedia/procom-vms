import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreHeaderComponent } from './activity-centre-header.component';

describe('ActivityCentreHeaderComponent', () => {
  let component: ActivityCentreHeaderComponent;
  let fixture: ComponentFixture<ActivityCentreHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
