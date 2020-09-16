import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabContactsComponent } from './organization-tab-contacts.component';

describe('OrganizationTabContactsComponent', () => {
  let component: OrganizationTabContactsComponent;
  let fixture: ComponentFixture<OrganizationTabContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationTabContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
