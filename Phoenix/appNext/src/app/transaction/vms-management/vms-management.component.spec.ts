import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsManagementComponent } from './vms-management.component';

describe('VmsManagementComponent', () => {
  let component: VmsManagementComponent;
  let fixture: ComponentFixture<VmsManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
