import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchGroupedByPayeeDialogComponent } from './batch-grouped-by-payee-dialog.component';

describe('BatchGroupedByPayeeDialogComponent', () => {
  let component: BatchGroupedByPayeeDialogComponent;
  let fixture: ComponentFixture<BatchGroupedByPayeeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchGroupedByPayeeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchGroupedByPayeeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
