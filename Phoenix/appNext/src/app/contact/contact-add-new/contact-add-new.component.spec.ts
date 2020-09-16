import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAddNewComponent } from './contact-add-new.component';

describe('ContactAddNewComponent', () => {
  let component: ContactAddNewComponent;
  let fixture: ComponentFixture<ContactAddNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactAddNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactAddNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
