import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabDetailComponent } from './organization-tab-detail.component';

describe('OrganizationTabDetailComponent', () => {
  let component: OrganizationTabDetailComponent;
  let fixture: ComponentFixture<OrganizationTabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationTabDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
