import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactGarnisheesComponent } from './contact-garnishees.component';

describe('ContactGarnisheesComponent', () => {
  let component: ContactGarnisheesComponent;
  let fixture: ComponentFixture<ContactGarnisheesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactGarnisheesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactGarnisheesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
