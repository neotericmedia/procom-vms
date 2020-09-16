import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceClearingListComponent } from './invoice-clearing-list.component';

describe('InvoiceClearingListComponent', () => {
  let component: InvoiceClearingListComponent;
  let fixture: ComponentFixture<InvoiceClearingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceClearingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceClearingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
