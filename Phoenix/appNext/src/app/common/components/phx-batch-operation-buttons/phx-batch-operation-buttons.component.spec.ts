import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxBatchOperationButtonsComponent } from './phx-batch-operation-buttons.component';

describe('PhxBatchOperationButtonsComponent', () => {
  let component: PhxBatchOperationButtonsComponent;
  let fixture: ComponentFixture<PhxBatchOperationButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxBatchOperationButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxBatchOperationButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
