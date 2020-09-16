import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetHeaderComponent } from './time-sheet-header.component';

describe('TimeSheetHeaderDesktopComponent', () => {
  let component: TimeSheetHeaderComponent;
  let fixture: ComponentFixture<TimeSheetHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
