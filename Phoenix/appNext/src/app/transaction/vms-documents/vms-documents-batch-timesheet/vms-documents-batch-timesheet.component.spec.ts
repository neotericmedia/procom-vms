import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsDocumentsBatchTimesheetComponent } from './vms-documents-batch-timesheet.component';

describe('VmsDocumentsBatchTimesheetComponent', () => {
  let component: VmsDocumentsBatchTimesheetComponent;
  let fixture: ComponentFixture<VmsDocumentsBatchTimesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsDocumentsBatchTimesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsDocumentsBatchTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
