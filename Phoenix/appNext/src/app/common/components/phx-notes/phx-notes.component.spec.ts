import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxNotesComponent } from './phx-notes.component';

describe('PhxNotesComponent', () => {
  let component: PhxNotesComponent;
  let fixture: ComponentFixture<PhxNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
