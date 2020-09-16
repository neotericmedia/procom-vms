import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactTabNotesComponent } from './contact-tab-notes.component';

describe('ContactTabNotesComponent', () => {
  let component: ContactTabNotesComponent;
  let fixture: ComponentFixture<ContactTabNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactTabNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactTabNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
