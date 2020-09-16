import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAdvancesNewComponent } from './organization-advances-new.component';

describe('OrganizationAdvancesNewComponent', () => {
  let component: OrganizationAdvancesNewComponent;
  let fixture: ComponentFixture<OrganizationAdvancesNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationAdvancesNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationAdvancesNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
