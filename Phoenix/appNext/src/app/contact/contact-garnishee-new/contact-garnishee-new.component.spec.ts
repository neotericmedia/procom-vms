import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactGarnisheeNewComponent } from './contact-garnishee-new.component';

describe('ContactGarnisheeNewComponent', () => {
  let component: ContactGarnisheeNewComponent;
  let fixture: ComponentFixture<ContactGarnisheeNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactGarnisheeNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactGarnisheeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
