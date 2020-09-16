import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceClearingGroupedComponent } from './invoice-clearing-grouped.component';

describe('InvoiceClearingGroupedComponent', () => {
  let component: InvoiceClearingGroupedComponent;
  let fixture: ComponentFixture<InvoiceClearingGroupedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceClearingGroupedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceClearingGroupedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
