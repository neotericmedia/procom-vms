import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactGarnisheeSearchComponent } from './contact-garnishee-search.component';

describe('ContactGarnisheeSearchComponent', () => {
  let component: ContactGarnisheeSearchComponent;
  let fixture: ComponentFixture<ContactGarnisheeSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactGarnisheeSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactGarnisheeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
