import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAdvancesComponent } from './contact-advances.component';

describe('ContactAdvancesComponent', () => {
  let component: ContactAdvancesComponent;
  let fixture: ComponentFixture<ContactAdvancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactAdvancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactAdvancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
