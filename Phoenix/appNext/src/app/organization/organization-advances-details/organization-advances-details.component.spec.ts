import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAdvancesDetailsComponent } from './organization-advances-details.component';

describe('OrganizationAdvancesDetailsComponent', () => {
  let component: OrganizationAdvancesDetailsComponent;
  let fixture: ComponentFixture<OrganizationAdvancesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationAdvancesDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationAdvancesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
