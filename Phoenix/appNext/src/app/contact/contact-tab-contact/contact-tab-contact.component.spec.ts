import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactTabContactComponent } from './contact-tab-contact.component';

describe('ContactTabContactComponent', () => {
  let component: ContactTabContactComponent;
  let fixture: ComponentFixture<ContactTabContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactTabContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactTabContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
