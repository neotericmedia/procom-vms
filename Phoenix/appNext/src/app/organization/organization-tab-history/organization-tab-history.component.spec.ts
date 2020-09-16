import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabHistoryComponent } from './organization-tab-history.component';

describe('OrganizationTabHistoryComponent', () => {
  let component: OrganizationTabHistoryComponent;
  let fixture: ComponentFixture<OrganizationTabHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationTabHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
