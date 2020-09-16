import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationBranchDetailsComponent } from './organization-branch-details.component';

describe('OrganizationBranchDetailsComponent', () => {
  let component: OrganizationBranchDetailsComponent;
  let fixture: ComponentFixture<OrganizationBranchDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationBranchDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationBranchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
