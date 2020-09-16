import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderTabPurchaseorderLinesComponent } from './workorder-tab-purchaseorder-lines.component';

describe('WorkorderTabPurchaseorderLinesComponent', () => {
  let component: WorkorderTabPurchaseorderLinesComponent;
  let fixture: ComponentFixture<WorkorderTabPurchaseorderLinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderTabPurchaseorderLinesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderTabPurchaseorderLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
