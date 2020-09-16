import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactTabWorkordersComponent } from './contact-tab-workorders.component';

describe('ContactTabWorkordersComponent', () => {
  let component: ContactTabWorkordersComponent;
  let fixture: ComponentFixture<ContactTabWorkordersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactTabWorkordersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactTabWorkordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
