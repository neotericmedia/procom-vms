import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabGarnisheesComponent } from './organization-tab-garnishees.component';

describe('OrganizationTabGarnisheesComponent', () => {
  let component: OrganizationTabGarnisheesComponent;
  let fixture: ComponentFixture<OrganizationTabGarnisheesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationTabGarnisheesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabGarnisheesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
