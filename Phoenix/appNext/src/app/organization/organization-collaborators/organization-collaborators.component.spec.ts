import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationCollaboratorsComponent } from './organization-collaborators.component';

describe('OrganizationCollaboratorsComponent', () => {
  let component: OrganizationCollaboratorsComponent;
  let fixture: ComponentFixture<OrganizationCollaboratorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationCollaboratorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationCollaboratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
