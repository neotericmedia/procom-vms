import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAdvancesNewComponent } from './contact-advances-new.component';

describe('ContactAdvancesNewComponent', () => {
  let component: ContactAdvancesNewComponent;
  let fixture: ComponentFixture<ContactAdvancesNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactAdvancesNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactAdvancesNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
