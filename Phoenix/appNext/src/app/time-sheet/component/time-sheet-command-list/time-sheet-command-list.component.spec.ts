import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetCommandListComponent } from './time-sheet-command-list.component';

describe('TimeSheetCommandListComponent', () => {
  let component: TimeSheetCommandListComponent;
  let fixture: ComponentFixture<TimeSheetCommandListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetCommandListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetCommandListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
