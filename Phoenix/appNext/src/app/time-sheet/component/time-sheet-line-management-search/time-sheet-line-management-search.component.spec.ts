import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetLineManagementSearchComponent } from './time-sheet-line-management-search.component';

describe('TimeSheetLineManagementSearchComponent', () => {
  let component: TimeSheetLineManagementSearchComponent;
  let fixture: ComponentFixture<TimeSheetLineManagementSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetLineManagementSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetLineManagementSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
