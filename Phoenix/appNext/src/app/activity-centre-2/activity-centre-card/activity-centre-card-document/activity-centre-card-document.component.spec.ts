import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardDocumentComponent } from './activity-centre-card-document.component';

describe('ActivityCentreCardDocumentComponent', () => {
  let component: ActivityCentreCardDocumentComponent;
  let fixture: ComponentFixture<ActivityCentreCardDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
