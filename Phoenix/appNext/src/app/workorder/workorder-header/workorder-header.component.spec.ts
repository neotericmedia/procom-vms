import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderHeaderComponent } from './workorder-header.component';

describe('OrganizationHeaderComponent', () => {
  let component: WorkorderHeaderComponent;
  let fixture: ComponentFixture<WorkorderHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
