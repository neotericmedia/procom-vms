import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationWorkflowComponent } from './organization-workflow.component';

describe('OrganizationWorkflowComponent', () => {
  let component: OrganizationWorkflowComponent;
  let fixture: ComponentFixture<OrganizationWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
