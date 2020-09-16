import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsBatchManagementComponent } from './vms-batch-management.component';

describe('VmsBatchManagementComponent', () => {
  let component: VmsBatchManagementComponent;
  let fixture: ComponentFixture<VmsBatchManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsBatchManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsBatchManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
