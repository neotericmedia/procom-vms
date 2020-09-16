import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationPrimaryContactComponent } from './organization-primary-contact.component';

describe('OrganizationPrimaryContactComponent', () => {
  let component: OrganizationPrimaryContactComponent;
  let fixture: ComponentFixture<OrganizationPrimaryContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationPrimaryContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationPrimaryContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
