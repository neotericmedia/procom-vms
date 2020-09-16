import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactOrganizationInfoComponent } from './contact-organization-info.component';

describe('ContactOrganizationInfoComponent', () => {
  let component: ContactOrganizationInfoComponent;
  let fixture: ComponentFixture<ContactOrganizationInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactOrganizationInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactOrganizationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
