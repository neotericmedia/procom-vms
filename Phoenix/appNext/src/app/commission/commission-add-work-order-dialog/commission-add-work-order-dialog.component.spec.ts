import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAddWorkOrderDialogComponent } from './commission-add-work-order-dialog.component';

describe('CommissionAddWorkOrderDialogComponent', () => {
  let component: CommissionAddWorkOrderDialogComponent;
  let fixture: ComponentFixture<CommissionAddWorkOrderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionAddWorkOrderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAddWorkOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
