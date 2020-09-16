import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetCellDateComponent } from './time-sheet-cell-date.component';

describe('TimeSheetCellDateComponent', () => {
  let component: TimeSheetCellDateComponent;
  let fixture: ComponentFixture<TimeSheetCellDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetCellDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetCellDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
