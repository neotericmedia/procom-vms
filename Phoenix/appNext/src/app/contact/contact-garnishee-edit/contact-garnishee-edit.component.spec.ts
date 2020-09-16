import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactGarnisheeEditComponent } from './contact-garnishee-edit.component';

describe('ContactGarnisheeEditComponent', () => {
  let component: ContactGarnisheeEditComponent;
  let fixture: ComponentFixture<ContactGarnisheeEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactGarnisheeEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactGarnisheeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
