import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabAdvancesComponent } from './organization-tab-advances.component';

describe('OrganizationTabAdvancesComponent', () => {
  let component: OrganizationTabAdvancesComponent;
  let fixture: ComponentFixture<OrganizationTabAdvancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationTabAdvancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabAdvancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
