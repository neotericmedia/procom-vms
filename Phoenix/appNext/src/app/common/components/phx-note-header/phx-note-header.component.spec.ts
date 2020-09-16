import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxNoteHeaderComponent } from './phx-note-header.component';

describe('PhxNoteHeaderComponent', () => {
  let component: PhxNoteHeaderComponent;
  let fixture: ComponentFixture<PhxNoteHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxNoteHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxNoteHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
