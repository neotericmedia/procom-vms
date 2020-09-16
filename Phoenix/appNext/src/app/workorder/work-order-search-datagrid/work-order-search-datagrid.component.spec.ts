import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderSearchDatagridComponent } from './work-order-search-datagrid.component';

describe('WorkOrderSearchDatagridComponent', () => {
  let component: WorkOrderSearchDatagridComponent;
  let fixture: ComponentFixture<WorkOrderSearchDatagridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderSearchDatagridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderSearchDatagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
