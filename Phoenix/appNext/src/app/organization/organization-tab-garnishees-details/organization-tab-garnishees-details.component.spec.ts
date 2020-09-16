import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabGarnisheesDetailsComponent } from './organization-tab-garnishees-details.component';

describe('OrganizationTabGarnisheesDetailsComponent', () => {
  let component: OrganizationTabGarnisheesDetailsComponent;
  let fixture: ComponentFixture<OrganizationTabGarnisheesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationTabGarnisheesDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabGarnisheesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
