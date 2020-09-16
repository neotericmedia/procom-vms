import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAdvancesEditComponent } from './contact-advances-edit.component';

describe('ContactAdvancesEditComponent', () => {
  let component: ContactAdvancesEditComponent;
  let fixture: ComponentFixture<ContactAdvancesEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactAdvancesEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactAdvancesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
