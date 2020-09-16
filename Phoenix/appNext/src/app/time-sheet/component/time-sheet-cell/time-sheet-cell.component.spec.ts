import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetCellComponent } from './time-sheet-cell.component';

describe('TimeSheetCellComponent', () => {
  let component: TimeSheetCellComponent;
  let fixture: ComponentFixture<TimeSheetCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
