import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsBatchSearchComponent } from './vms-batch-search.component';

describe('VmsBatchSearchComponent', () => {
  let component: VmsBatchSearchComponent;
  let fixture: ComponentFixture<VmsBatchSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsBatchSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsBatchSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
