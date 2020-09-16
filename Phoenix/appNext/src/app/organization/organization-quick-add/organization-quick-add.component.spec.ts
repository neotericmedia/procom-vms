import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationQuickAddComponent } from './organization-quick-add.component';

describe('OrganizationQuickAddComponent', () => {
  let component: OrganizationQuickAddComponent;
  let fixture: ComponentFixture<OrganizationQuickAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationQuickAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationQuickAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
