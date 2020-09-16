import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetNotFoundComponent } from './time-sheet-not-found.component';

describe('TimeSheetNotFoundComponent', () => {
  let component: TimeSheetNotFoundComponent;
  let fixture: ComponentFixture<TimeSheetNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetNotFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
