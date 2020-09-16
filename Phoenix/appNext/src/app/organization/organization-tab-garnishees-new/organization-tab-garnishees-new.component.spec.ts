import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabGarnisheesNewComponent } from './organization-tab-garnishees-new.component';

describe('OrganizationTabGarnisheesNewComponent', () => {
  let component: OrganizationTabGarnisheesNewComponent;
  let fixture: ComponentFixture<OrganizationTabGarnisheesNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationTabGarnisheesNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabGarnisheesNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
