import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetExceptionsComponent } from './time-sheet-exceptions.component';

describe('TimeSheetExceptionsComponent', () => {
  let component: TimeSheetExceptionsComponent;
  let fixture: ComponentFixture<TimeSheetExceptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetExceptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetExceptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
