import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetProjectsComponent } from './time-sheet-projects.component';

describe('TimeSheetProjectsComponent', () => {
  let component: TimeSheetProjectsComponent;
  let fixture: ComponentFixture<TimeSheetProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
