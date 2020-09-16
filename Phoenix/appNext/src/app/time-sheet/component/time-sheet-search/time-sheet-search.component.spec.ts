import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetSearchComponent } from './time-sheet-search.component';

describe('TimeSheetSearchComponent', () => {
  let component: TimeSheetSearchComponent;
  let fixture: ComponentFixture<TimeSheetSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
